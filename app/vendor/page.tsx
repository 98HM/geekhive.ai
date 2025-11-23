'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function VendorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (session && session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN') {
      router.push('/unauthorized')
      return
    }
    if (session) {
      fetchTools()
    }
  }, [session, status, router])

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/vendor/tools')
      if (!response.ok) {
        throw new Error('Failed to fetch tools')
      }
      const data = await response.json()
      setTools(data.tools || [])
    } catch (error) {
      console.error('Error fetching tools:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || !session) {
    return <div>Loading...</div>
  }

  const approvedTools = tools.filter((t) => t.status === 'APPROVED')
  const pendingTools = tools.filter((t) => t.status === 'PENDING')
  const rejectedTools = tools.filter((t) => t.status === 'REJECTED')

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Vendor Dashboard
        </h1>
        <Link
          href="/vendor/submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Submit New Tool
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-medium text-gray-500">Approved</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {approvedTools.length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {pendingTools.length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {rejectedTools.length}
          </p>
        </div>
      </div>

      {loading ? (
        <p>Loading tools...</p>
      ) : tools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No tools submitted yet</p>
          <Link
            href="/vendor/submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Submit Your First Tool
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Your Tools</h2>
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {tool.name}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        tool.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : tool.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tool.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {tool.description}
                  </p>
                  <Link
                    href={`/tools/${tool.id}`}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

