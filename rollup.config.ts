import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { userscriptMetadata } from "./plugins/userscript-metadata.js";

export default {
    input: "src/main.ts",
    output: {
        file: "dist/crunchyroll-enhancer.user.js",
        format: "iife",
        name: "CrunchyrollEnhancer",
        sourcemap: true,
    },
    plugins: [
        typescript({ tsconfig: "./tsconfig.json" }),
        terser(),
        userscriptMetadata(),
    ],
};
