import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme/provider'
import { Toaster } from '@/components/base/toaster'
import { CollapsibleSidebar } from '@/components/layout/CollapsibleSidebar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
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
                    <div className="flex min-h-screen flex-col">
                        <Header />
                        <div className="flex flex-1 overflow-hidden">
                            <CollapsibleSidebar />
                            <main className="flex-1 overflow-auto w-full">
                                {children}
                            </main>
                        </div>
                        <Footer />
                    </div>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    )
}
