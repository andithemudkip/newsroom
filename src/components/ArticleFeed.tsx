"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Article,
  formatDate,
  formatDuration,
  truncateContent,
} from "@/lib/articles";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { ARTICLES_PER_PAGE, ROOT_PARENT_ID } from "@/lib/constants";
import { Copy } from "./Copy";
import { truncateAddress } from "@/lib/functions";
import { formatEther } from "viem";
import { Citations } from "./Citations";

const GET_ARTICLES = gql`
  query GetArticles($skip: Int!) {
    ipNFTs(
      first: ${ARTICLES_PER_PAGE}
      skip: $skip
      orderBy: createdAt
      orderDirection: desc
      where: {
        parentIds_contains: [
          "${ROOT_PARENT_ID}"
        ]
      }
    ) {
      id
      name
      creator {
        id
      }
      price
      tokenId
      createdAt
      description
      attributes
      tokenURI
      duration
      parentIds
    }
  }
`;

export default function ArticleFeed() {
  const { data, loading, error, fetchMore } = useQuery<any>(GET_ARTICLES, {
    variables: { skip: 0 },
  });

  const [articles, setArticles] = useState<Article[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const updateArticles = async (ipnfts: any[]) => {
    const newArticles: Article[] = ipnfts.map((ipNFT: any) => ({
      id: ipNFT.id,
      tokenId: ipNFT.tokenId,
      title: ipNFT.name,
      author: ipNFT.creator?.id || "Unknown",
      content: ipNFT.description || "",
      timestamp: ipNFT.createdAt,
      walletAddress:
        ipNFT.creator?.id || "0x0000000000000000000000000000000000000000",
      price: ipNFT.price,
      tags: ipNFT.attributes || [],
      tokenURI: ipNFT.tokenURI || "",
      duration: ipNFT.duration || "0",
      parentIds: ipNFT.parentIds || [],
    }));
    const detailedArticles = await Promise.all(
      newArticles.map(async (article) => {
        const meta = await fetch(article.tokenURI);
        const metaJson = await meta.json();
        return {
          ...article,
          tags: metaJson.attributes.tags || article.tags,
          author: metaJson.attributes.author || article.author,
        };
      })
    );
    if (articles.length === 0) {
      setArticles(detailedArticles);
    } else {
      setArticles([...articles, ...detailedArticles]);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      await updateArticles(data.ipNFTs);

      // If we got fewer than ARTICLES_PER_PAGE articles, there are no more to load
      setHasMore(data.ipNFTs.length === ARTICLES_PER_PAGE);
    };

    if (data && data.ipNFTs) {
      fetchDetails();
    }
  }, [data]);

  const handleLoadMore = async () => {
    const result = await fetchMore({
      variables: {
        skip: articles.length,
      },
    });

    if (result.data && result.data.ipNFTs) {
      await updateArticles(result.data.ipNFTs);

      // If we got fewer than ARTICLES_PER_PAGE articles, there are no more to load
      setHasMore(result.data.ipNFTs.length === ARTICLES_PER_PAGE);
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading articles: {error.message}
      </div>
    );
  }

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
            key={article.tokenId}
            className="bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Link
                    href={`/article/${article.tokenId}`}
                    className="no-underline"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {article.title}
                    </h2>
                  </Link>

                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <span>
                      By{" "}
                      {article.author.startsWith("0x") ? (
                        <Copy
                          text={truncateAddress(article.author, 4)}
                          raw={article.author}
                        />
                      ) : (
                        article.author
                      )}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1">
                      <Copy
                        text={truncateAddress(article.walletAddress, 4)}
                        raw={article.walletAddress}
                      />
                    </span>
                    <span>•</span>
                    <span>
                      {formatDate(
                        new Date(Number(article.timestamp) * 1000).toString()
                      )}
                    </span>

                    <span>•</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1">
                      <Copy
                        text={truncateAddress(article.tokenId, 4)}
                        raw={article.tokenId}
                      />
                    </span>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="bg-orange-100 text-orange-800 px-3 py-1 text-sm font-semibold">
                    {formatEther(BigInt(article.price))} $CAMP /{" "}
                    {formatDuration(Number(article.duration))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="prose max-w-none mb-4 border-t border-gray-200 pt-4">
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
                  href={`/article/${article.tokenId}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Read Full Article →
                </Link>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <Link
                    className="hover:text-gray-900 transition-colors"
                    href={`/publish?citation=${article.tokenId}`}
                  >
                    📝 Cite This Article
                  </Link>
                </div>
              </div>
              <Citations
                showTitle={false}
                parentIds={article.parentIds || []}
              />
            </div>
          </article>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-3 hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Load More Articles"}
          </button>
        </div>
      )}
    </div>
  );
}
