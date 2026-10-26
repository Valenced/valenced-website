import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/lib/layout.shared'
import { seoMeta } from '@/lib/seo'
import { appName, homeOgImage, siteDescription } from '@/lib/shared'

export const Route = createFileRoute('/')({
    head: () => ({
        meta: seoMeta({
            description: siteDescription,
            embedTitle: `${appName} — Supercharge your Discord experience`,
            image: homeOgImage,
            path: '/',
        }),
    }),
    component: Home,
})

function Home() {
    return (
        <HomeLayout {...baseOptions()}>
            <div className="flex flex-col items-center justify-center text-center flex-1">
                <h1 className="font-medium text-xl mb-4">{appName}</h1>
                <Link
                    to="/docs/$"
                    params={{
                        _splat: '',
                    }}
                    className="px-3 py-2 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-sm mx-auto"
                >
                    Open Docs
                </Link>
            </div>
        </HomeLayout>
    )
}
