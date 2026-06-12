'use client'
import { cn } from 'cn'
import { useTheme } from 'next-themes'
import { useEffect, useReducer, useRef, useState } from 'react'

type Size = [width: number, height: number]

/** The smallest a diagram shrinks to fit before the wrapper scrolls instead. */
const MIN_SCALE = 0.8

/** The scale that fits `naturalWidth` into `containerWidth`, kept between `MIN_SCALE` and 1. */
const fitScale = (containerWidth: number, naturalWidth: number) =>
    Math.max(Math.min(containerWidth / naturalWidth, 1), MIN_SCALE)

const sizeCache = new Map<string, Size>()

const svgCache = new Map<string, string>()
const svgKey = (chart: string, theme: string) => `${theme}\u0000${chart}`

let ids = 0

function readPalette(container: HTMLElement) {
    const probe = document.createElement('span')
    probe.style.display = 'none'
    container.append(probe)

    const token = (name: string) => {
        probe.style.color = `var(--color-fd-${name})`
        return getComputedStyle(probe).color
    }

    try {
        const background = token('background')
        const foreground = token('foreground')
        const muted = token('muted')
        const border = token('border')
        const card = token('card')
        const cardForeground = token('card-foreground')

        return {
            background,
            textColor: foreground,
            titleColor: foreground,
            lineColor: token('muted-foreground'),

            // Node colors. Mermaid derives nested shape colors from these.
            primaryColor: card,
            primaryTextColor: cardForeground,
            primaryBorderColor: border,
            secondaryColor: token('secondary'),
            secondaryTextColor: token('secondary-foreground'),
            secondaryBorderColor: border,
            tertiaryColor: token('accent'),
            tertiaryTextColor: token('accent-foreground'),
            tertiaryBorderColor: border,
            mainBkg: card,
            nodeBorder: border,
            nodeTextColor: cardForeground,

            clusterBkg: muted,
            clusterBorder: border,
            edgeLabelBackground: background,
            noteBkgColor: muted,
            noteTextColor: foreground,
            noteBorderColor: border,

            errorBkgColor: token('error'),
            errorTextColor: background,
        }
    } finally {
        probe.remove()
    }
}

let queue: Promise<unknown> = Promise.resolve()

function renderChart(chart: string, theme: string, container: HTMLElement | null) {
    const render = async () => {
        const { default: mermaid } = await import('mermaid')

        // Mermaid measures text, so wait for the custom font
        await document.fonts.ready

        mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict',
            // Mermaid 12 defaults to ELK, which adds a ~1.5 MB chunk
            layout: 'dagre',
            fontFamily: container ? getComputedStyle(container).fontFamily : 'inherit',
            theme: 'base',
            darkMode: theme === 'dark',
            themeVariables: container ? readPalette(container) : undefined,
        })

        // Render off-screen so Mermaid doesn't shift the page layout
        const host = document.createElement('div')
        host.style.position = 'fixed'
        host.style.top = '0'
        host.style.left = '-100vw'

        document.body.append(host)

        try {
            const { svg } = await mermaid.render(`mermaid-${ids++}`, chart, host)
            return svg
        } finally {
            host.remove()
        }
    }

    const result = queue.then(render, render)
    queue = result.catch(() => {})
    return result
}

export interface MermaidProps {
    chart: string
    className?: string
}

export function Mermaid({ chart, className }: MermaidProps) {
    const { theme } = useTheme()
    const containerRef = useRef<HTMLDivElement>(null)
    const [, rerender] = useReducer((count: number) => count + 1, 0)
    const [error, setError] = useState<string>()

    const svg = theme && svgCache.get(svgKey(chart, theme))

    useEffect(() => {
        if (!theme) return

        let cancelled = false

        void (async () => {
            try {
                if (cancelled) return
                if (svgCache.has(svgKey(chart, theme))) return

                const rendered = await renderChart(chart, theme, containerRef.current)
                if (cancelled) return

                svgCache.set(svgKey(chart, theme), rendered)
                rerender()
            } catch (cause) {
                if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause))
            }
        })()

        return () => {
            cancelled = true
        }
    }, [chart, theme])

    // Mermaid's `width="100%"` shrinks labels until they're unreadable on narrow screens.
    // Size from the viewBox instead: shrink to fit down to `MIN_SCALE`, then scroll.
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const viewBox = (svg ? container.querySelector('svg') : null)
            ?.getAttribute('viewBox')
            ?.split(/[\s,]+/)
            .map(Number)
        if (viewBox?.[2] && viewBox[3]) sizeCache.set(chart, [viewBox[2], viewBox[3]])

        const size = sizeCache.get(chart)
        if (!size) return

        const [width, height] = size

        const fit = () => {
            const scale = fitScale(container.clientWidth, width)
            container.style.setProperty('--mermaid-width', `${width * scale}px`)
            container.style.setProperty('--mermaid-height', `${height * scale}px`)
        }

        fit()

        // The viewport and collapsible sidebars both change the available width
        const observer = new ResizeObserver(fit)
        observer.observe(container)
        return () => observer.disconnect()
    }, [svg, chart])

    if (error)
        return (
            <div className={cn('my-6 rounded-lg border border-fd-border bg-fd-card p-4', className)}>
                <p className="mb-2 text-sm text-fd-muted-foreground">Could not render diagram: {error}</p>
                <pre className="overflow-x-auto text-sm">{chart}</pre>
            </div>
        )

    return (
        <div
            ref={containerRef}
            className={cn(
                // Center with auto margins, since `justify-center` cuts off the left edge on
                // overflow. `max-w-none!` needs `!` to beat Mermaid's inline `max-width`.
                'my-6 overflow-x-auto [&>svg]:mx-auto [&>svg]:block [&>svg]:h-[var(--mermaid-height,auto)] [&>svg]:w-[var(--mermaid-width,100%)] [&>svg]:max-w-none!',
                // Reserve the diagram's height while it renders so the page doesn't jump
                !svg && 'min-h-[var(--mermaid-height,8rem)] animate-pulse rounded-lg bg-fd-muted',
                className,
            )}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Mermaid renders with securityLevel: 'strict'
            dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
        />
    )
}
