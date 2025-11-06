"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectWallet = () => {
    // TODO: Implement wallet connection logic
    setIsConnected(!isConnected);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-xl text-gray-900 uppercase">_Newsroom</h1>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            <Link
              href="/publish"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              Publish Article
            </Link>

            <button
              onClick={handleConnectWallet}
              className={`inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isConnected
                  ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500"
              }`}
            >
              {isConnected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Connected
                </>
              ) : (
                "Connect Wallet"
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
