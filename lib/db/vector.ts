import { prisma } from './prisma'

/**
 * Generate canonical text for a tool to be used for embeddings
 */
export function generateCanonicalText(tool: {
  name: string
  description: string
  strengths: string[]
  limitations: string[]
  useCasePersonas: string[]
  categories?: { category: { name: string } }[]
  tags?: { tag: { name: string } }[]
  integrations: string[]
  pricingModel: string
  apiAvailable: boolean
  enterpriseReady: boolean
}): string {
  const categoryNames = tool.categories?.map(c => c.category.name).join(', ') || ''
  const tagNames = tool.tags?.map(t => t.tag.name).join(', ') || ''
  
  return `
Tool: ${tool.name}
Description: ${tool.description}
Categories: ${categoryNames}
Tags: ${tagNames}
Strengths: ${tool.strengths.join(', ')}
Limitations: ${tool.limitations.join(', ')}
Use Cases: ${tool.useCasePersonas.join(', ')}
Integrations: ${tool.integrations.join(', ')}
Pricing: ${tool.pricingModel}
API Available: ${tool.apiAvailable}
Enterprise Ready: ${tool.enterpriseReady}
`.trim()
}

/**
 * Vector similarity search using pgvector
 * Note: This requires raw SQL as Prisma doesn't fully support pgvector yet
 */
export async function vectorSearch(
  queryEmbedding: number[],
  limit: number = 10,
  filters?: {
    status?: 'APPROVED' | 'PENDING' | 'REJECTED'
    categoryIds?: string[]
    tagIds?: string[]
    pricingModel?: string[]
    apiAvailable?: boolean
    enterpriseReady?: boolean
  }
) {
  const embeddingString = `[${queryEmbedding.join(',')}]`
  
  let whereClause = "WHERE t.status = 'APPROVED'"
  const params: any[] = [embeddingString, limit]
  let paramIndex = 3

  if (filters?.categoryIds && filters.categoryIds.length > 0) {
    whereClause += ` AND EXISTS (
      SELECT 1 FROM tool_categories tc 
      WHERE tc."toolId" = t.id 
      AND tc."categoryId" = ANY($${paramIndex}::text[])
    )`
    params.push(filters.categoryIds)
    paramIndex++
  }

  if (filters?.tagIds && filters.tagIds.length > 0) {
    whereClause += ` AND EXISTS (
      SELECT 1 FROM tool_tags tt 
      WHERE tt."toolId" = t.id 
      AND tt."tagId" = ANY($${paramIndex}::text[])
    )`
    params.push(filters.tagIds)
    paramIndex++
  }

  if (filters?.pricingModel && filters.pricingModel.length > 0) {
    whereClause += ` AND t."pricingModel" = ANY($${paramIndex}::text[])`
    params.push(filters.pricingModel)
    paramIndex++
  }

  if (filters?.apiAvailable !== undefined) {
    whereClause += ` AND t."apiAvailable" = $${paramIndex}`
    params.push(filters.apiAvailable)
    paramIndex++
  }

  if (filters?.enterpriseReady !== undefined) {
    whereClause += ` AND t."enterpriseReady" = $${paramIndex}`
    params.push(filters.enterpriseReady)
    paramIndex++
  }

  const query = `
    SELECT 
      t.*,
      1 - (t.embedding <=> $1::vector) as similarity
    FROM tools t
    ${whereClause}
    ORDER BY t.embedding <=> $1::vector
    LIMIT $2
  `

  // Use Prisma's $queryRawUnsafe for vector operations
  const results = await prisma.$queryRawUnsafe<any[]>(query, ...params)
  
  // Map results back to Prisma format
  const toolIds = results.map(r => r.id)
  const tools = await prisma.tool.findMany({
    where: { id: { in: toolIds } },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      vendor: { include: { user: true } },
    },
  })

  // Preserve similarity order
  const similarityMap = new Map(results.map(r => [r.id, r.similarity]))
  return tools.sort((a, b) => {
    const simA = similarityMap.get(a.id) || 0
    const simB = similarityMap.get(b.id) || 0
    return simB - simA
  })
}

