import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getTasksDir } from "@/lib/tasks-dir";
import { parse } from "yaml";

type TaskEntry = { id: number; details?: string; [key: string]: unknown };

function enrichDetails(tasksDir: string, tasks: TaskEntry[]): TaskEntry[] {
	const detailsDir = join(tasksDir, "details");
	if (!existsSync(detailsDir)) return tasks;
	const files = readdirSync(detailsDir);
	const byId = new Map<number, string>();
	for (const f of files) {
		const match = /^(\d+)-.+\.md$/.exec(f);
		if (match) byId.set(Number(match[1]), `details/${f}`);
	}
	return tasks.map((t) => {
		if (t.details) return t;
		const path = byId.get(t.id);
		return path ? { ...t, details: path } : t;
	});
}

export async function GET() {
	const tasksDir = getTasksDir();
	const yamlPath = join(tasksDir, "index.yaml");
	const raw = readFileSync(yamlPath, "utf8");
	const { tasks } = parse(raw) as { tasks: TaskEntry[] };
	const enriched = enrichDetails(tasksDir, tasks ?? []);
	return Response.json({ tasks: enriched });
}
