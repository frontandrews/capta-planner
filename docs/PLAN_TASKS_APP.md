# Tasks app — feature plan

This document proposes **new features**, **upgrades**, **refactors**, and **updates** for the tasks-app so that:

1. **Cursor** can easily find the next tickets to work on and have reference to why decisions were taken.
2. **Developers** can customize task details, keep a history of completed work, and see progress in a clear UI.

The tasks derived from this plan are added to `index.yaml` with `project: tasks-app`. **Conventions:** new tickets start as `status: triage`; `created_date` uses current ISO time when adding.

---

## Current state (summary)

- **Source of truth:** `docs/technical/tasks/index.yaml` — tasks with id, title, status, priority, area, app, project, details path, dates, tags, related.
- **Details:** Per-task markdown in `details/<id>-<slug>.md` (Summary, Appendix, Acceptance criteria, **Notes**). API: GET/PUT details, POST details/new; PATCH task for status/dates/tags/related/clarity_score.
- **UI:** Table with filters (status, priority, area, app, project, tags), column visibility, status counts, detail panel with MDX editor, related tasks, SSE refresh in dev.
- **Gaps:** No completion history, no “next tickets” reference for Cursor, no Kanban/board view, no “add task” or bulk actions, no explicit decision log when marking done.

---

## 1. Cursor integration — “next tickets” and decision reference

**Goal:** Cursor (and other tools) can discover what to work on next and understand past decisions.

| Proposal | Description |
|----------|-------------|
| **Next-tickets API** | `GET /api/tasks/next?project=X&limit=N` returns open tasks (todo + in_progress) sorted by priority/date. Cursor or a rule can call this or read a generated file. |
| **Next-for-Cursor artifact** | Optional: script or API that writes `docs/technical/tasks/next-for-cursor.md` (or similar) listing next suggested tasks by project so Cursor can “read this file first.” |
| **ASSISTANT_USAGE / rules** | Update `docs/technical/ASSISTANT_USAGE.md` (and any Cursor rules) to point to tasks index, details/, and “next” source. Mention: “When finishing a task, add a short completion note in the task details Notes or Decision log.” |

**Tasks in index.yaml:** Next-tickets API; optional next-for-cursor artifact; doc updates for Cursor.

---

## 2. History and completed-task tracking

**Goal:** Keep a history of what was done and why, so Cursor and developers can see “why this decision was taken.”

