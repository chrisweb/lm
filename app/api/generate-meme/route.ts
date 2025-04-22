import { letzAi } from '@/lib/providers/letz-ai'
import { Message, experimental_generateImage, createDataStreamResponse } from 'ai'
import { memeTopics, memeStyles } from '@/lib/meme-data'

export async function POST(request: Request) {

    try {

        const { messages, topic, style } = await request.json() as {
            messages?: Message[]
            topic?: string
            style?: string
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('Received request:', { messages, topic, style })
        }

        // Use createDataStreamResponse to properly handle streaming with annotations
        return createDataStreamResponse({
            execute: async (dataStream) => {
                try {

                    const model = letzAi(
                        'letz-ai-image',
                        {
                            maxImagesPerCall: 1,
                        }
                    )

                    if (process.env.NODE_ENV === 'development') {
                        console.log('Model initialized:', model)
                    }

                    if (!messages || messages.length === 0) {
                        throw new Error('No messages provided')
                    }

                    if (!topic || !style) {
                        throw new Error('Topic or style not provided')
                    }

                    const lastMessageOnly = messages[0].content

                    const memeTopic = memeTopics.find(t => t.id === topic)?.letzai_model_name ?? ''
                    const memeStyle = memeStyles.find(s => s.id === style)?.title ?? ''

                    const prompt = `You are a skilled content creator that loves generating memes. The topic for this meme is "${memeTopic}". The style you should use is "${memeStyle}". Follow the instructions: "${lastMessageOnly}". `

                    if (process.env.NODE_ENV === 'development') {
                        console.log('Generated prompt:', prompt)
                    }

                    const result = await experimental_generateImage({
                        model,
                        prompt,
                    })

                    if (process.env.NODE_ENV === 'development') {
                        console.log('Generated result:', result)
                    }

                    // If we have images, stream them back as message annotations
                    if (result.images.length > 0) {

                        const imageCount = result.images.length

                        dataStream.writeMessageAnnotation({
                            type: 'image',
                            image_data: imageCount,
                        })

                    } else {
                        throw new Error('No images were generated')
                    }
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Error generating image:', error)
                    }
                    dataStream.writeMessageAnnotation({
                        type: 'error',
                        error: error instanceof Error ? error.message : 'Unknown error occurred'
                    })
                    dataStream.writeData({ error: true })
                }
            },
            onError: (error: unknown) => {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error in stream:', error)
                }
                return 'Failed to generate image'
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