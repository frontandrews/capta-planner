import path from "node:path";

/**
 * Resolve path to task data (YAML index, details, schema).
 * Default: data/sample (shareable demo data, in repo).
 * Override with PLANNER_DATA_DIR for your own data:
 *   - /path/to/capta-planner-data (recommended: separate private repo)
 *   - data/tasks or data/projects/<name> (gitignored dirs in this repo)
 */
export function getTasksDir(): string {
	const env = process.env.PLANNER_DATA_DIR;
	if (env) {
		return path.isAbsolute(env) ? env : path.join(process.cwd(), env);
	}
	return path.join(process.cwd(), "data", "sample");
}
