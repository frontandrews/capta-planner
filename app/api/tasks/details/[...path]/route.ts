import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getTasksDir } from "@/lib/tasks-dir";

type Params = { params: Promise<{ path: string[] }> };

function validatePath(pathSegments: string[]): string | null {
	if (!pathSegments?.length) return null;
	const safe = pathSegments.every(
		(seg) => !seg.includes("..") && /^[\w-]+$/.test(seg),
	);
	return safe ? `${join(getTasksDir(), "details", ...pathSegments)}.md` : null;
}

export async function GET(_req: Request, { params }: Params) {
	const { path: pathSegments } = await params;
	const filePath = validatePath(pathSegments);
	if (!filePath || !existsSync(filePath)) {
		return new Response("Not found", { status: 404 });
	}
	const content = readFileSync(filePath, "utf8");
	return Response.json({ content });
}

export async function PUT(req: Request, { params }: Params) {
	const { path: pathSegments } = await params;
	const filePath = validatePath(pathSegments);
	if (!filePath) {
		return new Response("Bad request", { status: 400 });
	}
	if (!existsSync(filePath)) {
		return new Response("Not found", { status: 404 });
	}
	let body: { content?: string };
	try {
		body = (await req.json()) as { content?: string };
	} catch {
		return new Response("Bad request", { status: 400 });
	}
	if (typeof body.content !== "string") {
		return new Response("Bad request", { status: 400 });
	}
	writeFileSync(filePath, body.content, "utf8");
	return Response.json({ ok: true });
}
