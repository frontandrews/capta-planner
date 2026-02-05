# Task orientation — create new tickets that add value and improve the app

This document orients you (human or AI) on **how to create new tickets** that add value and improve the app. You can also ask to **create implementation details** (a details file) for each new task so they are ready to implement later.

---

## 1. Understand the app (so new tasks add value)

Before proposing new tasks, get context so tickets target real improvements:

| Goal | Where to look |
|------|----------------|
| **Dev environment & requirements** | `docs/technical/DEV_REQUIREMENTS.md` |
| **Design → React patterns** | `docs/technical/DESIGN_TO_REACT_GUIDE.md` |
| **Initial product plan** | `docs/technical/INITIAL_PLAN.md` |
| **Code snippets & reference** | `docs/technical/APPENDIX_SNIPPETS.md` |
| **Task index (structure, fields)** | `docs/technical/tasks/AI_TASK_INDEX_GUIDE.md` |
| **Tasks-app scope** | `docs/technical/tasks/PLAN_TASKS_APP.md` |

**Codebase layout:** `apps/web`, `apps/api`, `apps/tasks`, `apps/demo`; shared code in `packages/`. Use `area` and `app` when creating tasks so they target the right place.

---

## 2. What makes a new task add value

- **Improves the app:** Fixes a bug, adds a feature, improves UX, security, performance, or maintainability.
- **Scoped:** One clear outcome; not a multi-epic blob.
- **Actionable:** Someone (or AI) can implement it; optional details file makes this explicit (acceptance criteria, implementation steps).
- **Placed correctly:** `project` (primary-app / tasks-app), `app` (web, api, tasks, etc.), `area`, and optional `related` so it fits the backlog.

---

## 3. Creating new tasks (index + optional implementation details)

**Step 1 — Add to the index**

- Choose the next free `id` (max existing + 1 in `docs/technical/tasks/index.yaml`).
- Append one entry with **required** fields: `id`, `title`, `status`, `priority`, `area`.
- Add `summary`, `project`, `app`, `created_date` (e.g. `date -I`), and optionally `details`, `related`, `tags`.
- Use **only** fields from `docs/technical/tasks/task-schema.json` (unknown keys can break the tasks app and API).

**Step 2 — Optionally create implementation details**

- Copy `docs/technical/tasks/details/_template.md` to `details/<id>-<slug>.md`.
- Fill in:
  - **Summary** — One-line reminder.
  - **Acceptance criteria** — Concrete “done when” bullets.
  - **Implementation steps** — Numbered steps so someone can implement without extra discovery (this drives a higher `clarity_score`).
  - **Gaps / unknowns (why not 100)** — Unknowns, open decisions, or missing links; leave empty if none.
- In `index.yaml` set `details: details/<id>-<slug>.md` for that task.
- Set `clarity_score` (0–100) in `index.yaml` based on those gaps. See `docs/technical/tasks/CLARITY_SCORE.md`.

You can ask an AI to both propose new tickets and create these details files in one go (e.g. “create 3 new tasks that improve the app and write implementation details for each”).

---

## 4. Quick reference prompt (copy-paste)

Use this when you want an AI to **create new tickets** that add value and improve the app, and optionally **create implementation details** for each:

```
Create new tickets that add value and improve the app.

1. **Context:** Read docs/technical/tasks/TASK_ORIENTATION.md and, for product scope, docs/technical/tasks/PLAN_TASKS_APP.md. Understand the codebase (apps/web, api, tasks; packages/) so tasks target the right area and app.

2. **Index:** Add each new task to docs/technical/tasks/index.yaml. Use the next free id (max existing + 1). Required fields: id, title, status, priority, area. Also add summary, project, app, created_date; optionally details, related, tags. Use only fields from docs/technical/tasks/task-schema.json.

3. **Implementation details (optional):** For each new task, optionally create a details file: copy docs/technical/tasks/details/_template.md to details/<id>-<slug>.md. Fill Summary, Acceptance criteria, Implementation steps, and "Gaps / unknowns (why not 100)". Set details: details/<id>-<slug>.md in index.yaml and set clarity_score (0–100) per docs/technical/tasks/CLARITY_SCORE.md.

4. **Value:** Each task should improve the app (feature, fix, UX, security, performance, or maintainability), be scoped to one clear outcome, and have the right project/app/area.
```

---

## 5. Short version (minimal prompt)

```
Create new tickets that add value and improve the app. Add them to docs/technical/tasks/index.yaml (next free id; required: id, title, status, priority, area; use only fields from task-schema.json). Optionally create implementation details for each: copy details/_template.md to details/<id>-<slug>.md, fill Acceptance criteria and Implementation steps, set details and clarity_score in index.yaml. See docs/technical/tasks/TASK_ORIENTATION.md.
```

---

## Links

| Doc | Purpose |
|-----|---------|
| **AI_TASK_INDEX_GUIDE.md** | How to use the task index (review, add, implement). |
| **index.yaml** | Single source of truth; append new tasks here. |
| **task-schema.json** | Valid fields only; no extra keys. |
| **details/_template.md** | Template for new implementation details files. |
| **CLARITY_SCORE.md** | How to set clarity_score (0–100) after writing a details file. |
| **PROMPT_FOR_IA.md** | Prompt for implementing existing tasks (pick, implement, done). |

Use this orientation when you need to **create new tickets** that add value and improve the app, and optionally **create implementation details** for them.
