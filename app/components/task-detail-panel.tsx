"use client";

import { Button, ScrollArea } from "@/app/components/ui";
import type { Task } from "@/lib/task-types";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { LockIcon, PencilIcon, UnlockIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DynamicTruncate } from "./dynamic-truncate";
import { TaskNoteEditor } from "./mdx-editor";

type Props = {
	detailsPath: string | null;
	title: string;
	summary?: string | null;
	createdDate?: string | null;
	startDate?: string | null;
	dueDate?: string | null;
	tags?: string[];
	related?: number[];
	allTasks?: Task[];
	refreshKey?: number;
	/** Clarity 0–100; low = needs more discovery/evaluation */
	clarityScore?: number | null;
	/** When true (canceled task), details are read-only by default; lock icon toggles edit */
	isCanceled?: boolean;
	onClose: () => void;
	onOpenRelated?: (id: number) => void;
};

function getDetailsApiPath(detailsPath: string | null): string | null {
	if (!detailsPath) return null;
	return detailsPath.replace(/^details\//, "").replace(/\.md$/, "");
}

function formatDate(s: string | undefined | null): string {
	if (!s) return "";
	const d = s.slice(0, 10);
	return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : s;
}

function formatCreatedDateTime(s: string | undefined | null): string {
	if (!s) return "";
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

export function TaskDetailPanel({
	detailsPath,
	title,
	summary,
	createdDate,
	startDate,
	dueDate,
	tags,
	related,
	allTasks = [],
	refreshKey = 0,
	clarityScore,
	isCanceled = false,
	onClose,
	onOpenRelated,
}: Props) {
	const [content, setContent] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editDraft, setEditDraft] = useState("");
	const [locked, setLocked] = useState(isCanceled);
	const editorRef = useRef<MDXEditorMethods>(null);

	// When opening a different task, reset locked to default for canceled
	// biome-ignore lint/correctness/useExhaustiveDependencies: detailsPath resets lock when switching task
	useEffect(() => {
		setLocked(isCanceled);
	}, [isCanceled, detailsPath]);

	const apiPath = getDetailsApiPath(detailsPath);

	const fetchContent = useCallback(async () => {
		if (!apiPath) {
			setContent(null);
			setError(null);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/tasks/details/${apiPath}`);
			if (!res.ok) throw new Error("Not found");
			const data = (await res.json()) as { content: string };
			setContent(data.content);
			setEditDraft(data.content);
		} catch {
			setError("Could not load details.");
			setContent(null);
		} finally {
			setLoading(false);
		}
	}, [apiPath]);

	// Refetch when detailsPath or SSE refresh (refreshKey) changes.
	// biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is intentional
	useEffect(() => {
		fetchContent();
	}, [fetchContent, refreshKey]);

	// Prefetch related task details in the background when panel opens.
	useEffect(() => {
		if (!related?.length || !allTasks.length) return;
		for (const id of related) {
			const task = allTasks.find((t) => t.id === id);
			const path = task?.details;
			if (!path) continue;
			const apiPath = path.replace(/^details\//, "").replace(/\.md$/, "");
			void fetch(`/api/tasks/details/${apiPath}`).catch(() => {});
		}
	}, [related, allTasks]);

	const handleStartEdit = useCallback(() => {
		setEditDraft(content ?? "");
		setIsEditing(true);
	}, [content]);

	const handleCancelEdit = useCallback(() => {
		setIsEditing(false);
		setEditDraft(content ?? "");
	}, [content]);

	const handleSave = useCallback(async () => {
		if (!apiPath) return;
		const markdown = editorRef.current?.getMarkdown() ?? editDraft;
		setSaving(true);
		setError(null);
		try {
			const res = await fetch(`/api/tasks/details/${apiPath}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: markdown }),
			});
			if (!res.ok) throw new Error("Save failed");
			setContent(markdown);
			setEditDraft(markdown);
			setIsEditing(false);
		} catch {
			setError("Could not save.");
		} finally {
			setSaving(false);
		}
	}, [apiPath, editDraft]);

	const canEdit = content != null && !loading && (!isCanceled || !locked);

	return (
		<div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-background shadow-xl md:max-w-xl">
			<div className="flex shrink-0 flex-col gap-1 border-b border-border px-4 py-3">
				<div className="flex items-center justify-between gap-2">
					<h2
						className={`text-lg font-semibold min-w-0 ${isCanceled ? "line-through opacity-80" : ""}`}
					>
						<DynamicTruncate className="w-full" title={title}>
							{title}
						</DynamicTruncate>
					</h2>
					<div className="flex items-center gap-1">
						{content != null && !loading && isEditing && (
							<>
								<Button
									variant="outline"
									size="sm"
									onClick={handleSave}
									disabled={saving}
									type="button"
								>
									{saving ? "Saving…" : "Save"}
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleCancelEdit}
									disabled={saving}
									type="button"
								>
									Cancel
								</Button>
							</>
						)}
						{content != null && !loading && !isEditing && (
							<>
								{isCanceled && (
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setLocked((l) => !l)}
										title={locked ? "Unlock to edit" : "Lock (prevent edits)"}
										type="button"
									>
										{locked ? (
											<LockIcon className="size-4 text-muted-foreground" />
										) : (
											<UnlockIcon className="size-4 text-muted-foreground" />
										)}
									</Button>
								)}
								{canEdit && (
									<Button
										variant="ghost"
										size="icon"
										onClick={handleStartEdit}
										title="Edit note"
										type="button"
									>
										<PencilIcon className="size-4" />
									</Button>
								)}
							</>
						)}
						<Button
							variant="ghost"
							size="icon"
							onClick={onClose}
							title="Close"
							type="button"
						>
							<XIcon className="size-4" />
						</Button>
					</div>
				</div>
				{(summary ||
					createdDate != null ||
					startDate ||
					dueDate ||
					(tags && tags.length > 0) ||
					(related && related.length > 0) ||
					clarityScore != null) && (
					<div
						className={`text-xs text-muted-foreground space-y-0.5 ${isCanceled ? "line-through opacity-80" : ""}`}
					>
						{summary && <p className="line-clamp-2">{summary}</p>}
						{(createdDate != null ||
							startDate ||
							dueDate ||
							clarityScore != null) && (
							<p className="tabular-nums flex flex-wrap items-center gap-x-3 gap-y-0.5">
								{createdDate != null && (
									<span title="Created (ISO 8601)">
										Created: {formatCreatedDateTime(createdDate)}
									</span>
								)}
								{startDate && <span>Start: {formatDate(startDate)}</span>}
								{startDate && dueDate && " · "}
								{dueDate && <span>Due: {formatDate(dueDate)}</span>}
								{clarityScore != null && (
									<span
										className={
											clarityScore < 50
												? "text-amber-600 dark:text-amber-400"
												: clarityScore < 80
													? "text-muted-foreground"
													: "text-emerald-600 dark:text-emerald-400"
										}
										title="Clarity 0–100: low = needs more discovery/evaluation"
									>
										Clarity: {clarityScore}%
									</span>
								)}
							</p>
						)}
						{tags && tags.length > 0 && (
							<div className="flex flex-wrap gap-1 pt-0.5">
								{tags.map((tag) => (
									<span
										key={tag}
										className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
									>
										{tag}
									</span>
								))}
							</div>
						)}
						{related && related.length > 0 && (
							<p className="pt-0.5">
								<span className="text-muted-foreground">Related: </span>
								{related.map((id, i) => {
									const task = allTasks.find((t) => t.id === id);
									const label = task ? `#${id} ${task.title}` : `#${id}`;
									return (
										<span key={id}>
											{i > 0 && ", "}
											{onOpenRelated ? (
												<button
													type="button"
													className="text-primary underline underline-offset-2 hover:no-underline"
													onClick={() => onOpenRelated(id)}
												>
													{label}
												</button>
											) : (
												<span>{label}</span>
											)}
										</span>
									);
								})}
							</p>
						)}
					</div>
				)}
			</div>
			<ScrollArea className="flex-1">
				<div className="p-4">
					{loading && <p className="text-muted-foreground">Loading…</p>}
					{error && <p className="text-destructive">{error}</p>}
					{content != null && !loading && isEditing ? (
						<div className="min-h-[400px] [&_.mdxeditor]:rounded-md [&_.mdxeditor]:border [&_.mdxeditor]:border-[var(--color-border)] [&_.mdxeditor]:bg-[var(--color-input)]">
							<TaskNoteEditor
								ref={editorRef}
								key={apiPath ?? "none"}
								markdown={editDraft}
								onChange={(md) => setEditDraft(md)}
								className="min-h-[380px]"
								contentEditableClassName="prose prose-sm dark:prose-invert max-w-none min-h-[360px] p-3"
							/>
						</div>
					) : content != null && !loading ? (
						<div className="prose prose-sm dark:prose-invert max-w-none">
							<ReactMarkdown remarkPlugins={[remarkGfm]}>
								{content}
							</ReactMarkdown>
						</div>
					) : null}
				</div>
			</ScrollArea>
		</div>
	);
}
