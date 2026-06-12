import defaultMdxComponents from 'fumadocs-ui/mdx'
import { Mermaid } from './mermaid'
import { PageCard } from './PageCard'
import type { MDXComponents } from 'mdx/types'

export function getMDXComponents(components?: MDXComponents) {
    return {
        ...defaultMdxComponents,
        // Fills in the title, description and icon from the linked page
        Card: PageCard,
        // source.config.ts turns ```mermaid code blocks into <Mermaid />
        Mermaid,
        ...components,
    } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
    type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
