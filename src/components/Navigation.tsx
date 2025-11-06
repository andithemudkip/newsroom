"use client";

import { CampModal, useAuthState } from "@campnetwork/origin/react";
import Link from "next/link";

export default function Navigation() {
  const { authenticated } = useAuthState();

  return (
    <nav className="bg-[#f9f7f4aa] border-b border-gray-300 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <h1 className="text-xl text-gray-900 uppercase">_Newsroom</h1>
            <span className="mx-2 text-gray-900">|</span>
            <span className="ml-2 text-sm text-gray-500">Proof of News</span>
          </Link>

          <div className="flex items-stretch space-x-4">
            {authenticated && (
              <Link
                href="/publish"
                className="inline-flex items-center px-4 py-2 border border-orange-500 text-sm font-medium text-orange-500 hover:bg-orange-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                Publish Article
              </Link>
            )}
            <CampModal />
          </div>
        </div>
      </div>
    </nav>
  );
}
