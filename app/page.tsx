"use client";

import {
	Button,
	Card,
	CardContent,
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/app/components/ui";
import {
	COLUMN_IDS,
	COLUMN_LABELS,
	type ColumnId,
	loadColumnVisibility,
	saveColumnVisibility,
} from "@/lib/columns";
import { STATUS_OPTIONS, getStatusLabel } from "@/lib/status";
import type { Task } from "@/lib/task-types";
import type { VisibilityState } from "@tanstack/react-table";
import { ColumnsIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TaskDetailPanel } from "./components/task-detail-panel";
import { TaskTable } from "./components/task-table";
import { ThemeToggle } from "./components/theme-toggle";
import { TriageBoard } from "./components/triage-board";

const PRIORITY_OPTIONS = ["high", "normal", "low"];

export default function TasksPage() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<string[]>([]);
	const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
	const [areaFilter, setAreaFilter] = useState<string[]>([]);
	const [appFilter, setAppFilter] = useState<string[]>([]);
	const [projectFilter, setProjectFilter] = useState<string[]>([]);
	const [detailTask, setDetailTask] = useState<Task | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		() => loadColumnVisibility(),
	);
	const [tagFilter, setTagFilter] = useState<string[]>([]);

	const fetchTasks = useCallback(async () => {
		const res = await fetch("/api/tasks");
		if (!res.ok) return;
		const data = (await res.json()) as { tasks: Task[] };
		setTasks(data.tasks ?? []);
	}, []);

	useEffect(() => {
		fetchTasks().finally(() => setLoading(false));
	}, [fetchTasks]);

	useEffect(() => {
		if (process.env.NODE_ENV !== "development") return;
		const es = new EventSource("/api/tasks/events");
		es.onmessage = () => {
			fetchTasks();
			setRefreshKey((k) => k + 1);
		};
		return () => es.close();
	}, [fetchTasks]);

	const areas = useMemo(
		() => [...new Set(tasks.map((t) => t.area))].filter(Boolean).sort(),
		[tasks],
	);
	const apps = useMemo(
		() =>
			[
				...new Set(
					tasks.map((t) => t.app).filter((x): x is string => Boolean(x)),
				),
			].sort(),
		[tasks],
	);
	const projects = useMemo(
		() =>
			[
				...new Set(
					tasks.map((t) => t.project).filter((x): x is string => Boolean(x)),
				),
			].sort(),
		[tasks],
	);
	const filtered = useMemo(
		() =>
			tasks.filter(
				(t) =>
					(statusFilter.length === 0 || statusFilter.includes(t.status)) &&
					(priorityFilter.length === 0 ||
						priorityFilter.includes(t.priority)) &&
					(areaFilter.length === 0 || areaFilter.includes(t.area)) &&
					(appFilter.length === 0 || appFilter.includes(t.app ?? "")) &&
					(projectFilter.length === 0 ||
						projectFilter.includes(t.project ?? "")),
			),
		[tasks, statusFilter, priorityFilter, areaFilter, appFilter, projectFilter],
	);

	const allTags = useMemo(
		() => [...new Set(tasks.flatMap((t) => t.tags ?? []))].sort(),
		[tasks],
	);

	const filteredByTag = useMemo(
		() =>
			tagFilter.length === 0
				? filtered
				: filtered.filter((t) =>
					t.tags?.some((tag) => tagFilter.includes(tag)),
				),
		[filtered, tagFilter],
	);

	const statusCounts = useMemo(
		() => ({
			todo: filteredByTag.filter((t) => t.status === "todo").length,
			triage: filteredByTag.filter((t) => t.status === "triage").length,
			in_progress: filteredByTag.filter((t) => t.status === "in_progress")
				.length,
			done: filteredByTag.filter((t) => t.status === "done").length,
		}),
		[filteredByTag],
	);

	const triageTasks = useMemo(
		() => filteredByTag.filter((t) => t.status === "triage"),
		[filteredByTag],
	);

	const handleNewDetail = useCallback(
		async (task: Task) => {
			const res = await fetch("/api/tasks/details/new", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ taskId: task.id, title: task.title }),
			});
			if (!res.ok) return;
			const data = (await res.json()) as { detailsPath: string };
			if (data.detailsPath) {
				await fetchTasks();
				setDetailTask({ ...task, details: data.detailsPath });
				toast.success("Task note created", {
					description: `#${task.id} ${task.title}`,
				});
			}
		},
		[fetchTasks],
	);

	const handleStatusChange = useCallback(
		async (task: Task, status: string) => {
			const res = await fetch(`/api/tasks/${task.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});
			if (!res.ok) return;
			await fetchTasks();
			if (detailTask?.id === task.id) {
				setDetailTask((prev) =>
					prev ? { ...prev, status: status as Task["status"] } : null,
				);
			}
			if (status === "done") {
				toast.success("Task marked as done", {
					description: `#${task.id} ${task.title}`,
				});
			}
		},
		[fetchTasks, detailTask?.id],
	);

	const handleColumnVisibilityChange = useCallback(
		(columnId: ColumnId, visible: boolean) => {
			setColumnVisibility((prev) => {
				const next = { ...prev, [columnId]: visible };
				saveColumnVisibility(next);
				return next;
			});
		},
		[],
	);

	const handleTagFilterToggle = useCallback((tag: string, checked: boolean) => {
		setTagFilter((prev) =>
			checked ? [...prev, tag] : prev.filter((t) => t !== tag),
		);
	}, []);

	const handleMultiFilterToggle = useCallback(
		(
			setter: React.Dispatch<React.SetStateAction<string[]>>,
			value: string,
			checked: boolean,
		) => {
			setter((prev) =>
				checked ? [...prev, value] : prev.filter((v) => v !== value),
			);
		},
		[],
	);

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-400 px-4 py-6 sm:px-6 lg:px-8">
				<header className="mb-6 flex items-start justify-between gap-4">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight text-foreground">
							Planner
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							From task index (see PLANNER_DATA_DIR)
							{process.env.NODE_ENV === "development" &&
								" · Edits auto-refresh"}
						</p>
					</div>
					<ThemeToggle />
				</header>

				<div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
					<Card className="border-l-4 border-l-blue-500/80">
						<CardContent className="flex items-center gap-2 py-3 pl-4 pr-4">
							<span
								className="h-2 w-2 shrink-0 rounded-full bg-blue-500"
								aria-hidden
							/>
							<span className="text-sm font-medium text-muted-foreground">
								{getStatusLabel("todo")}
							</span>
							<span className="ml-auto tabular-nums font-semibold text-foreground">
								{statusCounts.todo}
							</span>
						</CardContent>
					</Card>
					<Card className="border-l-4 border-l-amber-500/80">
						<CardContent className="flex items-center gap-2 py-3 pl-4 pr-4">
							<span
								className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
								aria-hidden
							/>
							<span className="text-sm font-medium text-muted-foreground">
								{getStatusLabel("triage")}
							</span>
							<span className="ml-auto tabular-nums font-semibold text-foreground">
								{statusCounts.triage}
							</span>
						</CardContent>
					</Card>
					<Card className="border-l-4 border-l-amber-600/80">
						<CardContent className="flex items-center gap-2 py-3 pl-4 pr-4">
							<span
								className="h-2 w-2 shrink-0 rounded-full bg-amber-600"
								aria-hidden
							/>
							<span className="text-sm font-medium text-muted-foreground">
								{getStatusLabel("in_progress")}
							</span>
							<span className="ml-auto tabular-nums font-semibold text-foreground">
								{statusCounts.in_progress}
							</span>
						</CardContent>
					</Card>
					<Card className="border-l-4 border-l-emerald-500/80">
						<CardContent className="flex items-center gap-2 py-3 pl-4 pr-4">
							<span
								className="h-2 w-2 shrink-0 rounded-full bg-emerald-500"
								aria-hidden
							/>
							<span className="text-sm font-medium text-muted-foreground">
								{getStatusLabel("done")}
							</span>
							<span className="ml-auto tabular-nums font-semibold text-foreground">
								{statusCounts.done}
							</span>
						</CardContent>
					</Card>
				</div>

				<section className="mb-6" aria-labelledby="triage-heading">
					<h2
						id="triage-heading"
						className="mb-3 text-lg font-semibold text-foreground"
					>
						Triage
					</h2>
					<p className="mb-3 text-sm text-muted-foreground">
						Review tickets in triage. Drag a card to <strong>Triaged</strong>{" "}
						(move to To Do) or <strong>Won&apos;t do</strong>. Use &quot;New
						details&quot; to add discovery and notes.
					</p>
					<TriageBoard
						tasks={triageTasks}
						onStatusChange={handleStatusChange}
						onViewDetail={setDetailTask}
						onNewDetail={handleNewDetail}
					/>
				</section>

				<Card className="mb-4">
					<CardContent className="px-4">
						<div className="flex flex-wrap items-center gap-x-4 gap-y-3">
							<span className="flex items-center gap-2 text-sm font-medium text-(--color-muted-foreground)">
								Filters
							</span>
							<span className="flex items-center gap-2 text-sm">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="h-8 gap-1.5 min-w-25"
										>
											Status
											{statusFilter.length > 0 && (
												<span className="tabular-nums text-muted-foreground">
													({statusFilter.length})
												</span>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="start"
										className="w-48 max-h-70 overflow-y-auto scroll-fancy"
									>
										<DropdownMenuLabel>Filter by status</DropdownMenuLabel>
										{STATUS_OPTIONS.map((s) => (
											<DropdownMenuCheckboxItem
												key={s}
												checked={statusFilter.includes(s)}
												onCheckedChange={(checked: boolean | "indeterminate") =>
													handleMultiFilterToggle(
														setStatusFilter,
														s,
														checked === true,
													)
												}
											>
												{getStatusLabel(s)}
											</DropdownMenuCheckboxItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</span>
							<span className="flex items-center gap-2 text-sm">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="h-8 gap-1.5 min-w-25"
										>
											Priority
											{priorityFilter.length > 0 && (
												<span className="tabular-nums text-muted-foreground">
													({priorityFilter.length})
												</span>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="start"
										className="w-40 max-h-70 overflow-y-auto scroll-fancy"
									>
										<DropdownMenuLabel>Filter by priority</DropdownMenuLabel>
										{PRIORITY_OPTIONS.map((p) => (
											<DropdownMenuCheckboxItem
												key={p}
												checked={priorityFilter.includes(p)}
												onCheckedChange={(checked: boolean | "indeterminate") =>
													handleMultiFilterToggle(
														setPriorityFilter,
														p,
														checked === true,
													)
												}
											>
												{p}
											</DropdownMenuCheckboxItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</span>
							<span className="flex items-center gap-2 text-sm">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="h-8 gap-1.5 min-w-22.5"
										>
											Area
											{areaFilter.length > 0 && (
												<span className="tabular-nums text-muted-foreground">
													({areaFilter.length})
												</span>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="start"
										className="w-40 max-h-70 overflow-y-auto scroll-fancy"
									>
										<DropdownMenuLabel>Filter by area</DropdownMenuLabel>
										{areas.map((a) => (
											<DropdownMenuCheckboxItem
												key={a}
												checked={areaFilter.includes(a)}
												onCheckedChange={(checked: boolean | "indeterminate") =>
													handleMultiFilterToggle(
														setAreaFilter,
														a,
														checked === true,
													)
												}
											>
												{a}
											</DropdownMenuCheckboxItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</span>
							<span className="flex items-center gap-2 text-sm">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="h-8 gap-1.5 min-w-20"
										>
											App
											{appFilter.length > 0 && (
												<span className="tabular-nums text-muted-foreground">
													({appFilter.length})
												</span>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="start"
										className="w-40 max-h-70 overflow-y-auto scroll-fancy"
									>
										<DropdownMenuLabel>Filter by app</DropdownMenuLabel>
										{apps.map((a) => (
											<DropdownMenuCheckboxItem
												key={a}
												checked={appFilter.includes(a)}
												onCheckedChange={(checked: boolean | "indeterminate") =>
													handleMultiFilterToggle(
														setAppFilter,
														a,
														checked === true,
													)
												}
											>
												{a}
											</DropdownMenuCheckboxItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</span>
							<span className="flex items-center gap-2 text-sm">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="h-8 gap-1.5 min-w-22.5"
										>
											Project
											{projectFilter.length > 0 && (
												<span className="tabular-nums text-muted-foreground">
													({projectFilter.length})
												</span>
											)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="start"
										className="w-40 max-h-70 overflow-y-auto scroll-fancy"
									>
										<DropdownMenuLabel>Filter by project</DropdownMenuLabel>
										{projects.map((p) => (
											<DropdownMenuCheckboxItem
												key={p}
												checked={projectFilter.includes(p)}
												onCheckedChange={(checked: boolean | "indeterminate") =>
													handleMultiFilterToggle(
														setProjectFilter,
														p,
														checked === true,
													)
												}
											>
												{p}
											</DropdownMenuCheckboxItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</span>
							{allTags.length > 0 && (
								<span className="flex items-center gap-2 text-sm">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="h-8 gap-1.5"
											>
												Tags
												{tagFilter.length > 0 && (
													<span className="tabular-nums text-muted-foreground">
														({tagFilter.length})
													</span>
												)}
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="start"
											className="w-48 max-h-70 overflow-y-auto scroll-fancy"
										>
											<DropdownMenuLabel>Filter by tag</DropdownMenuLabel>
											{allTags.map((tag) => (
												<DropdownMenuCheckboxItem
													key={tag}
													checked={tagFilter.includes(tag)}
													onCheckedChange={(
														checked: boolean | "indeterminate",
													) => handleTagFilterToggle(tag, checked === true)}
												>
													{tag}
												</DropdownMenuCheckboxItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
								</span>
							)}
							<span className="flex items-center gap-2 text-sm">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm" className="h-8 gap-1.5">
											<ColumnsIcon className="size-4" />
											Columns
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56">
										<DropdownMenuLabel>Show columns</DropdownMenuLabel>
										{COLUMN_IDS.filter((id) => id !== "statusTier").map(
											(id) => (
												<DropdownMenuCheckboxItem
													key={id}
													checked={columnVisibility[id] !== false}
													onCheckedChange={(
														checked: boolean | "indeterminate",
													) =>
														handleColumnVisibilityChange(id, checked === true)
													}
												>
													{COLUMN_LABELS[id]}
												</DropdownMenuCheckboxItem>
											),
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							</span>
							<span className="ml-auto text-xs text-muted-foreground tabular-nums">
								{filteredByTag.length} task
								{filteredByTag.length !== 1 ? "s" : ""}
							</span>
						</div>
					</CardContent>
				</Card>

				{loading ? (
					<Card>
						<CardContent className="flex items-center justify-center py-12">
							<p className="text-sm text-(--color-muted-foreground)">
								Loading…
							</p>
						</CardContent>
					</Card>
				) : (
					<TaskTable
						tasks={filteredByTag}
						columnVisibility={columnVisibility}
						onViewDetail={setDetailTask}
						onNewDetail={handleNewDetail}
						onStatusChange={handleStatusChange}
					/>
				)}
			</div>

			{detailTask && (
				<TaskDetailPanel
					detailsPath={detailTask.details ?? null}
					title={detailTask.title}
					summary={detailTask.summary}
					createdDate={detailTask.created_date}
					startDate={detailTask.start_date}
					dueDate={detailTask.due_date}
					tags={detailTask.tags}
					related={detailTask.related}
					allTasks={tasks}
					refreshKey={refreshKey}
					clarityScore={detailTask.clarity_score}
					isCanceled={detailTask.status === "wont_do"}
					onClose={() => setDetailTask(null)}
					onOpenRelated={(id) => {
						const t = tasks.find((task) => task.id === id);
						if (t) setDetailTask(t);
					}}
				/>
			)}
		</div>
	);
}
