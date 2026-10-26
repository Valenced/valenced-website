import { appName, siteUrl } from './shared'

interface SeoOptions {
    /** Page title, without the site name. Omit on the home page. */
    title?: string
    description?: string
    /** Title for link embeds. Defaults to the tab title. */
    embedTitle?: string
    /** Path or absolute URL of the social card. */
    image?: string
    /** Path or absolute URL of the thumbnail. */
    thumbnail?: string
    /** Path of the page itself, for `og:url`. */
    path: string
}

const absolute = (pathOrUrl: string) => new URL(pathOrUrl, siteUrl).href

/** Title, description, Open Graph and Twitter tags for a page. */
export function seoMeta({ title, description, embedTitle, image, path, thumbnail }: SeoOptions) {
    const fullTitle = title ? `${title} | ${appName}` : appName
    const socialTitle = embedTitle ?? fullTitle
    const imageUrl = image ? absolute(image) : undefined
    const thumbnailUrl = thumbnail ? absolute(thumbnail) : undefined

    return [
        { title: fullTitle },
        ...(description ? [{ name: 'description', content: description }] : []),
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: socialTitle },
        ...(description ? [{ property: 'og:description', content: description }] : []),
        { property: 'og:url', content: absolute(path) },
        ...(thumbnailUrl ? [{ property: 'og:image', content: thumbnailUrl }] : []),
        { name: 'twitter:card', content: imageUrl ? 'summary_large_image' : 'summary' },
        { name: 'twitter:title', content: socialTitle },
        ...(description ? [{ name: 'twitter:description', content: description }] : []),
        ...(imageUrl ? [{ name: 'twitter:image', content: imageUrl }] : []),
    ]
}
