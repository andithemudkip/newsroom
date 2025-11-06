import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Article Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <div className="space-x-4">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            ← Back to Articles
          </Link>
          <Link
            href="/publish"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Publish New Article
          </Link>
        </div>
      </div>
    </div>
  );
}