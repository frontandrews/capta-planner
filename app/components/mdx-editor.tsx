"use client";

import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import dynamic from "next/dynamic";
import { forwardRef } from "react";

const Editor = dynamic(() => import("./mdx-editor-client"), { ssr: false });

export const TaskNoteEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
	(props, ref) => <Editor {...props} editorRef={ref} />,
);
TaskNoteEditor.displayName = "TaskNoteEditor";
