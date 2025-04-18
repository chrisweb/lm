'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { SettingsSidebar } from '@/components/meme/SettingsSidebar'
import { LoadingAnimation } from '@/components/meme/LoadingAnimation'
import { Card } from '@/components/ui/card'

export default function Home() {
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <div className="relative flex flex-1">
                <div className="flex-1 p-6 md:p-8">
                    <div className="mx-auto max-w-3xl space-y-8">
                        <div className="space-y-2 text-center">
                            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Letz meme</h1>
                            <p className="text-lg text-muted-foreground">
                                AI Meme Generator powered by Letz.ai
                            </p>
                            <p className="text-lg text-muted-foreground">
                                Chose a topic and style, add your prompt, and let the AI generate a meme for you!
                            </p>
                        </div>
                        <div className="flex justify-center">
                            {isLoading ? (
                                <LoadingAnimation isLoading={isLoading} className="w-full max-w-2xl" />
                            ) : generatedImage ?
                                (
                                    <Card className="overflow-hidden w-full max-w-2xl">
                                        <div className="relative aspect-square w-full">
                                            <Image
                                                src={generatedImage}
                                                alt="Generated meme"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </Card>
                                ) :
                                (
                                    <div className="relative aspect-square w-full max-w-2xl rounded-lg bg-muted flex items-center justify-center">
                                        <p className="px-6 text-center text-lg text-muted-foreground">
                                            Your generated meme will appear here.
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
                <SettingsSidebar
                    onImageGenerated={setGeneratedImage}
                    onLoadingChange={setIsLoading}
                />
            </div>
        </main>
    )
}