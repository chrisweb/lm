'use client'

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingSkeletons() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
        </div>
    )
}