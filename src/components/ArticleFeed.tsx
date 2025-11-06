"use client";

import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Article,
  mockArticles,
  formatDate,
  formatPrice,
  truncateContent,
} from "@/lib/articles";

export default function ArticleFeed() {
  const [articles] = useState<Article[]>(mockArticles);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Latest Articles
        </h1>
        <p className="text-gray-600">
          Discover the latest insights from the Web3 community
        </p>
      </div>

      <div className="space-y-6">
        {articles.map((article) => (
          <article
            key={article.id}
            className="bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {article.title}
                  </h2>

                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <span>By {article.author}</span>
                    <span>•</span>
                    <span>{formatDate(article.timestamp)}</span>

                    <span>•</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1">
                      {article.walletAddress}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1">
                      {article.tokenId.slice(0, 6)}...
                      {article.tokenId.slice(-4)}
                    </span>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="bg-orange-100 text-orange-800 px-3 py-1 text-sm font-semibold">
                    {formatPrice(article.price)} $CAMP
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="prose max-w-none mb-4">
                <ReactMarkdown>
                  {truncateContent(article.content)}
                </ReactMarkdown>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Link
                  href={`/article/${article.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Read Full Article →
                </Link>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <Link
                    className="hover:text-gray-900 transition-colors"
                    href={`/publish?citation=${article.id}`}
                  >
                    📝 Cite This Article
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-8">
        <button className="bg-orange-500 text-white px-6 py-3 hover:bg-orange-600 transition-colors">
          Load More Articles
        </button>
      </div>
    </div>
  );
}
