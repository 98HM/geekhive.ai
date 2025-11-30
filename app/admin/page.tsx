'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [metrics, setMetrics] = useState<any>(null)
  const [pendingTools, setPendingTools] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (session && session.user.role !== 'ADMIN') {
      router.push('/unauthorized')
      return
    }
    if (session) {
      fetchMetrics()
      fetchPendingTools()
    }
  }, [session, status, router])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics')
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const fetchPendingTools = async () => {
    try {
      const response = await fetch('/api/admin/tools/pending')
      const data = await response.json()
      setPendingTools(data.tools || [])
    } catch (error) {
      console.error('Error fetching pending tools:', error)
    }
  }

  const approveTool = async (toolId: string) => {
    try {
      const response = await fetch(`/api/admin/tools/${toolId}/approve`, {
        method: 'POST',
      })
      if (response.ok) {
        fetchPendingTools()
        fetchMetrics()
      }
    } catch (error) {
      console.error('Error approving tool:', error)
    }
  }

  const rejectTool = async (toolId: string) => {
    try {
      const response = await fetch(`/api/admin/tools/${toolId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rejected by admin' }),
      })
      if (response.ok) {
        fetchPendingTools()
        fetchMetrics()
      }
    } catch (error) {
      console.error('Error rejecting tool:', error)
    }
  }

  if (status === 'loading' || !session) {
    return <div>Loading...</div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
        Admin Dashboard
      </h1>

      {metrics && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Tools</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {metrics.tools?.total || 0}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {metrics.tools?.approved || 0} approved, {metrics.tools?.pending || 0}{' '}
              pending
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Users</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {metrics.users?.total || 0}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {metrics.users?.vendors || 0} vendors
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Comparisons</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {metrics.engagement?.comparisons || 0}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Recommendations</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {metrics.engagement?.recommendations || 0}
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Pending Tool Submissions
        </h2>
        {pendingTools.length === 0 ? (
          <p className="text-gray-600">No pending tools</p>
        ) : (
          <div className="space-y-4">
            {pendingTools.map((tool) => (
              <div
                key={tool.id}
                className="rounded-lg border border-gray-200 bg-white p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {tool.name}
                    </h3>
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveTool(tool.id)}
                      className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectTool(tool.id)}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Link
          href="/tools"
          className="text-blue-600 hover:text-blue-500"
        >
          Manage All Tools →
        </Link>
      </div>
    </div>
  )
}


