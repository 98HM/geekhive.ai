import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { feedbackSchema } from '@/lib/validations/tool'
import { requireAuth } from '@/lib/auth/rbac'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const validated = feedbackSchema.parse(body)

    // Verify tool exists
    const tool = await prisma.tool.findUnique({
      where: { id: validated.toolId },
    })

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      )
    }

    const feedback = await prisma.toolFeedback.create({
      data: {
        toolId: validated.toolId,
        userId: user.id,
        type: validated.type,
        content: validated.content,
      },
    })

    return NextResponse.json({ feedback }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating feedback:', error)
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const toolId = searchParams.get('toolId')
    const status = searchParams.get('status')

    const where: any = {}
    
    if (toolId) {
      where.toolId = toolId
    }
    
    if (status) {
      where.status = status
    }
    
    // Users can only see their own feedback unless admin
    if (user.role !== 'ADMIN') {
      where.userId = user.id
    }

    const feedback = await prisma.toolFeedback.findMany({
      where,
      include: {
        tool: { select: { id: true, name: true } },
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

