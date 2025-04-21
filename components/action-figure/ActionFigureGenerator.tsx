'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { toast } from '@/components/base/toaster'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTheme } from 'next-themes'
import { UploadCloud } from 'lucide-react'
import { LoadingSkeletons } from '@/components/action-figure/LoadingSkeletons'
import { ScanningAnimation } from '@/components/action-figure/ScanningAnimation'
import ReactMarkdown from 'react-markdown'

export function ActionFigureGenerator() {

    const [imageDataUrlState, setImageDataUrlState] = useState<string | null>(null)
    const [fileState, setFileState] = useState<Blob | null>(null)
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
            try {
                console.log('message.content:', message.content)
                setAnalysisState(message.content)
                toast.info('Analysis complete!')
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
    }

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleStop = () => {
        if (status === 'streaming') {
            stop()
            setImageDataUrlState(null)
            setFileState(null)
            setAnalysisState(null)
            setDragActiveState(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            toast.info('Generation stopped')
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
                    <Card className="p-8 mt-8 h-80 overflow-auto border-muted-foreground/40">
                        {(status === 'streaming' || status === 'submitted') ? (
                            <div className="mt-8">
                                <LoadingSkeletons />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleStop}
                                    className="mt-4"
                                    disabled={status !== 'streaming'}
                                    aria-label="Stop generation"
                                >
                                    Stop Generation
                                </Button>
                            </div>
                        ) : analysisState && (
                            <div className="space-y-4">
                                <ReactMarkdown>{analysisState}</ReactMarkdown>
                            </div>
                        )}
                    </Card>
                </>
            )}
        </div>
    )
}