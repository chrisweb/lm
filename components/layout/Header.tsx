'use client'

import { ThemeSwitcher } from '@/components/theme/switcher'

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4 w-full">
                <div className="font-bold tracking-tight">Chrisweb&apos;s AI playground</div>
                <ThemeSwitcher />
            </div>
        </header>
    )
}