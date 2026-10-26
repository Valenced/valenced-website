export const appName = 'Valenced'
export const docsRoute = '/docs'
export const siteUrl = 'https://valenced.app'

/** Path of the generated cover for the home page. */
export function ogImagePath(slugs: string[]) {
    // `/docs/index` is a page of its own, so the docs root can't take `index.webp`.
    return slugs.length === 0 ? `/og${docsRoute}.webp` : `/og${docsRoute}/${slugs.join('/')}.webp`
}

export const siteDescription = 'Make Discord mobile look and work the way you like, with custom themes and plugins.'

export const discordUrl = 'https://discord.com/invite/dtBTQHYSx4'

export const gitConfig = {
    user: 'Valenced',
    repo: 'valenced-website',
    branch: 'main',
}
