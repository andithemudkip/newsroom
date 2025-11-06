"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { use, useEffect, useState, useRef } from "react";
import { formatDate, formatDuration } from "@/lib/articles";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { truncateAddress } from "@/lib/functions";
import { formatEther } from "viem";
import { Copy } from "@/components/Copy";
import { Citations } from "@/components/Citations";
import { useAuth } from "@campnetwork/origin/react";
import { toast } from "sonner";

interface IpNFT {
  id: string;
  creator?: { id: string };
  name: string;
  image?: string;
  parentIds?: string[];
  price: string;
  tokenURI: string;
  tokenId: string;
  attributes?: string[];
  createdAt: string;
  description: string;
  duration?: string;
}

interface GetArticleData {
  ipNFT?: IpNFT;
}

interface GetArticleVars {
  id: string;
}

const GET_ARTICLE = gql`
  query GetArticle($id: ID!) {
    ipNFT(id: $id) {
      creator {
        id
      }
      name
      image
      parentIds
      price
      tokenURI
      tokenId
      attributes
      createdAt
      description
      duration
    }
  }
`;

interface ArticlePageProps {
  params: Promise<{
    articleId: string;
  }>;
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { articleId } = use(params);
  const tokenIdHex = `0x${BigInt(articleId).toString(16)}`;
  const { walletAddress, origin } = useAuth();
  const [fullContent, setFullContent] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const toastIdRef = useRef<string | number | null>(null);

  const { data, loading, error, startPolling, stopPolling } = useQuery<
    GetArticleData,
    GetArticleVars
  >(GET_ARTICLE, {
    variables: { id: tokenIdHex },
  });

  // Start polling if article is not found (might still be indexing)
  useEffect(() => {
    if (!loading && !data?.ipNFT) {
      startPolling(10000); // Poll every 10 seconds
    } else if (data?.ipNFT) {
      stopPolling(); // Stop polling once article is found
    }
  }, [data, loading, startPolling, stopPolling]);

  const [isCreator, setIsCreator] = useState(false);

  const { data: accessData, refetch: refetchAccess } = useReactQuery({
    queryKey: ["hasAccess", articleId, walletAddress, origin],
    queryFn: async () => {
      if (!origin || !walletAddress) return false;
      const access = await origin.hasAccess(
        walletAddress as `0x${string}`,
        BigInt(articleId)
      );
      return !!access;
    },
    enabled: !!origin && !!walletAddress,
    refetchInterval: isPurchasing ? 5000 : false, // Poll every 5 seconds when purchasing
  });

  const hasAccess = accessData ?? false;

  // Fetch full content with react-query, polling when isPurchasing is true
  const { data: contentData } = useReactQuery({
    queryKey: ["articleContent", articleId],
    queryFn: async () => {
      if (!origin || !hasAccess) return null;
      try {
        const response = await origin.getData(BigInt(articleId));
        if (response.isError) {
          toast.error("Error fetching full content");
          return null;
        }
        const urlToText = response.data[0].file[0];
        const textResponse = await fetch(urlToText);
        const textData = await textResponse.text();
        return textData;
      } catch (err) {
        console.error("Error fetching full content:", err);
        return null;
      }
    },
    enabled: !!origin && hasAccess,
    refetchInterval: isPurchasing && hasAccess ? 2000 : false, // Poll every 2 seconds when purchasing
  });

  // Stop polling once we have both access and content
  useEffect(() => {
    if (isPurchasing && hasAccess && contentData) {
      setIsPurchasing(false);
      // Dismiss the loading toast and show success
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      toast.success("Access granted! You can now read the full article.");
    }
  }, [isPurchasing, hasAccess, contentData]);

  // Update fullContent state when contentData changes
  useEffect(() => {
    if (contentData) {
      setFullContent(contentData);
    }
  }, [contentData]);

  // Check if user is creator
  useEffect(() => {
    if (data?.ipNFT && walletAddress) {
      if (
        data.ipNFT.creator?.id.toLowerCase() === walletAddress.toLowerCase()
      ) {
        setIsCreator(true);
      }
    }
  }, [data, walletAddress]);

  if (loading) {
    return <div className="p-8 text-center">Loading article...</div>;
  }

  if (error || !data?.ipNFT) {
    return notFound();
  }

  const ipNFT = data.ipNFT;

  const handleBuyAccess = async () => {
    if (!origin || !walletAddress) {
      alert("Please connect your wallet first");
      return;
    }
    try {
      setIsPurchasing(true);
      // Show persistent loading toast
      toastIdRef.current = toast.loading(
        "Purchasing access... Please wait while we verify your access.",
        {
          duration: Infinity, // Keep toast until manually dismissed
        }
      );
      await origin.buyAccessSmart(BigInt(articleId));
      // Trigger immediate refetch to start polling
      refetchAccess();
    } catch (err) {
      console.error("Error buying access:", err);
      // Dismiss loading toast on error
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      toast.error("Failed to purchase access. Please try again.");
      setIsPurchasing(false);
    }
  };

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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{ipNFT.name}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="font-medium">
            By{" "}
            <Copy
              text={truncateAddress(ipNFT.creator?.id || "Unknown")}
              raw={ipNFT.creator?.id || ""}
            />
          </span>
          <span>•</span>
          <span>
            {formatDate(new Date(Number(ipNFT.createdAt) * 1000).toISOString())}
          </span>
          <span>•</span>
          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
            <Copy text={truncateAddress(ipNFT.tokenId)} raw={ipNFT.tokenId} />
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="bg-orange-100 text-orange-800 px-3 py-1 text-sm font-semibold rounded">
            {formatEther(BigInt(ipNFT.price))} $CAMP /{" "}
            {formatDuration(Number(ipNFT.duration))}
          </div>
        </div>

        {/* Attributes */}
        {Array.isArray(ipNFT.attributes) && ipNFT.attributes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {ipNFT.attributes.map((attr: string, idx: number) => (
              <span
                key={idx}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {attr}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Article Content */}
      <article className="prose prose-lg max-w-none mb-8">
        {hasAccess ? (
          fullContent ? (
            <ReactMarkdown>{fullContent}</ReactMarkdown>
          ) : (
            <div>Loading full content...</div>
          )
        ) : (
          <>
            <div className="mb-6">
              <ReactMarkdown>{ipNFT.description}</ReactMarkdown>
            </div>
            <div className="border-t border-gray-200 pt-6 text-center">
              <p className="text-gray-600 mb-4">
                This is an excerpt. Purchase access to read the full article.
              </p>
              <button
                className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleBuyAccess}
                disabled={isPurchasing}
              >
                {isPurchasing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Purchasing...
                  </>
                ) : (
                  <>Buy Access for {formatEther(BigInt(ipNFT.price))} $CAMP</>
                )}
              </button>
            </div>
          </>
        )}
      </article>

      {/* Article Actions */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <Link
              className="hover:text-gray-900 transition-colors"
              href={`/publish?citation=${ipNFT.tokenId}`}
            >
              📝 Cite This Article
            </Link>
          </div>

          <div className="text-sm text-gray-600">
            <Copy
              text={`Article #${truncateAddress(ipNFT.tokenId)}`}
              raw={ipNFT.tokenId}
            />
          </div>
        </div>
      </div>

      {/* Citations Section */}
      {ipNFT.parentIds && ipNFT.parentIds.length > 0 && (
        <Citations parentIds={ipNFT.parentIds} />
      )}

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
