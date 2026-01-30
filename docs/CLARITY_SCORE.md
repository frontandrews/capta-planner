# Clarity score — implementation readiness

The **clarity_score** field (0–100) in `index.yaml` indicates how clear the **implementation path** is for a task. It is intended for **AI (e.g. Cursor)** to evaluate and update so you can measure how "ready to implement" a task is.

## Purpose

- **For AI:** When reading a task (especially its `details` file), evaluate whether the steps to implement are clear. If they are, set or suggest a high clarity_score; if not, set a low score and optionally add implementation steps or notes to the details file.
- **For humans:** Filter or sort by clarity_score to pick tasks that are ready to implement (high score) vs tasks that need more discovery or breakdown (low score).
- **For the product:** Over time, tasks with details files and implementation steps tend to have higher clarity; triage tasks or vague ideas tend to have lower clarity until someone (human or AI) adds structure.

## How to interpret the score

| Score range | Meaning |
|-------------|--------|
| **80–100** | Implementation path is clear. Acceptance criteria and implementation steps are spelled out; dependencies are known; AI or a developer can implement without further discovery. |
| **50–79** | Partially clear. Some steps or acceptance criteria exist but may be incomplete or depend on decisions not yet documented. |
| **1–49** | Needs discovery. The task is underspecified: missing implementation steps, unclear acceptance criteria, or open questions. Prefer adding details or breaking down before implementing. |
| **0 or unset** | Not yet evaluated, or no details file. AI can evaluate after reading the task summary and (if present) the details file. |

## Who sets clarity_score

- **Cursor / AI:** When working with tasks, after reading a task's `details` file (or summary if no details), evaluate whether the implementation path is clear. If the task has a `details` file with **Implementation steps** and **Acceptance criteria** filled in, the path is usually clear (high score). If the details file is missing or the steps are vague, the score should be low. Update `clarity_score` in `index.yaml` via the tasks app (PATCH) or by editing the YAML.
- **Humans:** Can set or adjust clarity_score in the tasks app or in `index.yaml` when adding implementation steps or after triage.

## Why not 100? (start here when scoring)

A score of **100** means: no unknown parts, no open decisions, no missing links — an implementer can follow the details file without any further discovery.

**When evaluating a task, start by writing unknown parts or potential gaps** in the details file (section **"Gaps / unknowns (why not 100)"**). Base the score on those gaps: if there are none (or the list is empty), use up to 100; if there are gaps, do **not** use 100 until they are resolved. To justify a score **below 100**, the details file must list:

- **Unknown parts:** Decisions not yet made (e.g. exact env name, which library to use).
- **Potential gaps:** Steps that depend on code or docs not yet inspected; integration points not fully specified.
- **Missing links:** Prerequisites (other tasks, APIs, schema) that are not yet done or documented.

Once those gaps are filled (decisions documented, steps made concrete, dependencies linked), re-evaluate and raise the score toward 100. **Always base the score on these gaps:** if there are none, use 100; if there are a few, use 80–95; if several or major, use 70–79; if many or critical unknowns, use &lt;70.

## How to improve clarity (and thus the score)

1. **Create or update the task's details file** (`details/<id>-<slug>.md`).
2. **Add Implementation steps** — Numbered steps that a developer (or AI) can follow (e.g. "1. Add env ALLOWED_ORIGINS. 2. In getCorsHeaders, if NODE_ENV=production and allowedSet is null, return 403.").
3. **Fill Acceptance criteria** — Concrete "done when" bullets so completion is verifiable.
4. **Document dependencies** — List related tasks or prerequisites in the details file or in `related` in index.yaml.
5. **Resolve open questions in Notes** — Move decisions and context into the details file so the path is clear.
6. **Shrink "Gaps / unknowns"** — Resolve each gap (or document the decision) so the section is empty or minimal; then score can approach 100.

After the details file is updated, re-evaluate clarity_score (or ask AI to do it).

## Where clarity_score lives

- **Schema:** `docs/technical/tasks/task-schema.json` — `clarity_score` is an optional integer 0–100.
- **Index:** `docs/technical/tasks/index.yaml` — optional field per task.
- **Tasks app:** The detail panel shows "Clarity: N%" when present; PATCH `/api/tasks/:id` accepts `clarity_score` so AI or users can update it.

## Summary

Use **clarity_score** so Cursor (or any AI) can **evaluate whether the implementation steps are clear** and so you can **measure how ready a task is to implement**. Low score = add more structure in the details file; high score = safe to implement.
