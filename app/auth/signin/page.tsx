'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h1>
        <p className="text-gray-600 mb-6">
          Sign in to save your favorite tools, comparisons, and recommendations.
        </p>
        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}


