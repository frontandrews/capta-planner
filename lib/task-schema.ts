/**
 * Allowed task fields for index.yaml. Used to validate PATCH body and avoid invalid data.
 * Must stay in sync with data/tasks/task-schema.json and Task type.
 */
export const TASK_STATUSES = [
	"todo",
	"in_progress",
	"done",
	"cancelled",
	"canceled",
	"wont",
	"discovery_needed",
	"triage",
] as const;

/** Fields that can be updated via PATCH /api/tasks/[id] */
export const PATCH_ALLOWED_KEYS = [
	"status",
	"start_date",
	"due_date",
	"tags",
	"related",
	"clarity_score",
] as const;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isTaskStatus(s: unknown): s is (typeof TASK_STATUSES)[number] {
	return (
		typeof s === "string" &&
		TASK_STATUSES.includes(s as (typeof TASK_STATUSES)[number])
	);
}

function isDateOrEmpty(s: unknown): boolean {
	if (s === null || s === undefined) return true;
	if (typeof s !== "string") return false;
	return s === "" || DATE_REGEX.test(s);
}

function isStringArray(s: unknown): s is string[] {
	if (!Array.isArray(s)) return false;
	return s.every((x) => typeof x === "string");
}

function isNumberArray(s: unknown): s is number[] {
	if (!Array.isArray(s)) return false;
	return s.every((x) => typeof x === "number" && Number.isInteger(x) && x >= 1);
}

function isClarityScore(n: unknown): n is number {
	return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 100;
}

export type PatchBody = {
	status?: string;
	start_date?: string;
	due_date?: string;
	tags?: string[];
	related?: number[];
	clarity_score?: number;
};

/**
 * Validate and sanitize PATCH body. Returns only allowed keys with valid values.
 */
export function validatePatchBody(
	body: Record<string, unknown>,
): PatchBody | null {
	const out: PatchBody = {};
	for (const key of PATCH_ALLOWED_KEYS) {
		const v = body[key];
		if (v === undefined) continue;
		if (key === "status") {
			if (!isTaskStatus(v)) return null;
			out.status = v;
		} else if (key === "start_date" || key === "due_date") {
			if (!isDateOrEmpty(v)) return null;
			out[key] = typeof v === "string" ? v : "";
		} else if (key === "tags") {
			if (!isStringArray(v)) return null;
			out.tags = v;
		} else if (key === "related") {
			if (!isNumberArray(v)) return null;
			out.related = v;
		} else if (key === "clarity_score") {
			if (!isClarityScore(v)) return null;
			out.clarity_score = v;
		}
	}
	return Object.keys(out).length ? out : null;
}
