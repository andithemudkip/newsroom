"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { use } from "react";
import { mockArticles, formatDate, formatPrice } from "@/lib/articles";

interface ArticlePageProps {
  params: Promise<{
    articleId: string;
  }>;
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { articleId } = use(params);

  // Find the article by ID
  const article = mockArticles.find((a) => a.id === articleId);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Articles
        </Link>
      </div>

      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="font-medium">By {article.author}</span>
          <span>•</span>
          <span>{formatDate(article.timestamp)}</span>
          <span>•</span>
          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
            {article.walletAddress}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="bg-orange-100 text-orange-800 px-3 py-1 text-sm font-semibold rounded">
            {formatPrice(article.price)} $CAMP
          </div>
          <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
            Token ID: {article.tokenId.slice(0, 8)}...
            {article.tokenId.slice(-6)}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </header>

      {/* Article Content */}
      <article className="prose prose-lg max-w-none mb-8">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </article>

      {/* Article Actions */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <button className="hover:text-gray-900 transition-colors">
              📤 Share Article
            </button>
            <Link
              className="hover:text-gray-900 transition-colors"
              href={`/publish?citation=${article.id}`}
            >
              📝 Cite This Article
            </Link>
          </div>

          <div className="text-sm text-gray-600">Article #{article.id}</div>
        </div>
      </div>

      {/* Related Articles or Navigation */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Continue Reading
        </h3>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          View All Articles →
        </Link>
      </div>
    </div>
  );
}
