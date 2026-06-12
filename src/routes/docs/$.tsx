import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { createIsomorphicFn } from '@tanstack/react-start'
import browserCollections from 'collections/browser'
import { useFumadocsLoader } from 'fumadocs-core/source/client'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { DocsBody, DocsDescription, DocsPage, DocsTitle, MarkdownCopyButton } from 'fumadocs-ui/layouts/docs/page'
import { Suspense } from 'react'
import { useMDXComponents } from '@/components/mdx'
import { ViewOptionsPopover } from '@/components/ViewOptionsPopover'
import { baseOptions, docsTabs } from '@/lib/layout.shared'
import { appName, gitConfig } from '@/lib/shared'
import { type DocsIndex, getDocsIndex } from '@/lib/source'

/**
 * The browser resolves pages from the prerendered `/api/docs-index.json` rather
 * than by running `loader()` itself. `createIsomorphicFn` compiles the
 * `.server()` branch out of the client build, which keeps `@/lib/source` — and
 * with it `fumadocs-core`'s content index plus the `react-dom/server` renderer
 * behind `serializePageTree()` — off the browser entirely.
 *
 * The index is one immutable, browser-cached request per session, so this costs
 * nothing on navigation.
 */
let indexRequest: Promise<DocsIndex> | undefined

const loadDocsIndex = createIsomorphicFn()
    .server(getDocsIndex)
    .client(() => (indexRequest ??= fetch('/api/docs-index.json').then(res => res.json() as Promise<DocsIndex>)))

export const Route = createFileRoute('/docs/$')({
    component: Page,
    loader: async ({ params }) => {
        const slugs = params._splat?.split('/').filter(Boolean) ?? []
        const { tree, pages } = await loadDocsIndex()

        const page = pages[slugs.join('/')]
        if (!page) throw notFound()

        await clientLoader.preload(page.path)

        return { ...page, tree }
    },
    head: ({ loaderData }) => ({
        meta: loaderData?.title ? [{ title: `${loaderData.title} | ${appName}` }] : [],
    }),
})

const clientLoader = browserCollections.docs.createClientLoader({
    component: function DocContent(
        { toc, frontmatter, default: MDX },
        {
            markdownUrl,
            path,
        }: {
            markdownUrl: string
            path: string
        },
    ) {
        const components = useMDXComponents()
        return (
            <DocsPage toc={toc}>
                <DocsTitle>{frontmatter.title}</DocsTitle>
                <DocsDescription>{frontmatter.description}</DocsDescription>
                <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
                    <MarkdownCopyButton markdownUrl={markdownUrl} />
                    <ViewOptionsPopover
                        markdownUrl={markdownUrl}
                        githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
                    />
                </div>
                <DocsBody>
                    <MDX components={components} />
                </DocsBody>
            </DocsPage>
        )
    },
})

function Page() {
    const { path, markdownUrl, tree } = useFumadocsLoader(Route.useLoaderData())

    return (
        <DocsLayout {...baseOptions()} tree={tree} tabs={docsTabs}>
            <Link to={markdownUrl} hidden />
            <Suspense>{clientLoader.useContent(path, { markdownUrl, path })}</Suspense>
        </DocsLayout>
    )
}
