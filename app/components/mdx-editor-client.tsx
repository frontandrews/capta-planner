"use client";

import {
	MDXEditor,
	type MDXEditorMethods,
	type MDXEditorProps,
	headingsPlugin,
	listsPlugin,
	markdownShortcutPlugin,
	quotePlugin,
	thematicBreakPlugin,
} from "@mdxeditor/editor";
import type { ForwardedRef } from "react";
import "@mdxeditor/editor/style.css";

export default function InitializedMDXEditor({
	editorRef,
	...props
}: { editorRef: ForwardedRef<MDXEditorMethods | null> } & MDXEditorProps) {
	return (
		<MDXEditor
			plugins={[
				headingsPlugin(),
				listsPlugin(),
				quotePlugin(),
				thematicBreakPlugin(),
				markdownShortcutPlugin(),
			]}
			{...props}
			ref={editorRef}
		/>
	);
}
