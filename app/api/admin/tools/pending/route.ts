import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/auth/rbac'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where: { status: 'PENDING' },
        include: {
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
          vendor: { include: { user: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tool.count({ where: { status: 'PENDING' } }),
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
    console.error('Error fetching pending tools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending tools' },
      { status: 500 }
    )
  }
}

