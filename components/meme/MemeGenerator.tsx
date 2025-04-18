'use client'

import { useState, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { toast } from '@/components/base/toaster'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MemeTopicSelector } from '@/components/meme/MemeTopicSelector'
import { MemeStyleSelector } from '@/components/meme/MemeStyleSelector'
import { memeTopics, memeStyles } from '@/lib/meme-data'
import { useTheme } from 'next-themes'

interface MemeGeneratorProps {
    onImageGenerated: (image: string) => void
    onLoadingChange: (isLoading: boolean) => void
}

export function MemeGenerator({ /*onImageGenerated,*/ onLoadingChange }: MemeGeneratorProps) {
    // state for selected options
    const [topicState, setTopicState] = useState(memeTopics[0].id)
    const [styleState, setStyleState] = useState(memeStyles[0].id)
    const [promptState, setPromptState] = useState('')
    const { theme } = useTheme()

    // use the AI SDK's useChat hook for handling the AI request and streaming response
    const { input, handleInputChange, messages, handleSubmit, status, stop } = useChat({
        api: '/api/generate-meme',
        onResponse: (response) => {
            // this will be triggered when we get a response from the API
            console.log(messages)
            console.log('Response received from AI', response)
        },
        onFinish: (message) => {
            // when the message is complete, check for image data
            console.log('Message finished', message)

            // TODO: need to analyze the content of the message and find images
            // the following AI generated code is commented out until I can verify it works
            // need to add more reusable types to prevent having error related to properties not existing

            // check for image data in message annotations
            /*if (message.annotations && message.annotations.length > 0) {
                const imageData = message.annotations.find(annotation =>
                    annotation.type === annotation
                )

                if (imageData?.image_data) {
                    onImageGenerated(imageData.image_data)
                }
            }*/
        },
        onError: (error) => {
            console.error('Error generating meme:', error)
            toast.error('Something went wrong while generating your meme')
        }
    })

    // update loading state when isLoading changes
    useEffect(() => {
        onLoadingChange(status === 'streaming')
    }, [status, onLoadingChange])

    // handle form submission with custom prompt
    const handleFormSubmit = (e: React.FormEvent) => {

        e.preventDefault()

        if (!promptState) {
            toast.error('Please enter a prompt for your meme')
            return
        }

        if (!topicState) {
            toast.error('Please select a meme topic')
            return
        }

        if (!styleState) {
            toast.error('Please select a style')
            return
        }

        // use the handleSubmit from useChat
        handleSubmit(e, {
            body: {
                topic: topicState,
                style: styleState,
            }
        })
    }

    const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setPromptState(value)
        handleInputChange(e)
    }

    const handleStop = () => {
        if (status === 'streaming') {
            stop()
        }
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
                    selectedTopic={topicState}
                    onSelectTopic={setTopicState}
                />

                <MemeStyleSelector
                    styles={memeStyles}
                    selectedStyle={styleState}
                    onSelectStyle={setStyleState}
                />

                <div className="space-y-3">
                    <h3 className="text-lg font-medium">Add Your Text</h3>
                    <Input
                        placeholder="Enter your meme text or idea..."
                        value={input}
                        className="h-12"
                        onChange={handlePromptChange}
                    />
                </div>

                {(status === 'submitted' || status === 'streaming') && (
                    <div>
                        {status === 'submitted' && <div>🧠</div>}
                        <button type="button" onClick={handleStop}>
                            Stop
                        </button>
                    </div>
                )}

                <Button
                    type="submit"
                    className={`w-full text-white font-bold ${buttonClasses}`}
                    //disabled={!prompt || status === 'streaming'}
                    size="lg"
                >
                    Generate Meme 🚀
                </Button>
            </form>
        </div>
    )
}