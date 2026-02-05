# Task orientation — create new tickets that add value and improve the app

This document orients you on **how to create new tickets** that add value and improve the app. You can also create **implementation details** (a details file) for each new task so they are ready to implement later.

---

## 1. Understand the app (so new tasks add value)

Before proposing new tasks, get context so tickets target real improvements:

| Goal | Where to look |
|------|----------------|
| **Dev environment & requirements** | `docs/technical/DEV_REQUIREMENTS.md` |
| **Design → React patterns** | `docs/technical/DESIGN_TO_REACT_GUIDE.md` |
| **Initial product plan** | `docs/technical/INITIAL_PLAN.md` |
| **Code snippets & reference** | `docs/technical/APPENDIX_SNIPPETS.md` |
| **Task index (structure, fields)** | `docs/technical/tasks/TASK_INDEX_GUIDE.md` |
| **Tasks-app scope** | `docs/technical/tasks/PLAN_TASKS_APP.md` |

**Codebase layout:** `apps/web`, `apps/api`, `apps/tasks`, `apps/demo`; shared code in `packages/`. Use `area` and `app` when creating tasks so they target the right place.

---

## 2. What makes a new task add value

- **Improves the app:** Fixes a bug, adds a feature, improves UX, security, performance, or maintainability.
- **Scoped:** One clear outcome; not a multi-epic blob.
- **Actionable:** Someone can implement it; optional details file makes this explicit (acceptance criteria, implementation steps).
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

---

## Links

| Doc | Purpose |
|-----|---------|
| **TASK_INDEX_GUIDE.md** | How to use the task index (review, add, implement). |
| **index.yaml** | Single source of truth; append new tasks here. |
| **task-schema.json** | Valid fields only; no extra keys. |
| **details/_template.md** | Template for new implementation details files. |
| **CLARITY_SCORE.md** | How to set clarity_score (0–100) after writing a details file. |
| **PLAN_TASKS_APP.md** | Product plan for tasks-app work. |

Use this orientation when you need to **create new tickets** that add value and improve the app, and optionally **create implementation details** for them.
