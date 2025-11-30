import { z } from 'zod'

export const toolCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
  shortDescription: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  categoryIds: z.array(z.string().cuid()).min(1),
  tagIds: z.array(z.string().cuid()).optional().default([]),
  integrations: z.array(z.string()).optional().default([]),
  apiAvailable: z.boolean().default(false),
  enterpriseReady: z.boolean().default(false),
  pricingModel: z.enum(['FREE', 'FREEMIUM', 'PAID', 'ENTERPRISE', 'USAGE_BASED']),
  strengths: z.array(z.string()).min(1),
  limitations: z.array(z.string()).optional().default([]),
  useCasePersonas: z.array(z.string()).min(1),
})

export const toolUpdateSchema = toolCreateSchema.partial()

export const workflowInputSchema = z.object({
  tasks: z.string().min(10).max(5000),
  categoryIds: z.array(z.string().cuid()).optional().default([]),
  role: z.string().max(200).optional(),
})

export const comparisonCreateSchema = z.object({
  toolIds: z.array(z.string().cuid()).min(2).max(4),
  name: z.string().max(200).optional(),
})

export const feedbackSchema = z.object({
  toolId: z.string().cuid(),
  type: z.enum(['comment', 'feature_request']),
  content: z.string().min(10).max(2000),
})


