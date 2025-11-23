import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { toolCreateSchema } from '@/lib/validations/tool'
import { requireVendorOrAdmin } from '@/lib/auth/rbac'
import { generateCanonicalText } from '@/lib/db/vector'
import { generateEmbedding } from '@/lib/ai/embeddings'

export async function POST(request: NextRequest) {
  try {
    const user = await requireVendorOrAdmin()
    const body = await request.json()
    const validated = toolCreateSchema.parse(body)

    // Ensure vendor profile exists
    let vendor = await prisma.vendor.findUnique({
      where: { userId: user.id },
    })

    if (!vendor && user.role === 'VENDOR') {
      vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          companyName: body.companyName || 'My Company',
          website: body.companyWebsite,
        },
      })
    }

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

    const embedding = await generateEmbedding(canonicalText)

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
        embedding: embedding as any,
        status: user.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
        vendorId: vendor?.id || null,
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
    console.error('Error submitting tool:', error)
    return NextResponse.json(
      { error: 'Failed to submit tool' },
      { status: 500 }
    )
  }
}

