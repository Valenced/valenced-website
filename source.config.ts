import { pageSchema } from 'fumadocs-core/source/schema'
import { defineConfig, defineDocs } from 'fumadocs-mdx/config'
import { visit } from 'unist-util-visit'
import { z } from 'zod'
import type { Element, ElementContent, Root } from 'hast'

export const docs = defineDocs({
    dir: 'content/docs',
    docs: {
        // `ogImage` replaces the generated social cover  with a path under `public/` or an absolute URL.
        schema: pageSchema.extend({ ogImage: z.string().optional() }),
        // Load page bodies lazily. Otherwise every page lands in any chunk that imports
        // `collections/server`, including the client bundle.
        async: true,
        postprocess: {
            includeProcessedMarkdown: true,
        },
    },
})

function textOf(node: Element): string {
    return node.children.map(child => (child.type === 'text' ? child.value : '')).join('')
}

/**
 * Turns ```mermaid code blocks into `<Mermaid chart="…" />` (see `src/components/mermaid.tsx`).
 *
 * This has to run in rehype, before `rehypeCode`:
 *
 *  - In remark, it runs before fumadocs captures the markdown for `/docs/*.md` and
 *    `llms-full.txt`, so the diagram source goes missing there. That rules out `remarkMdxMermaid`.
 *  - After `rehypeCode`, Shiki has already turned the code block into highlighted spans.
 */
function rehypeMermaid() {
    return (tree: Root) => {
        visit(tree, 'element', (node, index, parent) => {
            if (node.tagName !== 'pre' || index === undefined || !parent) return

            const [code] = node.children
            if (code?.type !== 'element' || code.tagName !== 'code') return

            const className = code.properties.className
            if (!Array.isArray(className) || !className.includes('language-mermaid')) return

            // hast doesn't type `mdxJsxFlowElement`, but MDX compiles it to a component call.
            parent.children[index] = {
                type: 'mdxJsxFlowElement',
                name: 'Mermaid',
                attributes: [{ type: 'mdxJsxAttribute', name: 'chart', value: textOf(code).trim() }],
                children: [],
            } as unknown as ElementContent
        })
    }
}

export default defineConfig({
    mdxOptions: {
        // Use the function form to put `rehypeMermaid` before the defaults. An array appends it.
        rehypePlugins: plugins => [rehypeMermaid, ...plugins],
    },
})
