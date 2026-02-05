# How to use the task index

This document is the **entry point** for working with tasks: **review**, **add new**, and **approach implementation**. Read it when you need to understand the purpose of `index.yaml`, how to refine tasks, how to link related files, and how to implement work from the index. For **creating new tickets** that add value and improve the app (and optionally implementation details), see **`TASK_ORIENTATION.md`**.

---

## 1. Purpose of `index.yaml`

- **Single source of truth** — All tasks live in `data/tasks/index.yaml`. Each entry has `id`, `title`, `status`, `priority`, `area`, and optional `summary`, `details`, `related`, `clarity_score`, etc.
- **Entry point for**  
  - **Review:** Filter and sort tasks; read details to assess readiness and clarity.  
  - **Add new:** Append new tasks with valid fields only; optionally create a details file and link it.  
  - **Implementation:** Pick a task → read its details → implement → update status and optionally add a completion note.
- **Schema** — Only fields defined in `task-schema.json` are valid. Unknown keys can break the tasks app and API.

**Path:** `data/tasks/index.yaml`  
**Schema:** `data/tasks/task-schema.json`

---

## 2. How to use the index (workflow)

| Goal | What to do |
|------|-------------|
| **Pick next task** | Filter `index.yaml` by `status: todo` or `in_progress`; sort by `priority` (high first). Optionally filter by `project` (primary-app / tasks-app) or `app` (web, api, tasks, etc.). Prefer tasks with a `details` path and higher `clarity_score` when you want a clear implementation path. |
| **Review a task** | Open the task in the index; if it has `details: details/<id>-<slug>.md`, read that file first (Summary, Acceptance criteria, Implementation steps, Gaps / unknowns). Use `related` to open linked tasks. Check `clarity_score` and update it after reading the details (see [Refining tasks](#4-how-to-refine-tasks)). |
| **Add a new task** | Choose next free `id` (max existing + 1). Append one entry to `index.yaml` with required fields: `id`, `title`, `status`, `priority`, `area`. Add `summary`, `project`, `app`, `created_date` (e.g. `date -Iseconds`), and optionally `details`, `related`, `tags`. Validate against `task-schema.json`. Optionally create a details file from `details/_template.md` and set `details: details/<id>-<slug>.md`. |
| **Start implementation** | Set the task’s `status` to `in_progress` in `index.yaml`. Read the task’s **details file** (if present); follow Implementation steps and Acceptance criteria. Open any `related` task details for context. |
| **Finish implementation** | Set `status` to `done` in `index.yaml`. If the project uses completion notes, add a short note (e.g. in the task’s details file under "Decision log" / "Completed", or as specified in ASSISTANT_USAGE / README). |

---

## 3. Related files (what to read and when)

| File | When to use it |
|------|-----------------|
| **`index.yaml`** | Always. The task list; filter, add, update status and clarity_score here. |
| **`task-schema.json`** | When adding or changing task fields. Only schema-defined fields are valid. |
| **`data/tasks/details/<id>-<slug>.md`** | When implementing or reviewing a task. The `details` field in index points to this file. Contains Summary, Acceptance criteria, Implementation steps, Gaps / unknowns, Notes. |
| **`data/tasks/details/_template.md`** | When creating a new details file. Copy to `details/<id>-<slug>.md` and fill in. |
| **`README.md`** (this folder) | Overview of the task system, fields, and workflow. |
| **`CLARITY_SCORE.md`** | When evaluating or setting `clarity_score`. Explains 0–100, "Gaps / unknowns (why not 100)", and how to improve clarity. |
| **`PLAN_TASKS_APP.md`** | When adding or understanding tasks with `project: tasks-app`. Feature plan for the tasks app. |
| **`projects/*.md`** | Optional. One doc per project (e.g. primary-app, tasks-app) for scope and context. |
| **`reference/README.md`** | Legacy. Where old appendix refs (NEXT_STEPS_PLAN, etc.) pointed. |
| **Session rules** | Align with index, details, clarity_score, completion note as in this guide. |
| **`TASK_ORIENTATION.md`** | Orientation: create new tickets that add value and improve the app; optionally create implementation details (details file) for each. |

**Linking in the index:**

- **`details`** — Set to `details/<id>-<slug>.md` so the task has a dedicated spec. Read this first when working on the task.
- **`related`** — List of task IDs (e.g. `related: [2, 4]`). Open those details when implementing or refining this task.
- **`appendix`** — Legacy refs (e.g. § 4, NEXT_STEPS_PLAN). Prefer `details` and `project` for new tasks.

---

## 4. How to refine tasks

Refining means making a task clearer so it can be implemented with less discovery.

1. **Create or update the details file**  
   - If the task has no `details` entry, create `details/<id>-<slug>.md` from `details/_template.md`.  
   - Fill in **Summary**, **Acceptance criteria**, **Implementation steps**, and **Gaps / unknowns (why not 100)**.  
   - In `index.yaml` set `details: details/<id>-<slug>.md`.

2. **Document gaps first, then score**  
   - In the details file, fill **"Gaps / unknowns (why not 100)"** with: unknowns (decisions not made), gaps (steps that depend on uninspected code/docs), missing links (prerequisites or other tasks).  
   - Set **`clarity_score`** in `index.yaml` based on that list: no gaps → up to 100; a few → 80–95; several → 70–79; many → &lt;70. Do not use 100 until the list is empty or resolved. See `CLARITY_SCORE.md`.

3. **Link related work**  
   - Add **`related`** in `index.yaml` with task IDs that must be read or done before/with this task.  
   - In the details file, mention dependencies in Implementation steps or Gaps.

4. **Keep YAML valid**  
   - Summaries that contain `:`, `#`, or unbalanced `"` can break parsing. Use single-quoted or double-quoted strings for such values (e.g. `summary: '"Quoted part"; rest of summary.'`).

5. **Resolve gaps over time**  
   - As you inspect code or make decisions, update Implementation steps and Notes; remove or shorten items in Gaps / unknowns and re-evaluate `clarity_score`.

---

## 5. Approaching task implementation (checklist)

1. **Choose a task** — From `index.yaml`, filter by status/priority/project; prefer one with a details file and higher clarity_score.
2. **Set status** — In `index.yaml` set `status: in_progress` for that task.
3. **Read details** — Open the file in `details` (Summary, Acceptance criteria, Implementation steps, Gaps / unknowns, Notes).
4. **Open related** — If `related` is set, open those task details for context or order (e.g. implement dependency first).
5. **Implement** — Follow Implementation steps; satisfy Acceptance criteria. Use Notes and project/plan docs if needed.
6. **Close** — Set `status: done` in `index.yaml`. Add a completion note if the project expects it (e.g. in the details file or as in ASSISTANT_USAGE).
7. **Optional** — If you discovered missing steps or new gaps, update the details file and adjust `clarity_score` for future use.

---

## 6. Quick reference

- **Index path:** `data/tasks/index.yaml`  
- **Schema:** `data/tasks/task-schema.json`  
- **Details template:** `data/tasks/details/_template.md`  
- **Clarity rules:** `docs/CLARITY_SCORE.md`  
- **Session/task rules:** `docs/technical/ASSISTANT_USAGE.md`  
- **Valid statuses:** todo, in_progress, done, cancelled, canceled, wont, discovery_needed, triage  
- **Valid priority:** high, normal, low (triage is used in some entries; schema may allow it)  
- **Required fields per task:** id, title, status, priority, area  

Use this guide as the entry point whenever you review, add, or implement tasks from the index.
