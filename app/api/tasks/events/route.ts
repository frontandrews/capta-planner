import { join } from "node:path";
import { getTasksDir } from "@/lib/tasks-dir";

const clients = new Set<ReadableStreamDefaultController>();
let watcher: { close: () => void } | null = null;

function broadcast() {
	for (const controller of clients) {
		try {
			controller.enqueue(new TextEncoder().encode("data: refresh\n\n"));
		} catch {
			clients.delete(controller);
		}
	}
}

function startWatcher() {
	if (watcher) return;
	const tasksDir = getTasksDir();
	import("chokidar").then(({ default: chokidar }) => {
		const w = chokidar.watch(
			[join(tasksDir, "index.yaml"), join(tasksDir, "details", "**", "*.md")],
			{ ignoreInitial: true },
		);
		watcher = w;
		w.on("add", broadcast);
		w.on("change", broadcast);
		w.on("unlink", broadcast);
	});
}

export async function GET() {
	if (process.env.NODE_ENV !== "development") {
		return new Response("Not available", { status: 404 });
	}

	startWatcher();

	let controllerRef: ReadableStreamDefaultController | null = null;
	const stream = new ReadableStream({
		start(controller) {
			controllerRef = controller;
			clients.add(controller);
		},
		cancel() {
			if (controllerRef) {
				clients.delete(controllerRef);
				controllerRef = null;
			}
			if (clients.size === 0 && watcher) {
				watcher.close();
				watcher = null;
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-store",
			Connection: "keep-alive",
		},
	});
}
