import { PrismaClient } from '@prisma/client'
import { generateEmbedding } from '../lib/ai/embeddings'
import { generateCanonicalText } from '../lib/db/vector'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminEmail = 'admin@geekhive.ai'
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Created admin user:', admin.email)

  // Create categories
  const categories = [
    { name: 'Content Creation', slug: 'content-creation', description: 'Tools for creating content' },
    { name: 'Productivity', slug: 'productivity', description: 'Tools to boost productivity' },
    { name: 'Development', slug: 'development', description: 'Developer tools and utilities' },
    { name: 'Marketing', slug: 'marketing', description: 'Marketing and advertising tools' },
    { name: 'Design', slug: 'design', description: 'Design and creative tools' },
    { name: 'Writing', slug: 'writing', description: 'Writing and editing tools' },
    { name: 'Video', slug: 'video', description: 'Video editing and production tools' },
    { name: 'Audio', slug: 'audio', description: 'Audio processing tools' },
  ]

  const createdCategories = []
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    createdCategories.push(category)
  }
  console.log(`✅ Created ${createdCategories.length} categories`)

  // Create tags
  const tags = [
    { name: 'Free', slug: 'free' },
    { name: 'API', slug: 'api' },
    { name: 'Enterprise', slug: 'enterprise' },
    { name: 'Open Source', slug: 'open-source' },
    { name: 'Browser Extension', slug: 'browser-extension' },
    { name: 'Mobile App', slug: 'mobile-app' },
  ]

  const createdTags = []
  for (const tag of tags) {
    const createdTag = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    })
    createdTags.push(createdTag)
  }
  console.log(`✅ Created ${createdTags.length} tags`)

  // Create sample tools
  const sampleTools = [
    {
      name: 'ChatGPT',
      description: 'An AI-powered conversational assistant that can help with writing, coding, analysis, and more. Powered by GPT-4 technology.',
      shortDescription: 'AI conversational assistant for various tasks',
      website: 'https://chat.openai.com',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
      categorySlugs: ['content-creation', 'productivity', 'writing'],
      tagSlugs: ['api', 'enterprise'],
      integrations: ['Slack', 'Microsoft Teams', 'API'],
      apiAvailable: true,
      enterpriseReady: true,
      pricingModel: 'FREEMIUM',
      strengths: ['Natural language understanding', 'Code generation', 'Multi-language support', 'Contextual responses'],
      limitations: ['Requires internet connection', 'May have usage limits on free tier'],
      useCasePersonas: ['Content creators needing writing assistance', 'Developers looking for coding help', 'Business professionals needing analysis'],
    },
    {
      name: 'Midjourney',
      description: 'An AI image generation tool that creates stunning artwork from text prompts. Known for high-quality, artistic outputs.',
      shortDescription: 'AI image generation from text prompts',
      website: 'https://www.midjourney.com',
      categorySlugs: ['design', 'content-creation'],
      tagSlugs: ['api'],
      integrations: ['Discord'],
      apiAvailable: false,
      enterpriseReady: false,
      pricingModel: 'PAID',
      strengths: ['High-quality artistic outputs', 'Unique style', 'Active community'],
      limitations: ['Requires Discord', 'No API access', 'Learning curve'],
      useCasePersonas: ['Artists and designers', 'Content creators needing visuals', 'Marketing teams'],
    },
    {
      name: 'Notion AI',
      description: 'AI-powered workspace that helps with writing, summarization, and organization. Integrated into the Notion platform.',
      shortDescription: 'AI-powered workspace and writing assistant',
      website: 'https://www.notion.so/product/ai',
      categorySlugs: ['productivity', 'writing'],
      tagSlugs: ['api', 'enterprise'],
      integrations: ['Slack', 'Google Drive', 'GitHub'],
      apiAvailable: true,
      enterpriseReady: true,
      pricingModel: 'FREEMIUM',
      strengths: ['Integrated workspace', 'Powerful organization', 'Team collaboration'],
      limitations: ['Can be overwhelming for new users', 'Limited free tier'],
      useCasePersonas: ['Teams needing organized workspaces', 'Writers and content creators', 'Project managers'],
    },
    {
      name: 'GitHub Copilot',
      description: 'AI pair programmer that suggests code completions and entire functions. Trained on billions of lines of code.',
      shortDescription: 'AI pair programmer for code completion',
      website: 'https://github.com/features/copilot',
      categorySlugs: ['development'],
      tagSlugs: ['api', 'enterprise'],
      integrations: ['VS Code', 'JetBrains IDEs', 'GitHub'],
      apiAvailable: false,
      enterpriseReady: true,
      pricingModel: 'PAID',
      strengths: ['Fast code suggestions', 'Multi-language support', 'Context-aware'],
      limitations: ['Requires subscription', 'May suggest incorrect code'],
      useCasePersonas: ['Software developers', 'Engineering teams', 'Students learning to code'],
    },
    {
      name: 'Runway ML',
      description: 'Creative suite with AI video editing, image generation, and content creation tools. Popular among video creators.',
      shortDescription: 'AI-powered video editing and creation suite',
      website: 'https://runwayml.com',
      categorySlugs: ['video', 'design', 'content-creation'],
      tagSlugs: ['api'],
      integrations: ['Adobe', 'Figma'],
      apiAvailable: true,
      enterpriseReady: false,
      pricingModel: 'FREEMIUM',
      strengths: ['Advanced video editing', 'Multiple AI tools in one', 'Creative features'],
      limitations: ['Learning curve', 'Resource intensive'],
      useCasePersonas: ['Video creators', 'Content creators', 'Marketing teams'],
    },
  ]

  for (const toolData of sampleTools) {
    // Get category and tag IDs
    const categoryIds = createdCategories
      .filter((c) => toolData.categorySlugs.includes(c.slug))
      .map((c) => c.id)
    
    const tagIds = createdTags
      .filter((t) => toolData.tagSlugs.includes(t.slug))
      .map((t) => t.id)

    // Generate canonical text and embedding
    const canonicalText = generateCanonicalText({
      name: toolData.name,
      description: toolData.description,
      strengths: toolData.strengths,
      limitations: toolData.limitations,
      useCasePersonas: toolData.useCasePersonas,
      integrations: toolData.integrations,
      pricingModel: toolData.pricingModel,
      apiAvailable: toolData.apiAvailable,
      enterpriseReady: toolData.enterpriseReady,
    })

    const embedding = await generateEmbedding(canonicalText)

    // Create tool
    const tool = await prisma.tool.upsert({
      where: { slug: toolData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      update: {},
      create: {
        name: toolData.name,
        slug: toolData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: toolData.description,
        shortDescription: toolData.shortDescription,
        website: toolData.website,
        logoUrl: toolData.logoUrl,
        integrations: toolData.integrations,
        apiAvailable: toolData.apiAvailable,
        enterpriseReady: toolData.enterpriseReady,
        pricingModel: toolData.pricingModel,
        strengths: toolData.strengths,
        limitations: toolData.limitations,
        useCasePersonas: toolData.useCasePersonas,
        canonicalText,
        embedding: embedding as any,
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: admin.id,
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    })

    console.log(`✅ Created tool: ${tool.name}`)
  }

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

