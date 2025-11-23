export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
        Privacy Policy
      </h1>
      <div className="prose prose-lg">
        <p className="text-gray-700">
          Your privacy is important to us. We are committed to protecting your personal
          information and complying with GDPR regulations.
        </p>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
          Data Collection
        </h2>
        <p className="text-gray-700">
          We collect only the information necessary to provide our services. We never
          share your email address with vendors without your explicit consent.
        </p>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
          Marketing Consent
        </h2>
        <p className="text-gray-700">
          You must opt-in to receive marketing communications. You can withdraw your
          consent at any time.
        </p>
        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
          Data Deletion
        </h2>
        <p className="text-gray-700">
          You can request deletion of your data at any time by contacting us.
        </p>
      </div>
    </div>
  )
}

