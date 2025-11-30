import { NextRequest, NextResponse } from 'next/server'
import { generateRecommendations } from '@/lib/ai/recommendations'
import { workflowInputSchema } from '@/lib/validations/tool'
import { recommendationRateLimit } from '@/lib/rate-limit'
import { getCurrentUser } from '@/lib/auth/rbac'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const user = await getCurrentUser()
    const identifier = user?.id || request.ip || 'anonymous'
    const { success } = await recommendationRateLimit.limit(identifier)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate input
    const body = await request.json()
    const validated = workflowInputSchema.parse(body)

    // Generate recommendations
    const recommendations = await generateRecommendations({
      tasks: validated.tasks,
      categoryIds: validated.categoryIds,
      role: validated.role,
    })

    // Save recommendation if user is logged in
    if (user) {
      const { prisma } = await import('@/lib/db/prisma')
      await prisma.savedRecommendation.create({
        data: {
          userId: user.id,
          workflowInput: validated.tasks,
          recommendedToolIds: recommendations.map(r => r.toolId),
        },
      })
    }

    return NextResponse.json({ recommendations })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}


