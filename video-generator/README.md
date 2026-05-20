# AI Video Generator - Wan 2.2 on Vast.ai

Generate 5-minute AI videos for ~₹100 using open-source Wan 2.2 model on rented GPUs.

## How it Works

1. **Web Dashboard** — Enter a prompt, pick duration and quality
2. **Auto GPU Rental** — Finds the cheapest RTX 4090/3090 on Vast.ai
3. **Auto Setup** — Installs Wan 2.2 on the GPU instance automatically
4. **Clip Generation** — Generates 5-sec clips sequentially
5. **Auto Merge** — Merges all clips into one video via FFmpeg
6. **Auto Stop** — Stops the GPU instance when done to save cost

## Cost Breakdown

| Duration | Clips | GPU (RTX 3090 @ $0.20/hr) | GPU (RTX 4090 @ $0.40/hr) |
|----------|-------|---------------------------|---------------------------|
| 30 sec   | 6     | ~$0.10 (~₹8)              | ~$0.20 (~₹17)             |
| 1 min    | 12    | ~$0.20 (~₹17)             | ~$0.40 (~₹34)             |
| 5 min    | 60    | ~$0.80 (~₹67)             | ~$1.60 (~₹134)            |

*Using Wan 2.2 1.3B model at 480p resolution. Times and costs are approximate.*

## Quick Start

### Prerequisites

- Python 3.9+
- [Vast.ai](https://vast.ai) account with credit
- Vast.ai API key (generate at https://cloud.vast.ai/manage-keys/)

### Setup

```bash
# Install dependencies
pip install -r requirements.txt
pip install vastai

# Set your Vast.ai API key
vastai set api-key YOUR_API_KEY

# Run the web app
python app.py
```

Open http://localhost:5000 in your browser.

### Usage

1. Click **Search Available GPUs** to find the cheapest option
2. Select a GPU from the list
3. Type your video prompt
4. Choose duration (start with 10s for testing!)
5. Click **Generate Video**
6. Wait for clips to generate (progress bar shows status)
7. Download the final merged video

### Instance Management

- The app **auto-stops** instances after video generation
- Use the **GPU Instance Management** section to manually stop/destroy instances
- **Stop** = pause billing, data preserved
- **Destroy** = delete everything, no more charges

## Architecture

```
┌──────────────┐     ┌───────────────┐     ┌──────────────────┐
│  Web Browser │────▶│  Flask Server │────▶│  Vast.ai API     │
│  (Dashboard) │◀────│  (app.py)     │◀────│  (GPU Instance)  │
└──────────────┘     └───────────────┘     └──────────────────┘
                            │                       │
                            │   SSH / SFTP          │
                            │◀──────────────────────│
                            │                       │
                     ┌──────▼──────┐     ┌──────────▼─────────┐
                     │  FFmpeg     │     │  Wan 2.2 1.3B      │
                     │  (merge)    │     │  (video generation) │
                     └─────────────┘     └────────────────────┘
```

## Files

- `app.py` — Flask web server with REST API and web UI
- `vastai_manager.py` — Vast.ai CLI wrapper (search, create, stop, destroy)
- `video_pipeline.py` — Video generation pipeline (SSH, generate, download, merge)
- `setup_instance.sh` — Auto-setup script for GPU instances (installs Wan 2.2)
- `templates/index.html` — Web dashboard UI
- `outputs/` — Generated videos stored here

## Tips

- **Start small:** Test with 10-sec video first to verify everything works
- **480p is cheaper:** Use 480p for drafts, 720p for final versions
- **Check instances:** Always verify no instances are running after you're done
- **RTX 3090 is cheapest:** ~$0.15-0.20/hr, good enough for 1.3B model
