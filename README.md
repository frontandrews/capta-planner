# Capta Planner

Task list and planning app — **YAML-backed** index, per-task details, and schema. **Portfolio-friendly:** the app and demo data are shareable; your real task data can stay local (gitignored).

## What it is

- **Planner UI** — Next.js app: table view, filters (status, priority, project, app, area), triage board, task detail panel with MDX editor.
- **Data** — Default: **`data/sample/`** (in repo, demo data). For your own tasks use **`capta-planner-data/`** (separate repo) via **`PLANNER_DATA_DIR=/path/to/capta-planner-data`** or Docker; keep that dir out of git so you don’t expose your index. See **`docs/DATA_ORGANIZATION.md`**.
- **API** — `GET /api/tasks`, `PATCH /api/tasks/[id]`, `GET/PUT /api/tasks/details/[...path]`, `POST /api/tasks/details/new`, `GET /api/tasks/events` (SSE refresh in dev).

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3333. The app uses **`data/sample/`** by default (shareable demo). To use **your data** from **capta-planner-data**: set **`PLANNER_DATA_DIR=/path/to/capta-planner-data`** (absolute path to your clone), then run `pnpm dev`. Alternatively use **`PLANNER_DATA_DIR=data/tasks`** for a gitignored dir inside this repo.

## Docker (app + auto-sync)

Run the planner and a **sync sidecar** that auto-pushes your task data to a **separate private repo** (debounced 60s after last change). See **`docs/DOCKER.md`** for setup.

**Important:** `capta-planner-data/` is a **separate git repository** for your private task data. It is NOT part of capta-planner repo.

```bash
# 1. Create a private repo on GitHub (e.g., github.com/you/capta-planner-data)
# 2. Clone it: git clone git@github.com:you/capta-planner-data.git capta-planner-data
# 3. Initialize with demo data: cp -r data/sample/* capta-planner-data/
# 4. Set up git in capta-planner-data/:
#    cd capta-planner-data && git add . && git commit -m "Initial task data" && git push && cd ..
# 5. Configure sync: cp .env.docker.example .env && edit .env
# 6. Start services:
docker compose up -d
```

**Data flow:** Your edits in the UI → saved to **capta-planner-data/** (mounted at `/data`) → sync service auto-commits & pushes → your private repo. The app reads and writes the **capta-planner-data** directory; ensure that dir exists and is your data repo clone (see steps above).

## Docs

- **`docs/DATA_ORGANIZATION.md`** — Shareable vs your data: sample in repo, your index gitignored, per-project layout.
- **`docs/README.md`** — Task system overview, fields, workflow.
- **`docs/TASK_INDEX_GUIDE.md`** — Entry point: how to approach the index (review, add, implement).
- **`docs/TASK_ORIENTATION.md`** — Creating new tickets and details files.
- **`docs/CLARITY_SCORE.md`** — clarity_score (0–100) and when to set it.
