'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Tool {
  id: string
  name: string
  description: string
  logoUrl?: string
  categories: Array<{ category: { name: string } }>
  tags: Array<{ tag: { name: string } }>
  pricingModel: string
  apiAvailable: boolean
  enterpriseReady: boolean
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Filter types (dummy data for now)
  const filterTypes = [
    'All',
    'Image',
    'Database',
    'Workflow',
    'Spreadsheet',
    'Writing',
    'Video',
    'Audio',
    'Development',
    'Marketing',
  ]

  useEffect(() => {
    fetchTools()
  }, [page, search])

  const fetchTools = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (search) params.append('search', search)

      const response = await fetch(`/api/tools?${params}`)
      const data = await response.json()
      setTools(data.tools || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching tools:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Browse AI Tools
        </h1>
        <p className="mt-2 text-gray-600">
          Discover AI tools across all categories
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Type
          </label>
          <div className="flex flex-wrap gap-2">
            {filterTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedType(type === 'All' ? '' : type)
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  (type === 'All' && !selectedType) || selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading tools...</p>
        </div>
      ) : tools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No tools found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start gap-4 flex-1">
                  {tool.logoUrl && (
                    <img
                      src={tool.logoUrl}
                      alt={tool.name}
                      className="h-12 w-12 rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {tool.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tool.categories.slice(0, 2).map((cat) => (
                        <span
                          key={cat.category.name}
                          className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                        >
                          {cat.category.name}
                        </span>
                      ))}
                      {tool.tags && tool.tags.slice(0, 1).map((tag) => (
                        <span
                          key={tag.tag.name}
                          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                        >
                          {tag.tag.name}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2 text-xs text-gray-500">
                      <span>{tool.pricingModel}</span>
                      {tool.apiAvailable && <span>• API</span>}
                      {tool.enterpriseReady && <span>• Enterprise</span>}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/tools/${tool.id}`}
                    className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-500"
                  >
                    View details
                  </Link>
                  <button
                    onClick={() => {
                      // Placeholder: prepare query param for compare
                      const currentToolId = tool.id
                      // For now, just navigate to compare with this tool
                      window.location.href = `/compare?toolA=${currentToolId}`
                    }}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Compare
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}


