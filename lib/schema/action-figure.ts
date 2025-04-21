import { z } from 'zod'

// Define the schema for action figure analysis
export const actionFigureAnalysisSchema = z.object({
    gender: z.string(),
    age_range: z.enum(['kid', 'young adult', 'middle aged', 'old']),
    build: z.string(),
    skin_tone: z.string(),
    hair_length: z.string(),
    hair_color: z.string(),
    haircut_style: z.string(),
    facial_features: z.string(),
    facial_expression: z.string(),
    clothing: z.string(),
    posture: z.string(),
})

// Create a type using Zod's infer
export type ActionFigureAnalysis = z.infer<typeof actionFigureAnalysisSchema>