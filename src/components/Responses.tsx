"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";

interface ResponseArticle {
  id: string;
  name: string;
  tokenId: string;
}

interface GetResponseArticlesData {
  ipNFTs: ResponseArticle[];
}

interface GetResponseArticlesVars {
  tokenId: string;
}

const GET_RESPONSE_ARTICLES = gql`
  query GetResponseArticles($tokenId: ID!) {
    ipNFTs(where: { parentIds_contains: [$tokenId] }) {
      id
      name
      tokenId
    }
  }
`;

interface ResponsesProps {
  tokenId: string;
  showTitle?: boolean;
}

export function Responses({ tokenId, showTitle = true }: ResponsesProps) {
  const { data, loading } = useQuery<
    GetResponseArticlesData,
    GetResponseArticlesVars
  >(GET_RESPONSE_ARTICLES, {
    variables: { tokenId },
    skip: !tokenId,
  });

  if (!tokenId || (!loading && (!data?.ipNFTs || data.ipNFTs.length === 0))) {
    return null;
  }

  return (
    <div
      className={`${
        showTitle ? "mt-12 pt-8" : "mt-6 pt-6"
      } border-t border-gray-200`}
    >
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💬 Responses
        </h3>
      )}
      <p className="text-sm text-gray-600 mb-4">
        Articles that cite this article:
      </p>
      {loading ? (
        <p className="text-sm text-gray-500">Loading responses...</p>
      ) : (
        <ul className="space-y-2">
          {data?.ipNFTs.map((responseArticle: ResponseArticle) => (
            <li key={responseArticle.tokenId}>
              <Link
                href={`/article/${responseArticle.tokenId}`}
                className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors"
              >
                ← <span className="ml-1">{responseArticle.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
