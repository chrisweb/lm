'use client'

import { useState, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { toast } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MemeTopicSelector } from '@/components/meme/MemeTopicSelector'
import { MemeStyleSelector } from '@/components/meme/MemeStyleSelector'
import { memeTopics, memeStyles } from '@/lib/meme-data'
import { useTheme } from 'next-themes'
import { stat } from 'fs'

interface MemeGeneratorProps {
    onImageGenerated: (image: string) => void
    onLoadingChange: (isLoading: boolean) => void
}

export function MemeGenerator({ onImageGenerated, onLoadingChange }: MemeGeneratorProps) {
    // state for selected options
    const [topic, setTopic] = useState(memeTopics[0].id)
    const [style, setStyle] = useState(memeStyles[0].id)
    const [prompt, setPrompt] = useState('')
    const { theme } = useTheme()

    // get the selected topic and style titles
    const selectedTopic = memeTopics.find(t => t.id === topic)
    const selectedStyle = memeStyles.find(s => s.id === style)?.title ?? ''

    // use the AI SDK's useChat hook for handling the AI request and streaming response
    const { /*input, handleInputChange, messages,*/ handleSubmit, status, stop } = useChat({
        api: '/api/generate-meme',
        onResponse: (response) => {
            // this will be triggered when we get a response from the API
            console.log('Response received from AI', response)
        },
        onFinish: (message) => {
            // when the message is complete, check for image data
            console.log('Message finished', message)

            // check for image data in message annotations
            if (message.annotations && message.annotations.length > 0) {
                const imageData = message.annotations.find(annotation =>
                    annotation.type === annotation.
                )

                if (imageData?.image_data) {
                    onImageGenerated(imageData.image_data)
                }
            }
        },
        onError: (error) => {
            console.error('Error generating meme:', error)
            toast.error('Something went wrong while generating your meme')
        }
    })

    // update loading state when isLoading changes
    useEffect(() => {
        onLoadingChange(status === 'streaming')
    }, [status])

    // handle form submission with custom prompt
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!prompt) {
            toast.error('Please enter a prompt for your meme')
            return
        }

        if (!selectedTopic) {
            toast.error('Please select a meme template')
            return
        }

        // create the prompt using the template format with letzai_model_name
        const letzAiPrompt = `${selectedTopic.letzai_model_name} ${prompt}, use the ${selectedStyle} style`

        console.log('Generated prompt:', letzAiPrompt)

        // use the handleSubmit from useChat with our custom prompt
        handleSubmit(e, {
            body: {
                prompt: letzAiPrompt,
                width: 1024,
                height: 1024,
                steps: 30,
                guidanceScale: 7.5
            }

        })
    }

    // determine button gradient based on theme
    const buttonClasses = theme === 'dark' ?
        'bg-gradient-to-r from-purple-600 to-blue-400 hover:from-purple-700 hover:to-blue-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300' :
        'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-500 hover:shadow-lg hover:shadow-indigo-300/30 transition-all duration-300'

    return (
        <div className="w-full">
            <form
                onSubmit={handleFormSubmit}
                className="space-y-6"
            >
                <MemeTopicSelector
                    topics={memeTopics}
                    selectedTopic={topic}
                    onSelectTopic={setTopic}
                />

                <MemeStyleSelector
                    styles={memeStyles}
                    selectedStyle={style}
                    onSelectStyle={setStyle}
                />

                <div className="space-y-3">
                    <h3 className="text-lg font-medium">Add Your Text</h3>
                    <Input
                        placeholder="Enter your meme text or idea..."
                        value={prompt}
                        onChange={(e) => { setPrompt(e.target.value) }}
                        className="h-12"
                    />
                </div>

                {(status === 'submitted' || status === 'streaming') && (
                    <div>
                        {status === 'submitted' && <div>🧠</div>}
                        <button type="button" onClick={() => stop()}>
                            Stop
                        </button>
                    </div>
                )}

                <Button
                    type="submit"
                    className={`w-full text-white font-bold ${buttonClasses}`}
                    disabled={!prompt || status === 'streaming'}
                    size="lg"
                >
                    Generate Meme 🚀
                </Button>
            </form>
        </div>
    )
}