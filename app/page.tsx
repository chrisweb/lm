import Link from 'next/link'
import { Bot, Laugh, ExternalLink } from 'lucide-react'

export default function Home() {
    return (
        <div className="w-full">
            <section className="w-full py-24 sm:py-32">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            AI Tools for{' '}
                            <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                                Creative Minds
                            </span>
                        </h1>
                        <p className="mt-6 max-w-3xl text-center text-lg text-muted-foreground">
                            Explore our suite of{' '}
                            <Link
                                href="https://letz.ai"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                                aria-label="Visit Letz.ai website"
                            >
                                Letz.ai
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Link>{' '}
                            powered tools designed to unlock your creativity and simplify content creation.
                        </p>
                    </div>
                </div>
            </section>

            <section id="tools" className="w-full">
                <div className="container mx-auto px-4">
                    <h2 className="mb-16 text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Our AI Tools</h2>
                    <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
                        {/* AI Action Figure Generator */}
                        <Link
                            href="/ai-action-figure-generator"
                            className="group relative flex flex-col items-center overflow-hidden rounded-3xl bg-gradient-to-br from-violet-100 to-violet-200 p-8 transition-all duration-300 hover:shadow-xl dark:from-violet-950 dark:to-violet-900"
                        >
                            <div className="absolute -right-20 -top-20 opacity-10 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:opacity-20">
                                <Bot className="h-96 w-96 text-violet-700 dark:text-violet-400" />
                            </div>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <Bot className="mb-6 h-24 w-24 text-violet-700 dark:text-violet-400" />
                                <h3 className="mb-3 text-2xl font-bold">AI Action Figure Generator</h3>
                                <p className="mb-6 max-w-md text-muted-foreground">
                                    Transform yourself or any character into an action figure (blister pack) using the power of AI.
                                </p>
                            </div>
                        </Link>

                        {/* AI Meme Generator */}
                        <Link
                            href="/ai-meme-generator"
                            className="group relative flex flex-col items-center overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 p-8 transition-all duration-300 hover:shadow-xl dark:from-amber-950 dark:to-amber-900"
                        >
                            <div className="absolute -left-20 -top-20 opacity-10 transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110 group-hover:opacity-20">
                                <Laugh className="h-96 w-96 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <Laugh className="mb-6 h-24 w-24 text-amber-600 dark:text-amber-400" />
                                <h3 className="mb-3 text-2xl font-bold">AI Meme Generator</h3>
                                <p className="mb-6 max-w-md text-muted-foreground">
                                    Create hilarious memes using the power of AI. Just add your text and watch the magic happen!
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}