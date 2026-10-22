import { build, context } from "esbuild";
import { userscriptMetadata } from "./plugins/userscript-metadata.ts";

/** @type {import("esbuild").BuildOptions} */
const options = {
    banner: { js: userscriptMetadata().trimEnd() },
    bundle: true,
    entryPoints: ["src/main.ts"],
    format: "iife",
    logLevel: "info",
    minify: false, // required by Greasy Fork
    outfile: "dist/crunchyroll-enhancer.user.js",
    platform: "browser",
    sourcemap: true,
    target: "es2020",
};

if (process.argv.includes("--watch")) {
    const buildContext = await context(options);
    await buildContext.watch();
} else {
    await build(options);
}
