import { Cpu, type LucideProps, Plug, User, Wrench } from 'lucide-react'
import { appName, docsRoute, gitConfig } from './shared'
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

export function baseOptions(): BaseLayoutProps {
    return {
        nav: {
            // JSX supported
            title: appName,
        },
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
