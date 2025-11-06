"use client";

import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface Article {
  id: string;
  title: string;
  author: string;
  content: string;
  tags: string[];
  timestamp: string;
  walletAddress: string;
  tokenId: string;
  price: number;
}

// Mock data for demonstration
const mockArticles: Article[] = [
  {
    id: "1",
    title: "The Future of Decentralized Finance",
    author: "Alice Crypto",
    content: `# DeFi Revolution

DeFi represents a fundamental shift in how we think about financial services. By removing intermediaries and leveraging smart contracts, we can create more accessible and transparent financial systems.

## Key Benefits

- **Permissionless**: Anyone can access DeFi protocols
- **Transparent**: All transactions are on-chain
- **Composable**: Protocols can be combined like Lego blocks

The future looks bright for decentralized finance!`,
    tags: ["defi", "blockchain", "cryptocurrency"],
    timestamp: "2024-11-06T10:30:00Z",
    walletAddress: "0x1234...5678",
    tokenId:
      "83679576525596327355512974138992486392092804660232857216239892862083372083126",
    price: 234,
  },
  {
    id: "2",
    title: "NFT Market Trends in 2024",
    author: "Bob Digital",
    content: `# NFT Market Analysis

The NFT market has evolved significantly this year. Let's look at the key trends:

## Major Developments

1. **Utility-focused NFTs** are gaining traction
2. **Gaming integration** is becoming mainstream
3. **Environmental concerns** are being addressed

## What's Next?

The focus is shifting from speculation to real-world utility and sustainable practices.`,
    tags: ["nft", "gaming", "trends"],
    timestamp: "2024-11-05T15:45:00Z",
    walletAddress: "0xabcd...efgh",
    tokenId:
      "83679576525596327355512974138992486392092804660232857216239892862083372083126",
    price: 512,
  },
  {
    id: "3",
    title: "Web3 Social Networks: A New Paradigm",
    author: "Charlie Web3",
    content: `# The Rise of Decentralized Social Media

Traditional social media platforms have centralized control over data and content. Web3 social networks offer an alternative.

## Key Features

- **Data ownership**: Users control their own data
- **Censorship resistance**: No single point of control
- **Token incentives**: Users earn for participation

This represents a paradigm shift towards user empowerment.`,
    tags: ["web3", "social", "decentralization"],
    timestamp: "2024-11-04T09:15:00Z",
    walletAddress: "0x9876...5432",
    tokenId:
      "83679576525596327355512974138992486392092804660232857216239892862083372083126",
    price: 234,
  },
];

export default function ArticleFeed() {
  const [articles] = useState<Article[]>(mockArticles);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  const toggleExpanded = (articleId: string) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId);
  };

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
                  {expandedArticle === article.id
                    ? article.content
                    : truncateContent(article.content)}
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
                <button
                  onClick={() => toggleExpanded(article.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {expandedArticle === article.id ? "Show Less" : "Read More"}
                </button>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <button className="hover:text-gray-900 transition-colors">
                    📤 Share
                  </button>
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
