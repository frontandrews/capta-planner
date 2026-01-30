import type { TaskStatus } from "./task-types";

export const STATUS_OPTIONS: TaskStatus[] = [
	"todo",
	"in_progress",
	"done",
	"discovery_ia",
	"discovery_manual",
	"triage",
	"wont_do",
];

const STATUS_LABELS: Record<string, string> = {
	todo: "To Do",
	in_progress: "In Progress",
	done: "Done",
	discovery_ia: "Discovery (IA)",
	discovery_manual: "Discovery (manual)",
	triage: "Triage",
	wont_do: "Won't do",
};

export function getStatusLabel(status: string): string {
	return STATUS_LABELS[status] ?? status;
}
