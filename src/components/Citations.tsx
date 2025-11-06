"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { truncateAddress } from "@/lib/functions";
import { ROOT_PARENT_ID } from "@/lib/constants";

interface CitedArticle {
  id: string;
  name: string;
  tokenId: string;
}

interface GetCitedArticlesData {
  ipNFTs: CitedArticle[];
}

interface GetCitedArticlesVars {
  ids: string[];
}

const GET_CITED_ARTICLES = gql`
  query GetCitedArticles($ids: [ID!]!) {
    ipNFTs(where: { tokenId_in: $ids }) {
      id
      name
      tokenId
    }
  }
`;

interface CitationsProps {
  parentIds: string[];
  showTitle?: boolean;
}

export function Citations({ parentIds, showTitle = true }: CitationsProps) {
  const { data, loading } = useQuery<
    GetCitedArticlesData,
    GetCitedArticlesVars
  >(GET_CITED_ARTICLES, {
    variables: { ids: parentIds.filter((id) => id !== ROOT_PARENT_ID) },
    skip: !parentIds || parentIds.length === 1,
  });

  if (!parentIds || parentIds.length === 1) {
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
          📚 Citations
        </h3>
      )}
      <p className="text-sm text-gray-600 mb-4">
        This article cites the following articles:
      </p>
      <ul className="space-y-2">
        {parentIds
          .filter((id) => id !== ROOT_PARENT_ID)
          .map((parentId: string) => {
            const citedArticle = data?.ipNFTs.find(
              (article: CitedArticle) => article.tokenId === parentId
            );

            return (
              <li key={parentId}>
                <Link
                  href={`/article/${parentId}`}
                  className="inline-flex items-center text-orange-600 hover:text-orange-800 transition-colors"
                >
                  →{" "}
                  {loading ? (
                    <span className="ml-1">
                      Loading... (#{truncateAddress(parentId)})
                    </span>
                  ) : citedArticle ? (
                    <span className="ml-1">{citedArticle.name}</span>
                  ) : (
                    <span className="ml-1">
                      Article #{truncateAddress(parentId)}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
