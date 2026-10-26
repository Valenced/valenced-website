import { createFileRoute, Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { Card } from 'fumadocs-ui/components/card'
import { buttonVariants } from 'fumadocs-ui/components/ui/button'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { Code, type LucideIcon, Palette, Plug, Shield, Smile } from 'lucide-react'
import { Phone } from '@/components/Phone'
import { baseOptions } from '@/lib/layout.shared'
import { seoMeta } from '@/lib/seo'
import { appName, discordUrl, siteDescription } from '@/lib/shared'

export const Route = createFileRoute('/')({
    head: () => ({
        meta: seoMeta({
            description: siteDescription,
            embedTitle: appName,
            thumbnail: '/og.webp',
            path: '/',
        }),
    }),
    component: Home,
})

const features: { icon: LucideIcon; title: string; description: string; action?: { label: string; to: string } }[] = [
    {
        icon: Plug,
        title: 'Plugins',
        description: 'Add the features you want. Browse community plugins inside the app and install them in a tap.',
    },
    {
        icon: Shield,
        title: 'Privacy first',
        description: "Blocks Discord's trackers and crash reports by default.",
    },
    {
        icon: Smile,
        title: 'User friendly',
        description:
            'Updates happen in the background. If a plugin breaks Discord, Valenced starts without it so you can get back in.',
    },
    {
        icon: Code,
        title: 'Developer friendly',
        description: 'Build your own plugins and themes with our guides, a ready-to-use template and debugging tools.',
        action: { label: 'Open documentation', to: 'plugin-development' },
    },
]

const glow =
    'radial-gradient(circle 720px at 88% -10%, color-mix(in oklab, var(--color-fd-primary) 22%, transparent), transparent 75%)'
const grid =
    'linear-gradient(to right, var(--color-fd-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-fd-primary) 1px, transparent 1px)'
const mask = 'radial-gradient(circle 720px at 88% -10%, black, transparent 75%)'

function Home() {
    return (
        <HomeLayout {...baseOptions()}>
            <main className="flex-1 overflow-x-clip">
                <div className="relative mx-auto mt-3 w-[calc(100%-1.5rem)] max-w-6xl overflow-hidden rounded-2xl border bg-fd-card">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{ backgroundImage: glow }}
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-[0.07]"
                        style={{ backgroundImage: grid, backgroundSize: '56px 56px', maskImage: mask }}
                    />
                    <section className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 text-center md:pt-28">
                        <h1 className="text-2xl font-medium md:text-3xl">Supercharge your Discord experience.</h1>
                        <p className="mt-5 max-w-2xl text-fd-muted-foreground md:text-lg">
                            Make Discord look and work the way you like, with custom themes and plugins.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Link
                                to="/docs/$"
                                params={{ _splat: 'installation' }}
                                className={cn(buttonVariants({ color: 'primary' }), 'px-5 py-2.5 text-base')}
                            >
                                Get started
                            </Link>
                            <Link
                                to="/docs/$"
                                params={{ _splat: '' }}
                                className={cn(buttonVariants({ color: 'outline' }), 'px-5 py-2.5 text-base')}
                            >
                                Read the docs
                            </Link>
                        </div>
                    </section>

                    <div className="relative mt-16 flex h-[420px] justify-center">
                        <div className="flex items-start">
                            <Phone
                                eager
                                src="/screenshots/server.webp"
                                lightSrc="/screenshots/server-light.webp"
                                alt="A Discord server themed with Valenced"
                                className="mt-16 -rotate-10"
                            />
                            <Phone
                                eager
                                src="/screenshots/chat.webp"
                                lightSrc="/screenshots/chat-light.webp"
                                alt="A Discord channel running Valenced"
                                className="relative z-10 -ml-16"
                            />
                            <Phone
                                eager
                                src="/screenshots/themes.webp"
                                lightSrc="/screenshots/themes-light.webp"
                                alt="Valenced's theme settings"
                                className="mt-16 -ml-16 rotate-10"
                            />
                        </div>
                    </div>
                </div>

                <section className="mx-auto max-w-5xl px-6 py-24">
                    <h2 className="text-3xl font-semibold tracking-tight">Make Discord yours</h2>
                    <p className="mt-3 max-w-xl text-fd-muted-foreground">
                        Valenced patches the official Discord mobile app, so everything is familiar.
                    </p>
                    <p className="mt-3 max-w-xl text-fd-muted-foreground">
                        Access Valenced's settings from Discord's settings menu, and install plugins and themes right
                        inside the app.
                    </p>

                    <div className="mt-10 grid gap-3 md:grid-cols-3">
                        <Card
                            icon={<Palette />}
                            title="Themes"
                            description="Change colors, fonts, icons and emoji, and mix them however you like."
                            className="flex flex-col overflow-hidden p-6 md:row-span-2"
                        >
                            <div className="flex flex-1 items-end justify-center pt-8">
                                <Phone
                                    src="/screenshots/themes.webp"
                                    lightSrc="/screenshots/themes-light.webp"
                                    alt="Valenced's theme settings"
                                    className="-mb-64 w-full max-w-[240px]"
                                />
                            </div>
                        </Card>

                        <div className="grid gap-3 md:col-span-2 md:row-span-2 md:grid-cols-2">
                            {features.map(({ icon: Icon, title, description, action }) => (
                                <Card
                                    key={title}
                                    icon={<Icon />}
                                    title={title}
                                    description={description}
                                    className="p-6"
                                >
                                    {action && (
                                        <div className="pt-4">
                                            <Link
                                                to="/docs/$"
                                                params={{ _splat: action.to }}
                                                className={buttonVariants({ color: 'secondary', size: 'sm' })}
                                            >
                                                {action.label}
                                            </Link>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="relative mx-auto max-w-5xl px-6 pb-24">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 right-0 hidden size-64 -translate-y-1/2 bg-fd-foreground opacity-[0.01] md:block"
                        style={{
                            maskImage: 'url(/logo.svg)',
                            maskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                        }}
                    />
                    <h2 className="text-3xl font-semibold tracking-tight">Get started</h2>
                    <p className="mt-3 max-w-xl text-fd-muted-foreground">
                        Install Valenced on your device, then pick the plugins and themes you like.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            to="/docs/$"
                            params={{ _splat: 'installation' }}
                            className={cn(buttonVariants({ color: 'primary' }), 'px-5 py-2.5 text-base')}
                        >
                            Download
                        </Link>
                        <a
                            href={discordUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(buttonVariants({ color: 'outline' }), 'px-5 py-2.5 text-base')}
                        >
                            Join the community
                        </a>
                    </div>
                </section>
            </main>
        </HomeLayout>
    )
}
