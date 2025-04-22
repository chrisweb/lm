'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { toast } from '@/components/base/toaster'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTheme } from 'next-themes'
import { UploadCloud } from 'lucide-react'
import { ScanningAnimation } from '@/components/action-figure/ScanningAnimation'

export function ActionFigureGenerator() {

    const [imageDataUrlState, setImageDataUrlState] = useState<string | null>(null)
    const [fileState, setFileState] = useState<Blob | null>(null)
    const [actionFigureState, setActionFigureState] = useState<string | null>(null)
    const [dragActiveState, setDragActiveState] = useState(false)
    const [mountedState, setMountedState] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const { theme } = useTheme()

    useEffect(() => {
        setMountedState(true)
    }, [])

    const { handleSubmit: handleSubmitImage, status: imageStatus } = useChat({
        api: '/api/analyze-image',
        onResponse: (response) => {
            console.log('response received from ai', response)
        },
        onFinish: (message) => {
            console.log('message finished', message)
            try {
                console.log('message.content:', message.content)
                designActionFigure(message.content)
            } catch (error) {
                console.error('error parsing analysis data:', error)
                toast.error('Error parsing the analysis data')
            }
        },
        onError: (error) => {
            console.error('error analyzing image:', error)
            toast.error('Something went wrong while analyzing your image')
        }
    })

    const { handleSubmit: handleSubmitLetzAi } = useChat({
        api: '/api/generate-action-figure',
        onResponse: (response) => {
            console.log('response received from ai', response)
        },
        onFinish: (message) => {
            console.log('message finished', message)
            try {
                console.log('message.content:', message.content)
                setActionFigureState(message.content)
                setFileState(null)
                toast.info('Action figure done!')
            } catch (error) {
                console.error('error generating action figure image:', error)
                toast.error('Error generating action figure image')
            }
        },
        onError: (error) => {
            console.error('error generating action figure image:', error)
            toast.error('Something went wrong while generating your action figure image')
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

        handleSubmitLetzAi(syntheticEvent, {
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
                    className={`border-2 border-dashed p-8 mt-8 flex flex-col items-center justify-center h-80 ${dragActiveState ? 'border-primary' : 'border-muted-foreground/40'}`}
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
                    {imageDataUrlState && (
                        <Card className="p-8 mt-8 h-80 border-muted-foreground/40">
                            <div className="relative h-[300px] w-auto overflow-hidden rounded-xl shadow-lg">
                                <div
                                    style={{
                                        backgroundImage: `url(${imageDataUrlState})`,
                                    }}
                                    className="h-full w-full bg-cover bg-center"
                                    aria-label="Uploaded image"
                                />
                                <ScanningAnimation />
                            </div>
                        </Card>
                    )}
                </>
            )}
            {actionFigureState && (
                <Card className="p-8 mt-8 h-80 border-muted-foreground/40">
                    <div className="relative h-[300px] w-auto overflow-hidden rounded-xl shadow-lg">
                        <div
                            style={{
                                backgroundImage: `url(${actionFigureState})`,
                            }}
                            className="h-full w-full bg-cover bg-center"
                            aria-label="Generated action figure image"
                        />
                    </div>
                </Card>
            )}
        </div>
    )
}