import { z } from 'zod'

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  githubUsername: z.string().min(1).max(39).optional()
})

export const repositoryToggleSchema = z.object({
  isActive: z.boolean()
})

export const reviewQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 20, 100)),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
  repositoryId: z.string().optional()
})

export const analyticsQuerySchema = z.object({
  timeframe: z.enum(['7d', '30d']).default('7d')
})

export const teamCreateSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional()
})

export const subscriptionCreateSchema = z.object({
  priceId: z.string().min(1),
  plan: z.enum(['pro', 'team'])
})

// Helper function to validate request data
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`)
  }
  
  return result.data
}
