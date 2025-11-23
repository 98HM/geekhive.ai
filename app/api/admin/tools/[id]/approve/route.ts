import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/auth/rbac'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params

    const tool = await prisma.tool.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: admin.id,
      },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    })

    return NextResponse.json({ tool })
  } catch (error) {
    console.error('Error approving tool:', error)
    return NextResponse.json(
      { error: 'Failed to approve tool' },
      { status: 500 }
    )
  }
}

