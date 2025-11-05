/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Plugin } from 'vite';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';
import colors from 'picocolors';

/** Plugin options */
export type FileRouteOptions = {
    pagesDir?: string; // default: 'src/pages'
    outputFile?: string; // default: 'src/router.generated.ts'
    extensions?: string[]; // default: ['.tsx', '.jsx', '.js', '.ts', '.mdx']
    log?: boolean; // default: true
};

/** Route tree node */
type RouteNode = {
    path: string;
    segment: string;
    isLayout: boolean;
    isApp: boolean;
    is404: boolean;
    isPage: boolean;
    filePath: string | null;
    children: Map<string, RouteNode>;
};

const DEFAULT_EXTENSIONS = ['.tsx', '.jsx', '.js', '.ts', '.mdx'];

export function fileRoutes(options: FileRouteOptions = {}): Plugin {
    const {
        pagesDir = 'src/pages',
        outputFile = 'src/router.generated.ts',
        extensions = DEFAULT_EXTENSIONS,
        log = true,
    } = options;

    const CWD = process.cwd();
    const PAGES_DIR_ABS = path.resolve(CWD, pagesDir);
    const OUTPUT_FILE_ABS = path.resolve(CWD, outputFile);
    const OUTPUT_FILE_DIR = path.dirname(OUTPUT_FILE_ABS);

    let rootNode: RouteNode;

    // ---------- Helpers ----------
    const logInfo = (...msg: any[]) => log && console.log(colors.cyan('[file-routes]'), ...msg);
    // const logWarn = (...msg: any[]) => log && console.warn(colors.yellow('[file-routes]'), ...msg);
    const logError = (...msg: any[]) => log && console.error(colors.red('[file-routes]'), ...msg);

    /** Converts file segment into React Router path */
    function transformSegment(segment: string): string {
        if (segment === '404') return '*';
        if (segment === 'page') return '';
        if (segment.startsWith('[...') && segment.endsWith(']')) return '*';
        if (segment.startsWith('[') && segment.endsWith(']')) return `:${segment.slice(1, -1)}`;
        if (segment.startsWith('-')) return `:${segment.slice(1)}?`;
        if (segment.startsWith('+')) return segment.slice(1);
        return segment;
    }

    /** Creates or gets a node in tree */
    function getOrCreateNode(parts: string[], parentNode: RouteNode): RouteNode {
        let node = parentNode;
        for (const part of parts) {
            if (!node.children.has(part)) {
                const newNode: RouteNode = {
                    path: path.join(node.path, part),
                    segment: part,
                    isLayout: false,
                    isApp: false,
                    is404: false,
                    isPage: false,
                    filePath: null,
                    children: new Map(),
                };
                node.children.set(part, newNode);
            }
            node = node.children.get(part)!;
        }
        return node;
    }

    /** Recursively prints route tree as RouteObject array string */
    function printRoutes(node: RouteNode, indent = 2): string {
        const spaces = ' '.repeat(indent);
        let str = '{\n';

        // Determine path
        let rrPath: string | undefined;
        if (node.isApp) rrPath = '/';
        else if (node.segment.startsWith('(') && node.segment.endsWith(')')) rrPath = undefined;
        else rrPath = transformSegment(node.segment);

        if (rrPath !== undefined) str += `${spaces}  path: '${rrPath}',\n`;

        // Lazy import if node has component
        if (node.filePath) {
            const rel = path.relative(OUTPUT_FILE_DIR, node.filePath);
            const importPath = `./${rel.replace(/\\\\/g, '/').replace(/\\/g, '/')}`;
            str += `${spaces}  lazy: async () => {\n`;
            str += `${spaces}    const m = await import('${importPath}');\n`;
            str += `${spaces}    return { Component: m.default, ...m };\n`;
            str += `${spaces}  },\n`;
        }

        // Collect children, keeping 404 last
        const childrenArr: string[] = [];
        const others: RouteNode[] = [];
        let notFound: RouteNode | null = null;

        for (const child of node.children.values()) {
            if (child.is404) notFound = child;
            else others.push(child);
        }

        // Sorting — static first, dynamic [:], catch-all [*] last
        others.sort((a, b) => {
            const weight = (seg: string) =>
                seg.startsWith('[...') ? 3 : seg.startsWith('[') ? 2 : seg.startsWith('-') ? 1 : 0;
            return weight(a.segment) - weight(b.segment);
        });

        for (const c of others) childrenArr.push(printRoutes(c, indent + 2));
        if (notFound) childrenArr.push(printRoutes(notFound, indent + 2));

        if (childrenArr.length) {
            str += `${spaces}  children: [\n${childrenArr.join(',\n')}\n${spaces}  ],\n`;
        }

        str += `${spaces}}`;
        return str;
    }

    /** Generate file routes */
    function generateRoutes() {
        const start = Date.now();

        // Root node
        rootNode = {
            path: PAGES_DIR_ABS,
            segment: '/',
            isLayout: false,
            isApp: true,
            is404: false,
            isPage: false,
            filePath: null,
            children: new Map(),
        };

        const globPattern = `${PAGES_DIR_ABS}/**/{${extensions.map((e) => `*${e}`).join(',')}}`;
        const files = glob.sync(globPattern, { cwd: CWD, absolute: true });

        let appFile: string | null = null;
        let notFoundFile: string | null = null;
        const pageFiles: string[] = [];

        for (const file of files) {
            const rel = path.relative(PAGES_DIR_ABS, file);

            if (rel === '_app.tsx') {
                appFile = file;
                continue;
            }
            if (rel === '404.tsx') {
                notFoundFile = file;
                continue;
            }

            // ignore underscore files except _layout.tsx
            const ignored = rel
                .split(path.sep)
                .some((p) => p.startsWith('_') && p !== '_layout.tsx');
            if (ignored) continue;

            pageFiles.push(file);
        }

        if (appFile) rootNode.filePath = appFile;

        for (const file of pageFiles) {
            const rel = path.relative(PAGES_DIR_ABS, file);
            const parts = rel.split(path.sep);
            const filename = parts.pop()!;
            const base = filename.replace(new RegExp(`(${extensions.join('|')})$`), '');
            const isLayout = filename === '_layout.tsx';

            const dirNode = getOrCreateNode(parts, rootNode);
            if (isLayout) {
                dirNode.isLayout = true;
                dirNode.filePath = file;
            } else {
                const pageNode = getOrCreateNode([base], dirNode);
                pageNode.isPage = true;
                pageNode.filePath = file;
            }
        }

        if (notFoundFile) {
            const nfNode = getOrCreateNode(['404'], rootNode);
            nfNode.is404 = true;
            nfNode.filePath = notFoundFile;
        }

        const routeObjects = printRoutes(rootNode);
        const content = `/* eslint-disable */
// prettier-ignore
// Auto-generated by vite-plugin-file-routes.
// @ts-nocheck
import React from 'react';
import * as ReactRouter from 'react-router';

export const routes = [${routeObjects}] as ReactRouter.RouteObject[];
export default routes;
`;

        fs.mkdirSync(OUTPUT_FILE_DIR, { recursive: true });
        fs.writeFileSync(OUTPUT_FILE_ABS, content);

        logInfo(
            `Generated ${colors.green(path.relative(CWD, OUTPUT_FILE_ABS))} in ${Date.now() - start}ms`
        );
    }

    // ---------- Plugin lifecycle ----------
    return {
        name: 'vite-plugin-file-router',
        enforce: 'pre',

        buildStart() {
            try {
                generateRoutes();
            } catch (err) {
                logError('Failed to generate routes:', err);
            }
        },

        configureServer(server) {
            generateRoutes();
            server.watcher.add(PAGES_DIR_ABS);

            let regenTimeout: NodeJS.Timeout | null = null;

            const rebuild = (event: string, filePath?: string | string[] | Buffer) => {
                if (typeof filePath !== 'string') return;
                const ext = path.extname(filePath);
                if (!extensions.includes(ext)) return;
                if (!filePath.startsWith(PAGES_DIR_ABS)) return;

                if (regenTimeout) clearTimeout(regenTimeout);
                regenTimeout = setTimeout(() => {
                    logInfo(`${event}: ${path.relative(CWD, filePath)}`);
                    try {
                        generateRoutes();
                        server.ws.send({ type: 'full-reload' });
                    } catch (err) {
                        logError('Regeneration failed:', err);
                    }
                }, 150);
            };

            server.watcher.on('add', rebuild);
            server.watcher.on('unlink', rebuild);
            server.watcher.on('change', rebuild);
        },
    };
}

export default fileRoutes;
