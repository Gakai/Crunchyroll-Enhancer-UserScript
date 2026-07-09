import type { Plugin } from "rollup";

import * as pkg from "../package.json" with { type: "json" };

type MetaValue = string | number | boolean | string[] | Record<string, boolean>;

const HEADER_START = "// ==UserScript==";
const HEADER_END = "// ==/UserScript==";

/** Turn "crunchyroll-enhancer" into "Crunchyroll Enhancer". */
function humanizePackageName(name: string | undefined): string | undefined {
    if (!name) return undefined;
    return name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatEntry(key: string, value: MetaValue, indent: number): string[] {
    function makeLine(key: string, value: string): string {
        const paddedKey = `@${key}`.padEnd(indent + 1, " ");
        return `// ${paddedKey}${value}`;
    }

    if (Array.isArray(value)) {
        return value.map((entry) => makeLine(key, entry));
    }

    if (typeof value === "object") {
        // Used for grant maps: { GM_getValue: true, GM_setValue: true }
        return Object.entries(value)
            .filter(([, enabled]) => enabled)
            .map(([grantKey]) => makeLine(key, grantKey));
    }

    if (typeof value === "boolean") {
        return value ? [`// @${key}`] : [];
    }

    return [makeLine(key, String(value))];
}

function formatMetadata(entries: Array<[string, MetaValue]>): string {
    const indent = Math.max(...entries.map(([key]) => key.length)) + 2;
    const lines = entries.flatMap(([key, value]) =>
        formatEntry(key, value, indent),
    );
    return [HEADER_START, ...lines, HEADER_END, ""].join("\n");
}

function getMetadata(packageJson: typeof pkg): Array<[string, MetaValue]> {
    const userscript = packageJson.userscript;
    if (!userscript) {
        throw new Error(
            'userscript-meta: package.json is missing a "userscript" field',
        );
    }

    const match = userscript.match;
    if (!match || (Array.isArray(match) && match.length === 0)) {
        throw new Error("userscript-meta: userscript.match is required");
    }

    const reserved = new Set(["name", "version", "description", "author"]);
    const merged: Record<string, MetaValue | undefined> = {};

    merged["name"] = humanizePackageName(packageJson.name);
    merged["version"] = packageJson.version;
    merged["description"] = packageJson.description;
    merged["author"] = packageJson.author;

    for (const [key, value] of Object.entries(userscript)) {
        if (reserved.has(key) || value === undefined) continue;
        merged[key] = value;
    }

    const standardKeys = [
        "name",
        "namespace",
        "version",
        "description",
        "author",
    ];

    // Emit standard keys first, then everything else in original order
    const orderedKeys = [
        ...standardKeys,
        ...Object.keys(merged).filter((k) => !standardKeys.includes(k)),
    ];

    const seen = new Set<string>();
    const entries: Array<[string, MetaValue]> = [];
    for (const key of orderedKeys) {
        if (seen.has(key)) continue;
        const value = merged[key];
        if (value === undefined) continue;
        seen.add(key);
        entries.push([key, value]);
    }

    return entries;
}

export function userscriptMetadata(): Plugin {
    let metadataComment = "";

    return {
        name: "userscript-metadata",

        buildStart() {
            metadataComment = formatMetadata(getMetadata(pkg));
        },

        renderChunk(code) {
            if (code.includes(HEADER_START)) {
                return null;
            }
            return { code: metadataComment + code, map: null };
        },
    };
}
