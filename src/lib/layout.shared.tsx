import { Cpu, type LucideProps, Plug, User, Wrench } from 'lucide-react'
import { appName, discordUrl, docsRoute, gitConfig } from './shared'
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

function DiscordIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.07.07 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.1.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
    )
}

export function baseOptions(): BaseLayoutProps {
    return {
        nav: {
            // JSX supported
            title: appName,
        },
        links: [
            {
                type: 'icon',
                label: 'Discord community',
                text: 'Discord',
                url: discordUrl,
                external: true,
                icon: <DiscordIcon />,
            },
        ],
        githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    }
}

function IconWrapper({
    icon,
}: {
    icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
}) {
    const Icon = icon
    return (
        <div className="flex size-full items-center justify-center">
            <Icon />
        </div>
    )
}

/**
 * Sidebar tabs, in display order.
 *
 * Also the ordering used to group search results, so keep this the single
 * source of truth for "which section does a docs URL belong to".
 */
export const docsTabs = [
    {
        title: 'User Guide',
        description: 'Installation, add-ons & troubleshooting',
        url: docsRoute,
        icon: <IconWrapper icon={User} />,
    },
    {
        title: 'Plugin Development',
        description: 'Build, test & publish plugins',
        url: `${docsRoute}/plugin-development`,
        icon: <IconWrapper icon={Plug} />,
    },
    {
        title: 'DevTools',
        description: 'Debugging tools for plugin developers',
        url: `${docsRoute}/devtools`,
        icon: <IconWrapper icon={Wrench} />,
    },
    {
        title: 'Core Development',
        description: 'Architecture & contributing to Valenced itself',
        url: `${docsRoute}/core-development`,
        icon: <IconWrapper icon={Cpu} />,
    },
]

/**
 * Index of the tab a docs URL belongs to, or `docsTabs.length` when it belongs
 * to none. The *most specific* matching tab wins, since the User Guide tab
 * (`/docs`, a route group with no URL segment) prefixes every other tab.
 */
export function docsTabIndexOf(url: string) {
    let index = docsTabs.length
    let matched = -1

    for (let i = 0; i < docsTabs.length; i++) {
        const { url: prefix } = docsTabs[i]
        if (url !== prefix && !url.startsWith(`${prefix}/`)) continue
        if (prefix.length <= matched) continue

        index = i
        matched = prefix.length
    }

    return index
}
