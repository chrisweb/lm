import { OpenAI } from 'openai'
import { createDataStreamResponse } from 'ai'

// initialize the OpenAI client with API key from environment variable
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// define the expected data structure
interface PromptData {
    prompt: string
}

export async function POST(request: Request) {
    try {
        // get the FormData from the request
        const formData = await request.formData()

        // check if there are any attachments (files)
        const attachments = formData.getAll('attachments') as File[]

        if (attachments.length === 0) {
            return new Response(JSON.stringify({ error: 'Image attachment is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // use the first attachment (image file)
        const imageFile = attachments[0]

        // ensure it's an image file
        if (!imageFile.type.startsWith('image/')) {
            return new Response(JSON.stringify({ error: 'Attachment must be an image' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // convert the file to a base64 data URL
        const imageBuffer = await imageFile.arrayBuffer()
        const base64Image = Buffer.from(imageBuffer).toString('base64')
        const dataUrl = `data:${imageFile.type};base64,${base64Image}`

        // get the prompt from the additional data
        let promptText = 'Transform this image into an action figure description. Create a detailed description of what this would look like as a toy in blister packaging, including the name, features and accessories.'

        // try to get custom prompt if available
        const dataField = formData.get('data')
        if (dataField) {
            try {
                const dataJson = JSON.parse(dataField as string) as Partial<PromptData>
                if (dataJson.prompt) {
                    promptText = dataJson.prompt
                }
            } catch (e) {
                console.error('error parsing data json:', e)
                // use default prompt if parsing fails
            }
        }

        // use createDataStreamResponse to properly handle streaming with annotations
        return createDataStreamResponse({
            execute: async (dataStream) => {
                try {
                    console.log('received image attachment, processing with openai vision...')

                    // call OpenAI's Chat Completions API with vision capabilities
                    const response = await openai.chat.completions.create({
                        model: 'gpt-4-vision-preview',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are an AI specialized in analyzing images and describing them as if they were action figures in packaging. Be creative and detailed in your analysis. Describe what the action figure would be called, its features, accessories, and the marketing text that would appear on the packaging.'
                            },
                            {
                                role: 'user',
                                content: [
                                    { type: 'text', text: promptText },
                                    { type: 'image_url', image_url: { url: dataUrl } }
                                ]
                            }
                        ],
                        max_tokens: 1000,
                        temperature: 0.7,
                        stream: true,
                    })

                    // process the streaming response
                    for await (const chunk of response) {
                        const content = chunk.choices[0]?.delta?.content ?? ''

                        if (content) {
                            // stream the content to the client
                            dataStream.writeData({ text: content })
                        }
                    }
                } catch (error) {
                    console.error('error analyzing image with openai:', error)
                    dataStream.writeMessageAnnotation({
                        type: 'error',
                        error: error instanceof Error ? error.message : 'Unknown error occurred'
                    })
                }
            },
            onError: (error: unknown) => {
                console.error('error in stream:', error)
                return 'Failed to analyze image'
            }
        })
    } catch (error) {
        console.error('error processing request:', error)
        return new Response(JSON.stringify({ error: 'Failed to process request' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}