# Capta Planner

Task list and planning app — **YAML-backed** index, per-task details, and schema. Designed for humans and AI to organize next steps and project tasks from structured YAML.

## What it is

- **Planner UI** — Next.js app: table view, filters (status, priority, project, app, area), triage board, task detail panel with MDX editor.
- **Data** — Default: **`data/sample/`** (in repo, demo data). For your own tasks use **`capta-planner-data/`** (separate repo) via **`PLANNER_DATA_DIR=/path/to/capta-planner-data`** or Docker; keep that dir out of git so you don’t expose your index. See **`docs/DATA_ORGANIZATION.md`**.
- **API** — `GET /api/tasks`, `PATCH /api/tasks/[id]`, `GET/PUT /api/tasks/details/[...path]`, `POST /api/tasks/details/new`, `GET /api/tasks/events` (SSE refresh in dev).

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3333. The app uses **`data/sample/`** by default (shareable demo). To use **your data**, point the app to any folder you choose: set **`PLANNER_DATA_DIR=/path/to/your/tasks`** (absolute path), then run `pnpm dev`. You can later store that folder on a drive, sync it, or back it up however you prefer. Alternatively use **`PLANNER_DATA_DIR=data/tasks`** for a gitignored dir inside this repo.

## Docs

- **`docs/DATA_ORGANIZATION.md`** — Shareable vs your data: sample in repo, your index gitignored, per-project layout.
- **`docs/README.md`** — Task system overview, fields, workflow.
- **`docs/TASK_INDEX_GUIDE.md`** — Entry point: how to approach the index (review, add, implement).
- **`docs/TASK_ORIENTATION.md`** — Creating new tickets and details files.
- **`docs/CLARITY_SCORE.md`** — clarity_score (0–100) and when to set it.
