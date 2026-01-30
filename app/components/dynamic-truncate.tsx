"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Only applies truncation (ellipsis) when content overflows.
 * Avoids showing "..." when text fits.
 */
export function DynamicTruncate({
	children,
	className = "",
	title,
}: {
	children: React.ReactNode;
	className?: string;
	title?: string;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const [overflowing, setOverflowing] = useState(false);

	// Re-run when children change so we re-measure (ResizeObserver may not fire for scrollWidth-only changes).
	// biome-ignore lint/correctness/useExhaustiveDependencies: children intentionally triggers re-measure
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		const check = () => setOverflowing(el.scrollWidth > el.clientWidth);
		check();
		const ro = new ResizeObserver(check);
		ro.observe(el);
		return () => ro.disconnect();
	}, [children]);

	return (
		<span
			ref={ref}
			className={
				overflowing
					? `truncate block ${className}`.trim()
					: `block min-w-0 ${className}`.trim()
			}
			title={
				overflowing
					? (title ?? (typeof children === "string" ? children : undefined))
					: title
			}
		>
			{children}
		</span>
	);
}
