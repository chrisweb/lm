'use client'

import { cn } from '@/lib/utils'
import { MemeStyle } from '@/types/meme'

interface MemeStyleSelectorProps {
    styles: MemeStyle[]
    selectedStyle: string
    onSelectStyle: (styleId: string) => void
}

export function MemeStyleSelector({ styles, selectedStyle, onSelectStyle }: MemeStyleSelectorProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-lg font-medium">Choose an Art Style</h3>
            <div className="flex flex-wrap gap-2">
                {styles.map(style => (
                    <button
                        key={style.id}
                        className={cn(
                            'rounded-full px-4 py-2 text-sm transition-all',
                            selectedStyle === style.id ?
                                'bg-primary text-primary-foreground dark:bg-accent dark:text-accent-foreground' :
                                'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                        onClick={() => { onSelectStyle(style.id) }}
                    >
                        {style.title}
                    </button>
                ))}
            </div>
        </div>
    )
}