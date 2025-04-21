'use client'

import React from 'react'

export function ScanningAnimation() {
    return (
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 h-[2px] w-full bg-green-400 opacity-80 animate-scan scan-glow" />
        </div>
    )
}