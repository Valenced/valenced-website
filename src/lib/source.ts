import icons from 'virtual:content-icons'
import { docs } from 'collections/server'
import { loader } from 'fumadocs-core/source'
import { createElement, type ReactNode } from 'react'
import { docsRoute } from './shared'

function resolveIcon<T extends { icon?: ReactNode }>(node: T) {
    if (typeof node.icon !== 'string') return node

    const Icon = icons[node.icon]
    if (!Icon) console.warn(`[source] Unknown icon "${node.icon}".`)

    node.icon = Icon && createElement(Icon)
    return node
}

export const source = loader({
    source: docs.toFumadocsSource(),
    baseUrl: docsRoute,
    pageTree: {
        transformers: [
            {
                file(node, filePath) {
                    resolveIcon(node)
                    if (!filePath) return node

                    // Attach frontmatter descriptions to page tree nodes, so client components can read them dynamically
                    const file = this.storage.read(filePath)
                    if (file?.format === 'page' && typeof file.data.description === 'string')
                        node.description ??= file.data.description

                    return node
                },
                folder: resolveIcon,
                separator: resolveIcon,
            },
        ],
    },
})

/**
 * Everything the docs route needs to render a page, in a plain-JSON shape.
 *
 * `/api/docs-index` prerenders this to a static file so the browser never has
 * to run `loader()` itself — see `src/routes/docs/$.tsx`.
 */
export async function getDocsIndex() {
    return {
        tree: await source.serializePageTree(source.pageTree),
        pages: Object.fromEntries(
            source.getPages().map(page => [
                page.slugs.join('/'),
                {
                    path: page.path,
                    title: page.data.title,
                    markdownUrl: slugsToMarkdownPath(page.slugs).url,
                },
            ]),
        ),
    }
}

export type DocsIndex = Awaited<ReturnType<typeof getDocsIndex>>

export function markdownPathToSlugs(segs: string[]) {
    if (segs.length === 0) return []

    const out = [...segs]
    out[out.length - 1] = out[out.length - 1].replace(/\.md$/, '')
    if (out.length === 1 && out[0] === 'index') out.pop()
    return out
}

export function slugsToMarkdownPath(slugs: string[]) {
    const segments = [...slugs]
    if (segments.length === 0) {
        segments.push('index.md')
    } else {
        segments[segments.length - 1] += '.md'
    }

    return {
        segments,
        url: `${docsRoute}/${segments.join('/')}`,
    }
}

export function getPageMarkdownUrl(slugs: string[]) {
    const segments = [...slugs]
    if (segments.length === 0) {
        segments.push('index.md')
    } else {
        segments[segments.length - 1] += '.md'
    }

    return {
        segments,
        url: `${docsRoute}/${segments.join('/')}`,
    }
}

export async function getLLMText(page: (typeof source)['$inferPage']) {
    const processed = await page.data.getText('processed')

    return `# ${page.data.title} (${page.url})

${processed}`
}
