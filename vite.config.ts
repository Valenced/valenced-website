import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import mdx from 'fumadocs-mdx/vite'
import { nitro } from 'nitro/vite'
import { defineConfig, type Plugin } from 'vite'

/**
 * Builds `virtual:content-icons`, a map of the Lucide icons named by `icon:` in frontmatter and
 * `meta.json`.
 *
 * Importing icons by name lets the bundler drop the ~2000 others that `lucideIconsPlugin()` would
 * ship. An icon name that isn't a Lucide export fails the build.
 */
function contentIcons(dir: string): Plugin {
    const virtualId = 'virtual:content-icons'
    const resolvedId = `\0${virtualId}`
    const root = resolve(dir)
    // Only scan frontmatter and `meta.json`. MDX bodies have `"icon"` keys in plugin manifest
    // examples, and those aren't Lucide names.
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/
    const iconName = /^\s*"?icon"?\s*:\s*"?([A-Z][A-Za-z0-9]*)"?,?\s*$/gm

    function collect() {
        const files: string[] = []
        const names = new Set<string>()

        for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
            const isMeta = entry.name === 'meta.json'
            if (!entry.isFile() || !(isMeta || /\.mdx?$/.test(entry.name))) continue

            const path = join(entry.parentPath, entry.name)
            const source = readFileSync(path, 'utf8')
            files.push(path)

            const scope = isMeta ? source : frontmatter.exec(source)?.[1]
            if (scope) for (const [, name] of scope.matchAll(iconName)) names.add(name)
        }

        return { files, names: [...names].sort() }
    }

    return {
        name: 'content-icons',
        resolveId: id => (id === virtualId ? resolvedId : null),
        load(id) {
            if (id !== resolvedId) return null

            const { files, names } = collect()
            for (const file of files) this.addWatchFile(file)

            const bindings = names.join(', ')
            return `import { ${bindings} } from 'lucide-react'\nexport default { ${bindings} }\n`
        },
        configureServer(server) {
            // `addWatchFile` misses new and deleted pages, so reload on any content change.
            server.watcher.on('all', (_event, path) => {
                if (!path.startsWith(root)) return

                const client = server.environments.client
                const module = client.moduleGraph.getModuleById(resolvedId)
                if (module) client.reloadModule(module)
            })
        },
    }
}

/**
 * Stubs out the Mermaid modules this site doesn't use.
 *
 * Mermaid lazy-loads every diagram type, layout engine and `katex`, so all of them end up in the
 * build. Mermaid has no option to leave them out, so this resolves the unlisted ones to a module
 * that throws. If a page needs one, `<Mermaid>` shows the error next to the diagram source.
 *
 * List chunk names without their hash (`flowDiagram`) or bare specifiers (`katex`).
 */
function mermaidModules(enabled: string[]): Plugin {
    const dist = /[/\\]mermaid[/\\]dist[/\\]/
    const stub = '\0mermaid-disabled:'
    const allowed = new Set(enabled)
    const seen = new Set<string>()

    // `./chunks/mermaid.core/sequenceDiagram-WJ2MYXX4.mjs` -> `sequenceDiagram`,
    // `katex` -> `katex`.
    const nameOf = (specifier: string) => specifier.replace(/^.*\//, '').replace(/-[A-Za-z0-9_]+\.mjs$/, '')

    return {
        name: 'mermaid-modules',
        // Run before `vite:resolve`, or this plugin never sees the imports.
        enforce: 'pre',
        // Only match dynamic imports. Mermaid's shared `chunk-*.mjs` files look like diagram
        // chunks but are imported statically, and stubbing them breaks rendering.
        resolveId(source, importer, { kind }) {
            if (kind !== 'dynamic-import' || !importer || !dist.test(importer)) return null

            const name = nameOf(source)
            seen.add(name)

            return allowed.has(name) ? null : stub + name
        },
        load(id) {
            if (!id.startsWith(stub)) return null

            const name = id.slice(stub.length)
            const message = `Mermaid module "${name}" is not enabled for this site. Add it to mermaidModules() in vite.config.ts.`

            // Throwing here rejects the `import()` that asked for this module.
            return `throw new Error(${JSON.stringify(message)})`
        },
        buildEnd() {
            if (seen.size === 0) return

            for (const name of enabled) {
                if (!seen.has(name)) this.warn(`"${name}" is not a Mermaid module — check the name`)
            }
        },
    }
}

export default defineConfig({
    server: {
        port: 3000,
    },
    plugins: [
        contentIcons('content'),
        mermaidModules([
            'flowDiagram', // also used by `graph`
            'sequenceDiagram',
            'dagre', // layout engine, set in `<Mermaid>`
            'sizeCapture', // used by the renderer, not a diagram type
        ]),
        mdx(),
        tailwindcss(),
        tanstackStart({
            spa: {
                enabled: true,
                prerender: {
                    enabled: true,
                    crawlLinks: true,
                },
            },

            prerender: {
                // Crawl one page at a time. Nitro's `wrangler dev` watches `.output/public`, and
                // parallel writes make it restart mid-crawl, which drops pages without an error.
                concurrency: 1,
            },

            pages: [
                { path: '/' },
                { path: '/docs' },
                { path: '/api/search' },
                { path: '/api/docs-index.json' },
                { path: 'llms-full.txt' },
                { path: 'llms.txt' },
            ],
        }),
        react(),
        nitro({
            preset: 'cloudflare_module',
            // Nitro doesn't minify the server bundle by default. A smaller Worker starts faster.
            minify: true,
            commands: {
                // Deployment hangs without this.
                preview: 'node node_modules/wrangler/wrangler-dist/cli.js --cwd ./ dev',
            },
        }),
    ],
    environments: {
        ssr: {
            // Pre-bundle deps to ESM in dev. Nitro runs SSR in workerd with every dep inlined, and
            // CommonJS packages like `react` fail there with `module is not defined`.
            optimizeDeps: {
                noDiscovery: false,
            },
        },
    },
    resolve: {
        tsconfigPaths: true,
    },
})
