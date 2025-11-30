import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { searchRateLimit } from '@/lib/rate-limit'
import { generateEmbedding } from '@/lib/ai/embeddings'
import { vectorSearch } from '@/lib/db/vector'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'anonymous'
    const { success } = await searchRateLimit.limit(identifier)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const categoryId = searchParams.get('categoryId')
    const tagId = searchParams.get('tagId')
    const pricingModel = searchParams.get('pricingModel')
    const apiAvailable = searchParams.get('apiAvailable')
    const enterpriseReady = searchParams.get('enterpriseReady')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Generate embedding for semantic search
    const queryEmbedding = await generateEmbedding(query)

    // Vector search with filters
    const categoryIds = categoryId ? [categoryId] : undefined
    const tagIds = tagId ? [tagId] : undefined
    const pricingModels = pricingModel ? [pricingModel] : undefined

    const tools = await vectorSearch(queryEmbedding, limit, {
      status: 'APPROVED',
      categoryIds,
      tagIds,
      pricingModel: pricingModels,
      apiAvailable: apiAvailable === 'true' ? true : apiAvailable === 'false' ? false : undefined,
      enterpriseReady: enterpriseReady === 'true' ? true : enterpriseReady === 'false' ? false : undefined,
    })

    return NextResponse.json({ tools })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}


