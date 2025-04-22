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

/**
 * Interface for the action figure traits parsed from markdown
 */
interface ActionFigureTraits {
    'Gender': string
    'Age Range': string
    'Build': string
    'Skin Tone': string
    'Hair Length': string
    'Hair Color': string
    'Haircut Style': string
    'Facial Features': string
    'Facial Expression': string
    'Clothing': string
    'Posture': string
    'Has Tattoos': string
    'Has Glasses': string
    'Has Beard': string
    'Has Mustache': string
    'Has Hat': string
    'Has Jewelry': string
    'Has Makeup': string
    'Has Piercings': string
    'Has Scars': string
    'Has Wrinkles': string
    'Has Freckles': string
}

export async function POST(request: Request) {

    try {

        const { messages, traits } = await request.json() as {
            messages?: Message[]
            traits?: string
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('Received request:', { messages, traits })
        }

        // Use createDataStreamResponse to properly handle streaming with annotations
        return createDataStreamResponse({
            execute: async (dataStream) => {
                try {

                    if (!traits) {
                        throw new Error('Missing traits in request')
                    }

                    // Parse traits from markdown format into a structured object
                    const parseTraits = (markdownTraits: string): ActionFigureTraits => {
                        const traitsObject: ActionFigureTraits = {
                            'Gender': '',
                            'Age Range': '',
                            'Build': '',
                            'Skin Tone': '',
                            'Hair Length': '',
                            'Hair Color': '',
                            'Haircut Style': '',
                            'Facial Features': '',
                            'Facial Expression': '',
                            'Clothing': '',
                            'Posture': '',
                            'Has Tattoos': '',
                            'Has Glasses': '',
                            'Has Beard': '',
                            'Has Mustache': '',
                            'Has Hat': '',
                            'Has Jewelry': '',
                            'Has Makeup': '',
                            'Has Piercings': '',
                            'Has Scars': '',
                            'Has Wrinkles': '',
                            'Has Freckles': '',
                        } as ActionFigureTraits

                        // Split the markdown by line and process each trait
                        const traitItems = markdownTraits.split('\n').filter(line => line.trim().startsWith('-'))

                        traitItems.forEach((item) => {
                            // Remove the leading dash and trim whitespace
                            const cleanItem = item.replace(/^-\s*/, '').trim()

                            // Split by the first colon to separate trait type and value
                            const colonIndex = cleanItem.indexOf(':')

                            if (colonIndex !== -1) {
                                const traitType = cleanItem.substring(0, colonIndex).trim()
                                const traitValue = cleanItem.substring(colonIndex + 1).trim()

                                // Check if the trait type is a valid key of ActionFigureTraits
                                if (traitType in traitsObject) {
                                    // Use type assertion to tell TypeScript this is a valid key
                                    traitsObject[traitType as keyof ActionFigureTraits] = traitValue
                                }
                            }
                        })

                        return traitsObject
                    }

                    const traitsObject = parseTraits(traits)

                    if (process.env.NODE_ENV === 'development') {
                        console.log(`Parsed traits: ${JSON.stringify(traitsObject).toString()}`)
                    }

                    // Convert gender format for the prompt
                    const formattedGender = traitsObject.Gender === 'Male' ? 'Man' : traitsObject.Gender === 'Female' ? 'Woman' : traitsObject.Gender

                    // Check for additional traits that start with "Has" and create description for those with "Yes" value
                    const additionalTraits: string[] = []

                    Object.entries(traitsObject).forEach(([key, value]) => {
                        if (key.startsWith('Has') && value === 'Yes') {
                            // Convert "HasBeard" format to "has a beard" format
                            const traitName = key.replace(/^Has\s*/, '').toLowerCase()
                            additionalTraits.push(traitName)
                        }
                    })

                    const additionalTraitsText = additionalTraits.length > 0 ?
                        `The action figure also has the following features: ${additionalTraits.join(', ')}.` :
                        ''

                    const prompt = `@action_figure:1.20 Create an action figure blister pack, containing an action figure and a few accessories, tucked neatly inside the blister pack alongside the figure are must-have.
                    Inside of the blister pack there is one full-body collectible action figure. Render the image in a detailed 3D toy aesthetic, the action figure is presented in transparent blister pack with a colorful paper back.
                    The action figure is a ${traitsObject['Age Range']} ${formattedGender} of ${traitsObject.Build} build with with ${traitsObject['Skin Tone']} skin.
                    The face is detailed, the hair is ${traitsObject['Hair Length']}, the hair color is ${traitsObject['Hair Color']} and the hair is styled ${traitsObject['Haircut Style']}. The figurine face also has ${traitsObject['Facial Features']}.
                    The action figure has a ${traitsObject['Facial Expression']} expression and is wearing ${traitsObject.Clothing}. The action figure is in a ${traitsObject.Posture} pose.
                    ${additionalTraitsText}`

                    if (process.env.NODE_ENV === 'development') {
                        console.log('Generated prompt:', prompt)
                    }

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

                    if (process.env.NODE_ENV === 'development') {
                        console.log('Letz.ai API request options:', letzAiRequestOptions)
                    }

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
                        if (process.env.NODE_ENV === 'development') {
                            console.error('Letz.ai API error:', errorData)
                        }
                        throw new Error(`Letz.ai API error: ${errorData.message ?? 'Unknown error'}`)
                    }

                    // Parse the successful response
                    const imageData = await response.json() as LetzAiImageResponse
                    if (process.env.NODE_ENV === 'development') {
                        console.log('Letz.ai API response:', imageData)
                    }

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
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Error generating image:', error)
                    }
                    dataStream.writeData({
                        imageId: '',
                        status: 'error',
                    })
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