'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function FindPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState('')
  const [role, setRole] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])

  // Fetch categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tasks.trim() || tasks.length < 10) {
      alert('Please describe at least 10 characters of your workflow')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          role: role || undefined,
          categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get recommendations')
      }

      const data = await response.json()
      
      // Store in sessionStorage to pass to results page
      sessionStorage.setItem('recommendations', JSON.stringify(data.recommendations))
      sessionStorage.setItem('workflowInput', tasks)
      
      router.push('/results')
    } catch (error: any) {
      alert(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Find Your Perfect AI Tools
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Describe your workflow and we'll recommend the best AI tools for you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="tasks" className="block text-sm font-medium text-gray-700">
            Describe Your Daily Tasks & Workflow *
          </label>
          <textarea
            id="tasks"
            rows={8}
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="e.g., I'm a content creator who needs to edit videos, create thumbnails, write scripts, and manage social media posts. I also need to transcribe interviews and generate captions..."
            required
            minLength={10}
          />
          <p className="mt-2 text-sm text-gray-500">
            {tasks.length}/5000 characters
          </p>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Your Role (Optional)
          </label>
          <input
            type="text"
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="e.g., Content Creator, Marketing Manager, Developer"
          />
        </div>

        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Categories (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedCategories.includes(category.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading || tasks.length < 10}
            className="w-full rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing Your Workflow...' : 'Get Recommendations'}
          </button>
        </div>
      </form>
    </div>
  )
}

