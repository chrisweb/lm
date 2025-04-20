'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { toast } from '@/components/base/toaster'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTheme } from 'next-themes'
import { UploadCloud } from 'lucide-react'
import { LoadingAnimation } from './LoadingAnimation'

export function ActionFigureGenerator() {

    const [imageDataUrlState, setImageDataUrlState] = useState<string | null>(null)
    const [fileState, setFileState] = useState<Blob | null>(null)
    const [loadingState, setLoadingState] = useState(false)
    const [analysisState, setAnalysisState] = useState<string | null>(null)
    const [dragActiveState, setDragActiveState] = useState(false)
    const [mountedState, setMountedState] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const { theme } = useTheme()

    // useEffect only runs on the client, so we can safely show theme-dependent UI
    useEffect(() => {
        setMountedState(true)
    }, [])

    // use the AI SDK's useChat hook for handling the AI request and streaming response
    const { handleSubmit, status, stop } = useChat({
        api: '/api/analyze-image',
        onResponse: (response) => {
            console.log('response received from ai', response)
        },
        onFinish: (message) => {
            console.log('message finished', message)
            setAnalysisState(message.content)
            setLoadingState(false)
        },
        onError: (error) => {
            console.error('error analyzing image:', error)
            toast.error('Something went wrong while analyzing your image')
            setLoadingState(false)
        }
    })

    const handleDrag = (event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()

        if (event.type === 'dragenter' || event.type === 'dragover') {
            setDragActiveState(true)
        } else if (event.type === 'dragleave') {
            setDragActiveState(false)
        }
    }

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()

        setDragActiveState(false)

        if (event.dataTransfer.files.length > 0) {
            setFileState(event.dataTransfer.files[0])
            // Process file immediately without trying to trigger form submission
            processFile(event.dataTransfer.files[0])
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()
        event.stopPropagation()
        if (event.target.files && event.target.files.length > 0) {
            setFileState(event.target.files[0])
            // Process file immediately without trying to trigger form submission
            processFile(event.target.files[0])
        }
    }

    // Replace submitForm with processFile to handle file processing directly
    const processFile = (file: Blob) => {
        // check if file is an image
        if (!(/image.*/.exec(file.type))) {
            toast.error('Please upload an image file')
            return
        }

        // check if file size is less than 10MB
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size should be less than 10MB')
            return
        }

        console.log('🔍 CLIENT: Image set, preparing to send to API', file.type, file.size.toString(), 'bytes')

        const files = {
            0: file,
            length: 1,
            item: (index: number) => index === 0 ? file : null
        } as unknown as FileList

        console.log('🔍 CLIENT: Created FileList object for API submission')
        console.log('🔍 CLIENT: Processing submission with image attachment')

        // Create a synthetic form event for handleSubmit
        const syntheticEvent = {
            preventDefault: () => void 0,
            stopPropagation: () => void 0,
            target: {
                files: files,
                // Add any other properties you need to simulate the form submission
            },
        } as unknown as React.FormEvent<HTMLFormElement>

        handleSubmit(syntheticEvent, {
            experimental_attachments: files,
            allowEmptySubmit: true,
        })

        console.log('🔍 CLIENT: handleSubmit called, checking status:', status)

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }

        const reader = new FileReader()

        reader.onload = (event) => {
            const dataUrl = event.target?.result as string
            setImageDataUrlState(dataUrl)
            console.log('🔍 CLIENT: Image converted to data URL for preview')
        }

        reader.readAsDataURL(file)

        setLoadingState(true)
    }

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleStop = () => {
        if (status === 'streaming') {
            stop()
        }
    }

    // determine button gradient based on theme
    const buttonClasses = mountedState && theme === 'dark' ?
        'bg-gradient-to-r from-pink-600 to-violet-500 hover:from-pink-700 hover:to-violet-600 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300' :
        'bg-gradient-to-r from-pink-300 to-violet-400 hover:from-pink-400 hover:to-violet-500 hover:shadow-lg hover:shadow-violet-300/30 transition-all duration-300'

    return (
        <div className="w-full max-w-2xl mx-auto">
            {!fileState ? (
                <Card
                    className={`border-2 border-dashed p-8 flex flex-col items-center justify-center h-80 ${dragActiveState ? 'border-primary' : 'border-muted-foreground/20'}`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center text-center space-y-4">
                        <UploadCloud
                            className="h-12 w-12 text-muted-foreground"
                        />
                        <div className="space-y-2">
                            <p className="text-lg font-medium">Drag and drop an image or click to upload</p>
                            <p className="text-sm text-muted-foreground">
                                Upload a photo to transform into an action figure (max 10MB)
                            </p>
                        </div>
                        <Button
                            onClick={handleButtonClick}
                            className={`mt-4 text-white font-medium ${buttonClasses}`}
                        >
                            Choose File
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="space-y-6">
                    {imageDataUrlState && (
                        <div
                            style={{
                                backgroundImage: `url(${imageDataUrlState})`,
                                backgroundSize: 'contain',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                width: '100%',
                                height: '300px'
                            }}
                            aria-label="Uploaded image"
                        />
                    )}
                    {loadingState ? (
                        <div className="mt-8">
                            <LoadingAnimation />
                            {status === 'streaming' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleStop}
                                    className="mt-4"
                                >
                                    Stop Generation
                                </Button>
                            )}
                        </div>
                    ) : analysisState && (
                        <Card className="p-6 mt-8">
                            <h3 className="text-xl font-semibold mb-4">Your Action Figure Description</h3>
                            <div className="space-y-2 text-muted-foreground">
                                {analysisState.split('\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}