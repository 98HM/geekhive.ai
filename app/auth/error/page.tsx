import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Authentication Error
        </h1>
        <p className="text-gray-600 mb-6">
          There was an error signing in. Please try again.
        </p>
        <Link
          href="/auth/signin"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Try Again
        </Link>
      </div>
    </div>
  )
}


