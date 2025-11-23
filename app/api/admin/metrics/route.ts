import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/auth/rbac'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const [
      totalTools,
      approvedTools,
      pendingTools,
      totalUsers,
      totalVendors,
      totalComparisons,
      totalRecommendations,
      topViewedTools,
      topSavedTools,
    ] = await Promise.all([
      prisma.tool.count(),
      prisma.tool.count({ where: { status: 'APPROVED' } }),
      prisma.tool.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'VENDOR' } }),
      prisma.comparison.count(),
      prisma.savedRecommendation.count(),
      prisma.tool.findMany({
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: { id: true, name: true, viewCount: true },
      }),
      prisma.tool.findMany({
        orderBy: { saveCount: 'desc' },
        take: 10,
        select: { id: true, name: true, saveCount: true },
      }),
    ])

    return NextResponse.json({
      tools: {
        total: totalTools,
        approved: approvedTools,
        pending: pendingTools,
      },
      users: {
        total: totalUsers,
        vendors: totalVendors,
      },
      engagement: {
        comparisons: totalComparisons,
        recommendations: totalRecommendations,
      },
      topTools: {
        viewed: topViewedTools,
        saved: topSavedTools,
      },
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

