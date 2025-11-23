import { generateEmbedding } from './embeddings'
import { callLLM, loadPrompt } from './llm'
import { vectorSearch } from '@/lib/db/vector'
import { prisma } from '@/lib/db/prisma'
import { generateCanonicalText } from '@/lib/db/vector'

interface WorkflowInput {
  tasks: string
  categoryIds?: string[]
  role?: string
}

interface RecommendationResult {
  toolId: string
  tool: any
  whyThisFits: string
  relevanceScore: number
}

/**
 * Main recommendation engine
 */
export async function generateRecommendations(
  input: WorkflowInput
): Promise<RecommendationResult[]> {
  // Step 1: Analyze workflow using LLM
  const workflowAnalysis = await analyzeWorkflow(input)
  
  // Step 2: Generate embedding for semantic search
  const searchQuery = workflowAnalysis.searchQuery || input.tasks
  const queryEmbedding = await generateEmbedding(searchQuery)
  
  // Step 3: Vector search with filters
  const vectorResults = await vectorSearch(queryEmbedding, 20, {
    status: 'APPROVED',
    categoryIds: input.categoryIds,
  })
  
  // Step 4: Re-rank using LLM
  const toolSummaries = vectorResults.map(tool => ({
    id: tool.id,
    name: tool.name,
    description: tool.description,
    strengths: tool.strengths,
    useCasePersonas: tool.useCasePersonas,
    categories: tool.categories.map((c: any) => c.category.name),
    tags: tool.tags.map((t: any) => t.tag.name),
  }))
  
  const reranked = await rerankTools(workflowAnalysis, toolSummaries)
  
  // Step 5: Get top 5 tools with full data
  const topToolIds = reranked.slice(0, 5).map((r: any) => r.toolId)
  const topTools = vectorResults.filter(t => topToolIds.includes(t.id))
  
  // Step 6: Generate "why this fits" explanations
  const recommendations = await Promise.all(
    topTools.map(async (tool) => {
      const rerankResult = reranked.find((r: any) => r.toolId === tool.id)
      const whyThisFits = await generateWhyThisFits(
        tool,
        input,
        workflowAnalysis
      )
      
      return {
        toolId: tool.id,
        tool,
        whyThisFits,
        relevanceScore: rerankResult?.relevanceScore || 0,
      }
    })
  )
  
  return recommendations
}

/**
 * Analyze user workflow
 */
async function analyzeWorkflow(input: WorkflowInput) {
  const promptTemplate = loadPrompt('v1', 'workflow_analysis')
  const categories = input.categoryIds
    ? await prisma.category.findMany({
        where: { id: { in: input.categoryIds } },
        select: { name: true },
      })
    : []
  
  const prompt = promptTemplate
    .replace('{tasks}', input.tasks)
    .replace('{role}', input.role || 'Not specified')
    .replace('{categories}', categories.map(c => c.name).join(', ') || 'None')
  
  const response = await callLLM(prompt, { temperature: 0.3 })
  
  try {
    const analysis = JSON.parse(response)
    return analysis
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      primaryTasks: [],
      inferredNeeds: [],
      roleContext: input.role || '',
      technicalRequirements: [],
      searchQuery: input.tasks,
    }
  }
}

/**
 * Re-rank tools using LLM
 */
async function rerankTools(workflowAnalysis: any, toolSummaries: any[]) {
  const promptTemplate = loadPrompt('v1', 'tool_rerank')
  const prompt = promptTemplate
    .replace('{workflowAnalysis}', JSON.stringify(workflowAnalysis, null, 2))
    .replace('{toolSummaries}', JSON.stringify(toolSummaries, null, 2))
  
  const response = await callLLM(prompt, { temperature: 0.2 })
  
  try {
    const reranked = JSON.parse(response)
    return Array.isArray(reranked) ? reranked : []
  } catch (error) {
    // Fallback: return tools in original order
    return toolSummaries.map((tool, index) => ({
      toolId: tool.id,
      relevanceScore: 1 - index * 0.1,
      reasoning: 'Ranked by semantic similarity',
    }))
  }
}

/**
 * Generate "why this fits" explanation
 */
async function generateWhyThisFits(
  tool: any,
  input: WorkflowInput,
  workflowAnalysis: any
) {
  const promptTemplate = loadPrompt('v1', 'why_this_fits')
  const prompt = promptTemplate
    .replace('{toolName}', tool.name)
    .replace('{toolDescription}', tool.description)
    .replace('{strengths}', tool.strengths.join(', '))
    .replace('{useCasePersonas}', tool.useCasePersonas.join(', '))
    .replace('{userWorkflow}', input.tasks)
    .replace('{userRole}', input.role || 'Not specified')
    .replace('{primaryTasks}', workflowAnalysis.primaryTasks?.join(', ') || input.tasks)
  
  const explanation = await callLLM(prompt, { temperature: 0.7, maxTokens: 200 })
  return explanation.trim()
}

