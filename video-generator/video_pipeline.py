"""Video generation pipeline: generate clips on Vast.ai and merge locally."""
import json
import os
import subprocess
import tempfile
import time

import paramiko

from vastai_manager import get_ssh_key_path


def ssh_connect(ssh_host, ssh_port, retries=3):
    """Create an SSH connection to the Vast.ai instance with retry logic."""
    key_path = get_ssh_key_path()
    last_err = None
    for attempt in range(retries):
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(
                hostname=ssh_host,
                port=ssh_port,
                username="root",
                key_filename=key_path,
                timeout=30,
                banner_timeout=30,
            )
            return client
        except Exception as e:
            last_err = e
            if attempt < retries - 1:
                time.sleep(10)
    raise RuntimeError(f"SSH connection failed after {retries} attempts: {last_err}")


def ssh_exec(client, command, timeout=1800):
    """Execute a command via SSH and return stdout."""
    stdin, stdout, stderr = client.exec_command(command, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    if exit_code != 0:
        raise RuntimeError(f"Remote command failed (exit {exit_code}): {err[:500]}")
    return out


def upload_file(client, local_path, remote_path):
    """Upload a file to the instance via SFTP."""
    sftp = client.open_sftp()
    sftp.put(local_path, remote_path)
    sftp.close()


def download_file(client, remote_path, local_path):
    """Download a file from the instance via SFTP."""
    sftp = client.open_sftp()
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    sftp.get(remote_path, local_path)
    sftp.close()


def generate_clip_on_instance(client, prompt, clip_index, total_clips,
                              height=480, width=832, num_frames=81):
    """Generate a single clip on the remote instance."""
    config = {
        "prompt": prompt,
        "output_path": f"/workspace/clips/clip_{clip_index:04d}.mp4",
        "clip_index": clip_index,
        "seed": clip_index * 42 + 7,
        "num_frames": num_frames,
        "height": height,
        "width": width,
    }
    config_json = json.dumps(config).replace("'", "'\\''")
    cmd = f"cd /workspace && python3 generate_video.py '{config_json}'"
    ssh_exec(client, cmd, timeout=1800)
    return config["output_path"]


def generate_all_clips(ssh_host, ssh_port, prompt, total_duration_sec=300,
                       clip_duration_sec=5, height=480, width=832,
                       on_progress=None):
    """Generate all clips for the full video."""
    total_clips = total_duration_sec // clip_duration_sec
    fps = 16
    num_frames = clip_duration_sec * fps + 1

    client = ssh_connect(ssh_host, ssh_port)

    try:
        ssh_exec(client, "test -f /workspace/generate_video.py")
    except RuntimeError:
        if on_progress:
            on_progress("setup", 0, total_clips, "Installing Wan 2.2 on GPU (first time takes 10-15 min)...")
        setup_script_path = os.path.join(os.path.dirname(__file__), "setup_instance.sh")
        upload_file(client, setup_script_path, "/tmp/setup_instance.sh")
        ssh_exec(client, "bash /tmp/setup_instance.sh", timeout=3600)

    ssh_exec(client, "mkdir -p /workspace/clips")

    remote_clips = []
    for i in range(total_clips):
        if on_progress:
            on_progress("generating", i, total_clips,
                        f"Generating clip {i+1}/{total_clips}...")
        clip_prompt = f"{prompt} (scene {i+1} of {total_clips})"
        try:
            remote_path = generate_clip_on_instance(
                client, clip_prompt, i, total_clips,
                height=height, width=width, num_frames=num_frames,
            )
            remote_clips.append(remote_path)
        except RuntimeError as e:
            if on_progress:
                on_progress("generating", i, total_clips,
                            f"Clip {i+1} failed, retrying...")
            try:
                remote_path = generate_clip_on_instance(
                    client, clip_prompt, i, total_clips,
                    height=height, width=width, num_frames=num_frames,
                )
                remote_clips.append(remote_path)
            except RuntimeError:
                raise RuntimeError(f"Clip {i+1}/{total_clips} failed after retry: {e}")

    client.close()
    return remote_clips


def download_clips(ssh_host, ssh_port, remote_clips, local_dir, on_progress=None):
    """Download all generated clips from the instance."""
    client = ssh_connect(ssh_host, ssh_port)
    local_clips = []
    for idx, remote_path in enumerate(remote_clips):
        if on_progress:
            on_progress("downloading", idx, len(remote_clips),
                        f"Downloading clip {idx+1}/{len(remote_clips)}...")
        filename = os.path.basename(remote_path)
        local_path = os.path.join(local_dir, filename)
        download_file(client, remote_path, local_path)
        local_clips.append(local_path)
    client.close()
    return local_clips


def merge_clips(clip_paths, output_path):
    """Merge video clips into a single video using FFmpeg."""
    if not clip_paths:
        raise RuntimeError("No clips to merge")

    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        for clip in sorted(clip_paths):
            f.write(f"file '{os.path.abspath(clip)}'\n")
        filelist = f.name

    try:
        cmd = [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", filelist,
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            "-pix_fmt", "yuv420p",
            output_path,
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg merge failed: {result.stderr[:500]}")
    finally:
        os.unlink(filelist)

    return output_path


def full_pipeline(ssh_host, ssh_port, prompt, output_path,
                  duration_sec=300, height=480, width=832,
                  on_progress=None):
    """Run the full video generation pipeline."""
    clip_dir = os.path.join(os.path.dirname(output_path), "clips")
    os.makedirs(clip_dir, exist_ok=True)

    remote_clips = generate_all_clips(
        ssh_host, ssh_port, prompt,
        total_duration_sec=duration_sec,
        height=height, width=width,
        on_progress=on_progress,
    )

    if on_progress:
        on_progress("downloading", 0, len(remote_clips), "Downloading clips from GPU...")
    local_clips = download_clips(ssh_host, ssh_port, remote_clips, clip_dir, on_progress)

    if on_progress:
        on_progress("merging", 0, 1, "Merging clips into final video...")
    merge_clips(local_clips, output_path)

    if on_progress:
        on_progress("done", 1, 1, "Video generation complete!")

    return output_path
