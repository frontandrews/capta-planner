# Data organization: shareable app vs your data

Capta Planner is **portfolio-friendly**: the app and schema are shareable; your task data does not have to be.

## Default: shareable sample data

- **`data/sample/`** — In the repo. Minimal demo: `index.yaml`, `task-schema.json`, a few tasks and details. The app **defaults** to this dir so the repo runs out of the box with no private data.
- **`data/tasks/`** — **Gitignored.** Use it for your real tasks. Set `PLANNER_DATA_DIR=data/tasks` (or absolute path) so the app reads/writes there. Your `index.yaml` and `details/*.md` stay local and are not committed.

## Per-project layout (optional)

You can organize data **per project** so each repo or product has its own index:

```
data/
  sample/                    # In repo — demo data (default)
    index.yaml
    task-schema.json
    details/
  projects/                   # Gitignore this folder or specific project dirs
    copylume/
      index.yaml
      details/
    capta-core/
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
| **`PLANNER_DATA_DIR=data/tasks`** | App uses your local `data/tasks/` (gitignored). |
| **`PLANNER_DATA_DIR=data/projects/copylume`** | App uses that project’s data (e.g. per-repo planning). |
| **`PLANNER_DATA_DIR=/absolute/path`** | App uses that absolute path (e.g. data in another repo). |

## Summary

- **Planner as product:** App + schema + `data/sample` are public; anyone can fork and run.
- **Your data:** Live in a separate dir (e.g. `data/tasks` or `data/projects/<name>`), set `PLANNER_DATA_DIR`, and gitignore that dir so you never expose your `index.yaml` or detail files.
