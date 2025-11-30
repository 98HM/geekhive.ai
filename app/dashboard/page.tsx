'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// TODO: This page will require authentication - add auth check when implementing
export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [savedTools, setSavedTools] = useState<any[]>([])
  const [savedComparisons, setSavedComparisons] = useState<any[]>([])
  const [savedRecommendations, setSavedRecommendations] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (session) {
      // TODO: Fetch real data from API endpoints
      // fetchSavedTools()
      // fetchSavedComparisons()
      // fetchSavedRecommendations()
    }
  }, [session, status, router])

  if (status === 'loading' || !session) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
        My account
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Saved Tools */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Saved Tools
          </h2>
          {savedTools.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No saved tools yet</p>
              <Link
                href="/tools"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Browse tools →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {savedTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.toolId || tool.id}`}
                  className="block text-blue-600 hover:text-blue-500 text-sm"
                >
                  {tool.tool?.name || 'Tool'}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Saved Comparisons */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Saved Comparisons
          </h2>
          {savedComparisons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No saved comparisons</p>
              <Link
                href="/compare"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Compare tools →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {savedComparisons.map((comp) => (
                <Link
                  key={comp.id}
                  href={`/compare?toolIds=${comp.comparison?.tools?.map((t: any) => t.toolId).join(',') || ''}`}
                  className="block text-blue-600 hover:text-blue-500 text-sm"
                >
                  {comp.comparison?.name || 'Untitled Comparison'}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Saved Recommendations / Project Stacks */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Saved Recommendations
          </h2>
          {savedRecommendations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No saved recommendations</p>
              <Link
                href="/find"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Find tools →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedRecommendations.map((rec) => (
                <div key={rec.id} className="border-b border-gray-200 pb-3 last:border-0">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {rec.workflowInput}
                  </p>
                  <Link
                    href="/results"
                    className="text-xs text-blue-600 hover:text-blue-500"
                  >
                    View recommendations →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

