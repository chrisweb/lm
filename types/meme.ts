/**
 * type definitions for the meme generator
 */

export interface MemeTopic {
    id: string
    title: string
    thumbnail: string
    letzai_model_name: string
}

export interface MemeStyle {
    id: string
    title: string
}

export interface MemeGenerationParams {
    topic: string
    style: string
    prompt: string
}

// Topic names that match our available thumbnails
export type MemeTopicName = 'cats' | 'funny' | 'gaming' | 'office' | 'tech'