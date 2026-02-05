# Docker: planner + auto-sync

Run the planner in Docker with a **sync sidecar** that watches your task data and auto-pushes to a private repo (no need to remember to commit/push).

## Prerequisites

1. **Private repo** for your task data (only `index.yaml`, `task-schema.json`, `details/`).
2. **Clone** it locally into a dir that will be mounted (e.g. `planner-data`).
3. **SSH** so the sync container can push (mount `~/.ssh`; remote should be `git@github.com:you/repo.git` or similar).

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
   # Edit .env: GIT_USER_NAME, GIT_USER_EMAIL
   docker compose up -d
   ```

4. Open http://localhost:3333. Edit tasks; after **60 seconds** with no changes, the sync container will `git add` / `commit` / `push` to your private repo.

## How it works

- **planner**: Next.js app; reads/writes the mounted data dir (`PLANNER_DATA_DIR=/data`).
- **sync**: Watches the same dir with `inotifywait`; **debounces 60s** after the last file change, then runs `git add -A && git commit -m "auto backup ..." && git push`. So if the IA (or you) is editing, sync waits until 60s of no changes before pushing.

## Env

| Env | Default | Purpose |
|-----|---------|--------|
| `PLANNER_DATA_PATH` | `../capta-planner-data` | Host path to your **capta-planner-data** clone (mounted at `/data`). Run compose from capta-planner so this path resolves. |
| `GIT_USER_NAME` | Planner Sync | Git `user.name` for sync commits. |
| `GIT_USER_EMAIL` | sync@localhost | Git `user.email` for sync commits. |
| `SSH_DIR` | `$HOME/.ssh` | Mounted into sync so `git push` can use SSH. |
| `DEBOUNCE_SEC` | 60 | Seconds of no file changes before sync runs. |

## HTTPS remote (token)

If your remote is HTTPS with a token (e.g. `https://token@github.com/you/repo.git`), you don't need to mount SSH. Ensure the clone in `planner-data` has that remote and credentials (e.g. git credential store). The sync container uses the same git config and remote; for HTTPS you may need to mount a credential helper or use a token in the URL.

## Build context

The planner Dockerfile expects to be built with **context = parent dir** (so `capta-config` and `capta-planner` are available). Run `docker compose` from **capta-planner** so `context: ..` is the repo root; or from repo root: `docker compose -f capta-planner/docker-compose.yml up -d` (and set `context` in the compose file if needed).
