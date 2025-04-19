'use client'

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingAnimation() {
    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col items-center space-y-2">
                <Skeleton className="h-64 w-64 rounded-lg" />
                <div className="flex flex-col items-center space-y-2 mt-4">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    )
}