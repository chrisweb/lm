'use client'

import { Toaster as SonnerToaster, toast } from 'sonner'
import { useTheme } from 'next-themes'

export { toast }

export function Toaster() {
    const { theme } = useTheme()
    
    return (
        <SonnerToaster
            position="top-right"
            theme={theme as 'light' | 'dark' | 'system'}
            closeButton
        />
    )
}