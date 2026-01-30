import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const configRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
	output: "standalone",
	turbopack: {
		root: path.resolve(configRoot),
	},
};

export default nextConfig;
