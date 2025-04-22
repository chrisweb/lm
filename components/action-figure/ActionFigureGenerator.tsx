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
    const [showGenerateAnotherState, setShowGenerateAnotherState] = useState(false)
    const [originalImageUrlState, setOriginalImageUrlState] = useState<string | null>(null)
    const [showProgressState, setShowProgressState] = useState(true)
    const [currentAnalysisTextState, setCurrentAnalysisTextState] = useState<string>('')

    const fileInputRef = useRef<HTMLInputElement>(null)

    const { theme } = useTheme()

    useEffect(() => {
        setMountedState(true)
    }, [])

    // Effect to rotate through analysis texts
    useEffect(() => {
        const analysisTexts = [
            'hmmm what hair color is this?',
            'hmmm how do you call that haircut again...',
            'two arms, two legs, I\'m done it\'s a human I guess...',
            'what color are those eyes?',
            'is that posture a dance move from Fortnite?...',
            'analyzing facial features... human confirmed (probably)',
            'checking for signs of superhero potential...',
            'measuring shoulder-to-hip ratio for action figure accuracy...',
            'looking for distinctive characteristics... found some!',
            'determining optimal action pose for maximum coolness...'
        ]

        // Set initial random text
        if (imageDataUrlState && !actionFigureState) {
            const randomIndex = Math.floor(Math.random() * analysisTexts.length)
            setCurrentAnalysisTextState(analysisTexts[randomIndex])

            // Set up interval to change text every 6 seconds
            const textRotationInterval = setInterval(() => {
                const newRandomIndex = Math.floor(Math.random() * analysisTexts.length)
                setCurrentAnalysisTextState(analysisTexts[newRandomIndex])
            }, 6000)

            // Clean up interval on unmount or when conditions change
            return () => {
                clearInterval(textRotationInterval)
            }
        }
    }, [imageDataUrlState, actionFigureState])

    // Effect to show the "Generate another" button and hide progress after final image is displayed
    useEffect(() => {
        // Check if the action figure is fully generated (100% progress)
        if (actionFigureState && progressState === 100) {
            // Hide the button and progress initially
            setShowGenerateAnotherState(false)
            setShowProgressState(true)

            // Set a timeout to show the button and hide progress after 5 seconds
            const timeout = setTimeout(() => {
                setShowGenerateAnotherState(true)
                setShowProgressState(false)
            }, 5000)

            // Clean up timeout when component unmounts or when states change
            return () => {
                clearTimeout(timeout)
            }
        } else {
            // Reset states when we don't have a complete action figure
            setShowGenerateAnotherState(false)
            setShowProgressState(true)
        }
    }, [actionFigureState, progressState])

    const { handleSubmit: handleSubmitStatusCheck } = useChat({
        api: '/api/check-action-figure-status',
        onResponse: (response) => {
            console.log('🔍 check-action-figure-status: response received from letz.ai', response)
        },
        onFinish: (message) => {

            console.log('status check finished', message)

            const annotations = message.annotations as ActionFigureStatusData[]

            if (annotations.length > 0) {

                const annotationData = annotations.find((annotation) => {
                    return annotation.type === 'action_figure_status'
                })

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

                    if (pollingIntervalState) {
                        clearInterval(pollingIntervalState)
                        setPollingIntervalState(null)
                    }

                    const finalImage = annotationData.status.imageVersions['640x640']

                    if (finalImage) {
                        setActionFigureState(finalImage)
                        setProgressState(100)
                        setPollingState(false)

                        // Store the original image URL for download
                        if (annotationData.status.imageVersions.original) {
                            setOriginalImageUrlState(annotationData.status.imageVersions.original)
                        }

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

            // Start initial polling after 5 seconds
            const initialTimeout = setTimeout(() => {
                checkActionFigureStatus(imageIdState)

                // Then set up regular interval polling
                const interval = setInterval(() => {
                    checkActionFigureStatus(imageIdState)
                }, 5000) // Poll every 5 seconds

                setPollingIntervalState(interval)
            }, 5000)

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
            console.log('chatgpt response received', response, imageStatus)
        },
        onFinish: (message) => {
            try {
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
            }
        },
        onError: (error) => {
            console.error('error generating action figure:', error)
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

        // Create a synthetic form event for handleSubmit
        const syntheticEvent = {} as unknown as React.FormEvent<HTMLFormElement>

        handleSubmitImage(syntheticEvent, {
            experimental_attachments: files,
            allowEmptySubmit: true,
        })

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }

        const reader = new FileReader()

        reader.onload = (event) => {
            const dataUrl = event.target?.result as string
            setImageDataUrlState(dataUrl)
        }

        reader.readAsDataURL(file)
    }

    const designActionFigure = (analysis: string) => {
        const syntheticEvent = {} as unknown as React.FormEvent<HTMLFormElement>

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

    const handleGenerateAnother = () => {
        // Reset all states to allow for a new image upload
        setImageDataUrlState(null)
        setFileState(null)
        setActionFigureState(null)
        setDragActiveState(false)
        setImageIdState(null)
        setProgressState(0)
        setPollingState(false)
        setShowGenerateAnotherState(false)
        setOriginalImageUrlState(null)

        // Clear any active polling intervals
        if (pollingIntervalState) {
            clearInterval(pollingIntervalState)
            setPollingIntervalState(null)
        }
    }

    const handleDownloadImage = () => {
        if (originalImageUrlState) {
            // Open the image in a new browser tab
            window.open(originalImageUrlState, '_blank')
        } else {
            toast.error('Image URL not available')
        }
    }

    // determine button gradient based on theme with improved approach to prevent flickering
    const buttonClasses = !mountedState ?
        'bg-gradient-to-r from-pink-300 to-violet-400 opacity-0 transition-opacity duration-300' :
        theme === 'dark' ?
            'bg-gradient-to-r from-pink-600 to-violet-500 hover:from-pink-700 hover:to-violet-600 hover:shadow-lg hover:shadow-violet-500/20 opacity-100 transition-all duration-300' :
            'bg-gradient-to-r from-pink-300 to-violet-400 hover:from-pink-400 hover:to-violet-500 hover:shadow-lg hover:shadow-violet-300/30 opacity-100 transition-all duration-300'

    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            {!fileState ? (
                <Card
                    className={`border-dashed p-4 sm:p-6 md:p-8 mt-4 sm:mt-8 flex flex-col items-center justify-center w-full max-w-full aspect-square sm:aspect-auto ${dragActiveState ? 'border-primary' : 'border-muted-foreground/40'}`}
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
                            className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground"
                        />
                        <div className="space-y-2">
                            <p className="text-base sm:text-lg font-medium">Drag and drop an image or click to upload</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
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
                        <Card className="p-4 sm:p-6 md:p-8 mt-4 sm:mt-8 border-muted-foreground/40 w-full max-w-full">
                            <div className="relative overflow-hidden shadow-lg">
                                <div
                                    style={{
                                        backgroundImage: `url(${imageDataUrlState})`,
                                    }}
                                    className="w-full aspect-square md:max-h-[640px] bg-cover bg-center"
                                    aria-label="Uploaded image"
                                />
                                <ScanningAnimation />
                            </div>

                            {(typeof progressState === 'number') && (
                                <div className="mt-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm">{currentAnalysisTextState || 'Analyzing image...'}</span>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}

                    {actionFigureState && (
                        <Card className="p-4 sm:p-6 md:p-8 mt-4 sm:mt-8 border-muted-foreground/40 w-full max-w-full">
                            <div className="relative overflow-hidden shadow-lg">
                                <div
                                    style={{
                                        backgroundImage: `url(${actionFigureState})`,
                                    }}
                                    className="w-full aspect-square md:max-h-[640px] bg-contain bg-center bg-no-repeat"
                                    aria-label="Generated action figure image"
                                />
                            </div>

                            {(typeof progressState === 'number') && showProgressState && (
                                <div className="mt-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm">Generating action figure...</span>
                                        <span className="text-sm font-medium">{progressState}%</span>
                                    </div>
                                    <Progress value={progressState} className="h-2" />
                                </div>
                            )}

                            {progressState === 100 && showGenerateAnotherState && (
                                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                    <Button
                                        onClick={handleGenerateAnother}
                                        className={`text-white font-medium ${buttonClasses}`}
                                        aria-label="Generate another action figure"
                                    >
                                        Letz generate another
                                    </Button>
                                    <Button
                                        onClick={handleDownloadImage}
                                        className={`text-white font-medium ${buttonClasses}`}
                                        aria-label="Download action figure image"
                                    >
                                        Download Image
                                    </Button>
                                </div>
                            )}
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}