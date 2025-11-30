'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

type FindMode = 'workflow' | 'project'

export default function FindPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [mode, setMode] = useState<FindMode>('workflow')
  const [description, setDescription] = useState('')
  const [role, setRole] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])

  // Fetch categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || description.length < 10) {
      alert(`Please describe at least 10 characters of your ${mode === 'workflow' ? 'workflow' : 'project'}`)
      return
    }

    setLoading(true)

    try {
      // TODO: Wire up API call here - structure is ready for integration
      // For now, show placeholder results
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: description,
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
      sessionStorage.setItem('workflowInput', description)
      sessionStorage.setItem('findMode', mode)
      
      // For now, show results on page, later can redirect to /results
      setResults(data.recommendations || [])
      
      // Uncomment to redirect to results page:
      // router.push('/results')
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
          Find the Right AI for You
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Tell us what you need help with and we'll recommend the best AI tools
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What do you need help with? *
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode('workflow')}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                mode === 'workflow'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  checked={mode === 'workflow'}
                  onChange={() => setMode('workflow')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="font-semibold text-gray-900">
                  Help with my day-to-day workflow
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Describe your daily tasks and we'll find tools to streamline your routine
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode('project')}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                mode === 'project'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  checked={mode === 'project'}
                  onChange={() => setMode('project')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="font-semibold text-gray-900">
                  Help with a specific project or idea
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Tell us about your project and we'll suggest tools to bring it to life
              </p>
            </button>
          </div>
        </div>

        {/* Step 2: Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            {mode === 'workflow'
              ? 'Describe Your Daily Tasks & Workflow *'
              : 'Describe Your Project or Idea *'}
          </label>
          <textarea
            id="description"
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder={
              mode === 'workflow'
                ? "e.g., I'm a content creator who needs to edit videos, create thumbnails, write scripts, and manage social media posts. I also need to transcribe interviews and generate captions..."
                : "e.g., I'm building a mobile app that needs AI-powered image recognition, natural language processing for user interactions, and automated content generation..."
            }
            required
            minLength={10}
          />
          <p className="mt-2 text-sm text-gray-500">
            {description.length}/5000 characters
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

        {/* Step 3: Find Tools Button */}
        <div>
          <button
            type="submit"
            disabled={loading || description.length < 10}
            className="w-full rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? `Finding tools for your ${mode === 'workflow' ? 'workflow' : 'project'}...`
              : 'Find tools'}
          </button>
        </div>
      </form>

      {/* Results Section - Placeholder for now, will be wired to API later */}
      {results.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recommended Tools
          </h2>
          <div className="space-y-4">
            {results.map((result: any, index: number) => (
              <div
                key={result.toolId || index}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {result.tool?.name || `Tool ${index + 1}`}
                </h3>
                {result.whyThisFits && (
                  <p className="mt-2 text-sm text-gray-600">{result.whyThisFits}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

