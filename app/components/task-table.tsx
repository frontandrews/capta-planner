"use client";

import {
	Button,
	Card,
	CardContent,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	ScrollArea,
	ScrollBar,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/app/components/ui";
import { STATUS_OPTIONS, getStatusLabel } from "@/lib/status";
import type { Task } from "@/lib/task-types";
import {
	type ColumnDef,
	type PaginationState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowDownIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	ArrowUpDownIcon,
	ArrowUpIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	CircleCheckIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DynamicTruncate } from "./dynamic-truncate";

/** 0 = active, 1 = done, 2 = canceled — used to sort done/canceled to bottom */
function statusTier(status: string): number {
	if (status === "canceled" || status === "cancelled" || status === "wont")
		return 2;
	if (status === "done") return 1;
	return 0;
}

function isCanceled(status: string): boolean {
	return status === "canceled" || status === "cancelled" || status === "wont";
}

const statusBadgeClass: Record<string, string> = {
	done: "bg-slate-800 text-slate-300 border-slate-600",
	in_progress: "bg-amber-900/50 text-amber-200 border-amber-700",
	cancelled: "bg-red-900/30 text-red-200 border-red-800",
	canceled: "bg-red-900/30 text-red-200 border-red-800",
	wont: "bg-zinc-800 text-zinc-300 border-zinc-600",
	discovery_needed: "bg-violet-900/50 text-violet-200 border-violet-700",
	triage: "bg-amber-900/50 text-amber-200 border-amber-700",
	todo: "bg-blue-900/50 text-blue-200 border-blue-700",
};

function SortIcon({
	direction,
}: {
	direction: "asc" | "desc" | false;
}) {
	if (direction === "asc") return <ArrowUpIcon className="size-3.5 shrink-0" />;
	if (direction === "desc")
		return <ArrowDownIcon className="size-3.5 shrink-0" />;
	return <ArrowUpDownIcon className="size-3.5 shrink-0 opacity-50" />;
}

function formatDate(s: string | undefined): string {
	if (!s) return "—";
	const d = s.slice(0, 10);
	if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
	return s;
}

/** Format created_date (ISO 8601 or YYYY-MM-DD) for display with time when available. */
function formatCreatedDateTime(s: string | undefined): string {
	if (!s) return "—";
	const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
	if (dateOnly.test(s.trim())) return s.trim();
	const iso = s.includes("T") ? new Date(s) : null;
	if (iso && !Number.isNaN(iso.getTime())) {
		return iso.toLocaleString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	}
	return s.slice(0, 19);
}

const MOBILE_BREAKPOINT = 768;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export function TaskTable({
	tasks,
	columnVisibility: userColumnVisibility,
	onViewDetail,
	onNewDetail,
	onStatusChange,
}: {
	tasks: Task[];
	columnVisibility: VisibilityState;
	onViewDetail: (task: Task) => void;
	onNewDetail?: (task: Task) => void;
	onStatusChange?: (task: Task, status: string) => void;
}) {
	const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "statusTier", desc: false },
		{ id: "created_date", desc: true },
		{ id: "priority", desc: false },
		{ id: "id", desc: false },
	]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const update = () => setIsMobile(mql.matches);
		update();
		mql.addEventListener("change", update);
		return () => mql.removeEventListener("change", update);
	}, []);

	const columnVisibility = useMemo<VisibilityState>(() => {
		if (isMobile) {
			return {
				statusTier: false,
				id: false,
				title: true,
				status: true,
				priority: false,
				area: false,
				app: false,
				project: false,
				tags: false,
				created_date: false,
				start_date: false,
				due_date: false,
				ref: false,
				details: true,
			} as VisibilityState;
		}
		return { statusTier: false, ...userColumnVisibility };
	}, [isMobile, userColumnVisibility]);

	const columns = useMemo<ColumnDef<Task>[]>(
		() => [
			{
				id: "statusTier",
				accessorFn: (row) => statusTier(row.status),
				header: "",
				cell: () => null,
				size: 0,
				enableSorting: true,
				enableHiding: true,
			},
			{
				accessorKey: "id",
				header: "#",
				cell: ({ getValue }) => (
					<span className="tabular-nums text-muted-foreground">
						{getValue() as number}
					</span>
				),
				size: 48,
				enableSorting: true,
			},
			{
				accessorKey: "title",
				header: "Title",
				cell: ({ row }) => {
					const task = row.original;
					const canceled = isCanceled(task.status);
					return (
						<div className={`min-w-0 ${canceled ? "opacity-75" : ""}`}>
							<DynamicTruncate
								className={`font-medium w-full ${canceled ? "line-through" : ""}`}
								title={task.title}
							>
								{task.title}
							</DynamicTruncate>
							{task.summary && (
								<DynamicTruncate
									className={`text-xs text-muted-foreground w-full mt-0.5 ${canceled ? "line-through" : ""}`}
									title={task.summary}
								>
									{task.summary}
								</DynamicTruncate>
							)}
						</div>
					);
				},
				enableSorting: true,
				minSize: 120,
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => {
					const task = row.original;
					const status = task.status;
					if (onStatusChange) {
						return (
							<div
								className="contents"
								onClick={(e) => e.stopPropagation()}
								onPointerDown={(e) => e.stopPropagation()}
								onKeyDown={(e) => e.stopPropagation()}
							>
								<DropdownMenu modal={false}>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="h-8 gap-1.5 min-w-[100px]"
										>
											{getStatusLabel(status)}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align="start"
										className="w-48 max-h-[280px] overflow-y-auto scroll-fancy"
									>
										<DropdownMenuLabel>Change status</DropdownMenuLabel>
										{STATUS_OPTIONS.map((s) => (
											<DropdownMenuItem
												key={s}
												onClick={() => onStatusChange(task, s)}
											>
												{getStatusLabel(s)}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						);
					}
					const done = status === "done";
					return (
						<span
							className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${statusBadgeClass[status] ?? "border-border"}`}
						>
							{done && (
								<CircleCheckIcon className="size-3.5 text-emerald-500 shrink-0" />
							)}
							{getStatusLabel(status)}
						</span>
					);
				},
				size: 130,
				enableSorting: true,
			},
			{
				accessorKey: "priority",
				header: "Priority",
				cell: ({ getValue }) => (
					<span className="text-muted-foreground capitalize">
						{getValue() as string}
					</span>
				),
				size: 88,
				enableSorting: true,
				sortingFn: (rowA, rowB) => {
					const order = ["high", "normal", "low"];
					const a = order.indexOf((rowA.getValue("priority") as string) ?? "");
					const b = order.indexOf((rowB.getValue("priority") as string) ?? "");
					return a - b;
				},
			},
			{
				accessorKey: "area",
				header: "Area",
				cell: ({ getValue }) => (
					<span className="text-muted-foreground">
						{(getValue() as string) ?? "—"}
					</span>
				),
				size: 88,
				enableSorting: true,
			},
			{
				accessorKey: "app",
				header: "App",
				cell: ({ getValue }) => (
					<span className="text-muted-foreground text-xs">
						{(getValue() as string) ?? "—"}
					</span>
				),
				size: 72,
				enableSorting: true,
			},
			{
				accessorKey: "project",
				header: "Project",
				cell: ({ getValue }) => (
					<span className="text-muted-foreground text-xs">
						{(getValue() as string) ?? "—"}
					</span>
				),
				size: 88,
				enableSorting: true,
			},
			{
				accessorKey: "tags",
				header: "Tags",
				cell: ({ row }) => {
					const tags = row.original.tags;
					if (!tags?.length)
						return <span className="text-muted-foreground text-xs">—</span>;
					return (
						<div className="flex flex-wrap gap-0.5 max-w-[120px]">
							{tags.slice(0, 4).map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground"
								>
									{tag}
								</span>
							))}
							{tags.length > 4 && (
								<span className="font-mono text-[10px] text-muted-foreground">
									+{tags.length - 4}
								</span>
							)}
						</div>
					);
				},
				size: 120,
				enableSorting: false,
			},
			{
				accessorKey: "created_date",
				header: "Created",
				cell: ({ getValue }) => (
					<span className="text-muted-foreground text-xs tabular-nums whitespace-nowrap">
						{formatCreatedDateTime(getValue() as string)}
					</span>
				),
				size: 140,
				enableSorting: true,
				sortingFn: (rowA, rowB) => {
					const a = (rowA.getValue("created_date") as string) ?? "";
					const b = (rowB.getValue("created_date") as string) ?? "";
					return a.localeCompare(b, undefined, { numeric: true });
				},
			},
			{
				accessorKey: "start_date",
				header: "Start",
				cell: ({ getValue }) => (
					<span className="text-muted-foreground text-xs tabular-nums">
						{formatDate(getValue() as string)}
					</span>
				),
				size: 96,
				enableSorting: true,
			},
			{
				accessorKey: "due_date",
				header: "Due",
				cell: ({ getValue }) => (
					<span className="text-muted-foreground text-xs tabular-nums">
						{formatDate(getValue() as string)}
					</span>
				),
				size: 96,
				enableSorting: true,
			},
			{
				id: "ref",
				accessorFn: (row) => row.appendix ?? "",
				header: "Ref",
				cell: ({ row }) => (
					<div
						className="text-xs text-muted-foreground w-full"
						title={row.original.appendix ?? undefined}
					>
						{row.original.appendix ?? "—"}
					</div>
				),
				size: 96,
				enableSorting: false,
			},
			{
				id: "details",
				header: "",
				cell: ({ row }) => {
					const task = row.original;
					const hasDetails = Boolean(task.details);
					const isHovered = hoveredRowId === row.id;
					const canceled = isCanceled(task.status);
					const done = task.status === "done";
					const showNew =
						!hasDetails &&
						onNewDetail &&
						!canceled &&
						!done &&
						(isHovered || false);
					return hasDetails ? (
						<Button
							variant="outline"
							size="sm"
							className="shrink-0"
							onClick={() => onViewDetail(task)}
						>
							View
						</Button>
					) : showNew ? (
						<Button
							variant="outline"
							size="sm"
							className="shrink-0"
							onClick={() => onNewDetail(task)}
						>
							New
						</Button>
					) : (
						<span className="text-muted-foreground text-xs">—</span>
					);
				},
				size: 80,
				enableSorting: false,
			},
		],
		[onViewDetail, onNewDetail, onStatusChange, hoveredRowId],
	);

	const table = useReactTable({
		data: tasks,
		columns,
		state: { sorting, columnVisibility, pagination },
		onSortingChange: setSorting,
		onColumnVisibilityChange: () => {},
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getRowId: (row) => String(row.id),
		autoResetPageIndex: false,
	});

	const prePaginationRows = table.getPrePaginationRowModel().rows;
	const totalRows = prePaginationRows.length;
	const pageSize = table.getState().pagination.pageSize;
	const pageIndex = table.getState().pagination.pageIndex;
	const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
	const end = Math.min((pageIndex + 1) * pageSize, totalRows);

	return (
		<Card className="overflow-hidden">
			<ScrollArea className="w-full">
				<CardContent className="p-0">
					<table className="w-full text-sm border-collapse">
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr
									key={headerGroup.id}
									className="border-b border-border bg-card"
								>
									{headerGroup.headers.map((header) => {
										const canSort = header.column.getCanSort();
										return (
											<th
												key={header.id}
												className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap"
												style={{
													width:
														header.getSize() !== 150
															? header.getSize()
															: undefined,
													minWidth: header.column.columnDef.minSize,
												}}
											>
												{canSort ? (
													<button
														type="button"
														className="flex items-center gap-1.5 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
														onClick={header.column.getToggleSortingHandler()}
													>
														{header.isPlaceholder
															? null
															: flexRender(
																	header.column.columnDef.header,
																	header.getContext(),
																)}
														<SortIcon
															direction={
																header.column.getIsSorted() === false
																	? false
																	: header.column.getIsSorted()
															}
														/>
													</button>
												) : header.isPlaceholder ? null : (
													flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)
												)}
											</th>
										);
									})}
								</tr>
							))}
						</thead>
						<tbody>
							{table.getRowModel().rows.map((row) => {
								const task = row.original;
								const canceled = isCanceled(task.status);
								const done = task.status === "done";
								const needsDiscovery =
									task.status === "discovery_ia" ||
									task.status === "discovery_manual";
								const needsTriage = task.status === "triage";
								const rowClass = [
									"border-b border-border last:border-b-0 transition-colors",
									canceled && "bg-muted/30 opacity-90",
									done &&
										!canceled &&
										"bg-emerald-500/5 hover:bg-emerald-500/10",
									needsDiscovery &&
										!done &&
										!canceled &&
										"bg-violet-500/5 hover:bg-violet-500/10",
									needsTriage &&
										!done &&
										!canceled &&
										!needsDiscovery &&
										"bg-amber-500/5 hover:bg-amber-500/10",
									!done &&
										!canceled &&
										!needsDiscovery &&
										!needsTriage &&
										"hover:bg-accent/10",
								]
									.filter(Boolean)
									.join(" ");
								return (
									<tr
										key={row.id}
										className={rowClass}
										onMouseEnter={() => setHoveredRowId(row.id)}
										onMouseLeave={(e) => {
											// Don't clear hover when pointer moves to dropdown (portaled content)
											// so columns aren't recreated and the status dropdown stays open
											const to = e.relatedTarget as Element | null;
											if (
												to?.closest?.('[data-slot="dropdown-menu-content"]')
											) {
												return;
											}
											setHoveredRowId(null);
										}}
									>
										{row.getVisibleCells().map((cell) => (
											<td
												key={cell.id}
												className="px-4 py-3 align-top"
												style={{
													width:
														cell.column.getSize() !== 150
															? cell.column.getSize()
															: undefined,
													minWidth: cell.column.columnDef.minSize,
												}}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</td>
										))}
									</tr>
								);
							})}
						</tbody>
					</table>
				</CardContent>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
			{/* Pagination: page size selector + range + prev/next */}
			<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
				<div className="flex items-center gap-2">
					<span className="whitespace-nowrap">Rows per page</span>
					<Select
						value={String(pageSize)}
						onValueChange={(v) => table.setPageSize(Number(v))}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent align="start">
							{PAGE_SIZE_OPTIONS.map((n) => (
								<SelectItem key={n} value={String(n)}>
									{n}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<span className="tabular-nums">
					{totalRows === 0 ? "0 rows" : `${start}–${end} of ${totalRows}`}
				</span>
				<div className="flex items-center gap-1">
					<Button
						variant="outline"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={() => table.firstPage()}
						disabled={!table.getCanPreviousPage()}
						aria-label="First page"
					>
						<ChevronsLeftIcon className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						aria-label="Previous page"
					>
						<ArrowLeftIcon className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						aria-label="Next page"
					>
						<ArrowRightIcon className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={() => table.lastPage()}
						disabled={!table.getCanNextPage()}
						aria-label="Last page"
					>
						<ChevronsRightIcon className="size-4" />
					</Button>
				</div>
			</div>
		</Card>
	);
}
