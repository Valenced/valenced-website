import { cn } from 'cn'

interface PhoneProps {
    /** Dark theme screenshot. */
    src: string
    /** Light theme screenshot. Falls back to `src`. */
    lightSrc?: string
    alt: string
    className?: string
    eager?: boolean
}

export function Phone({ src, lightSrc, alt, className, eager }: PhoneProps) {
    return (
        <div
            className={cn(
                'w-[262px] shrink-0 rounded-[24px] border border-white/15 bg-[#121214] p-[5px] shadow-2xl shadow-black/40',
                className,
            )}
        >
            {[
                { url: lightSrc, className: 'dark:hidden' },
                { url: src, className: lightSrc ? 'hidden dark:block' : '' },
            ].map(({ url, className }) =>
                url ? (
                    <img
                        key={className}
                        src={url}
                        alt={alt}
                        width={250}
                        height={524}
                        loading={eager ? 'eager' : 'lazy'}
                        decoding="async"
                        className={cn('block h-auto w-full rounded-[18px]', className)}
                    />
                ) : null,
            )}
        </div>
    )
}
