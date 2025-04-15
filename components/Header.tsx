'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ThemeSwitcher } from '@/components/theme/switcher'

export function Header() {
    return (
        <header className="border-b py-3">
            <div className="container mx-auto flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/images/logo.png"
                        alt="AI Meme Generator"
                        width={40}
                        height={40}
                        className="rounded-md"
                    />
                    <span className="text-xl font-bold">AI Meme Generator</span>
                </Link>
                <ThemeSwitcher />
            </div>
        </header>
    )
}