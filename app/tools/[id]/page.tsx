'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Tool {
  id: string
  name: string
  description: string
  website?: string
  logoUrl?: string
  strengths: string[]
  limitations: string[]
  useCasePersonas: string[]
  integrations: string[]
  pricingModel: string
  apiAvailable: boolean
  enterpriseReady: boolean
  categories: Array<{ category: { name: string } }>
  tags: Array<{ tag: { name: string } }>
  vendor?: { companyName: string; user: { name: string } }
}

export default function ToolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [tool, setTool] = useState<Tool | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchTool()
    }
  }, [params.id])

  const fetchTool = async () => {
    try {
      const response = await fetch(`/api/tools/${params.id}`)
      if (!response.ok) {
        router.push('/tools')
        return
      }
      const data = await response.json()
      setTool(data.tool)
      
      // Check if favorited
      if (session) {
        const favResponse = await fetch(`/api/tools/${params.id}/favorite`)
        if (favResponse.ok) {
          // Check favorite status (you might want to add a GET endpoint for this)
        }
      }
    } catch (error) {
      console.error('Error fetching tool:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    try {
      const method = isFavorite ? 'DELETE' : 'POST'
      const response = await fetch(`/api/tools/${params.id}/favorite`, {
        method,
      })
      if (response.ok) {
        setIsFavorite(!isFavorite)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p>Loading...</p>
      </div>
    )
  }

  if (!tool) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p>Tool not found</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/tools" className="text-blue-600 hover:text-blue-500">
          ← Back to Tools
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {tool.logoUrl && (
              <img
                src={tool.logoUrl}
                alt={tool.name}
                className="h-20 w-20 rounded"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {tool.categories.map((cat) => (
                  <span
                    key={cat.category.name}
                    className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                  >
                    {cat.category.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/compare?toolA=${tool.id}`}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Compare this tool
            </Link>
            {session && (
              <button
                onClick={toggleFavorite}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {isFavorite ? '★ Saved' : '☆ Save'}
              </button>
            )}
            {tool.website && (
              <a
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Description</h2>
          <p className="mt-2 text-gray-700">{tool.description}</p>
        </div>

        {/* Key Features Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Key Features</h2>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {tool.apiAvailable && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600">✓</span>
                <span>API Available</span>
              </div>
            )}
            {tool.enterpriseReady && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600">✓</span>
                <span>Enterprise Ready</span>
              </div>
            )}
            {tool.integrations.length > 0 && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600">✓</span>
                <span>{tool.integrations.length} Integrations</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-green-600">✓</span>
              <span>Pricing: {tool.pricingModel}</span>
            </div>
          </div>
        </div>

        {tool.strengths.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">Strengths</h2>
            <ul className="mt-2 list-disc list-inside space-y-1 text-gray-700">
              {tool.strengths.map((strength, i) => (
                <li key={i}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {tool.limitations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">Limitations</h2>
            <ul className="mt-2 list-disc list-inside space-y-1 text-gray-700">
              {tool.limitations.map((limitation, i) => (
                <li key={i}>{limitation}</li>
              ))}
            </ul>
          </div>
        )}

        {tool.useCasePersonas.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">Use Cases</h2>
            <ul className="mt-2 list-disc list-inside space-y-1 text-gray-700">
              {tool.useCasePersonas.map((useCase, i) => (
                <li key={i}>{useCase}</li>
              ))}
            </ul>
          </div>
        )}

        {tool.integrations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {tool.integrations.map((integration, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  {integration}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Pricing Model</span>
            <p className="mt-1 text-sm text-gray-900">{tool.pricingModel}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Features</span>
            <div className="mt-1 flex gap-2">
              {tool.apiAvailable && (
                <span className="text-xs text-gray-600">API Available</span>
              )}
              {tool.enterpriseReady && (
                <span className="text-xs text-gray-600">Enterprise Ready</span>
              )}
            </div>
          </div>
        </div>

        {tool.vendor && (
          <div className="mt-8 border-t pt-6">
            <span className="text-sm font-medium text-gray-500">Vendor</span>
            <p className="mt-1 text-sm text-gray-900">
              {tool.vendor.companyName} by {tool.vendor.user.name}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


