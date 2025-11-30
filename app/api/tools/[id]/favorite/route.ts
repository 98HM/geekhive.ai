import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/rbac'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Check if already favorited
    const existing = await prisma.favoriteTool.findUnique({
      where: {
        userId_toolId: {
          userId: user.id,
          toolId: id,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ message: 'Already favorited' })
    }

    // Create favorite
    await prisma.favoriteTool.create({
      data: {
        userId: user.id,
        toolId: id,
      },
    })

    // Increment save count
    await prisma.tool.update({
      where: { id },
      data: { saveCount: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error favoriting tool:', error)
    return NextResponse.json(
      { error: 'Failed to favorite tool' },
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
    const { id } = await params

    await prisma.favoriteTool.delete({
      where: {
        userId_toolId: {
          userId: user.id,
          toolId: id,
        },
      },
    })

    // Decrement save count
    await prisma.tool.update({
      where: { id },
      data: { saveCount: { decrement: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unfavoriting tool:', error)
    return NextResponse.json(
      { error: 'Failed to unfavorite tool' },
      { status: 500 }
    )
  }
}


