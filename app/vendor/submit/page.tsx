'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function VendorSubmitPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    website: '',
    logoUrl: '',
    categoryIds: [] as string[],
    tagIds: [] as string[],
    integrations: [] as string[],
    apiAvailable: false,
    enterpriseReady: false,
    pricingModel: 'FREEMIUM' as const,
    strengths: [''],
    limitations: [''],
    useCasePersonas: [''],
    companyName: '',
    companyWebsite: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/vendor/submit')
      return
    }
    fetchCategories()
    fetchTags()
  }, [status, router])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const data = await response.json()
      setTags(data.tags || [])
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/vendor/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          strengths: formData.strengths.filter((s) => s.trim()),
          limitations: formData.limitations.filter((l) => l.trim()),
          useCasePersonas: formData.useCasePersonas.filter((u) => u.trim()),
          integrations: formData.integrations.filter((i) => i.trim()),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit tool')
      }

      const data = await response.json()
      alert('Tool submitted successfully! It will be reviewed by an admin.')
      router.push('/vendor')
    } catch (error: any) {
      alert(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
        Submit Your AI Tool
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tool Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            required
            rows={6}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Categories *
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  const newIds = formData.categoryIds.includes(category.id)
                    ? formData.categoryIds.filter((id) => id !== category.id)
                    : [...formData.categoryIds, category.id]
                  setFormData({ ...formData, categoryIds: newIds })
                }}
                className={`px-4 py-2 rounded-full text-sm ${
                  formData.categoryIds.includes(category.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Pricing Model *
          </label>
          <select
            required
            value={formData.pricingModel}
            onChange={(e) =>
              setFormData({
                ...formData,
                pricingModel: e.target.value as any,
              })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="FREE">Free</option>
            <option value="FREEMIUM">Freemium</option>
            <option value="PAID">Paid</option>
            <option value="ENTERPRISE">Enterprise</option>
            <option value="USAGE_BASED">Usage Based</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Strengths *
          </label>
          {formData.strengths.map((strength, i) => (
            <input
              key={i}
              type="text"
              value={strength}
              onChange={(e) => {
                const newStrengths = [...formData.strengths]
                newStrengths[i] = e.target.value
                setFormData({ ...formData, strengths: newStrengths })
              }}
              className="mt-1 mb-2 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter a strength"
            />
          ))}
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                strengths: [...formData.strengths, ''],
              })
            }
            className="text-sm text-blue-600"
          >
            + Add Strength
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Use Case Personas *
          </label>
          {formData.useCasePersonas.map((persona, i) => (
            <input
              key={i}
              type="text"
              value={persona}
              onChange={(e) => {
                const newPersonas = [...formData.useCasePersonas]
                newPersonas[i] = e.target.value
                setFormData({ ...formData, useCasePersonas: newPersonas })
              }}
              className="mt-1 mb-2 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., Content creators who need video editing"
            />
          ))}
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                useCasePersonas: [...formData.useCasePersonas, ''],
              })
            }
            className="text-sm text-blue-600"
          >
            + Add Use Case
          </button>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.apiAvailable}
              onChange={(e) =>
                setFormData({ ...formData, apiAvailable: e.target.checked })
              }
              className="mr-2"
            />
            API Available
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.enterpriseReady}
              onChange={(e) =>
                setFormData({ ...formData, enterpriseReady: e.target.checked })
              }
              className="mr-2"
            />
            Enterprise Ready
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Tool'}
        </button>
      </form>
    </div>
  )
}

