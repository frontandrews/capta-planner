import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getTasksDir } from "@/lib/tasks-dir";

function slugify(title: string): string {
	return (
		title
			.trim()
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "") || "task"
	);
}

export async function POST(req: Request) {
	let body: { taskId?: number; title?: string };
	try {
		body = (await req.json()) as { taskId?: number; title?: string };
	} catch {
		return new Response("Bad request", { status: 400 });
	}
	const { taskId, title } = body;
	if (
		typeof taskId !== "number" ||
		typeof title !== "string" ||
		!title.trim()
	) {
		return new Response("Bad request", { status: 400 });
	}

	const tasksDir = getTasksDir();
	const detailsDir = join(tasksDir, "details");
	const templatePath = join(detailsDir, "_template.md");
	if (!existsSync(templatePath)) {
		return new Response("Template not found", { status: 500 });
	}

	const slug = slugify(title);
	const filename = `${taskId}-${slug}.md`;
	const filePath = join(detailsDir, filename);
	if (existsSync(filePath)) {
		return Response.json(
			{ detailsPath: `details/${filename}` },
			{ status: 200 },
		);
	}

	let template = readFileSync(templatePath, "utf8");
	template = template.replace(/\{\{\s*id\s*\}\}/g, String(taskId));
	template = template.replace(/\{\{\s*title\s*\}\}/g, title.trim());

	writeFileSync(filePath, template, "utf8");
	return Response.json({ detailsPath: `details/${filename}` });
}
