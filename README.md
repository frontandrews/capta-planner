# Capta Planner

Task list and planning app — **YAML-backed** index, per-task details, and schema. **Portfolio-friendly:** the app and demo data are shareable; your real task data can stay local (gitignored).

## What it is

- **Planner UI** — Next.js app: table view, filters (status, priority, project, app, area), triage board, task detail panel with MDX editor.
- **Data** — Default: **`data/sample/`** (in repo, demo data). For your own tasks use **`data/tasks/`** or **`data/projects/<name>/`** and set **`PLANNER_DATA_DIR`**; keep that dir out of git so you don’t expose your index. See **`docs/DATA_ORGANIZATION.md`**.
- **API** — `GET /api/tasks`, `PATCH /api/tasks/[id]`, `GET/PUT /api/tasks/details/[...path]`, `POST /api/tasks/details/new`, `GET /api/tasks/events` (SSE refresh in dev).

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3333. The app uses **`data/sample/`** by default (shareable demo). To use your own data: set **`PLANNER_DATA_DIR=data/tasks`** (or `data/projects/my-project`) and add that dir to **`.gitignore`**.

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

**Data flow:** Your edits in the UI → saved to `capta-planner-data/` → sync service auto-commits & pushes → your private repo

## Docs

- **`docs/DATA_ORGANIZATION.md`** — Shareable vs your data: sample in repo, your index gitignored, per-project layout.
- **`docs/README.md`** — Task system overview, fields, workflow.
- **`docs/AI_TASK_INDEX_GUIDE.md`** — Entry point for AI: how to approach the index (review, add, implement).
- **`docs/TASK_ORIENTATION.md`** — Creating new tickets and details files.
- **`docs/CLARITY_SCORE.md`** — clarity_score (0–100) and when to set it.

## Migration from Copylume

The task app previously lived in **`copylume/apps/tasks`** and read from **`copylume/docs/technical/tasks/`**. It is now **capta-planner**. Default data is **`data/sample/`** (shareable). Your own data: use **`data/tasks/`** or **`data/projects/<name>/`**, set **`PLANNER_DATA_DIR`**, and add that dir to **`.gitignore`** so your index is not exposed.
