import { createFileRoute } from '@tanstack/react-router'
import { getDocsIndex } from '@/lib/source'

export const Route = createFileRoute('/api/docs-index.json')({
    server: {
        handlers: {
            GET: async () => Response.json(await getDocsIndex()),
        },
    },
})
