# Screen Tracker

A lightweight desktop productivity tracker that captures your screen at regular intervals, analyzes activity using your AI assistant, stores results in SQLite, and delivers a daily summary report via email.

## How it works

```
Every N minutes
      │
      ▼
Screenshot (Python Pillow)
      │
      ▼
AI Vision Analysis → app name, task description, productivity score
      │
      ▼
SQLite (snapshots + reports)
      │
      └──► Daily report (HTML) → Email
               └──► System tray controls (start / stop / view report)
```

## Setup

```bash
cp .env.example .env   # fill in your keys
npm install
npm start
```

## Commands

| Command | Description |
|---|---|
| `npm start` | Start the full tracker |
| `npm run report` | Generate today's report manually |
| `node src/report.js 2025-04-25` | Generate report for a specific date |

## Environment variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your AI assistant API key |
| `EMAIL_USER` | Gmail address used to send reports |
| `EMAIL_PASS` | Gmail app password |
| `EMAIL_TO` | Recipient address for daily reports |
| `CAPTURE_INTERVAL_MINUTES` | Screenshot interval in minutes (default: `5`) |
| `REPORT_HOUR` | Hour to send the daily report (default: `18`) |

## Tech stack

- **Node.js** (ESM) — scheduler and orchestration
- **Python + Pillow** — screen capture
- **AI Vision API** — activity analysis
- **SQLite (better-sqlite3)** — local data storage
- **Nodemailer** — email delivery
- **Electron** — system tray interface

## License

MIT © [goparjanette-hub](https://github.com/goparjanette-hub)
