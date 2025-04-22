//import { letzAi } from '@/lib/providers/letz-ai'
import { Message, createDataStreamResponse } from 'ai'
import { ActionFigureGenerationData } from '@/types/action-figure'

// hobby 10s (default) max 60s, pro: 15s (default) max 300s
// https://vercel.com/docs/functions/configuring-functions/duration#duration-limits
export const maxDuration = 60

interface LetzAiErrorResponse {
    message?: string
    error?: string
}

interface LetzAiImageResponse {
    id: string
    status: string
    imageUrl?: string
    imagePaths?: string[]
    imageVersions?: Record<string, string>
}

export async function POST(request: Request) {

    try {

        const { messages, traits } = await request.json() as {
            messages?: Message[]
            traits?: string
        }

        console.log('Received request:', { messages, traits })

        // Use createDataStreamResponse to properly handle streaming with annotations
        return createDataStreamResponse({
            execute: async (dataStream) => {
                try {

                    if (!traits) {
                        throw new Error('Missing traits in request')
                    }

                    const prompt = `@action_figure:1.20 Create an action figure blister packs containing an action figure and a few accessories. Here is some additional information about the action figure: ${traits}.`

                    console.log('Generated prompt:', prompt)

                    // Start the image generation process with Letz.ai API
                    const apiKey = process.env.LETZ_AI_API_KEY

                    if (!apiKey) {
                        throw new Error('Missing LETZ_AI_API_KEY environment variable')
                    }

                    // Prepare the request options for Letz.ai API
                    const letzAiRequestOptions = {
                        prompt,
                        width: 1024,
                        height: 1024,
                        quality: 2,
                        creativity: 2,
                        hasWatermark: true,
                        systemVersion: 3,
                        mode: 'default'
                    }

                    console.log('Letz.ai API request options:', letzAiRequestOptions)

                    // Make the initial POST request to start image generation
                    const response = await fetch('https://api.letz.ai/images', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify(letzAiRequestOptions)
                    })

                    if (!response.ok) {
                        const errorData = await response.json() as LetzAiErrorResponse
                        console.error('Letz.ai API error:', errorData)
                        throw new Error(`Letz.ai API error: ${errorData.message ?? 'Unknown error'}`)
                    }

                    // Parse the successful response
                    const imageData = await response.json() as LetzAiImageResponse
                    console.log('Letz.ai API response:', imageData)

                    const imageAnnotation = {
                        type: 'generate_image',
                        imageId: imageData.id,
                        status: imageData.status,
                        error: false,
                    } as ActionFigureGenerationData

                    // Return the image ID to the client for polling
                    dataStream.writeMessageAnnotation(imageAnnotation)

                    // Send the image ID and initial status to the client
                    dataStream.writeData({})

                } catch (error) {
                    console.error('Error generating image:', error)
                    dataStream.writeData({
                        imageId: '',
                        status: 'error',
                    })
                }
            },
            onError: (error: unknown) => {
                console.error('Error in stream:', error)
                return 'Failed to generate image'
            }
        })

    } catch (error) {
        console.error('Error processing request:', error)
        return new Response(JSON.stringify({ error: 'Failed to process request' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}