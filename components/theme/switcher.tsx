'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <div className="flex items-center space-x-2">
            <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="light">
                        <span className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Light
                        </span>
                    </SelectItem>
                    <SelectItem value="dark">
                        <span className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dark
                        </span>
                    </SelectItem>
                    <SelectItem value="system">
                        <span className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            System
                        </span>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}