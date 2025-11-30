'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Recommendation {
  toolId: string
  tool: {
    id: string
    name: string
    description: string
    website?: string
    logoUrl?: string
    strengths: string[]
    categories: Array<{ category: { name: string } }>
    tags: Array<{ tag: { name: string } }>
  }
  whyThisFits: string
  relevanceScore: number
}

export default function ResultsPage() {
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [workflowInput, setWorkflowInput] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('recommendations')
    const storedInput = sessionStorage.getItem('workflowInput')
    
    if (!stored) {
      router.push('/find')
      return
    }

    setRecommendations(JSON.parse(stored))
    setWorkflowInput(storedInput || '')
  }, [router])

  if (recommendations.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p>Loading recommendations...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Your Personalized Recommendations
        </h1>
        <p className="mt-2 text-gray-600">
          Based on your workflow: &quot;{workflowInput.substring(0, 100)}
          {workflowInput.length > 100 ? '...' : ''}&quot;
        </p>
      </div>

      <div className="space-y-6">
        {recommendations.map((rec, index) => (
          <div
            key={rec.toolId}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  {rec.tool.logoUrl && (
                    <img
                      src={rec.tool.logoUrl}
                      alt={rec.tool.name}
                      className="h-12 w-12 rounded"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {index + 1}. {rec.tool.name}
                    </h2>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {rec.tool.categories.map((cat) => (
                        <span
                          key={cat.category.name}
                          className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                        >
                          {cat.category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-gray-700">{rec.tool.description}</p>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Why This Fits You:
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{rec.whyThisFits}</p>
                </div>

                {rec.tool.strengths.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-900">Strengths:</h3>
                    <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                      {rec.tool.strengths.map((strength, i) => (
                        <li key={i}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex gap-4">
                  {rec.tool.website && (
                    <a
                      href={rec.tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                    >
                      Visit Website
                    </a>
                  )}
                  <Link
                    href={`/tools/${rec.toolId}`}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/find"
          className="text-blue-600 hover:text-blue-500"
        >
          Get New Recommendations →
        </Link>
      </div>
    </div>
  )
}


