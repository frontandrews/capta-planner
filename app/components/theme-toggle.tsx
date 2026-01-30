"use client";

import { Button } from "@/app/components/ui";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	// Avoid hydration mismatch: theme is only known on client (localStorage/system)
	if (!mounted) {
		return (
			<Button
				variant="ghost"
				size="icon"
				title="Theme"
				type="button"
				aria-label="Theme"
				disabled
			>
				<SunIcon className="size-4" />
			</Button>
		);
	}

	const isDark = theme === "dark";
	const label = isDark ? "Switch to light mode" : "Switch to dark mode";

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			title={label}
			type="button"
			aria-label={label}
		>
			<SunIcon className="size-4 dark:hidden" />
			<MoonIcon className="size-4 hidden dark:block" />
		</Button>
	);
}
