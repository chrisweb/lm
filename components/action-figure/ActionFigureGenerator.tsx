'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { toast } from '@/components/base/toaster'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTheme } from 'next-themes'
import { LoadingAnimation } from './LoadingAnimation'

export function ActionFigureGenerator() {
    const [image, setImage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [analysis, setAnalysis] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [fileAttachment, setFileAttachment] = useState<FileList | null>(null)
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

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0])
            // No need to set fileAttachment here as it's already set in handleFile
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

        // Create a FileList-like object with the single file
        const fileList = {
            0: file,
            length: 1,
            item: (index: number) => index === 0 ? file : null
        } as unknown as FileList

        // Set the file attachment first
        setFileAttachment(fileList)

        const reader = new FileReader()
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            setImage(dataUrl)
            // Call processImage in a setTimeout to ensure state is updated
            setTimeout(() => {
                processImage()
            }, 0)
        }
        reader.readAsDataURL(file)
    }

    const processImage = () => {
        setLoading(true)
        setAnalysis(null)

        console.log('processing image, setting loading state')

        // check if the fileAttachment is valid
        if (!fileAttachment) {
            console.error('invalid file attachment')
            toast.error('Invalid image data')
            setLoading(false)
            return
        }

        try {
            console.log('about to submit image for analysis')

            // create a mock form event with preventDefault method
            const mockFormEvent = {
                preventDefault: () => {
                    // intentionally empty as this is a mock event
                }
            } as React.FormEvent<HTMLFormElement>

            // submit with the file attachment using the experimental attachments feature
            handleSubmit(mockFormEvent, {
                data: {
                    prompt: 'Transform this image into an action figure description. Create a detailed description of what this would look like as a toy in blister packaging, including the name, features and accessories.'
                },
                // cast to any to use the experimental feature
                experimental_attachments: fileAttachment
            })

            console.log('image submitted for analysis, waiting for response')
        } catch (error) {
            console.error('error submitting image:', error)
            toast.error('Failed to submit image for analysis')
            setLoading(false)
        }
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
    const buttonClasses = mounted && theme === 'dark' ?
        'bg-gradient-to-r from-pink-600 to-violet-500 hover:from-pink-700 hover:to-violet-600 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300' :
        'bg-gradient-to-r from-pink-300 to-violet-400 hover:from-pink-400 hover:to-violet-500 hover:shadow-lg hover:shadow-violet-300/30 transition-all duration-300'

    return (
        <div className="w-full max-w-2xl mx-auto">
            {!image ? (
                <Card
                    className={`border-2 border-dashed p-8 flex flex-col items-center justify-center h-80 ${dragActive ? 'border-primary' : 'border-muted-foreground/20'
                        }`}
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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
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
                    <div className="flex justify-center">
                        <div className="relative w-full max-w-md overflow-hidden rounded-lg">
                            {/* we need to use a div with background-image instead of next/image
                  since we're dealing with dynamic user-uploaded data URLs */}
                            <div
                                style={{
                                    backgroundImage: `url(${image})`,
                                    backgroundSize: 'contain',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    width: '100%',
                                    height: '300px'
                                }}
                                aria-label="Uploaded image"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                    setImage(null)
                                    setAnalysis(null)
                                    setFileAttachment(null)
                                    if (status === 'streaming') {
                                        stop()
                                    }
                                }}
                            >
                                Change Image
                            </Button>
                        </div>
                    </div>

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
                            <Button
                                className={`w-full mt-6 text-white font-medium ${buttonClasses}`}
                                onClick={processImage}
                            >
                                Regenerate Description
                            </Button>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}