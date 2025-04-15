'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MemeTopic } from '@/types/meme'

interface MemeTopicSelectorProps {
    topics: MemeTopic[]
    selectedTopic: string
    onSelectTopic: (topicId: string) => void
}

export function MemeTopicSelector({ topics, selectedTopic, onSelectTopic }: MemeTopicSelectorProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-lg font-medium">Choose a Meme Template</h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                {topics.map(topic => (
                    <Card
                        key={topic.id}
                        className={cn(
                            'cursor-pointer overflow-hidden transition-all duration-200 hover:scale-105',
                            selectedTopic === topic.id ?
                                'ring-2 ring-primary dark:ring-accent' :
                                'opacity-70 hover:opacity-100'
                        )}
                        onClick={() => { onSelectTopic(topic.id) }}
                    >
                        <div className="relative h-24 w-full">
                            <Image
                                src={topic.thumbnail}
                                alt={topic.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="p-2 text-center">
                            <p className="text-sm font-medium">{topic.title}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}