# YouTube Scheduled Video Uploader

A production-ready, fully automated Python tool that uploads and **schedules** YouTube videos using the official **YouTube Data API v3**.

## Features

- **OAuth 2.0 Authentication** – One-time browser consent; token is cached and auto-refreshed.
- **Batch Uploads** – Drop videos into a folder, fill in a CSV, and run one command.
- **Scheduled Publishing** – Set a date/time in **IST**; the script converts to UTC and schedules the video automatically.
- **Anti-Spam Delay** – Random 5–10 minute sleep between uploads to avoid quota throttling.
- **Progress Bar** – Real-time, per-file upload progress in the terminal (via `tqdm`).
- **Robust Logging** – All events written to `uploader.log` and echoed to the console.
- **Graceful Error Handling** – Handles quota errors (403), bad requests (400), timeouts, and missing files without crashing.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.10+ |
| pip | latest |
| A Google account with a YouTube channel | — |

---

## Setup Guide

### 1. Create a Google Cloud Project & Enable the YouTube Data API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a **new project** (or select an existing one).
3. Navigate to **APIs & Services → Library**.
4. Search for **YouTube Data API v3** and click **Enable**.

### 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**.
2. Click **+ CREATE CREDENTIALS → OAuth client ID**.
3. If prompted, configure the **OAuth consent screen** first:
   - Choose **External** user type.
   - Fill in the app name, support email, and developer email.
   - Add the scope: `https://www.googleapis.com/auth/youtube.upload`.
   - Add your Google account email as a **Test user**.
4. Back in Credentials, select **Desktop app** as the application type.
5. Click **Create** and then **Download JSON**.
6. Rename the downloaded file to `client_secrets.json` and place it in the project root (`youtube-video-uploader/`).

### 3. Install Dependencies

```bash
cd youtube-video-uploader
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` to point to your actual paths if they differ from the defaults.

### 5. Prepare Your Videos & Metadata

1. Place your `.mp4` / `.mkv` video files in the `videos_to_upload/` folder.
2. Edit `sample_metadata/videos.csv` with your video details:

```csv
filename,title,description,tags,schedule_time_ist
my_first_video.mp4,My First Video Title,"Description here.",python|tutorial|coding,2025-08-01 18:00
my_second_video.mkv,Second Video,"Another description.",tips|tricks,2025-08-02 10:30
```

| Column | Description |
|---|---|
| `filename` | Exact name of the video file (including extension) |
| `title` | YouTube video title |
| `description` | Video description (supports multi-line in quotes) |
| `tags` | Pipe-separated tags (`tag1\|tag2\|tag3`) |
| `schedule_time_ist` | Publish date/time in **IST** – format: `YYYY-MM-DD HH:MM` (24 h) |

### 6. Run the Uploader

```bash
python uploader.py
```

On the **first run**, a browser window will open for Google OAuth consent. After authorizing, a `token.json` file is created and reused for all future runs.

---

## Project Structure

```
youtube-video-uploader/
├── uploader.py              # Main orchestration script
├── youtube_client.py        # YouTube API auth & upload logic
├── config.py                # Loads .env settings
├── utils.py                 # IST→UTC conversion, logger, anti-spam delay
├── requirements.txt         # Pinned dependencies
├── .env.example             # Environment variable template
├── .gitignore               # Ignored files
├── README.md                # This file
├── sample_metadata/
│   └── videos.csv           # Sample CSV metadata file
└── videos_to_upload/        # Drop your video files here
    └── .gitkeep
```

---

## Configuration Reference (`.env`)

| Variable | Default | Description |
|---|---|---|
| `VIDEO_DIR` | `./videos_to_upload` | Folder containing video files |
| `METADATA_FILE` | `./sample_metadata/videos.csv` | Path to the CSV metadata |
| `CLIENT_SECRETS_FILE` | `./client_secrets.json` | OAuth client secrets from Google Cloud |
| `TOKEN_FILE` | `./token.json` | Cached OAuth token (auto-created) |
| `LOG_FILE` | `./uploader.log` | Log output file |
| `UPLOAD_CHUNK_SIZE` | `262144` (256 KB) | Resumable upload chunk size in bytes |
| `MIN_DELAY_SECONDS` | `300` (5 min) | Minimum anti-spam delay between uploads |
| `MAX_DELAY_SECONDS` | `600` (10 min) | Maximum anti-spam delay between uploads |

---

## YouTube API Quota Notes

- Each `videos.insert` call costs **1,600 quota units**.
- The default daily quota is **10,000 units** → ~6 uploads per day.
- To upload more, request a [quota increase](https://support.google.com/youtube/contact/yt_api_form) from Google.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `quotaExceeded` (403) | You've hit the daily API quota. Wait 24 hours or request a quota increase. |
| `invalid_grant` | Delete `token.json` and re-authenticate. |
| Browser doesn't open for OAuth | Ensure you're running on a machine with a browser, or use `--console` flow. |
| Video uploads but isn't scheduled | Verify `privacyStatus` is `private` and `publishAt` is a future UTC time. |

---

## License

MIT
