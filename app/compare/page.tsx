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
}

export default function ComparePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const toolIds = searchParams.get('toolIds')
    if (!toolIds) {
      router.push('/tools')
      return
    }

    fetchTools(toolIds.split(','))
  }, [searchParams, router])

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
                Pricing Model
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
                Integrations
              </td>
              {tools.map((tool) => (
                <td key={tool.id} className="px-6 py-4 text-sm text-gray-700">
                  {tool.integrations.length > 0
                    ? tool.integrations.slice(0, 3).join(', ')
                    : 'None'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

