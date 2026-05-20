"""Vast.ai GPU instance management for video generation."""
import json
import os
import subprocess
import time


def run_vastai(*args):
    """Run a vastai CLI command and return the output."""
    cmd = ["vastai"] + list(args)
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        raise RuntimeError(f"vastai command failed: {result.stderr}")
    return result.stdout.strip()


def search_cheapest_gpu(min_vram_gb=20, gpu_name=None):
    """Find the cheapest available GPU on Vast.ai."""
    query = f"gpu_ram>={min_vram_gb} num_gpus=1 reliability>0.9 rentable=true disk_space>=50"
    if gpu_name:
        query += f" gpu_name={gpu_name}"

    raw = run_vastai(
        "search", "offers",
        "--limit", "5",
        "--type", "on-demand",
        "--order", "dph_total",
        "--raw",
        query,
    )
    offers = json.loads(raw)
    if not offers:
        return None
    return offers[0]


def create_instance(offer_id, disk_gb=80):
    """Create a Vast.ai instance with PyTorch image."""
    output = run_vastai(
        "create", "instance", str(offer_id),
        "--image", "pytorch/pytorch:2.4.0-cuda12.4-cudnn9-devel",
        "--disk", str(disk_gb),
        "--ssh", "--direct",
    )
    # Extract instance ID from output
    for word in output.split():
        if word.isdigit():
            return int(word)
    raise RuntimeError(f"Could not parse instance ID from: {output}")


def wait_for_instance(instance_id, timeout=600):
    """Wait for instance to be running and return SSH connection info."""
    start = time.time()
    while time.time() - start < timeout:
        raw = run_vastai("show", "instances", "--raw")
        instances = json.loads(raw)
        for inst in instances:
            if inst.get("id") == instance_id:
                status = inst.get("actual_status", "")
                if status == "running":
                    ssh_host = inst.get("ssh_host", "")
                    ssh_port = inst.get("ssh_port", 22)
                    return {
                        "id": instance_id,
                        "ssh_host": ssh_host,
                        "ssh_port": ssh_port,
                        "status": status,
                        "gpu_name": inst.get("gpu_name", "Unknown"),
                        "dph_total": inst.get("dph_total", 0),
                    }
        time.sleep(15)
    raise TimeoutError(f"Instance {instance_id} did not start within {timeout}s")


def stop_instance(instance_id):
    """Stop a Vast.ai instance."""
    run_vastai("stop", "instance", str(instance_id))


def destroy_instance(instance_id):
    """Destroy a Vast.ai instance."""
    run_vastai("destroy", "instance", str(instance_id))


def get_running_instances():
    """Get list of running instances."""
    raw = run_vastai("show", "instances", "--raw")
    instances = json.loads(raw)
    return [i for i in instances if i.get("actual_status") == "running"]


def get_ssh_key_path():
    """Get or create SSH key for Vast.ai."""
    key_path = os.path.expanduser("~/.ssh/id_ed25519")
    if not os.path.exists(key_path):
        os.makedirs(os.path.dirname(key_path), exist_ok=True)
        subprocess.run(
            ["ssh-keygen", "-t", "ed25519", "-f", key_path, "-N", ""],
            check=True, capture_output=True,
        )
        pub_key = open(f"{key_path}.pub").read().strip()
        run_vastai("create", "ssh-key", pub_key)
    return key_path
