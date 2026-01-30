/**
 * Task shape from data/tasks/index.yaml
 */
export type TaskStatus =
	| "todo"
	| "in_progress"
	| "done"
	| "wont_do"
	| "discovery_ia"
	| "discovery_manual"
	| "triage";
export type TaskPriority = "high" | "normal" | "low";

export interface Task {
	id: number;
	title: string;
	summary?: string;
	status: TaskStatus;
	priority: TaskPriority;
	area: string;
	/** Which app the task primarily belongs to (web, api, tasks, demo, packages, infra, etc.) */
	app?: string;
	/** Project scope: e.g. "copylume" (main), "tasks-app" (improvements to this task app) */
	project?: string;
	/** Legacy: refs to NEXT_STEPS_PLAN / NEXT_STEPS_BY_AREA. Prefer details/ and project instead. */
	appendix?: string;
	/** Path to details markdown file, e.g. "details/001-neon-db.md" */
	details?: string;
	/** Creation datetime ISO 8601 (e.g. 2026-01-28T14:30:00.000-03:00). Enables sort by latest. */
	created_date?: string;
	/** Start date (YYYY-MM-DD or ISO string) */
	start_date?: string;
	/** Due date (YYYY-MM-DD or ISO string) */
	due_date?: string;
	/** Tags for search and context (e.g. billing, stripe). AI can add for later search. */
	tags?: string[];
	/** Related task IDs for context. Open their details when working on this task. */
	related?: number[];
	/** Clarity score 0–100. Low = needs more discovery/evaluation before implementing. */
	clarity_score?: number;
}
