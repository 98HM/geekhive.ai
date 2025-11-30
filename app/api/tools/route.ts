import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { toolCreateSchema } from '@/lib/validations/tool'
import { requireAuth } from '@/lib/auth/rbac'
import { generateCanonicalText, generateEmbedding } from '@/lib/db/vector'
import { generateEmbedding as generateEmbeddingAI } from '@/lib/ai/embeddings'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const categoryId = searchParams.get('categoryId')
    const tagId = searchParams.get('tagId')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'APPROVED'

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (categoryId) {
      where.categories = {
        some: { categoryId },
      }
    }
    
    if (tagId) {
      where.tags = {
        some: { tagId },
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
          vendor: { include: { user: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tool.count({ where }),
    ])

    return NextResponse.json({
      tools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    
    // Only vendors and admins can create tools
    if (user.role !== 'VENDOR' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = toolCreateSchema.parse(body)

    // Generate canonical text and embedding
    const canonicalText = generateCanonicalText({
      name: validated.name,
      description: validated.description,
      strengths: validated.strengths,
      limitations: validated.limitations,
      useCasePersonas: validated.useCasePersonas,
      integrations: validated.integrations,
      pricingModel: validated.pricingModel,
      apiAvailable: validated.apiAvailable,
      enterpriseReady: validated.enterpriseReady,
    })

    const embedding = await generateEmbeddingAI(canonicalText)

    // Get vendor if user is a vendor
    let vendorId = null
    if (user.role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId: user.id },
      })
      vendorId = vendor?.id || null
    }

    // Create tool
    const tool = await prisma.tool.create({
      data: {
        name: validated.name,
        slug: validated.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: validated.description,
        shortDescription: validated.shortDescription,
        website: validated.website || null,
        logoUrl: validated.logoUrl || null,
        integrations: validated.integrations,
        apiAvailable: validated.apiAvailable,
        enterpriseReady: validated.enterpriseReady,
        pricingModel: validated.pricingModel,
        strengths: validated.strengths,
        limitations: validated.limitations,
        useCasePersonas: validated.useCasePersonas,
        canonicalText,
        embedding: embedding as any, // pgvector type
        status: user.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
        vendorId,
        submittedBy: user.id,
        categories: {
          create: validated.categoryIds.map(categoryId => ({
            categoryId,
          })),
        },
        tags: {
          create: (validated.tagIds || []).map(tagId => ({
            tagId,
          })),
        },
      },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    })

    return NextResponse.json({ tool }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating tool:', error)
    return NextResponse.json(
      { error: 'Failed to create tool' },
      { status: 500 }
    )
  }
}


