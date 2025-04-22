//import { letzAi } from '@/lib/providers/letz-ai'
import { Message/*, experimental_generateImage*/, createDataStreamResponse } from 'ai'

// hobby 10s (default) max 60s, pro: 15s (default) max 300s
// https://vercel.com/docs/functions/configuring-functions/duration#duration-limits
export const maxDuration = 60

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

                    // TODO: get image form letz-ai using their API endpoints

                    dataStream.writeMessageAnnotation({
                        type: 'progress',
                        progress: 0,
                    })

                } catch (error) {
                    console.error('Error generating image:', error)
                    dataStream.writeMessageAnnotation({
                        type: 'error',
                        error: error instanceof Error ? error.message : 'Unknown error occurred'
                    })
                    dataStream.writeData({ error: true })
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