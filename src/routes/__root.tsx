import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { RootProvider } from 'fumadocs-ui/provider/tanstack'
import { lazy } from 'react'
import { appName } from '@/lib/shared'
import appCss from '@/styles/app.css?url'

const SearchDialog = lazy(() => import('@/components/search'))

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                title: appName,
            },
        ],
        links: [{ rel: 'stylesheet', href: appCss }],
    }),
    component: RootComponent,
})

function RootComponent() {
    return (
        <html suppressHydrationWarning lang="en">
            <head>
                <HeadContent />
            </head>
            <body className="flex flex-col min-h-screen">
                <RootProvider search={{ SearchDialog, preload: false }}>
                    <Outlet />
                </RootProvider>
                <Scripts />
            </body>
        </html>
    )
}
