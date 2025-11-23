import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { comparisonCreateSchema } from '@/lib/validations/tool'
import { requireAuth } from '@/lib/auth/rbac'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const validated = comparisonCreateSchema.parse(body)

    // Verify all tools exist and are approved
    const tools = await prisma.tool.findMany({
      where: {
        id: { in: validated.toolIds },
        status: 'APPROVED',
      },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        vendor: { include: { user: true } },
      },
    })

    if (tools.length !== validated.toolIds.length) {
      return NextResponse.json(
        { error: 'Some tools not found or not approved' },
        { status: 400 }
      )
    }

    // Create comparison
    const comparison = await prisma.comparison.create({
      data: {
        userId: user.id,
        name: validated.name,
        tools: {
          create: validated.toolIds.map((toolId, index) => ({
            toolId,
            order: index,
          })),
        },
      },
      include: {
        tools: {
          include: {
            tool: {
              include: {
                categories: { include: { category: true } },
                tags: { include: { tag: true } },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json({ comparison }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating comparison:', error)
    return NextResponse.json(
      { error: 'Failed to create comparison' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const toolIds = searchParams.get('toolIds')?.split(',')

    if (!toolIds || toolIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 tool IDs required' },
        { status: 400 }
      )
    }

    const tools = await prisma.tool.findMany({
      where: {
        id: { in: toolIds },
        status: 'APPROVED',
      },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        vendor: { include: { user: true } },
      },
    })

    if (tools.length !== toolIds.length) {
      return NextResponse.json(
        { error: 'Some tools not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ tools })
  } catch (error) {
    console.error('Error fetching comparison:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comparison' },
      { status: 500 }
    )
  }
}

