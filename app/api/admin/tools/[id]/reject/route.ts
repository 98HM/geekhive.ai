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
    const body = await request.json()
    const reason = body.reason || 'No reason provided'

    const tool = await prisma.tool.update({
      where: { id },
      data: {
        status: 'REJECTED',
        // Store rejection reason in a note field (you might want to add this to schema)
      },
    })

    return NextResponse.json({ tool, reason })
  } catch (error) {
    console.error('Error rejecting tool:', error)
    return NextResponse.json(
      { error: 'Failed to reject tool' },
      { status: 500 }
    )
  }
}


