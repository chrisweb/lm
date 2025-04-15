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
} from '@ai-sdk/provider-utils'
import { z } from 'zod'

/**
 * letz.ai image model ids
 */
export type LetzAiImageModelId = string

/**
 * letz.ai image generation settings
 */
export interface LetzAiImageSettings {
    width?: number
    height?: number
    quality?: number
    creativity?: number
    hasWatermark?: boolean
    systemVersion?: 2 | 3
    mode?: 'default' | 'sigma'
    negativePrompt?: string
    steps?: number
    guidanceScale?: number
}

/**
 * provider factory settings
 */
export interface LetzAiProviderSettings {
    /** Use a different URL prefix for API calls */
    baseURL?: string
    /** API key */
    apiKey?: string
    /** Custom headers to include in the requests */
    headers?: Record<string, string>
    /** Custom fetch implementation */
    fetch?: FetchFunction
}

/**
 * letz.ai specific provider options
 */
export interface LetzAiProviderOptions {
    /** letz.ai specific settings */
    letzAi?: {
        steps?: number
        guidanceScale?: number
        negativePrompt?: string
        width?: number
        height?: number
        quality?: number
        creativity?: number
        hasWatermark?: boolean
        systemVersion?: 2 | 3
        mode?: 'default' | 'sigma'
        [key: string]: unknown
    }
}

/**
 * letz.ai image provider
 */
export interface LetzAiProvider {
    (modelId?: LetzAiImageModelId, settings?: LetzAiImageSettings): LetzAiImageModel
    image(modelId?: LetzAiImageModelId, settings?: LetzAiImageSettings): LetzAiImageModel
}

/**
 * letz.ai provider configuration
 */
interface LetzAiConfig {
    provider: string
    baseURL: string
    headers: () => Record<string, string>
    fetch?: FetchFunction
}

/**
 * provider factory function
 */
export function createLetzAiProvider(options: LetzAiProviderSettings = {}): LetzAiProvider {
    // Load the API key from options or environment variable
    const apiKey = loadApiKey({
        apiKey: options.apiKey,
        environmentVariableName: 'LETZ_AI_API_KEY',
        description: 'Letz.ai API key',
    })

    // Set base URL from options or use default
    const baseURL = withoutTrailingSlash(options.baseURL ?? 'https://api.letz.ai')

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
                ...(options.headers ?? {})
            }

            if (apiKey) {
                headers.Authorization = `Bearer ${apiKey}`
            }

            return headers
        },
        fetch: options.fetch
    }

    // Factory function for creating model instances
    const createModel = (modelId: LetzAiImageModelId = 'default', settings: LetzAiImageSettings = {}) => {
        return new LetzAiImageModel(modelId, settings, config)
    }

    // Create the provider object with model creation functions
    const provider = ((modelId?: LetzAiImageModelId, settings?: LetzAiImageSettings) =>
        createModel(modelId, settings)) as LetzAiProvider

    // Add the explicit image method
    provider.image = (modelId?: LetzAiImageModelId, settings?: LetzAiImageSettings) =>
        createModel(modelId, settings)

    return provider
}

/**
 * letz.ai image model class implementing the ImageModelV1 interface
 */
export class LetzAiImageModel implements ImageModelV1 {
    readonly specificationVersion = 'v1'
    readonly provider: string
    readonly modelId: LetzAiImageModelId
    readonly settings: LetzAiImageSettings
    readonly defaultObjectGenerationMode = 'json'
    readonly maxImagesPerCall = 4

    private readonly config: LetzAiConfig

    constructor(
        modelId: LetzAiImageModelId,
        settings: LetzAiImageSettings,
        config: LetzAiConfig
    ) {
        this.modelId = modelId
        this.settings = settings
        this.config = config
        this.provider = config.provider
    }

    private getArgs(options: {
        prompt: string
        size?: `${number}x${number}`
        width?: number
        height?: number
        negativePrompt?: string
        seed?: number
        n?: number
        providerOptions?: Record<string, Record<string, unknown>>
    }) {
        const warnings: ImageModelV1CallWarning[] = []

        // Extract provider-specific options
        const letzAiOptions = options.providerOptions?.letzAi ?? {}

        // Parse dimensions from size if provided
        let width = options.width ?? this.settings.width ?? 1024
        let height = options.height ?? this.settings.height ?? 1024

        if (options.size) {
            const [w, h] = options.size.split('x').map(dim => parseInt(dim, 10))
            if (!isNaN(w) && !isNaN(h)) {
                width = w
                height = h
            }
        }

        // Prepare the request body for the API
        const args: Record<string, unknown> = {
            prompt: options.prompt,
            width,
            height,
            quality: letzAiOptions.quality ?? this.settings.quality ?? 2,
            creativity: letzAiOptions.creativity ?? this.settings.creativity ?? 2,
            hasWatermark: letzAiOptions.hasWatermark ?? this.settings.hasWatermark ?? true,
            systemVersion: letzAiOptions.systemVersion ?? this.settings.systemVersion ?? 3,
            mode: letzAiOptions.mode ?? this.settings.mode ?? 'default'
        }

        // Add optional parameters
        const negativePrompt = options.negativePrompt ??
            letzAiOptions.negativePrompt ??
            this.settings.negativePrompt

        if (negativePrompt) {
            args.negative_prompt = negativePrompt
        }

        // Add model ID if specified
        if (this.modelId !== 'default') {
            args.model_id = this.modelId
        }

        // Add seed if provided
        if (options.seed !== undefined) {
            args.seed = options.seed
        }

        // Add batch size if n is provided, limited by maxImagesPerCall
        if (options.n !== undefined) {
            const batchSize = Math.min(options.n, this.maxImagesPerCall)
            if (batchSize > 1) {
                args.imageCompletionsCount = batchSize
            }
        }

        // Add steps parameter if provided
        const steps = letzAiOptions.steps ?? this.settings.steps
        if (steps !== undefined) {
            args.steps = steps
        }

        // Add guidance scale if provided
        const guidanceScale = letzAiOptions.guidanceScale ?? this.settings.guidanceScale
        if (guidanceScale !== undefined) {
            args.guidance_scale = guidanceScale
        }

        return { args, warnings }
    }

    async doGenerate(options: Parameters<ImageModelV1['doGenerate']>[0]): Promise<Awaited<ReturnType<ImageModelV1['doGenerate']>>> {

        const { args, warnings } = this.getArgs(options)

        const letzAiErrorDataSchema = z.object({
            error: z.string().optional(),
            message: z.string().optional()
        })

        const letzAIFailedResponseHandler = createJsonErrorResponseHandler({
            errorSchema: letzAiErrorDataSchema,
            errorToMessage: data => data.message ?? 'Unknown error',
        })

        // API call with proper error handling
        const { responseHeaders, value: response } = await postJsonToApi({
            url: `${this.config.baseURL}/images`,
            headers: combineHeaders(this.config.headers(), options.headers),
            body: args,
            failedResponseHandler: letzAIFailedResponseHandler,
            successfulResponseHandler: createJsonResponseHandler(
                z.object({
                    id: z.string(),
                    imageUrl: z.string().optional(),
                    imagePaths: z.array(z.string()).optional(),
                    imageVersions: z.record(z.string()).optional(),
                    status: z.string()
                })
            ),
            abortSignal: options.abortSignal,
            fetch: this.config.fetch
        })

        // Extract image URLs from response
        let images: string[] = []

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
        }

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

/**
 * default provider instance
 */
export const letzAi = createLetzAiProvider()