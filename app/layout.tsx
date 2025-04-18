import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme/provider'
import { Toaster } from '@/components/base/toaster'
import './globals.css'

export const metadata: Metadata = {
    title: 'Prototype - AI Meme Generator',
    description: 'AI Image Generator powered by Letz.ai',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    )
}
