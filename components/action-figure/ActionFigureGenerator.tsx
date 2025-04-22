'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { toast } from '@/components/base/toaster'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useTheme } from 'next-themes'
import { UploadCloud } from 'lucide-react'
import { ScanningAnimation } from '@/components/action-figure/ScanningAnimation'
import { ActionFigureGenerationData, ActionFigureStatusData } from '@/types/action-figure'

export function ActionFigureGenerator() {

    const [imageDataUrlState, setImageDataUrlState] = useState<string | null>(null)
    const [fileState, setFileState] = useState<Blob | null>(null)
    const [actionFigureState, setActionFigureState] = useState<string | null>(null)
    const [dragActiveState, setDragActiveState] = useState(false)
    const [mountedState, setMountedState] = useState(false)
    const [imageIdState, setImageIdState] = useState<string | null>(null)
    const [progressState, setProgressState] = useState(0)
    const [pollingState, setPollingState] = useState(false)
    const [pollingIntervalState, setPollingIntervalState] = useState<NodeJS.Timeout | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const { theme } = useTheme()

    useEffect(() => {
        setMountedState(true)
    }, [])

    const { handleSubmit: handleSubmitStatusCheck } = useChat({
        api: '/api/check-action-figure-status',
        onResponse: (response) => {
            console.log('status check response received', response)

            /*if (response.data) {
                const {
                    progress,
                    previewImage,
                    imageVersions,
                    complete
                } = response.data as ActionFigureStatusData

                // Update progress
                if (typeof progress === 'number') {
                    setProgressState(progress)
                }

                // Show preview image if available
                if (previewImage) {
                    setActionFigureState(previewImage)
                }

                // If generation is complete, set the final image and stop polling
                if (complete && imageVersions) {
                    console.log('Image generation complete!', imageVersions)

                    // Use the highest quality version available, or the first one if no specific versions
                    const imageVersionsTyped = imageVersions as ActionFigureImageVersions
                    const finalImage = imageVersionsTyped.lg ?? imageVersionsTyped.md ?? imageVersionsTyped.sm ??
                        Object.values(imageVersions)[0]

                    if (finalImage) {
                        setActionFigureState(finalImage)
                        setProgressState(100)
                        setPollingState(false)

                        if (pollingIntervalState) {
                            clearInterval(pollingIntervalState)
                            setPollingIntervalState(null)
                        }

                        toast.success('Action figure generated successfully!')
                    }
                }
            }*/
        },
        onFinish: (message) => {

            console.log('status check finished', message)

            const annotations = message.annotations as ActionFigureStatusData[]

            if (annotations.length > 0) {

                const annotationData = annotations.find((annotation) => {
                    return annotation.type === 'action_figure_status'
                })

                console.log('check-action-figure-status:', annotationData)

                if (!annotationData) {
                    console.error('check-action-figure-status: no image data found in annotations')
                    toast.error('No image data found in the response')
                    return
                }

                if (typeof annotationData.status.progress === 'number') {
                    setProgressState(annotationData.status.progress)
                }

                if (annotationData.status.previewImage && annotationData.status.previewImage !== '') {
                    setActionFigureState(annotationData.status.previewImage)
                }

                if (annotationData.status.progress === 100 && annotationData.status.imageVersions) {
                    console.log('Image generation complete!', annotationData.status.imageVersions)

                    if (pollingIntervalState) {
                        clearInterval(pollingIntervalState)
                        setPollingIntervalState(null)
                    }

                    const finalImage = annotationData.status.imageVersions['640x640']

                    if (finalImage) {
                        setActionFigureState(finalImage)
                        setProgressState(100)
                        setPollingState(false)

                        if (pollingIntervalState) {
                            clearInterval(pollingIntervalState)
                            setPollingIntervalState(null)
                        }

                        toast.success('Action figure generated successfully!')
                    }
                }
            }
        },
        onError: (error) => {
            console.error('error checking action figure status:', error)
            toast.error('Something went wrong while checking your action figure status')
        }
    })

    const checkActionFigureStatus = useCallback((imageId: string) => {
        const syntheticEvent = {} as unknown as React.FormEvent<HTMLFormElement>

        handleSubmitStatusCheck(syntheticEvent, {
            body: {
                imageId
            },
            allowEmptySubmit: true,
        })
    }, [handleSubmitStatusCheck])

    // Set up status polling effect
    useEffect(() => {
        if (imageIdState && pollingState) {
            console.log('Starting polling for image status with ID:', imageIdState)

            // Start initial polling after 10 seconds
            const initialTimeout = setTimeout(() => {
                checkActionFigureStatus(imageIdState)

                // Then set up regular interval polling
                const interval = setInterval(() => {
                    checkActionFigureStatus(imageIdState)
                }, 10000) // Poll every 10 seconds

                setPollingIntervalState(interval)
            }, 10000)

            return () => {
                clearTimeout(initialTimeout)
                if (pollingIntervalState) {
                    clearInterval(pollingIntervalState)
                }
            }
        }

        return () => {
            if (pollingIntervalState) {
                clearInterval(pollingIntervalState)
            }
        }
    }, [imageIdState, pollingState, checkActionFigureStatus, pollingIntervalState])

    const { handleSubmit: handleSubmitImage, status: imageStatus } = useChat({
        api: '/api/analyze-image',
        onResponse: (response) => {
            console.log('chatgpt response received', response)
        },
        onFinish: (message) => {
            console.log('chatgpt message finished', message)
            try {
                console.log('chatgpt message.content:', message.content)
                designActionFigure(message.content)
            } catch (error: unknown) {
                console.error('error parsing analysis data:', error)
                toast.error('Error parsing the analysis data')
            }
        },
        onError: (error) => {
            console.error('error analyzing image:', error)
            toast.error('Something went wrong while analyzing your image')
        }
    })

    const { handleSubmit: handleLetzAiGenerate } = useChat({
        api: '/api/generate-action-figure',
        onResponse: (response) => {
            console.log('generate-action-figure: response received from letz.ai', response)
        },
        onFinish: (message) => {
            console.log('generate-action-figure: message finished', message)

            const annotations = message.annotations as ActionFigureGenerationData[]

            if (annotations.length > 0) {
                const annotationData = annotations.find((annotation) => {
                    return annotation.type === 'generate_image'
                })
                if (!annotationData) {
                    console.error('generate-action-figure: no image data found in annotations')
                    toast.error('No image data found in the response')
                    return
                }
                setImageIdState(annotationData.imageId)
                setPollingState(true)
                console.log('generate-action-figure, letz.ai image id:', annotationData.imageId)
            }
        },
        onError: (error) => {
            console.error('error starting action figure generation:', error)
            toast.error('Something went wrong while starting your action figure generation')
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
            processFiles(event.dataTransfer.files)
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()
        event.stopPropagation()
        if (event.target.files && event.target.files.length > 0) {
            setFileState(event.target.files[0])
            processFiles(event.target.files)
        }
    }

    const processFiles = (files: FileList) => {

        // Reset states when processing new file
        setActionFigureState(null)
        setImageIdState(null)
        setProgressState(0)
        setPollingState(false)

        if (pollingIntervalState) {
            clearInterval(pollingIntervalState)
            setPollingIntervalState(null)
        }

        // simplified code as we handle only one file
        const file = files[0]

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
        console.log('CLIENT: Created FileList object for API submission')
        console.log('CLIENT: Processing submission with image attachment')

        // Create a synthetic form event for handleSubmit
        const syntheticEvent = {} as unknown as React.FormEvent<HTMLFormElement>

        handleSubmitImage(syntheticEvent, {
            experimental_attachments: files,
            allowEmptySubmit: true,
        })

        console.log('🔍 CLIENT: handleSubmit called, checking status:', imageStatus)

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
    }

    const designActionFigure = (analysis: string) => {
        const syntheticEvent = {} as unknown as React.FormEvent<HTMLFormElement>

        console.log('design action figure:', analysis)

        handleLetzAiGenerate(syntheticEvent, {
            body: {
                traits: analysis
            },
            allowEmptySubmit: true,
        })
    }

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    // determine button gradient based on theme with improved approach to prevent flickering
    const buttonClasses = !mountedState ?
        'bg-gradient-to-r from-pink-300 to-violet-400 opacity-0 transition-opacity duration-300' :
        theme === 'dark' ?
            'bg-gradient-to-r from-pink-600 to-violet-500 hover:from-pink-700 hover:to-violet-600 hover:shadow-lg hover:shadow-violet-500/20 opacity-100 transition-all duration-300' :
            'bg-gradient-to-r from-pink-300 to-violet-400 hover:from-pink-400 hover:to-violet-500 hover:shadow-lg hover:shadow-violet-300/30 opacity-100 transition-all duration-300'

    return (
        <div className="w-full max-w-2xl mx-auto">
            {!fileState ? (
                <Card
                    // width = 640px + 2 * 32px (padding) + 2 * 1px (border)
                    className={`border-dashed p-8 mt-8 flex flex-col items-center justify-center w-[706px] h-auto ${dragActiveState ? 'border-primary' : 'border-muted-foreground/40'}`}
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
                <>
                    {imageDataUrlState && !actionFigureState && (
                        <Card className="p-8 mt-8 border-muted-foreground/40 w-[706px]">
                            <div className="relative overflow-hidden shadow-lg">
                                <div
                                    style={{
                                        backgroundImage: `url(${imageDataUrlState})`,
                                    }}
                                    className="h-[640px] w-auto bg-cover bg-center"
                                    aria-label="Uploaded image"
                                />
                                <ScanningAnimation />
                            </div>

                            {(typeof progressState === 'number') && (
                                <div className="mt-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm">Analyzing image...</span>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    {actionFigureState && (
                        <Card className="p-8 mt-8 border-muted-foreground/40 w-[706px]">
                            <div className="relative overflow-hidden shadow-lg">
                                <div
                                    style={{
                                        backgroundImage: `url(${actionFigureState})`,
                                    }}
                                    className="h-[640px] w-auto bg-auto"
                                    aria-label="Generated action figure image"
                                />
                            </div>

                            {(typeof progressState === 'number') && (
                                <div className="mt-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm">Generating action figure...</span>
                                        <span className="text-sm font-medium">{progressState}%</span>
                                    </div>
                                    <Progress value={progressState} className="h-2" />
                                </div>
                            )}
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}