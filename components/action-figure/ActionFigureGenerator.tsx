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

    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
    const [image, setImage] = useState<Blob | null>(null)
    const [loading, setLoading] = useState(false)
    const [analysis, setAnalysis] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [mounted, setMounted] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const { theme } = useTheme()

    // useEffect only runs on the client, so we can safely show theme-dependent UI
    useEffect(() => {
        setMounted(true)
    }, [])

    // use the AI SDK's useChat hook for handling the AI request and streaming response
    const { handleSubmit, status, stop } = useChat({
        api: '/api/analyze-image',
        onResponse: (response) => {
            console.log('response received from ai', response)
        },
        onFinish: (message) => {
            console.log('message finished', message)
            setAnalysis(message.content)
            setLoading(false)
        },
        onError: (error) => {
            console.error('error analyzing image:', error)
            toast.error('Something went wrong while analyzing your image')
            setLoading(false)
        }
    })

    const handleDrag = (event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()

        if (event.type === 'dragenter' || event.type === 'dragover') {
            setDragActive(true)
        } else if (event.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
        setDragActive(false)

        if (event.dataTransfer.files.length > 0) {
            handleFile(event.dataTransfer.files[0])
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            handleFile(event.target.files[0])
        }
    }

    const handleFile = (file: File) => {

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

        setImage(file)

    }

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleStop = () => {
        if (status === 'streaming') {
            stop()
        }
    }

    useEffect(() => {

        if (!image) return

        const files = {
            0: image,
            length: 1,
            item: (index: number) => index === 0 ? image : null
        } as unknown as FileList

        // fake event for the handleSubmit function
        const event = new Event('submit', {
            bubbles: true,
            cancelable: true,
        }) as unknown as React.FormEvent<HTMLFormElement>

        handleSubmit(event, {
            experimental_attachments: files,
        })

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }

        const reader = new FileReader()

        reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            setImageDataUrl(dataUrl)
        }

        reader.readAsDataURL(image)

        setLoading(true)

    }, [image, handleSubmit])

    // determine button gradient based on theme
    const buttonClasses = mounted && theme === 'dark' ?
        'bg-gradient-to-r from-pink-600 to-violet-500 hover:from-pink-700 hover:to-violet-600 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300' :
        'bg-gradient-to-r from-pink-300 to-violet-400 hover:from-pink-400 hover:to-violet-500 hover:shadow-lg hover:shadow-violet-300/30 transition-all duration-300'

    return (
        <div className="w-full max-w-2xl mx-auto">
            {!image ? (
                <Card
                    className={`border-2 border-dashed p-8 flex flex-col items-center justify-center h-80 ${dragActive ? 'border-primary' : 'border-muted-foreground/20'}`}
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
                    {imageDataUrl && (
                        <div
                            style={{
                                backgroundImage: `url(${imageDataUrl})`,
                                backgroundSize: 'contain',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                width: '100%',
                                height: '300px'
                            }}
                            aria-label="Uploaded image"
                        />
                    )}
                    {loading ? (
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
                    ) : analysis && (
                        <Card className="p-6 mt-8">
                            <h3 className="text-xl font-semibold mb-4">Your Action Figure Description</h3>
                            <div className="space-y-2 text-muted-foreground">
                                {analysis.split('\n').map((paragraph, index) => (
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