| Proposal | Description |
|----------|-------------|
| **completed_date** | When status is set to `done`, optionally set `completed_date` (YYYY-MM-DD or ISO) in index.yaml. PATCH handler or UI can set it. Schema + task-schema.json update. |
| **Completion note** | When marking done, optional short “completion note” — either (a) append to task details file (e.g. ## Decision log / ## Completed), or (b) new field `completed_note` in index.yaml. Prefer (a) so one file holds full context. |
| **Decision log section** | In details template and existing details files: add optional **## Decision log** (or **## Completed**) with date + 1–2 line summary. UI: when status → done, prompt “Add completion note?” and append to details file. |
| **Completed tasks view** | UI: filter status=done, sort by completed_date or due_date; optional “History” or “Completed” view so developer can scan what was done. |

**Tasks in index.yaml:** completed_date in schema and PATCH; completion note flow (prompt + append to details); “Completed” / history view in UI.

---

## 3. UI upgrades

| Proposal | Description |
|----------|-------------|
| **Kanban board view** | Optional view toggle: List vs Board. Board columns: Todo, Triage, In progress, Done (and optionally Cancelled). Drag-and-drop to change status. |
| **Drag-and-drop status** | In table or board: drag task row/card to another status (or use existing dropdown). Requires PATCH on drop. |
| **Export** | Export current filtered list as Markdown or CSV (e.g. “Export” button in filters bar). |
| **Bulk status update** | Select multiple tasks (checkboxes), then “Set status to …” to change all at once. API: PATCH multiple or loop PATCH. |
| **Improve empty states** | When no tasks match filters, show clear message and “Clear filters” or suggested project/app. |

**Tasks in index.yaml:** Kanban view; drag-and-drop status; Export; bulk status update; empty states.

---

## 4. Data and schema evolution

| Proposal | Description |
|----------|-------------|
| **completed_date** | Add to task-schema.json and Task type; set in PATCH when status → done (optional). |
| **Validate index on read** | Validate parsed index.yaml against task-schema.json in GET /api/tasks (or a dedicated validation route); log or return validation errors. |
| **Per-project index (optional)** | If task 31 decides to split: support per-project YAML (e.g. `index/primary-app.yaml`, `index/tasks-app.yaml`) and merge or filter in API. |

**Tasks in index.yaml:** completed_date; validate index on read; implement per-project index only if decided in 31.

---

## 5. New features

| Proposal | Description |
|----------|-------------|
| **Create task from UI** | Form: title, summary, project, app, area, priority. API: POST /api/tasks — compute next id, append to index.yaml, optionally create details file from template. |
| **Search** | Full-text search on title + summary in UI (client-side or API). Optional: include Notes from details files (would require indexing or reading details in API). |
| **Saved views / quick filters** | Allow saving a named filter set (e.g. “Primary app high priority”) for one-click apply. Could be localStorage or a small config file. |

**Tasks in index.yaml:** Create task from UI; Search (title/summary); Saved views (optional).

---

## 6. Refactors and maintenance

| Proposal | Description |
|----------|-------------|
| **Consistent status/priority** | Align task-types.ts and status.ts with task-schema.json (e.g. triage as status, not priority). |
| **API tests** | Add tests for GET /api/tasks, PATCH /api/tasks/[id], GET/PUT details, POST details/new (e.g. Vitest + fetch). |
| **Details template** | Add **## Decision log** (or **## Completed**) to `details/_template.md` and README. |

**Tasks in index.yaml:** API tests; template + doc updates; status/priority alignment if needed.

---

## Priority and order

Suggested order for implementation:

1. **Cursor & docs** — Next-tickets API, ASSISTANT_USAGE update (so Cursor can find next work immediately).
2. **History** — completed_date, Decision log in template, completion-note flow when marking done.
3. **UI** — Completed view, Export, then Kanban + drag-and-drop.
4. **Data** — Validation on read; per-project index only if task 31 decides to split.
5. **New features** — Create task from UI, Search, then optional saved views.
6. **Refactors** — API tests, template/README, status/priority consistency.

---

## Tasks added to index.yaml

The concrete tasks from this plan are added to `index.yaml` with `project: tasks-app` and ids ≥ 32. See `index.yaml` for the full list.

| Ids   | Area |
|-------|------|
| 32–36 | Cursor integration, history, completed view |
| 37–41 | Kanban, drag-and-drop, export, bulk update, empty state |
| 42–46 | Validation, create task, search, API tests, template/README |
| 47–56 | Next-for-Cursor artifact, saved views, keyboard shortcuts, Cursor rule, responsive, a11y, duplicate task, hide canceled, reordering, per-project index |
| 57–68 | Deep link, URL filters, copy as markdown, open in editor, created_date doc, clarity in triage, discovery drop zone, confirm toast, loading skeleton, optimistic update, sort triage, collapsible triage |

---

## 7. More potential features

| Proposal | Description |
|----------|-------------|
| **Deep link to task** | URL param e.g. `?task=32` so Cursor, docs, or PRs can link to a specific task; on load open detail panel if task exists. |
| **Persist filters in URL** | Store status/project/area etc. in query string (`?status=todo&project=primary-app`) for shareable links and back/forward. |
| **Copy as markdown** | Button to copy current task (or filtered list) as markdown for pasting into PR description or docs. |
| **Open details in editor** | Link from UI to open the task’s details file in VS Code/Cursor (e.g. `vscode://` or `cursor://` with file path). |
| **created_date convention** | Document in README: when adding a new task, set `created_date` with current ISO time, e.g. `date -Iseconds` or `date +"%Y-%m-%dT%H:%M:%S%z"`. |
| **Clarity score in triage** | Show or edit clarity_score (0–100) on triage cards or in detail panel; schema already supports it. |
| **Discovery drop zone** | In Triage board, add “Move to discovery” drop zone that sets status to `discovery_needed`. |
| **Confirm toast on drop** | When dragging to Triaged / Won’t do, show a short toast (“Moved to To Do” / “Moved to Won’t do”). |
| **Loading skeleton** | Replace “Loading…” with a skeleton (table rows or cards) for perceived performance. |
| **Optimistic status update** | On status change (table or triage), update UI immediately and revert on PATCH failure. |
| **Sort triage cards** | Let user sort triage column by priority, created_date, or title. |
| **Collapsible Triage section** | Toggle to show/hide the Triage board so the table has more space when not triaging. |
