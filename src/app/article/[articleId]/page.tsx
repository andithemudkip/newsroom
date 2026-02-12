"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { use, useEffect, useState } from "react";
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
import { Responses } from "@/components/Responses";
import { client as apolloClient } from "@/lib/apolloClient";

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
  licenseType?: string;
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
      licenseType
    }
  }
`;

const CHECK_SUBSCRIPTION = gql`
  query CheckSubscription($ipNftId: String!, $userId: String!) {
    ipSubscriptions(where: { ipNft: $ipNftId, user: $userId }) {
      id
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
  const [author, setAuthor] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);

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

  useEffect(() => {
    const fetchMeta = async () => {
      if (data?.ipNFT && data.ipNFT.tokenURI) {
        try {
          const response = await fetch(data.ipNFT.tokenURI);
          const meta = await response.json();
          if (meta.attributes?.author) {
            setAuthor(meta.attributes.author);
          }
          if (meta.attributes?.tags) {
            setTags(meta.attributes.tags);
          }
        } catch (err) {
          console.error("Error fetching metadata:", err);
        }
      }
    };
    fetchMeta();
  }, [data?.ipNFT]);

  const { data: accessData, refetch: refetchAccess } = useReactQuery({
    queryKey: ["hasAccess", articleId, walletAddress],
    queryFn: async () => {
      if (!origin || !walletAddress || !data?.ipNFT) return false;

      // Creator always has access
      if (data.ipNFT.creator?.id.toLowerCase() === walletAddress.toLowerCase()) {
        return true;
      }

      // Check subscription expiry (works for duration-based licenses)
      try {
        const expiry = await origin.subscriptionExpiry(
          BigInt(articleId),
          walletAddress as `0x${string}`,
        );
        if (expiry && !isNaN(Number(expiry)) && Number(expiry) > 0) {
          return Number(expiry) * 1000 > Date.now();
        }
      } catch (err) {
        console.error("Error checking subscription expiry:", err);
      }

      // For permanent licenses, the contract doesn't store expiry — check subgraph
      if (data.ipNFT.licenseType === "SINGLE_PAYMENT") {
        try {
          const result = await apolloClient.query<{
            ipSubscriptions: { id: string }[];
          }>({
            query: CHECK_SUBSCRIPTION,
            variables: {
              ipNftId: tokenIdHex,
              userId: walletAddress.toLowerCase(),
            },
            fetchPolicy: "network-only",
          });
          return (result.data?.ipSubscriptions?.length ?? 0) > 0;
        } catch {
          return false;
        }
      }

      return false;
    },
    enabled: !!origin && !!walletAddress && !!data?.ipNFT,
    refetchInterval: isPurchasing ? 3000 : false,
  });

  const hasAccess = accessData ?? false;

  const { data: contentData } = useReactQuery({
    queryKey: ["articleContent", articleId],
    queryFn: async () => {
      if (!origin) return null;
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
  });

  // Stop polling once access is confirmed by the subgraph
  useEffect(() => {
    if (isPurchasing && hasAccess) {
      setIsPurchasing(false);
    }
  }, [isPurchasing, hasAccess]);

  useEffect(() => {
    if (contentData) {
      setFullContent(contentData);
    }
  }, [contentData]);

  if (loading) {
    return <div className="p-8 text-center">Loading article...</div>;
  }

  if (error || !data?.ipNFT) {
    return notFound();
  }

  const ipNFT = data.ipNFT;

  const handleBuyAccess = async () => {
    if (!origin || !walletAddress || isPurchasing || hasAccess) return;
    try {
      setIsPurchasing(true);
      await origin.buyAccessSmart(BigInt(articleId));
      toast.success("Access purchased! Waiting for confirmation...");
      // isPurchasing stays true — the access query polls every 3s
      // until hasAccess flips to true, then the effect above clears isPurchasing
    } catch (err) {
      console.error("Error buying access:", err);
      setIsPurchasing(false);
      const errorMessage = err?.toString() || "";
      if (errorMessage.includes("insufficient funds")) {
        toast.error("Insufficient funds to buy access");
      } else if (errorMessage.includes("User rejected")) {
        toast.error("Transaction rejected");
      } else {
        toast.error("Failed to purchase access. Please try again.");
      }
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
            {author ? (
              author
            ) : (
              <Copy
                text={truncateAddress(ipNFT.creator?.id || "Unknown")}
                raw={ipNFT.creator?.id || ""}
              />
            )}
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
            {ipNFT.licenseType === "2" ? (
              <>{formatEther(BigInt(ipNFT.price))} $USDC / Per View</>
            ) : (
              <>
                {formatEther(BigInt(ipNFT.price))} $CAMP /{" "}
                {ipNFT.licenseType === "1" || Number(ipNFT.duration) === 0
                  ? "Permanent"
                  : formatDuration(Number(ipNFT.duration))}
              </>
            )}
          </div>
        </div>

        {/* X402 Agent Info */}
        {ipNFT.licenseType === "2" && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              AI Agent Accessible via X402
            </h3>
            <p className="text-sm text-blue-800 mb-2">
              This article uses the HTTP 402 payment protocol. AI agents and automated systems can access it programmatically — no wallet UI needed. When an agent requests the content and receives a 402 response, it signs a payment intent and retries with an <code className="bg-blue-100 px-1 rounded text-xs">X-PAYMENT</code> header to gain instant access.
            </p>
            <p className="text-xs text-blue-700">
              Compatible with any x402-enabled client or AI agent SDK.
            </p>
          </div>
        )}

        {/* Attributes */}
        {Array.isArray(tags) && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag: string, idx: number) => (
              <span
                key={idx}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {tag}
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
        ) : ipNFT.licenseType === "2" ? (
          <>
            <div className="mb-6">
              <ReactMarkdown>{ipNFT.description}</ReactMarkdown>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <div className="max-w-lg mx-auto text-center">
                <p className="text-gray-600 mb-4">
                  This article is available exclusively via the X402 payment protocol at{" "}
                  <span className="font-semibold">{formatEther(BigInt(ipNFT.price))} $USDC</span> per view.
                </p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-left">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    How to access this content
                  </h4>
                  <p className="text-sm text-blue-800 mb-2">
                    X402 content is accessed over HTTP and paid for in USDC via the backend. AI agents and x402-enabled clients can fetch this article programmatically:
                  </p>
                  <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
                    <li>Request the content endpoint — receive an HTTP 402 response with payment details</li>
                    <li>Sign a USDC payment intent with your wallet</li>
                    <li>Retry the request with the <code className="bg-blue-100 px-1 rounded text-xs">X-PAYMENT</code> header</li>
                  </ol>
                  <p className="text-xs text-blue-700 mt-3">
                    No on-chain transaction needed — payments are settled in USDC through the backend.
                  </p>
                </div>
              </div>
            </div>
          </>
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
                  <>
                    {ipNFT.licenseType === "1" || Number(ipNFT.duration) === 0
                      ? "Buy Permanent Access"
                      : "Buy Access"}{" "}
                    for {formatEther(BigInt(ipNFT.price))} $CAMP
                  </>
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
      {ipNFT.parentIds && ipNFT.parentIds.length > 1 && (
        <Citations parentIds={ipNFT.parentIds} />
      )}
      <Responses tokenId={ipNFT.tokenId} />

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
