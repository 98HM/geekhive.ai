import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { toolUpdateSchema } from '@/lib/validations/tool'
import { requireAuth } from '@/lib/auth/rbac'
import { generateCanonicalText } from '@/lib/db/vector'
import { generateEmbedding } from '@/lib/ai/embeddings'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tool = await prisma.tool.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        vendor: { include: { user: true } },
        feedback: {
          where: { status: 'reviewed' },
          include: { user: { select: { name: true, image: true } } },
          take: 10,
        },
      },
    })

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.tool.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ tool })
  } catch (error) {
    console.error('Error fetching tool:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tool' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Check permissions
    const tool = await prisma.tool.findUnique({
      where: { id },
      select: { vendorId: true, submittedBy: true },
    })

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    const isOwner = tool.vendorId && user.role === 'VENDOR'
    const isAdmin = user.role === 'ADMIN'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = toolUpdateSchema.parse(body)

    // If description or metadata changed, regenerate embedding
    const updateData: any = { ...validated }
    
    if (validated.description || validated.strengths || validated.useCasePersonas) {
      const currentTool = await prisma.tool.findUnique({
        where: { id },
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
        },
      })
      
      if (currentTool) {
        const canonicalText = generateCanonicalText({
          name: validated.name || currentTool.name,
          description: validated.description || currentTool.description,
          strengths: validated.strengths || currentTool.strengths,
          limitations: validated.limitations || currentTool.limitations,
          useCasePersonas: validated.useCasePersonas || currentTool.useCasePersonas,
          integrations: validated.integrations || currentTool.integrations,
          pricingModel: validated.pricingModel || currentTool.pricingModel,
          apiAvailable: validated.apiAvailable ?? currentTool.apiAvailable,
          enterpriseReady: validated.enterpriseReady ?? currentTool.enterpriseReady,
          categories: currentTool.categories,
          tags: currentTool.tags,
        })
        
        const embedding = await generateEmbedding(canonicalText)
        updateData.canonicalText = canonicalText
        updateData.embedding = embedding as any
      }
    }

    // Update categories and tags if provided
    if (validated.categoryIds) {
      await prisma.toolCategory.deleteMany({ where: { toolId: id } })
      updateData.categories = {
        create: validated.categoryIds.map(categoryId => ({ categoryId })),
      }
    }

    if (validated.tagIds) {
      await prisma.toolTag.deleteMany({ where: { toolId: id } })
      updateData.tags = {
        create: validated.tagIds.map(tagId => ({ tagId })),
      }
    }

    const updated = await prisma.tool.update({
      where: { id },
      data: updateData,
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    })

    return NextResponse.json({ tool: updated })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating tool:', error)
    return NextResponse.json(
      { error: 'Failed to update tool' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { id } = await params
    await prisma.tool.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tool:', error)
    return NextResponse.json(
      { error: 'Failed to delete tool' },
      { status: 500 }
    )
  }
}


