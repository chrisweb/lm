'use client'

import { SidebarProvider, Sidebar, SidebarContent } from '@/components/ui/sidebar'
import { MemeGenerator } from '@/components/meme/MemeGenerator'
import { useMobile } from '@/hooks/use-mobile'

interface SettingsSidebarProps {
    onImageGenerated: (image: string) => void
    onLoadingChange: (isLoading: boolean) => void
}

export function SettingsSidebar({ onImageGenerated, onLoadingChange }: SettingsSidebarProps) {
    const isMobile = useMobile()

    return (
        <SidebarProvider defaultOpen={!isMobile}>
            <Sidebar
                side="right"
                variant="sidebar"
                className="border-muted min-w-64 border-l"
            >
                <SidebarContent className="p-6 bg-sidebar text-sidebar-foreground w-full max-w-xs">
                    <div className="space-y-6 py-4">
                        <h2 className="text-xl font-bold">Meme Settings</h2>
                        <MemeGenerator
                            onImageGenerated={onImageGenerated}
                            onLoadingChange={onLoadingChange}
                        />
                    </div>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    )
}