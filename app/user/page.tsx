'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UserDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<any[]>([])
  const [savedComparisons, setSavedComparisons] = useState<any[]>([])
  const [savedRecommendations, setSavedRecommendations] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (session) {
      fetchFavorites()
      fetchSavedComparisons()
      fetchSavedRecommendations()
    }
  }, [session, status, router])

  const fetchFavorites = async () => {
    // You'll need to create this endpoint
    // For now, this is a placeholder
  }

  const fetchSavedComparisons = async () => {
    // You'll need to create this endpoint
    // For now, this is a placeholder
  }

  const fetchSavedRecommendations = async () => {
    // You'll need to create this endpoint
    // For now, this is a placeholder
  }

  if (status === 'loading' || !session) {
    return <div>Loading...</div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
        My Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Favorite Tools
          </h2>
          {favorites.length === 0 ? (
            <p className="text-gray-600">No favorite tools yet</p>
          ) : (
            <div className="space-y-2">
              {favorites.map((fav) => (
                <Link
                  key={fav.id}
                  href={`/tools/${fav.toolId}`}
                  className="block text-blue-600 hover:text-blue-500"
                >
                  {fav.tool?.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Saved Comparisons
          </h2>
          {savedComparisons.length === 0 ? (
            <p className="text-gray-600">No saved comparisons</p>
          ) : (
            <div className="space-y-2">
              {savedComparisons.map((comp) => (
                <Link
                  key={comp.id}
                  href={`/compare?toolIds=${comp.comparison.tools.map((t: any) => t.toolId).join(',')}`}
                  className="block text-blue-600 hover:text-blue-500"
                >
                  {comp.comparison.name || 'Untitled Comparison'}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Past Recommendations
          </h2>
          {savedRecommendations.length === 0 ? (
            <p className="text-gray-600">No saved recommendations</p>
          ) : (
            <div className="space-y-2">
              {savedRecommendations.map((rec) => (
                <div key={rec.id} className="text-sm text-gray-600">
                  <p className="line-clamp-2">{rec.workflowInput}</p>
                  <Link
                    href="/results"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    View →
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

