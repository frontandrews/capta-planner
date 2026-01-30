"use client";

import { Button, Card, CardContent } from "@/app/components/ui";
import type { Task } from "@/lib/task-types";
import {
	CheckCircleIcon,
	FilePlusIcon,
	GripVerticalIcon,
	XCircleIcon,
} from "lucide-react";
import { useCallback, useState } from "react";

const DROP_TRIAGED = "triaged";
const DROP_WONT = "wont";

type Props = {
	tasks: Task[];
	onStatusChange: (task: Task, status: string) => void | Promise<void>;
	onViewDetail: (task: Task) => void;
	onNewDetail: (task: Task) => void | Promise<void>;
};

function TriageCard({
	task,
	onViewDetail,
	onNewDetail,
	onDragStart,
	isDragging,
}: {
	task: Task;
	onViewDetail: (task: Task) => void;
	onNewDetail: (task: Task) => void | Promise<void>;
	onDragStart: (task: Task | null) => void;
	isDragging: boolean;
}) {
	const hasDetails = Boolean(task.details);
	return (
		<Card
			className={`cursor-grab active:cursor-grabbing border-l-4 border-l-amber-500/80 transition-shadow ${isDragging ? "opacity-60 shadow-lg" : "hover:shadow-md"}`}
			draggable
			onDragStart={(e) => {
				e.dataTransfer.setData(
					"application/json",
					JSON.stringify({ taskId: task.id }),
				);
				e.dataTransfer.effectAllowed = "move";
				onDragStart(task);
			}}
			onDragEnd={() => onDragStart(null)}
		>
			<CardContent className="p-3">
				<div className="flex items-start gap-2">
					<span className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden>
						<GripVerticalIcon className="size-4" />
					</span>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<span className="text-xs font-medium text-muted-foreground">
								#{task.id}
							</span>
							{task.priority && (
								<span className="rounded border border-border px-1.5 py-0 text-xs text-muted-foreground">
									{task.priority}
								</span>
							)}
							{task.area && (
								<span className="rounded border border-border px-1.5 py-0 text-xs text-muted-foreground">
									{task.area}
								</span>
							)}
						</div>
						<h3 className="mt-0.5 font-medium text-foreground line-clamp-2">
							{task.title}
						</h3>
						{task.summary && (
							<p className="mt-1 text-xs text-muted-foreground line-clamp-2">
								{task.summary}
							</p>
						)}
						<div className="mt-2 flex flex-wrap items-center gap-2">
							{hasDetails ? (
								<Button
									variant="outline"
									size="sm"
									className="h-7 text-xs"
									onClick={(e) => {
										e.stopPropagation();
										onViewDetail(task);
									}}
								>
									View details
								</Button>
							) : (
								<Button
									variant="outline"
									size="sm"
									className="h-7 gap-1 text-xs"
									onClick={(e) => {
										e.stopPropagation();
										onNewDetail(task);
									}}
								>
									<FilePlusIcon className="size-3.5" />
									New details
								</Button>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function DropZone({
	id,
	label,
	icon: Icon,
	onDrop,
	className,
}: {
	id: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	onDrop: (taskId: number) => void;
	className?: string;
}) {
	const [over, setOver] = useState(false);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setOver(true);
	}, []);
	const handleDragLeave = useCallback(() => setOver(false), []);
	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setOver(false);
			try {
				const data = JSON.parse(
					e.dataTransfer.getData("application/json") ?? "{}",
				);
				if (typeof data.taskId === "number") onDrop(data.taskId);
			} catch {
				// ignore
			}
		},
		[onDrop],
	);

	return (
		<div
			className={`flex min-h-[120px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${className ?? ""} ${over ? "border-primary/60 bg-primary/5" : "border-muted-foreground/30 bg-muted/30"}`}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			data-drop-zone={id}
		>
			<Icon className="size-8 shrink-0 text-muted-foreground" />
			<span className="mt-2 text-sm font-medium text-muted-foreground">
				{label}
			</span>
			<span className="mt-0.5 text-xs text-muted-foreground/80">
				Drop here to move
			</span>
		</div>
	);
}

export function TriageBoard({
	tasks,
	onStatusChange,
	onViewDetail,
	onNewDetail,
}: Props) {
	const [draggingTask, setDraggingTask] = useState<Task | null>(null);

	const handleDropTriaged = useCallback(
		async (taskId: number) => {
			const task = tasks.find((t) => t.id === taskId);
			if (task) await onStatusChange(task, "todo");
		},
		[tasks, onStatusChange],
	);

	const handleDropWont = useCallback(
		async (taskId: number) => {
			const task = tasks.find((t) => t.id === taskId);
			if (task) await onStatusChange(task, "wont");
		},
		[tasks, onStatusChange],
	);

	if (tasks.length === 0) {
		return (
			<Card className="border-amber-500/30">
				<CardContent className="py-8 text-center">
					<p className="text-sm text-muted-foreground">
						No tickets in triage. New tickets start here.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-[1fr_160px_160px]">
			<div>
				<h2 className="mb-2 text-sm font-medium text-muted-foreground">
					Needs triage ({tasks.length})
				</h2>
				<div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto rounded-lg border border-border/50 bg-muted/20 p-2">
					{tasks.map((task) => (
						<TriageCard
							key={task.id}
							task={task}
							onViewDetail={onViewDetail}
							onNewDetail={onNewDetail}
							onDragStart={(t) => setDraggingTask(t ?? null)}
							isDragging={draggingTask?.id === task.id}
						/>
					))}
				</div>
			</div>
			<div className="flex flex-col gap-4">
				<h2 className="text-sm font-medium text-muted-foreground">Move to</h2>
				<DropZone
					id={DROP_TRIAGED}
					label="Triaged"
					icon={CheckCircleIcon}
					onDrop={handleDropTriaged}
					className="border-green-500/40 bg-green-500/5"
				/>
				<DropZone
					id={DROP_WONT}
					label="Won't do"
					icon={XCircleIcon}
					onDrop={handleDropWont}
					className="border-red-500/40 bg-red-500/5"
				/>
			</div>
		</div>
	);
}
