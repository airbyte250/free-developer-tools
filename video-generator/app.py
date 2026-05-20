"""Flask web app for AI video generation using Vast.ai + Wan 2.2."""
import json
import os
import threading
import time
import uuid

from flask import Flask, jsonify, render_template, request, send_file

from vastai_manager import (
    create_instance,
    destroy_instance,
    get_running_instances,
    search_cheapest_gpu,
    stop_instance,
    wait_for_instance,
)
from video_pipeline import full_pipeline

app = Flask(__name__)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# In-memory job tracking
jobs = {}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/gpu-options")
def gpu_options():
    """Search for available GPUs on Vast.ai."""
    try:
        gpu_types = [
            {"name": "RTX 3090", "query_name": "RTX_3090", "vram": 24},
            {"name": "RTX 4090", "query_name": "RTX_4090", "vram": 24},
            {"name": "Any 24GB+ GPU", "query_name": None, "vram": 20},
        ]
        results = []
        for gpu in gpu_types:
            offer = search_cheapest_gpu(
                min_vram_gb=gpu["vram"], gpu_name=gpu["query_name"]
            )
            if offer:
                results.append({
                    "name": gpu["name"],
                    "offer_id": offer["id"],
                    "gpu_model": offer.get("gpu_name", "Unknown"),
                    "vram_gb": round(offer.get("gpu_ram", 0) / 1024, 1),
                    "price_per_hour": round(offer.get("dph_total", 0), 4),
                    "price_inr_per_hour": round(offer.get("dph_total", 0) * 84, 1),
                    "reliability": round(offer.get("reliability", 0) * 100, 1),
                    "country": offer.get("geolocation", "Unknown"),
                })
        return jsonify({"gpus": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/instances")
def list_instances():
    """List running Vast.ai instances."""
    try:
        instances = get_running_instances()
        return jsonify({"instances": instances})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/generate", methods=["POST"])
def generate_video():
    """Start video generation job."""
    data = request.json
    prompt = data.get("prompt", "")
    duration = int(data.get("duration", 30))
    resolution = data.get("resolution", "480p")
    offer_id = data.get("offer_id")

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    height = 480
    width = 832
    if resolution == "720p":
        height = 720
        width = 1280

    job_id = str(uuid.uuid4())[:8]
    job = {
        "id": job_id,
        "prompt": prompt,
        "duration": duration,
        "resolution": resolution,
        "status": "starting",
        "progress": 0,
        "message": "Finding cheapest GPU...",
        "created_at": time.time(),
        "output_path": None,
        "instance_id": None,
        "cost_estimate": 0,
    }
    jobs[job_id] = job

    thread = threading.Thread(
        target=_run_generation, args=(job_id, prompt, duration, height, width, offer_id)
    )
    thread.daemon = True
    thread.start()

    return jsonify({"job_id": job_id, "status": "started"})


def _run_generation(job_id, prompt, duration, height, width, offer_id):
    """Background task for video generation."""
    job = jobs[job_id]
    instance_id = None

    try:
        # Find cheapest GPU if no offer specified
        if not offer_id:
            job["message"] = "Searching for cheapest GPU..."
            offer = search_cheapest_gpu(min_vram_gb=20)
            if not offer:
                job["status"] = "error"
                job["message"] = "No GPUs available. Try again later."
                return
            offer_id = offer["id"]
            job["cost_estimate"] = round(offer.get("dph_total", 0) * (duration / 60) * 3, 2)

        # Create instance
        job["message"] = "Starting GPU instance..."
        job["status"] = "provisioning"
        instance_id = create_instance(offer_id, disk_gb=80)
        job["instance_id"] = instance_id

        # Wait for instance
        job["message"] = "Waiting for GPU to boot (1-3 min)..."
        info = wait_for_instance(instance_id, timeout=600)
        ssh_host = info["ssh_host"]
        ssh_port = info["ssh_port"]
        job["message"] = f"GPU ready: {info['gpu_name']} @ ${info['dph_total']:.2f}/hr"

        # Generate video
        job["status"] = "generating"
        output_path = os.path.join(OUTPUT_DIR, f"{job_id}_final.mp4")

        def on_progress(stage, current, total, message):
            job["message"] = message
            if total > 0:
                if stage == "generating":
                    job["progress"] = int((current / total) * 90)
                elif stage == "downloading":
                    job["progress"] = 90
                elif stage == "merging":
                    job["progress"] = 95
                elif stage == "done":
                    job["progress"] = 100

        full_pipeline(
            ssh_host, ssh_port, prompt, output_path,
            duration_sec=duration, height=height, width=width,
            on_progress=on_progress,
        )

        job["output_path"] = output_path
        job["status"] = "completed"
        job["message"] = "Video ready!"
        job["progress"] = 100

    except Exception as e:
        job["status"] = "error"
        job["message"] = f"Error: {str(e)}"
    finally:
        # Auto-stop instance to save cost
        if instance_id:
            try:
                stop_instance(instance_id)
                job["message"] += " (GPU stopped to save cost)"
            except Exception:
                pass


@app.route("/api/job/<job_id>")
def job_status(job_id):
    """Get job status and progress."""
    job = jobs.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(job)


@app.route("/api/download/<job_id>")
def download_video(job_id):
    """Download the generated video."""
    job = jobs.get(job_id)
    if not job or not job.get("output_path"):
        return jsonify({"error": "Video not ready"}), 404
    return send_file(job["output_path"], as_attachment=True,
                     download_name=f"video_{job_id}.mp4")


@app.route("/api/stop-instance", methods=["POST"])
def stop_instance_api():
    """Manually stop a Vast.ai instance."""
    data = request.json
    instance_id = data.get("instance_id")
    if not instance_id:
        return jsonify({"error": "instance_id required"}), 400
    try:
        stop_instance(instance_id)
        return jsonify({"status": "stopped"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/destroy-instance", methods=["POST"])
def destroy_instance_api():
    """Manually destroy a Vast.ai instance."""
    data = request.json
    instance_id = data.get("instance_id")
    if not instance_id:
        return jsonify({"error": "instance_id required"}), 400
    try:
        destroy_instance(instance_id)
        return jsonify({"status": "destroyed"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/jobs")
def list_jobs():
    """List all jobs."""
    return jsonify({"jobs": list(jobs.values())})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
