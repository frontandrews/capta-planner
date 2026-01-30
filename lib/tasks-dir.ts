import path from "node:path";

/**
 * Resolve path to task data (YAML index, details, schema).
 * Default: data/sample (shareable demo data, in repo).
 * Override with PLANNER_DATA_DIR for your own data (e.g. data/tasks or data/projects/my-project).
 */
export function getTasksDir(): string {
	const env = process.env.PLANNER_DATA_DIR;
	if (env) {
		return path.isAbsolute(env) ? env : path.join(process.cwd(), env);
	}
	return path.join(process.cwd(), "data", "sample");
}
