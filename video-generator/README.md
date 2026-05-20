# VideoForge AI — Wan 2.2 Video Generator

Generate 5-minute AI videos for ~₹100 using open-source Wan 2.2 on rented cloud GPUs.

## How It Works

1. **Rent cheapest GPU** — Auto-finds cheapest RTX 3090/4090 on Vast.ai marketplace
2. **Auto-install Wan 2.2** — Sets up the 1.3B model on the GPU instance via SSH
3. **Generate clips** — Creates 5-sec video clips from your text prompt
4. **Merge & deliver** — FFmpeg merges clips into final video, auto-stops GPU

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set Vast.ai API key
pip install vastai
vastai set api-key YOUR_API_KEY

# 3. Install FFmpeg (if not already installed)
# Ubuntu: sudo apt install ffmpeg
# Mac: brew install ffmpeg

# 4. Start server
python app.py
```

Open **http://localhost:5000** → Search GPUs → Write prompt → Generate!

## Cost Breakdown

| GPU | Price/hr | 5 min video (480p) | 5 min video (720p) |
|-----|----------|-------------------|-------------------|
| RTX 3090 | ~$0.15/hr (~₹13) | ~₹40-65 | ~₹80-130 |
| RTX 4090 | ~$0.35/hr (~₹29) | ~₹90-140 | ~₹175-280 |

## Architecture

```
Browser → Flask API → Vast.ai CLI → GPU Instance (SSH)
                                          ↓
                                    Wan 2.2 1.3B
                                          ↓
                                    5-sec clips
                                          ↓
                              Download → FFmpeg merge
                                          ↓
                                    Final video
```

## Files

| File | Description |
|------|-------------|
| `app.py` | Flask web server with REST API |
| `vastai_manager.py` | Vast.ai CLI wrapper (search, create, stop, destroy) |
| `video_pipeline.py` | SSH-based clip generation + FFmpeg merge |
| `setup_instance.sh` | Auto-setup script for Wan 2.2 on GPU instances |
| `templates/index.html` | Web dashboard (sidebar navigation, multi-page) |
| `requirements.txt` | Python dependencies |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check + API key status |
| GET | `/api/gpu-options` | Search cheapest GPUs on Vast.ai |
| POST | `/api/generate` | Start video generation job |
| GET | `/api/job/<id>` | Get job status and progress |
| GET | `/api/download/<id>` | Download completed video |
| GET | `/api/instances` | List running GPU instances |
| POST | `/api/stop-instance` | Stop a GPU instance |
| POST | `/api/destroy-instance` | Destroy a GPU instance |
| GET | `/api/jobs` | List all generation jobs |

## Requirements

- Python 3.10+
- FFmpeg
- Vast.ai account with API key
- $5-10 Vast.ai credit to start
