'use client'
import { staticClient } from 'fumadocs-core/search/client/orama-static'
import {
    SearchDialog,
    SearchDialogClose,
    SearchDialogContent,
    SearchDialogHeader,
    SearchDialogIcon,
    SearchDialogInput,
    SearchDialogList,
    SearchDialogOverlay,
    type SharedProps,
} from 'fumadocs-ui/components/dialog/search'
import { useI18n } from 'fumadocs-ui/contexts/i18n'
import { useEffect, useMemo, useState } from 'react'
import { docsTabIndexOf } from '@/lib/layout.shared'
import type { SortedResult } from 'fumadocs-core/search'

const DEBOUNCE_MS = 100

/**
 * Replaces `useDocsSearch` from `fumadocs-core/search/client`.
 *
 * The upstream hook dynamically imports every search backend, so the bundler ships all of them
 * (mixedbread alone adds ~90 kB of remark). This one only uses the static client.
 */
function useStaticDocsSearch(locale: string | undefined) {
    const client = useMemo(() => staticClient({ locale }), [locale])
    const [search, setSearch] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [data, setData] = useState<SortedResult[] | 'empty'>('empty')
    const [error, setError] = useState<Error>()

    useEffect(() => {
        if (search.length === 0) {
            setData('empty')
            setError(undefined)
            setIsLoading(false)
            return
        }

        let cancelled = false
        setIsLoading(true)

        const timeout = window.setTimeout(() => {
            Promise.resolve(client.search(search))
                .then(results => {
                    if (cancelled) return
                    setError(undefined)
                    setData(results)
                })
                .catch((err: Error) => {
                    if (cancelled) return
                    setError(err)
                })
                .finally(() => {
                    if (!cancelled) setIsLoading(false)
                })
        }, DEBOUNCE_MS)

        return () => {
            cancelled = true
            clearTimeout(timeout)
        }
    }, [client, search])

    return { search, setSearch, query: { isLoading, data, error } }
}

export default function StaticSearchDialog(props: SharedProps) {
    const { locale } = useI18n()
    const { search, setSearch, query } = useStaticDocsSearch(locale)

    // Group results by sidebar tab. The sort is stable, so each tab keeps its relevance order.
    const items = useMemo(() => {
        if (query.data === 'empty' || !query.data) return null
        return [...query.data].sort((a, b) => docsTabIndexOf(a.url) - docsTabIndexOf(b.url))
    }, [query.data])

    return (
        <SearchDialog search={search} onSearchChange={setSearch} isLoading={query.isLoading} {...props}>
            <SearchDialogOverlay />
            <SearchDialogContent>
                <SearchDialogHeader>
                    <SearchDialogIcon />
                    <SearchDialogInput />
                    <SearchDialogClose />
                </SearchDialogHeader>
                <SearchDialogList items={items} />
            </SearchDialogContent>
        </SearchDialog>
    )
}
