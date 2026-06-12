import { createFileRoute } from '@tanstack/react-router'
import { createFromSource } from 'fumadocs-core/search/server'
import { source } from '@/lib/source'

const server = createFromSource(source, {
    // https://github.com/micheleriva/zbsearch supported languages
    language: 'english',
})

export const Route = createFileRoute('/api/search')({
    server: {
        handlers: {
            GET: () => server.staticGET(),
        },
    },
})
