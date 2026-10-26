export const appName = 'Valenced'
export const docsRoute = '/docs'
export const siteUrl = 'https://valenced.app'

/** Path of the generated cover for the home page. */
export function ogImagePath(slugs: string[]) {
    // `/docs/index` is a page of its own, so the docs root can't take `index.webp`.
    return slugs.length === 0 ? `/og${docsRoute}.webp` : `/og${docsRoute}/${slugs.join('/')}.webp`
}

export const siteDescription =
    'Supercharge your Discord experience. Valenced is a client modification for Discord mobile.'

/** Path of the generated cover for the home page. */
export const homeOgImage = '/og/home.webp'

// fill this with your actual GitHub info, for example:
export const gitConfig = {
    user: 'Valenced',
    repo: 'valenced-website',
    branch: 'main',
}
