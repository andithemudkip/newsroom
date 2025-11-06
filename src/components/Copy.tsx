"use client";

import { useState } from "react";
import { toast } from "sonner";

export const CopySVG = ({ color }: { color?: string }) => {
  return (
    <svg
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.20117 5.27732V9.3418H2.43963H3.05886V5.98918V2.63656H5.88254H8.08699V1.9247V1.21284H4.64408H1.20117V5.27732Z"
        fill={color || "#59513F"}
      />
      <path
        d="M4.16309 7.32259V10.813H7.48215H10.8012V7.32259V3.83219H7.48215H4.16309V7.32259Z"
        fill={color || "#59513F"}
      />
    </svg>
  );
};

interface CopyProps {
  text: string;
  raw?: string;
  className?: string;
}

export const Copy = ({ text, raw, className = "" }: CopyProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(raw || text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopy}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`inline-flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-70 ${className}`}
      type="button"
    >
      <span>{text}</span>
      <CopySVG color={isHovered ? "#FF6D01" : "#59513F"} />
    </button>
  );
};
