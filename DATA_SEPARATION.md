# Data Separation Strategy

## Overview

Capta Planner keeps **public demo data** in this repo and **your private task data** completely separate.

## Repository Structure

### ✅ What's IN this repo (capta-planner)

- `data/sample/` - Demo data (shareable, in git)
  - `index.yaml` - Sample tasks
  - `task-schema.json` - Schema definition
  - `details/*.md` - Sample task details
- App code, docs, Docker setup

### ❌ What's NOT in this repo

- `data/tasks/` - Your local task data (gitignored)
- `capta-planner-data/` - Your private data repo clone (gitignored)
- `.env` - Docker config with your git credentials (gitignored)

## Two Usage Modes

### Mode 1: Local Development (No Docker)

Your data lives in `data/tasks/` (gitignored):

```bash
# Use your own task data locally
export PLANNER_DATA_DIR=data/tasks
pnpm dev
```

**Important:** `data/tasks/` is gitignored and never pushed to this repo.

### Mode 2: Docker with Auto-Sync (recommended for your real data)

Your data lives in **capta-planner-data/** — a **separate private git repo** cloned next to capta-planner (or anywhere; set `PLANNER_DATA_PATH` to its path). The app reads and writes this directory; Docker mounts it at `/data` by default.

```bash
# 1. Create private repo on GitHub
gh repo create your-username/capta-planner-data --private

# 2. Clone it locally
git clone git@github.com:your-username/capta-planner-data.git capta-planner-data

# 3. Initialize with demo data
cp -r data/sample/* capta-planner-data/
cd capta-planner-data
git add .
git commit -m "Initial task data"
git push
cd ..

# 4. Configure Docker
cp .env.docker.example .env
# Edit .env: set GIT_USER_NAME and GIT_USER_EMAIL

# 5. Start planner + sync service
docker compose up -d
```

## How Auto-Sync Works

1. **Planner app** reads/writes to `/data` (mounted from `capta-planner-data/`)
2. **Sync service** watches `/data` for changes
3. After **60 seconds** of no changes (debounced):
   - `git add -A`
   - `git commit -m "auto backup <timestamp>"`
   - `git push` to your private repo

## Key Points

- ✅ `data/sample/` - Public demo data, safe to share
- ❌ `data/tasks/` - Your local data, gitignored
- ❌ `capta-planner-data/` - Separate repo, gitignored from capta-planner
- 🔒 Your task data **never** touches the capta-planner repo
- 🔄 Sync service only commits to **your separate private repo**

## Verification

Check what's being tracked in capta-planner:

```bash
git ls-files | grep "data/"
# Should only show: data/sample/...
```

Check your private data repo:

```bash
cd capta-planner-data
git log --oneline
# Shows your auto-backup commits
```
