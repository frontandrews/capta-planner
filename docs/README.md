# Planner docs — task system

This folder documents the **Planner** task system. The **structured source of truth** lives in **`data/tasks/`** (index.yaml, details/, task-schema.json). Use it for tracking, search, and AI context across projects (e.g. copylume, tasks-app).

**For AI (Cursor):** Read **`AI_TASK_INDEX_GUIDE.md`** first — it explains how to approach the index (purpose, refine, link related files, review, add new, implement). For **creating new tickets** that add value and improve the app (and optionally implementation details), see **`TASK_ORIENTATION.md`**.

## Files

| File / folder | Purpose |
|---------------|--------|
| **`AI_TASK_INDEX_GUIDE.md`** | **Entry point for AI:** how to approach index.yaml (purpose, refine tasks, link related files, review, add new, implement). |
| **`TASK_ORIENTATION.md`** | **Orientation:** how to create new tickets that add value and improve the app; optionally create implementation details (details file) for each. |
| **`PROMPT_FOR_IA.md`** | Copy-paste prompt to send to an AI so it works on tasks using the index and details. |
| **`data/tasks/index.yaml`** | Machine-readable task list. **Single source of truth** for id, title, status, priority, area, **app**, **project**, details, **start_date**, **due_date**. Only fields defined in **`data/tasks/task-schema.json`** are valid. |
| **`data/tasks/task-schema.json`** | JSON Schema for a single task. Use it to validate data; the Planner app and API reject invalid or unknown fields. |
| **`data/tasks/details/`** | Per-task details: `details/<id>-<slug>.md`. Add a `details` field in index.yaml pointing to the file. AI reads this first when working on the task. |
| **`details/_template.md`** | Template to copy when creating a new details file. |
| **`projects/`** | One .md per **project** (e.g. copylume, tasks-app) describing scope. Filter by project in the tasks app. |
| **`reference/`** | Legacy reference: where appendix refs pointed (NEXT_STEPS_PLAN, NEXT_STEPS_BY_AREA). See `reference/README.md`. |
| **`PLAN_TASKS_APP.md`** | Feature plan for the tasks-app: new features, upgrades, refactors; tasks from the plan are in index.yaml with `project: tasks-app`. |
| **`PLAN_COPYLUME.md`** | (Optional copy.) Feature plan for Copylume; tasks with `project: copylume` live in index.yaml. |
| **`CLARITY_SCORE.md`** | How **clarity_score** (0–100) works: AI (e.g. Cursor) evaluates implementation clarity from the details file; low = needs discovery, high = ready to implement. |
| **`README.md`** | This file. |

## Task index fields (`index.yaml`)

- **id** — Unique number.
- **title** — Short title.
- **status** — `todo` \| `in_progress` \| `done` \| `cancelled` \| `canceled` \| `wont` \| `discovery_needed`
- **priority** — `high` \| `normal` \| `low` \| `triage`
- **area** — Where it lives: `infra`, `api`, `web`, `demo`, `packages`, `billing`, `tasks`, etc.
- **app** — Which app the task primarily belongs to: `web`, `api`, `tasks`, `demo`, `packages`, `infra`. Use for filtering in the tasks app.
- **project** — Project scope: `copylume` (main product) or `tasks-app` (improvements to the task list app). Lets you keep tasks-app backlog separate from main backlog.
- **appendix** — *Legacy.* Refs to NEXT_STEPS_PLAN / NEXT_STEPS_BY_AREA. Prefer **details/** and **project** for new tasks.
- **details** — Optional. Path to a per-task details file (e.g. `details/001-neon-db.md`).
- **start_date** — Optional. Start date `YYYY-MM-DD`. Backfilled for done tasks; AI or UI can set for new work.
- **due_date** — Optional. Due date `YYYY-MM-DD`. Backfilled for done tasks; AI or UI can set for new work.
- **clarity_score** — Optional. Integer 0–100. Indicates how clear the implementation path is; **AI (e.g. Cursor) should evaluate** from the task’s details file and set/update it. Low = needs discovery; high = ready to implement. See **`CLARITY_SCORE.md`**.

**Only the fields above (and in `task-schema.json`) are valid.** Adding other keys can cause validation errors in the tasks app.

## Workflow

1. **Pick next task** — Open the tasks app (or read index.yaml); filter by status, priority, **project**, **app**.
2. **Start work** — Set `status: in_progress` in index.yaml.
3. **Get details** — If the task has a `details` file, read it (summary, acceptance criteria, Notes). For legacy tasks, appendix pointed to NEXT_STEPS_* (see reference/).
4. **Add context** — Use the **Notes** section in the task’s details file; AI uses it when working on the task.
5. **Finish** — Set `status: done` in index.yaml.

## For AI / search

- **List open tasks:** `status` in `[todo, in_progress]`.
- **By project:** Filter `project` (e.g. `copylume`, `tasks-app`).
- **By app:** Filter `app` (e.g. `web`, `api`, `tasks`).
- **By area:** Filter `area`.
- **Implementation details:** If the task has a `details` path, read that file first. Appendix is legacy reference only.
- **Clarity score:** After reading a task’s details file, **evaluate whether the implementation steps are clear** and set or update `clarity_score` (0–100) in index.yaml. See **`CLARITY_SCORE.md`** for how to interpret and who sets it.
