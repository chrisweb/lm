// filepath: c:\Users\chris\grepos\lm\types\action-figure.ts
// interfaces for action figure generation API responses

import { JSONValue } from 'ai'

/**
 * Data returned from the initial action figure generation request
 */
export type ActionFigureGenerationData = JSONValue & {
    type: string
    imageId: string
    status: string
    error?: boolean
}

/**
 * Data returned from the action figure status check endpoint
 */
export type ActionFigureStatusData = JSONValue & {
    type: string
    imageId: string
    status: {
        progress: number
        previewImage?: string
        imageVersions?: ActionFigureImageVersions
    }
    error?: boolean
}

/**
 * Image version options that might be returned by the Letz.ai API
 */
export interface ActionFigureImageVersions {
    'original': string
    '96x96': string
    '240x240': string
    '640x640': string
    '1920x1920': string
}