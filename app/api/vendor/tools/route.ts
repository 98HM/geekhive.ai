import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireVendorOrAdmin } from '@/lib/auth/rbac'

export async function GET(request: NextRequest) {
  try {
    const user = await requireVendorOrAdmin()
    
    const vendor = await prisma.vendor.findUnique({
      where: { userId: user.id },
    })

    if (!vendor && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Vendor profile not found' },
        { status: 404 }
      )
    }

    const tools = await prisma.tool.findMany({
      where: user.role === 'ADMIN' ? {} : { vendorId: vendor!.id },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ tools })
  } catch (error) {
    console.error('Error fetching vendor tools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    )
  }
}


