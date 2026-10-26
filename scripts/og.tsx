/**
 * Renders a social card for docs and home into `.output/public/og`.
 *
 * Runs after `vite build` because TanStack Start's prerenderer only writes HTML and Takumi is a native module that can't run in Workers.
 * Pages come from the prerendered `/api/docs-index.json`. Set `ogImage` manually in frontmatter to override image.
 */

/** biome-ignore-all lint/a11y/useAltText: OG image gen doesn't need to be accesible. */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { ImageResponse } from '@takumi-rs/image-response'
import { appName, ogImagePath } from '../src/lib/shared'

interface DocsIndex {
    pages: Record<string, { title: string; description?: string; ogImage: string }>
}

const publicDir = '.output/public'
const primary = '#37EBFF'
const font = 'Google Sans Flex'

const fontDir = 'node_modules/@fontsource-variable/google-sans-flex/files'
const fonts = await Promise.all(
    ['latin', 'latin-ext'].map(async subset => ({
        name: font,
        data: await readFile(join(fontDir, `google-sans-flex-${subset}-wght-normal.woff2`)),
    })),
)

const logoSvg = await readFile('scripts/logo.svg', 'utf8')
const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`

const index: DocsIndex = JSON.parse(await readFile(join(publicDir, 'api/docs-index.json'), 'utf8'))

const trim = (text = '', max = 120) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)

// Name the files in `scripts/screenshots` so they sort in display order.
const screenshotDir = 'scripts/screenshots'
const screenshots = await Promise.all(
    (await readdir(screenshotDir)).sort().map(async name => {
        const data = await readFile(join(screenshotDir, name))
        return `data:image/jpeg;base64,${data.toString('base64')}`
    }),
)

const backdrop = (
    <>
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `radial-gradient(circle 960px at 1360px -160px, ${primary}2e, ${primary}14 40%, transparent 80%)`,
            }}
        />
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: [
                    `linear-gradient(to right, ${primary}26 1px, transparent 1px)`,
                    `linear-gradient(to bottom, ${primary}26 1px, transparent 1px)`,
                ].join(', '),
                backgroundSize: '56px 56px',
                maskImage:
                    'radial-gradient(circle 960px at 1360px -160px, black, rgba(0, 0, 0, 0.4) 40%, transparent 80%)',
            }}
        />
    </>
)

const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    padding: '4rem',
    color: 'white',
    backgroundColor: '#0c0c0c',
    fontFamily: font,
    position: 'relative',
} as const

function docsCard(title: string, description?: string) {
    return (
        <div style={{ ...cardStyle, borderBottom: `18px solid ${primary}4d` }}>
            {backdrop}
            <p style={{ margin: 0, fontSize: 82, fontWeight: 600 }}>{title}</p>
            <p style={{ margin: 0, marginTop: 16, fontSize: 52, color: 'rgba(240,240,240,0.8)' }}>
                {trim(description)}
            </p>
            {/* The logo has ~14px of empty space on each side. The negative margin lines its edge up with the text above. */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    marginTop: 'auto',
                    marginLeft: -14,
                    color: primary,
                }}
            >
                <img src={logoSrc} width={80} height={80} />
                <p style={{ margin: 0, fontSize: 56, fontWeight: 500 }}>{appName}</p>
            </div>
        </div>
    )
}

async function write(file: string, card: React.ReactElement) {
    const image = new ImageResponse(card, { width: 1200, height: 630, format: 'webp', fonts })

    const target = join(publicDir, file)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, new Uint8Array(await image.arrayBuffer()))
}

const started = performance.now()
const jobs: Promise<void>[] = []
let custom = 0

for (const [key, page] of Object.entries(index.pages)) {
    const generated = ogImagePath(key.split('/').filter(Boolean))
    if (page.ogImage !== generated) {
        custom++
        continue
    }

    jobs.push(write(generated, docsCard(page.title, page.description)))
}

await Promise.all(jobs)

const seconds = ((performance.now() - started) / 1000).toFixed(1)
console.log(`[og] ${jobs.length} images in ${seconds}s (${custom} pages use a custom ogImage)`)
