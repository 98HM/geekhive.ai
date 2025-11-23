import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
        Unauthorized
      </h1>
      <p className="text-gray-600 mb-6">
        You don't have permission to access this page.
      </p>
      <Link
        href="/"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
      >
        Go Home
      </Link>
    </div>
  )
}

