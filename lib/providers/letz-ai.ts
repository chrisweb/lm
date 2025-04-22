import {
    ImageModelV1,
    ImageModelV1CallWarning,
} from '@ai-sdk/provider'
import {
    FetchFunction,
    loadApiKey,
    withoutTrailingSlash,
    createJsonResponseHandler,
    combineHeaders,
    postJsonToApi,
    createJsonErrorResponseHandler,
    parseProviderOptions,
} from '@ai-sdk/provider-utils'
import { z } from 'zod'

/**
 * letz.ai image model ids
 */
type LetzAiImageModelId = string

// create a zod schema using the LetzAiProviderOptions as base
const letzAiProviderOptionsSchema = z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    quality: z.number().optional(),
    creativity: z.number().optional(),
    hasWatermark: z.boolean().optional(),
    systemVersion: z.union([z.literal(2), z.literal(3)]).optional(),
    mode: z.union([z.literal('default'), z.literal('sigma')]).optional()
}).optional()

export type LetzAiProviderOptions = z.infer<
    typeof letzAiProviderOptionsSchema
>

/**
 * letz.ai provider configuration
 */
interface LetzAiConfig {
    provider: string
    baseURL: string
    headers: () => Record<string, string>
    fetch?: FetchFunction
}

interface LetzAiImageSettings {
    maxImagesPerCall: number
}

/**
 * letz.ai image model class implementing the ImageModelV1 interface
 */
export class LetzAiImageModel implements ImageModelV1 {

    readonly specificationVersion = 'v1'
    readonly modelId: LetzAiImageModelId
    readonly settings: LetzAiImageSettings
    readonly config: LetzAiConfig
    readonly provider: string = 'letz-ai'
    readonly maxImagesPerCall: number = 4

    constructor(
        modelId: LetzAiImageModelId,
        settings: LetzAiImageSettings,
        config: LetzAiConfig
    ) {
        this.modelId = modelId
        this.settings = settings
        this.config = config
    }

    private prepareImageRequest(requestOptions: {
        prompt: string
        providerOptions: LetzAiProviderOptions
        baseURL?: string
        headers?: Record<string, string | undefined>
        fetch?: FetchFunction
        abortSignal?: AbortSignal
        apiKey?: string
    }) {

        const warnings: ImageModelV1CallWarning[] = []

        const apiKey = loadApiKey({
            apiKey: requestOptions.apiKey,
            environmentVariableName: 'LETZ_AI_API_KEY',
            description: 'Letz.ai API key',
        })

        // Set base URL from options or use default
        const baseURL = withoutTrailingSlash(requestOptions.baseURL ?? 'https://api.letz.ai')

        if (!baseURL) {
            throw new Error('Base URL is required')
        }

        // Create provider configuration
        const config: LetzAiConfig = {
            provider: 'letz-ai',
            baseURL,
            headers: () => {
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    ...(requestOptions.headers ?? {})
                }

                if (apiKey) {
                    headers.Authorization = `Bearer ${apiKey}`
                }

                return headers
            },
            fetch: requestOptions.fetch
        }

        const letzAiOptions = parseProviderOptions({
            provider: 'letz-ai',
            providerOptions: requestOptions.providerOptions,
            schema: letzAiProviderOptionsSchema,
        })

        const options: LetzAiProviderOptions & { prompt: string } = {
            prompt: requestOptions.prompt,
            width: letzAiOptions?.width ?? 1024,
            height: letzAiOptions?.height ?? 1024,
            quality: letzAiOptions?.quality ?? 2,
            creativity: letzAiOptions?.creativity ?? 2,
            hasWatermark: letzAiOptions?.hasWatermark ?? true,
            systemVersion: letzAiOptions?.systemVersion ?? 3,
            mode: letzAiOptions?.mode ?? 'default'
        }

        return { options, config, warnings }
    }

    async doGenerate(providerOptions: Parameters<ImageModelV1['doGenerate']>[0]): Promise<Awaited<ReturnType<ImageModelV1['doGenerate']>>> {

        // TODO: I have paused the development of doGenerate as the letzai API
        // implementation will require several API calls, the initial call to
        // the API starts the image generation, but after that you need to
        // poll the API to check if the image is ready, and then get the image

        const { options, config, warnings } = this.prepareImageRequest(providerOptions)

        const letzAiErrorDataSchema = z.object({
            error: z.string().optional(),
            message: z.string().optional()
        })

        const letzAIFailedResponseHandler = createJsonErrorResponseHandler({
            errorSchema: letzAiErrorDataSchema,
            errorToMessage: data => data.message ?? 'Unknown error',
        })

        const letzAiSuccessDataSchema = z.object({
            id: z.string(),
            imageUrl: z.string().optional(),
            imagePaths: z.array(z.string()).optional(),
            imageVersions: z.record(z.string()).optional(),
            status: z.string()
        })

        const letzAiSuccessResponseHandler = createJsonResponseHandler(letzAiSuccessDataSchema)

        console.log('Letz.ai API request:', {
            url: `${config.baseURL}/images`,
            headers: config.headers(),
            body: options,
        })

        // API call with proper error handling
        const { responseHeaders, value } = await postJsonToApi({
            url: `${config.baseURL}/images`,
            headers: combineHeaders(config.headers(), providerOptions.headers),
            body: options,
            failedResponseHandler: letzAIFailedResponseHandler,
            successfulResponseHandler: letzAiSuccessResponseHandler,
            abortSignal: providerOptions.abortSignal,
            fetch: config.fetch
        })

        console.log('Letz.ai API response:', responseHeaders, value)

        // TODO: extract the image ID from the response

        let processingDone = false

        while (!processingDone) {

            // TODO: at an interval check if the image is done processing
            // GET request to /images/:id
            processingDone = true

        }

        // Extract image URLs from response
        /*let images: string[] = []

        if (response.imageUrl) {
            images.push(response.imageUrl)
        }

        if (response.imagePaths && response.imagePaths.length > 0) {
            images = [...images, ...response.imagePaths]
        }

        if (response.imageVersions) {
            // Use the highest quality version available
            const versions = Object.values(response.imageVersions)
            if (versions.length > 0) {
                images = [...images, ...versions.filter(url => typeof url === 'string')]
            }
        }

        // If no images were found in the response
        if (images.length === 0) {
            throw new Error('No images were returned from Letz.ai API')
        }*/

        // TODO: pseudo code to pass type checking, remove following line when adding the "real" code
        const images = value.imagePaths ?? []

        return {
            images,
            response: {
                timestamp: new Date(),
                modelId: this.modelId,
                headers: responseHeaders,
            },
            warnings
        }
    }
}

export function letzAi(modelId: LetzAiImageModelId, settings: LetzAiImageSettings): ImageModelV1 {
    return new LetzAiImageModel(
        modelId,
        settings,
        {
            provider: 'letz-ai',
            baseURL: 'https://api.letz.ai',
            headers: () => ({
                'Content-Type': 'application/json',
            }),
        }
    )
}