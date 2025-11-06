export interface Article {
  id: string;
  title: string;
  author: string;
  content: string;
  tags: string[];
  timestamp: string;
  walletAddress: string;
  tokenId: string;
  price: number;
  tokenURI: string;
  duration?: string;
  parentIds?: string[];
}

// Utility functions
export const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatPrice = (price: number) => {
  return price.toLocaleString();
};

export const truncateContent = (content: string, maxLength: number = 200) => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
};

export const formatDuration = (seconds: number) => {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let result = "";
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;

  return result.trim();
}