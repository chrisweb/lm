'use client'

import { cn } from '@/lib/utils'

interface LoadingAnimationProps {
    isLoading: boolean
    className?: string
}

export function LoadingAnimation({ isLoading, className }: LoadingAnimationProps) {
    if (!isLoading) return null

    return (
        <div className={cn('flex flex-col items-center justify-center p-8', className)}>
            <div className="animate-bounce text-6xl">🧠</div>
            <p className="mt-4 text-center text-lg">Generating your meme...</p>
        </div>
    )
}