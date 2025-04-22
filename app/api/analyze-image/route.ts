import { createOpenAI } from '@ai-sdk/openai'
import { /*streamObject,*/ streamText, type Message, type CoreUserMessage } from 'ai'
import { type NextRequest } from 'next/server'
//import { actionFigureAnalysisSchema } from '@/lib/schema/action-figure'

// initialize the OpenAI client with API key from environment variable
const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

interface ImageObject {
    name: string
    contentType: string
    url: string
}

export async function POST(request: NextRequest) {

    if (process.env.NODE_ENV === 'development') {
        console.log('🔍 API ROUTE: /api/analyze-image route called')
    }

    try {
        // get the FormData from the request
        const { messages } = await request.json() as { messages: Message[] }

        const lastMessage = messages[messages.length - 1]

        const { experimental_attachments } = lastMessage

        if (!experimental_attachments || experimental_attachments.length === 0) {
            if (process.env.NODE_ENV === 'development') {
                console.log('❌ Error: No image attachment found in the request')
            }
            return new Response(JSON.stringify({ error: 'No image attachment found' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        if (!experimental_attachments[0].name || !experimental_attachments[0].contentType || !experimental_attachments[0].url) {
            if (process.env.NODE_ENV === 'development') {
                console.log('❌ Error: Invalid image attachment format')
            }
            return new Response(JSON.stringify({ error: 'Invalid image attachment format' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // use the first attachment (image file)
        const imageFile = experimental_attachments[0] as ImageObject

        // ensure it's an image file
        if (!imageFile.contentType.startsWith('image/')) {
            if (process.env.NODE_ENV === 'development') {
                console.log('❌ Error: Attachment is not an image file, type:', imageFile.contentType)
            }
            return new Response(JSON.stringify({ error: 'Attachment must be an image' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const customizedMessages: CoreUserMessage[] = [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'Describe the main person in this image, analyze the following traits: gender, age range (chose between: kid, young adult, middle aged, old), Build , Skin Tone, Hair length, color and haircut style, facial features, facial expression, clothing, posture, has tattoos, has glasses, has beard, has mustache, has hat, has jewelry, has makeup, has piercings, has scars, has wrinkles, has freckles. Its very important that you return the list of traits as a markdown list and make sure you add no other text to your response.',
                    },
                    {
                        type: 'image',
                        image: imageFile.url,
                    },
                ]
            }
        ]

        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Creating data stream response... lastMessage: ', customizedMessages)
        }

        // problem when decoding the object stream response
        // TODO: use a schema to get a structured response
        /*const result = streamObject({
            model: openai('gpt-4o-mini'),
            system: 'You are a vision agent that finds the main person in an image and then generates a list of the most significant traits that best describe the person in the image.',
            messages: customizedMessages,
            schema: actionFigureAnalysisSchema,
            temperature: 0.2,
        })

        return result.toTextStreamResponse()*/

        const result = streamText({
            model: openai('gpt-4o-mini'),
            system: 'You are a vision agent that finds the main person in an image then describes some of its visual traits.',
            messages: customizedMessages,
        })

        return result.toDataStreamResponse({
            getErrorMessage: (error) => {
                if (error == null) {
                    return 'unknown error'
                }

                if (typeof error === 'string') {
                    return error
                }

                if (error instanceof Error) {
                    return error.message
                }

                return JSON.stringify(error)
            },
        })

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('❌ Error processing request:', error)
        }
        return new Response(JSON.stringify({ error: 'Failed to process request' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}