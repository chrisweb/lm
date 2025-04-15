import { letzAi } from '@/lib/providers/letz-ai'
import { Message, createDataStreamResponse, streamText } from 'ai'

export async function POST(request: Request) {
    try {
        // Parse the request body
        const { messages, prompt, width, height, steps, guidanceScale, quality, creativity, hasWatermark, modelId } = await request.json() as {
            messages?: Message[]
            prompt: string
            width?: number
            height?: number
            steps?: number
            guidanceScale?: number
            quality?: number
            creativity?: number
            hasWatermark?: boolean
            modelId?: string
        }

        console.log('Received request:', { messages, prompt, width, height, steps, guidanceScale, quality, creativity, hasWatermark, modelId })

        // Use createDataStreamResponse to properly handle streaming with annotations
        return createDataStreamResponse({
            execute: async (dataStream) => {
                try {
                    // Create the LetzAi model with specified or default model ID
                    const model = letzAi.image(modelId)

                    // Generate options with any specified parameters
                    const generateOptions = {
                        prompt,
                        width: width ?? 1024,
                        height: height ?? 1024,
                        providerOptions: {
                            letzAi: {
                                quality: quality ?? 2,
                                creativity: creativity ?? 2,
                                hasWatermark: hasWatermark ?? true,
                                systemVersion: 3,
                                mode: 'default',
                            }
                        }
                    }

                    // Add optional parameters if they're provided
                    if (quality !== undefined) {
                        generateOptions.providerOptions.letzAi.quality = quality
                    }

                    if (creativity !== undefined) {
                        generateOptions.providerOptions.letzAi.creativity = creativity
                    }

                    if (hasWatermark !== undefined) {
                        generateOptions.providerOptions.letzAi.hasWatermark = hasWatermark
                    }

                    // Call the Letz.ai provider to generate the image
                    const result = await model.doGenerate(generateOptions)

                    // If we have images, stream them back as message annotations
                    if (result.images.length > 0) {
                        // Write a system message with the generated image
                        const systemMessage = streamText({
                            model: model,
                            messages: [{ role: 'system', content: 'Image generated successfully' }]
                        })

                        // Merge the text stream into our data stream
                        systemMessage.mergeIntoDataStream(dataStream)

                        // Add the image as a message annotation
                        dataStream.writeMessageAnnotation({
                            type: 'image-data',
                            image_data: result.images[0]
                        })

                        // If there are warnings, add them to the response
                        if (result.warnings && result.warnings.length > 0) {
                            for (const warning of result.warnings) {
                                dataStream.writeMessageAnnotation({
                                    type: 'warning',
                                    warning: warning.message
                                })
                            }
                        }
                    } else {
                        throw new Error('No images were generated')
                    }
                } catch (error) {
                    console.error('Error generating image:', error)
                    dataStream.writeMessageAnnotation({
                        type: 'error',
                        error: error instanceof Error ? error.message : 'Unknown error occurred'
                    })
                    dataStream.writeData({ error: true })
                }
            },
            onError: (error) => {
                console.error('Error in stream:', error)
                return new Response(JSON.stringify({ error: 'Failed to generate image' }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
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