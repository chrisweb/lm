'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, BotIcon, SmileIcon } from 'lucide-react'
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger
} from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'

export function CollapsibleSidebar() {
    const isMobile = useIsMobile()
    const pathname = usePathname()

    return (
        <SidebarProvider
            defaultOpen={!isMobile}
            className="max-w-fit"
            style={{ '--sidebar-width': '14rem' } as React.CSSProperties}
        >
            <Sidebar
                side="left"
                variant="sidebar"
                collapsible="icon"
                className="border-r border-border"
            >
                <SidebarHeader className="flex items-center justify-between p-4">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold hidden md:inline-block">
                            Letz.AI
                        </span>
                    </Link>
                    <SidebarTrigger />
                </SidebarHeader>

                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === '/'}
                                tooltip="Home"
                            >
                                <Link href="/">
                                    <HomeIcon className="h-5 w-5" />
                                    <span>Home</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === '/ai-action-figure-generator'}
                                tooltip="Action Figure"
                            >
                                <Link href="/ai-action-figure-generator">
                                    <BotIcon className="h-5 w-5" />
                                    <span>AI Action Figure Generator</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === '/ai-meme-generator'}
                                tooltip="AI Meme Generator"
                            >
                                <Link href="/ai-meme-generator">
                                    <SmileIcon className="h-5 w-5" />
                                    <span>AI Meme Generator</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    )
}