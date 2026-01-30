import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { validatePatchBody } from "@/lib/task-schema";
import { getTasksDir } from "@/lib/tasks-dir";
import { parse, stringify } from "yaml";

type Params = { params: Promise<{ id: string }> };

type TaskEntry = { id: number; [key: string]: unknown };

export async function PATCH(req: Request, { params }: Params) {
	const { id: idParam } = await params;
	const taskId = Number(idParam);
	if (!Number.isInteger(taskId) || taskId < 1) {
		return new Response("Bad request", { status: 400 });
	}

	let body: Record<string, unknown>;
	try {
		body = (await req.json()) as Record<string, unknown>;
	} catch {
		return new Response("Bad request", { status: 400 });
	}

	const allowed = validatePatchBody(body);
	if (!allowed) {
		return new Response("Bad request: invalid or disallowed fields", {
			status: 400,
		});
	}

	const tasksDir = getTasksDir();
	const yamlPath = join(tasksDir, "index.yaml");
	const raw = readFileSync(yamlPath, "utf8");
	const doc = parse(raw) as { tasks?: TaskEntry[] };
	const tasks = doc.tasks ?? [];
	const index = tasks.findIndex((t) => t.id === taskId);
	if (index === -1) {
		return new Response("Not found", { status: 404 });
	}

	const task = tasks[index] as TaskEntry;
	if (allowed.status !== undefined) task.status = allowed.status;
	if (allowed.start_date !== undefined) task.start_date = allowed.start_date;
	if (allowed.due_date !== undefined) task.due_date = allowed.due_date;
	if (allowed.tags !== undefined) task.tags = allowed.tags;
	if (allowed.related !== undefined) task.related = allowed.related;
	if (allowed.clarity_score !== undefined)
		task.clarity_score = allowed.clarity_score;

	const newRaw = stringify({ tasks }, { lineWidth: 0 });
	writeFileSync(yamlPath, newRaw, "utf8");

	return Response.json({ ok: true, task });
}
