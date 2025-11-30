'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Tool {
  id: string
  name: string
  description: string
  logoUrl?: string
  strengths: string[]
  limitations: string[]
  pricingModel: string
  apiAvailable: boolean
  enterpriseReady: boolean
  integrations: string[]
  categories: Array<{ category: { name: string } }>
  useCasePersonas?: string[]
}

export default function ComparePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tools, setTools] = useState<Tool[]>([])
  const [allTools, setAllTools] = useState<Tool[]>([])
  const [selectedToolA, setSelectedToolA] = useState<string>('')
  const [selectedToolB, setSelectedToolB] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [loadingTools, setLoadingTools] = useState(true)

  useEffect(() => {
    // Fetch all tools for dropdown
    fetchAllTools()
    
    // Check for query params
    const toolA = searchParams.get('toolA')
    const toolB = searchParams.get('toolB')
    const toolIds = searchParams.get('toolIds')
    
    if (toolA && toolB) {
      setSelectedToolA(toolA)
      setSelectedToolB(toolB)
      fetchTools([toolA, toolB])
    } else if (toolIds) {
      const ids = toolIds.split(',')
      if (ids.length >= 2) {
        setSelectedToolA(ids[0])
        setSelectedToolB(ids[1])
        fetchTools(ids.slice(0, 2))
      }
    }
  }, [searchParams, router])

  const fetchAllTools = async () => {
    try {
      const response = await fetch('/api/tools?limit=100')
      const data = await response.json()
      setAllTools(data.tools || [])
    } catch (error) {
      console.error('Error fetching tools:', error)
    } finally {
      setLoadingTools(false)
    }
  }

  const handleCompare = () => {
    if (selectedToolA && selectedToolB) {
      router.push(`/compare?toolA=${selectedToolA}&toolB=${selectedToolB}`)
    }
  }

  const fetchTools = async (toolIds: string[]) => {
    try {
      const params = new URLSearchParams({ toolIds: toolIds.join(',') })
      const response = await fetch(`/api/compare?${params}`)
      if (!response.ok) {
        router.push('/tools')
        return
      }
      const data = await response.json()
      setTools(data.tools || [])
    } catch (error) {
      console.error('Error fetching tools:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p>Loading comparison...</p>
      </div>
    )
  }

  if (tools.length < 2) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p>Please select at least 2 tools to compare</p>
        <Link href="/tools" className="text-blue-600 hover:text-blue-500">
          Browse Tools
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Compare Tools
        </h1>
      </div>

      {/* Tool Selection UI */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Tools to Compare
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tool A
            </label>
            <select
              value={selectedToolA}
              onChange={(e) => setSelectedToolA(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              disabled={loadingTools}
            >
              <option value="">Select a tool...</option>
              {allTools.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tool B
            </label>
            <select
              value={selectedToolB}
              onChange={(e) => setSelectedToolB(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              disabled={loadingTools}
            >
              <option value="">Select a tool...</option>
              {allTools
                .filter((tool) => tool.id !== selectedToolA)
                .map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleCompare}
          disabled={!selectedToolA || !selectedToolB}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Compare Tools
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Feature
              </th>
              {tools.map((tool) => (
                <th key={tool.id} className="px-6 py-3 text-left">
                  <div className="flex items-center gap-3">
                    {tool.logoUrl && (
                      <img
                        src={tool.logoUrl}
                        alt={tool.name}
                        className="h-10 w-10 rounded"
                      />
                    )}
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {tool.name}
                      </div>
                      <Link
                        href={`/tools/${tool.id}`}
                        className="text-xs text-blue-600 hover:text-blue-500"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Category
              </td>
              {tools.map((tool) => (
                <td key={tool.id} className="px-6 py-4 text-sm text-gray-700">
                  {tool.categories.map((cat) => cat.category.name).join(', ') || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Description
              </td>
              {tools.map((tool) => (
                <td key={tool.id} className="px-6 py-4 text-sm text-gray-700">
                  {tool.description.substring(0, 150)}...
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Use Cases
              </td>
              {tools.map((tool) => (
                <td key={tool.id} className="px-6 py-4 text-sm text-gray-700">
                  {tool.useCasePersonas && tool.useCasePersonas.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {tool.useCasePersonas.slice(0, 3).map((useCase, i) => (
                        <li key={i}>{useCase}</li>
                      ))}
                    </ul>
                  ) : (
                    'N/A'
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Features
              </td>
              {tools.map((tool) => (
                <td key={tool.id} className="px-6 py-4 text-sm text-gray-700">
                  <ul className="list-disc list-inside">
                    {tool.apiAvailable && <li>API Available</li>}
                    {tool.enterpriseReady && <li>Enterprise Ready</li>}
                    {tool.integrations.length > 0 && <li>{tool.integrations.length} Integrations</li>}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Pricing Summary
              </td>
              {tools.map((tool) => (
                <td key={tool.id} className="px-6 py-4 text-sm text-gray-700">
                  {tool.pricingModel}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                API Available
              </td>
              {tools.map((tool) => (
                <td key={tool.id} className="px-6 py-4 text-sm text-gray-700">
                  {tool.apiAvailable ? '✓ Yes' : '✗ No'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Enterprise Ready
              </td>
              {tools.map((tool) => (
                <td key={tool.id} className="px-6 py-4 text-sm text-gray-700">
                  {tool.enterpriseReady ? '✓ Yes' : '✗ No'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                Strengths
              </td>
              {tools.map((tool) => (
                <td key={tool.id} className="px-6 py-4 text-sm text-gray-700">
                  <ul className="list-disc list-inside">
                    {tool.strengths.slice(0, 3).map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                API Availability / Integrations
              </td>
              {tools.map((tool) => (
                <td key={tool.id} className="px-6 py-4 text-sm text-gray-700">
                  <div className="space-y-1">
                    <div>API: {tool.apiAvailable ? '✓ Yes' : '✗ No'}</div>
                    <div>
                      Integrations: {tool.integrations.length > 0
                        ? tool.integrations.slice(0, 3).join(', ')
                        : 'None'}
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}


