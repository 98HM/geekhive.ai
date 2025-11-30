import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Find the Perfect AI Tools
            <br />
            for Your Workflow
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Our AI-powered recommendation engine analyzes your daily tasks and suggests
            the most relevant AI tools with personalized explanations.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/find"
              className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Find the right AI for you
            </Link>
            <Link
              href="/tools"
              className="text-base font-semibold leading-7 text-gray-900"
            >
              Browse AI tools <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hottest AI of the Month Section */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Hottest AI of the Month
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              Trending AI tools that are making waves this month
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {/* Dummy data for trending tools */}
            {[
              {
                name: 'ChatGPT',
                description: 'The most popular AI assistant for conversation, coding, and creative tasks.',
                category: 'Productivity',
                trending: true,
              },
              {
                name: 'Midjourney',
                description: 'Revolutionary AI image generation that creates stunning artwork from text.',
                category: 'Design',
                trending: true,
              },
              {
                name: 'GitHub Copilot',
                description: 'AI pair programmer that helps developers write code faster and better.',
                category: 'Development',
                trending: true,
              },
            ].map((tool, index) => (
              <div
                key={index}
                className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    🔥 Trending
                  </span>
                  <span className="text-sm text-gray-500">{tool.category}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {tool.name}
                </h3>
                <p className="text-sm text-gray-600 flex-1">{tool.description}</p>
                <Link
                  href="/tools"
                  className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Discover AI tools tailored to your specific needs
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                1. Describe Your Workflow
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Tell us about your daily tasks, challenges, and goals. Our AI analyzes
                  your workflow to understand your needs.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                2. AI-Powered Matching
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  We use semantic search and intelligent re-ranking to find tools that
                  truly match your requirements.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                3. Personalized Recommendations
              </dt>
              <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Get 3-5 curated tool recommendations with explanations of why each
                  tool fits your workflow.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to discover your perfect AI tools?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-blue-100">
              Start your personalized recommendation journey today.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/find"
                className="rounded-md bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-gray-50"
              >
                Find the right AI for you
              </Link>
              <Link
                href="/tools"
                className="rounded-md border border-white/20 bg-white/10 px-6 py-3 text-base font-semibold text-white hover:bg-white/20"
              >
                Browse AI tools
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
