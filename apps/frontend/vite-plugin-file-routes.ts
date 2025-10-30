import type { Plugin } from 'vite';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';

/**
 * Options for the Vite plugin.
 */
type FileRouteOptions = {
    /**
     * The directory to scan for page components.
     * @default 'src/pages'
     */
    pagesDir?: string;
    /**
     * The path to the generated routes file.
     * @default 'src/router.generated.ts'
     */
    outputFile?: string;
    /**
     * File extensions to consider as routes.
     * @default ['.tsx', '.jsx', '.js', '.ts']
     */
    extensions?: string[];
};

// Helper: Define the structure of our intermediate route tree
type RouteNode = {
    path: string; // The full file-system path to this node
    segment: string; // The URL segment (e.g., '[slug]', '(auth)')
    isLayout: boolean;
    isApp: boolean;
    is404: boolean;
    isPage: boolean; // Is this a file that exports a page?
    filePath: string | null; // Full path to the component file (e.g., _layout.tsx)
    children: Map<string, RouteNode>;
};

const DEFAULT_EXTENSIONS = ['.tsx', '.jsx', '.js', '.ts'];

export function fileRoutes(options: FileRouteOptions = {}): Plugin {
    const {
        pagesDir = 'src/pages',
        outputFile = 'src/router.generated.ts',
        extensions = DEFAULT_EXTENSIONS,
    } = options;

    const CWD = process.cwd();
    const PAGES_DIR_ABS = path.resolve(CWD, pagesDir);
    const OUTPUT_FILE_ABS = path.resolve(CWD, outputFile);
    const OUTPUT_FILE_DIR = path.dirname(OUTPUT_FILE_ABS);

    let rootNode: RouteNode;

    /**
     * Transforms a file-system segment into a React Router path segment.
     */
    function transformSegment(segment: string): string {
        // Check for '404' segment specifically for the not-found route
        if (segment === '404') return '*';
        if (segment === 'page') return ''; // page.{ts,tsx} instead of index.{ts,tsx}
        if (segment.startsWith('[...') && segment.endsWith(']')) return '*';
        if (segment.startsWith('[') && segment.endsWith(']')) return `:${segment.slice(1, -1)}`;
        if (segment.startsWith('-')) return `:${segment.slice(1)}?`;
        if (segment.startsWith('+')) return segment.slice(1);
        return segment;
    }

    /**
     * Creates or gets a node in the tree.
     */
    function getOrCreateNode(parts: string[], parentNode: RouteNode): RouteNode {
        let currentNode = parentNode;

        for (const part of parts) {
            if (!currentNode.children.has(part)) {
                const newNode: RouteNode = {
                    path: path.join(currentNode.path, part),
                    segment: part,
                    isLayout: false,
                    isApp: false,
                    is404: false,
                    isPage: false,
                    filePath: null,
                    children: new Map(),
                };
                currentNode.children.set(part, newNode);
            }
            currentNode = currentNode.children.get(part)!;
        }
        return currentNode;
    }

    /**
     * Recursively builds the React Router `RouteObject` string.
     */
    function printRoutes(node: RouteNode, indent: number = 2): string {
        const spaces = ' '.repeat(indent);
        let routeString = '{\n';

        // 1. Get component path (absolute)
        const componentPath = node.filePath; // This is the full absolute path

        // 2. Determine Path
        let rrPath: string | undefined;
        if (node.isApp) {
            rrPath = '/';
        } else {
            // Pathless routes (e.g., '(auth)')
            if (node.segment.startsWith('(') && node.segment.endsWith(')')) {
                rrPath = undefined;
            } else {
                rrPath = transformSegment(node.segment);
            }
        }

        if (rrPath !== undefined) {
            routeString += `${spaces}  path: '${rrPath}',\n`;
        }

        // 3. Add lazy import
        if (componentPath) {
            const relativePath = path.relative(OUTPUT_FILE_DIR, componentPath);
            const importPath = `./${relativePath.replace(/\\/g, '/')}`;

            routeString += `${spaces}  lazy: async () => {\n`;
            routeString += `${spaces}    const m = await import('${importPath}');\n`;
            // Map 'default' to 'Component' and spread 'loader', 'action', etc.
            routeString += `${spaces}    return { Component: m.default, ...m };\n`;
            routeString += `${spaces}  },\n`;

            // --- THIS IS THE FIX ---
            // The 'else if (node.isApp)' block has been completely removed.
            // If _app.tsx is missing, no 'element' will be added to the root route.
            // --- END FIX ---
        }

        // 4. Recursively add children
        const children: string[] = [];
        let notFoundNode: RouteNode | null = null;
        const otherNodes: RouteNode[] = [];

        for (const child of node.children.values()) {
            if (child.is404) {
                notFoundNode = child;
            } else {
                otherNodes.push(child);
            }
        }

        otherNodes.sort((a, b) => {
            const aScore = a.segment.startsWith('[...')
                ? 3
                : a.segment.startsWith('[')
                  ? 2
                  : a.segment.startsWith('-')
                    ? 1
                    : 0;
            const bScore = b.segment.startsWith('[...')
                ? 3
                : b.segment.startsWith('[')
                  ? 2
                  : b.segment.startsWith('-')
                    ? 1
                    : 0;
            return aScore - bScore;
        });

        for (const child of otherNodes) {
            children.push(printRoutes(child, indent + 2));
        }

        if (notFoundNode) {
            children.push(printRoutes(notFoundNode, indent + 2));
        }

        if (children.length > 0) {
            routeString += `${spaces}  children: [\n`;
            routeString += children.join(',\n');
            routeString += `\n${spaces}  ],\n`;
        }

        routeString += `${spaces}}`;
        return routeString;
    }

    /**
     * Scans the pages directory and generates the route tree.
     */
    function generateRoutes() {
        // 1. Initialize root node
        rootNode = {
            path: PAGES_DIR_ABS,
            segment: '/',
            isLayout: false,
            isApp: true, // This is the root
            is404: false,
            isPage: false,
            filePath: null,
            children: new Map(),
        };

        // 2. Find all page files
        const globPattern = `${pagesDir}/**/{${extensions.map((e) => `*${e}`).join(',')}}`;
        const files = glob.sync(globPattern, { cwd: CWD });

        let appFile: string | null = null;
        let notFoundFile: string | null = null;
        const pageFiles: string[] = [];

        // 3. Filter and categorize files
        for (const file of files) {
            const relPath = path.relative(pagesDir, file);

            // Check for _app and 404 FIRST, before any ignore logic
            if (relPath === '_app.tsx') {
                appFile = file;
                continue;
            }
            if (relPath === '404.tsx') {
                notFoundFile = file;
                continue;
            }

            // Check for ignored files/folders
            // We allow _layout.tsx to pass
            if (
                relPath
                    .split(path.sep)
                    .some((part) => part.startsWith('_') && !['_layout.tsx'].includes(part))
            ) {
                continue;
            }
            // Check for other ignored root files (but not _layout.tsx)
            if (relPath.startsWith('_') && relPath !== '_layout.tsx') {
                continue;
            }

            pageFiles.push(file);
        }

        // 4. Set _app.tsx file
        if (appFile) {
            rootNode.filePath = path.resolve(CWD, appFile);
        }

        // 5. Build the intermediate tree
        for (const file of pageFiles) {
            const relPath = path.relative(PAGES_DIR_ABS, file);
            const parts = relPath.split(path.sep);
            const fileName = parts.pop()!;
            const fileBase = fileName.replace(new RegExp(`(${extensions.join('|')})$`), '');

            const isLayout = fileName === '_layout.tsx';

            // Get the node for the directory
            const dirNode = getOrCreateNode(parts, rootNode);

            if (isLayout) {
                dirNode.isLayout = true;
                dirNode.filePath = path.resolve(CWD, file);
            } else {
                // This is a page file, create a child node for it
                const pageNode = getOrCreateNode([fileBase], dirNode);
                pageNode.isPage = true;
                pageNode.filePath = path.resolve(CWD, file);
            }
        }

        // 6. Add 404 node
        if (notFoundFile) {
            const notFoundRouteNode = getOrCreateNode(['404'], rootNode);
            notFoundRouteNode.is404 = true;
            notFoundRouteNode.filePath = path.resolve(CWD, notFoundFile);
        }

        // 7. Generate the final output string
        const routeObjectsString = printRoutes(rootNode);

        const output = `/* eslint-disable */
// prettier-ignore
// This file is auto-generated by vite-plugin-file-routes.
// Do not edit this file directly.
//
// @ts-nocheck
import React from 'react';
import * as ReactRouter from 'react-router';

export const routes = [${routeObjectsString}] as ReactRouter.RouteObject[];
`;

        // 8. Write to file
        fs.writeFileSync(OUTPUT_FILE_ABS, output);
    }

    return {
        name: 'vite-plugin-file-routes',
        // Run on build start
        buildStart() {
            generateRoutes();
        },
        // Run on dev server start
        configureServer(server) {
            // Initial generation
            generateRoutes();

            // Watch for changes in the pages directory
            server.watcher.add(PAGES_DIR_ABS);
            server.watcher.on('all', (event, filePath) => {
                if (filePath.startsWith(PAGES_DIR_ABS)) {
                    console.log(`[file-routes] ${event}: ${path.relative(CWD, filePath)}`);
                    generateRoutes();
                    // Trigger a full-page reload
                    server.ws.send({ type: 'full-reload' });
                }
            });
        },
    };
}

export default fileRoutes;
