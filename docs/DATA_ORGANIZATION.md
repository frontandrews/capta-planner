# Data organization: shareable app vs your data

Capta Planner is **portfolio-friendly**: the app and schema are shareable; your task data does not have to be.

## Where your data lives

| Location | Purpose |
|----------|---------|
| **`data/sample/`** (in capta-planner repo) | Shareable demo data. **Default** when `PLANNER_DATA_DIR` is unset — app runs out of the box. |
| **`capta-planner-data/`** (separate repo) | **Canonical location for your real task data.** A separate private git repo; clone it next to capta-planner (or anywhere) and point the app at it (see below). |
| **`data/tasks/`** (in capta-planner, gitignored) | Optional local-only data dir; set `PLANNER_DATA_DIR=data/tasks` if you prefer data inside the app repo but gitignored. |

**To use capta-planner-data:**

- **Local dev (no Docker):** Set `PLANNER_DATA_DIR` to the absolute path of your capta-planner-data clone (e.g. `PLANNER_DATA_DIR=/path/to/capta-planner-data`), then run `pnpm dev`.
- **Docker:** Use `docker compose` from capta-planner; it mounts `capta-planner-data` at `/data` by default (`PLANNER_DATA_PATH=../capta-planner-data`). The app reads/writes there.

## Default: shareable sample data

- **`data/sample/`** — In the repo. Minimal demo: `index.yaml`, `task-schema.json`, a few tasks and details. The app **defaults** to this dir so the repo runs out of the box with no private data.
- **`data/tasks/`** — **Gitignored.** Alternative local dir for your tasks. Set `PLANNER_DATA_DIR=data/tasks` so the app reads/writes there. Your `index.yaml` and `details/*.md` stay local and are not committed.

## Per-project layout (optional)

You can organize data **per project** so each repo or product has its own index:

```
data/
  sample/                    # In repo — demo data (default)
    index.yaml
    task-schema.json
    details/
  projects/                   # Gitignore this folder or specific project dirs
    primary-app/
      index.yaml
      details/
    internal-tooling/
      index.yaml
      details/
    portfolio-2026/
      index.yaml
      details/
```

- **Shareable:** Keep only `data/sample/` in the repo. Clone → run → see demo data.
- **Your data:** Use `data/tasks/` or `data/projects/<name>/`. Set `PLANNER_DATA_DIR` to that path (e.g. `PLANNER_DATA_DIR=data/projects/portfolio-2026`). Add `data/tasks/` or `data/projects/` to `.gitignore` so your index and details are never committed.

## Env

| Env | Purpose |
|-----|--------|
| **Unset** | App uses `data/sample/` (shareable demo). |
| **`PLANNER_DATA_DIR=/path/to/capta-planner-data`** | App uses your **capta-planner-data** clone (recommended for your real data). |
| **`PLANNER_DATA_DIR=data/tasks`** | App uses your local `data/tasks/` (gitignored). |
| **`PLANNER_DATA_DIR=data/projects/primary-app`** | App uses that project’s data (e.g. per-repo planning). |
| **`PLANNER_DATA_DIR=/absolute/path`** | App uses that absolute path (e.g. data in another repo). |

## Summary

- **Planner as product:** App + schema + `data/sample` are public; anyone can fork and run.
- **Your data:** Live in **capta-planner-data** (separate repo) or a gitignored dir (e.g. `data/tasks` or `data/projects/<name>`). Set `PLANNER_DATA_DIR` to that path so you never expose your `index.yaml` or detail files.
