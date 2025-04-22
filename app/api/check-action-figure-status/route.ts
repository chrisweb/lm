// filepath: c:\Users\chris\grepos\lm\app\api\check-action-figure-status\route.ts
import { createDataStreamResponse } from 'ai'
import { ActionFigureStatusData } from '@/types/action-figure'

// hobby 10s (default) max 60s, pro: 15s (default) max 300s
// https://vercel.com/docs/functions/configuring-functions/duration#duration-limits
export const maxDuration = 60

interface LetzAiErrorResponse {
    message?: string
    error?: string
}

interface LetzAiStatusResponse {
    status: string
    progress?: number
    previewImage?: string
    imageVersions?: Record<string, string>
}

export async function POST(request: Request) {
    try {
        const { imageId } = await request.json() as {
            imageId: string
        }

        if (!imageId) {
            throw new Error('Missing imageId in request')
        }

        // Use createDataStreamResponse to properly handle streaming with annotations
        return createDataStreamResponse({
            execute: async (dataStream) => {
                try {
                    const apiKey = process.env.LETZ_AI_API_KEY

                    if (!apiKey) {
                        throw new Error('Missing LETZ_AI_API_KEY environment variable')
                    }

                    // Make a GET request to check the status of the image generation
                    const response = await fetch(`https://api.letz.ai/images/${imageId}`, {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${apiKey}`
                        }
                    })

                    if (!response.ok) {
                        const errorData = await response.json() as LetzAiErrorResponse
                        if (process.env.NODE_ENV === 'development') {
                            console.error('Letz.ai API error:', errorData)
                        }
                        throw new Error(`Letz.ai API error: ${errorData.message ?? 'Unknown error'}`)
                    }

                    // Parse the successful response
                    const statusData = await response.json() as LetzAiStatusResponse

                    // Extract relevant information from the response
                    const {
                        status,
                        progress,
                        previewImage,
                        imageVersions
                    } = statusData

                    const actionFigureAnnotationData = {
                        type: 'action_figure_status',
                        imageId,
                        status: {
                            progress: progress ?? 0,
                            previewImage,
                            imageVersions,
                            complete: status === 'complete',
                        },
                        error: status === 'error'
                    } as ActionFigureStatusData

                    dataStream.writeMessageAnnotation(actionFigureAnnotationData)

                    // Send the status data to the client
                    dataStream.writeData({})

                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Error checking image status:', error)
                    }
                    dataStream.writeMessageAnnotation({
                        type: 'error',
                        error: error instanceof Error ? error.message : 'Unknown error occurred'
                    })
                    dataStream.writeMessageAnnotation({
                        status: 'error',
                        progress: 0,
                        complete: false,
                        error: true
                    })

                    // Send the status data to the client
                    dataStream.writeData({})
                }
            },
            onError: (error: unknown) => {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error in stream:', error)
                }
                return 'Failed to check image status'
            }
        })

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error processing request:', error)
        }
        return new Response(JSON.stringify({ error: 'Failed to process request' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}