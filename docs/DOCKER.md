# Docker: planner

Run the planner in Docker and mount your task data directory.

## Prerequisites

1. **Private repo** for your task data (only `index.yaml`, `task-schema.json`, `details/`).
2. **Clone** it locally into a dir that will be mounted (e.g. `planner-data`).
3. **Optional**: set up Git for your data repo if you want to commit changes manually.

## Setup

1. Create a private repo named **capta-planner-data** and clone it (e.g. next to capta-planner):

   ```bash
   gh repo create your-username/capta-planner-data --private
   git clone git@github.com:your-username/capta-planner-data.git capta-planner-data
   ```

2. Copy sample structure into the clone (so you have `index.yaml`, `task-schema.json`, `details/`):

   ```bash
   cp -r capta-planner/data/sample/* capta-planner-data/
   cd capta-planner-data && git add -A && git commit -m "init from sample" && git push
   ```

3. From **capta-planner** directory (or repo root with `-f capta-planner/docker-compose.yml`):

   ```bash
   cp .env.docker.example .env
   docker compose up -d
   ```

4. Open http://localhost:3333 and edit tasks.

## How it works

- **planner**: Next.js app; reads/writes the mounted data dir (`PLANNER_DATA_DIR=/data`).

## Env

| Env | Default | Purpose |
|-----|---------|--------|
| `PLANNER_DATA_PATH` | `../capta-planner-data` | Host path to your **capta-planner-data** clone (mounted at `/data`). Run compose from capta-planner so this path resolves. |

## Git remote (optional)

If you want to store task data in a private repo, set up the clone in `planner-data` and commit/push manually as needed.

## Build context

The planner Dockerfile expects to be built with **context = parent dir** (so `capta-config` and `capta-planner` are available). Run `docker compose` from **capta-planner** so `context: ..` is the repo root; or from repo root: `docker compose -f capta-planner/docker-compose.yml up -d` (and set `context` in the compose file if needed).
