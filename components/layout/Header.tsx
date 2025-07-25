'use client'

import Link from 'next/link'
import { ThemeSwitcher } from '@/components/theme/switcher'

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ height: 'var(--header-height)' }}>
            <div className="flex h-full items-center justify-between px-4 w-full">
                <Link href="/" className="font-bold tracking-tight hover:opacity-80 transition-opacity">
                    Chrisweb&apos;s AI playground
                </Link>
                <ThemeSwitcher />
            </div>
        </header>
    )
}