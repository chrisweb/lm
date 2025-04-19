'use client'

import { ActionFigureGenerator } from '@/components/action-figure/ActionFigureGenerator'

export default function AIActionFigureGeneratorPage() {
    return (
        <div className="container mx-auto flex flex-col items-center justify-center min-h-screen py-8 px-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">AI <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Action Figure</span> Generator</h1>
            <p className="max-w-3xl text-center text-lg text-muted-foreground mb-10">Transform yourself or any character into an action figure (blister pack) using the power of AI.</p>
            <ActionFigureGenerator />
        </div>
    )
}