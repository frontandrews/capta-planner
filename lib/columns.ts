import type { VisibilityState } from "@tanstack/react-table";

export const COLUMN_STORAGE_KEY = "planner-app-column-visibility";

/** All table column ids in display order (statusTier is hidden, used for sort only) */
export const COLUMN_IDS = [
	"statusTier",
	"id",
	"title",
	"status",
	"priority",
	"area",
	"app",
	"project",
	"tags",
	"created_date",
	"start_date",
	"due_date",
	"ref",
	"details",
] as const;

export type ColumnId = (typeof COLUMN_IDS)[number];

export const COLUMN_LABELS: Record<ColumnId, string> = {
	statusTier: "Status tier",
	id: "#",
	title: "Title",
	status: "Status",
	priority: "Priority",
	area: "Area",
	app: "App",
	project: "Project",
	tags: "Tags",
	created_date: "Created",
	start_date: "Start",
	due_date: "Due",
	ref: "Ref",
	details: "View",
};

/** Default visible: title, status, priority, project, view only (statusTier always hidden) */
export const DEFAULT_COLUMN_VISIBILITY: VisibilityState = {
	statusTier: false,
	id: false,
	title: true,
	status: true,
	priority: true,
	area: false,
	app: false,
	project: true,
	tags: false,
	created_date: false,
	start_date: false,
	due_date: false,
	ref: false,
	details: true,
};

export function loadColumnVisibility(): VisibilityState {
	if (typeof window === "undefined") return DEFAULT_COLUMN_VISIBILITY;
	try {
		const raw = localStorage.getItem(COLUMN_STORAGE_KEY);
		if (!raw) return DEFAULT_COLUMN_VISIBILITY;
		const parsed = JSON.parse(raw) as Record<string, boolean>;
		return { ...DEFAULT_COLUMN_VISIBILITY, ...parsed };
	} catch {
		return DEFAULT_COLUMN_VISIBILITY;
	}
}

export function saveColumnVisibility(visibility: VisibilityState): void {
	try {
		localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(visibility));
	} catch {
		// ignore
	}
}
