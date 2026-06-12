'use client'
import { Card, type CardProps } from 'fumadocs-ui/components/card'
import { useTreeContext } from 'fumadocs-ui/contexts/tree'
import { useMemo } from 'react'
import type * as PageTree from 'fumadocs-core/page-tree'

interface ResolvedPage {
    name: PageTree.Item['name']
    description?: PageTree.Item['description']
    icon?: PageTree.Item['icon']
}

function findPage(nodes: PageTree.Node[], url: string): ResolvedPage | undefined {
    for (const node of nodes) {
        if (node.type === 'page' && node.url === url) return node

        if (node.type === 'folder') {
            // Links to a section show the folder name, not the index page title.
            // The index page is either `node.index` or a child listed in the folder's meta.json `pages`.
            const index =
                node.index?.url === url
                    ? node.index
                    : node.children.find(
                          (child): child is PageTree.Item =>
                              child.type === 'page' &&
                              child.url === url &&
                              /(^|[/\\])index\.mdx?$/.test(child.$ref ?? ''),
                      )

            if (index)
                return {
                    name: node.name,
                    description: index.description ?? node.description,
                    icon: node.icon ?? index.icon,
                }

            const match = findPage(node.children, url)
            if (match) return match
        }
    }
}

export type PageCardProps = Omit<CardProps, 'title'> & {
    title?: CardProps['title']
}

export function PageCard({ href, title, description, icon, ...props }: PageCardProps) {
    const { full } = useTreeContext()
    const page = useMemo(() => (href ? findPage(full.children, href) : undefined), [full, href])

    return (
        <Card
            href={href}
            title={title ?? page?.name ?? href}
            description={description ?? page?.description}
            icon={icon ?? page?.icon}
            {...props}
        />
    )
}
