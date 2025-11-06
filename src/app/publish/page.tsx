"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function PublishPage() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    content: "",
    tags: "",
  });

  const [isPreview, setIsPreview] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement article publishing logic
    console.log("Publishing article:", formData);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Publish New Article
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Article Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter your article title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Author */}
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Author
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Your name or pseudonym..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="blockchain, defi, nft (comma separated)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Article Content (Markdown)
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setIsPreview(false)}
                  className={`px-3 py-1 text-sm ${
                    !isPreview
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreview(true)}
                  className={`px-3 py-1 text-sm ${
                    isPreview
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            <div className="border border-gray-300 rounded-md overflow-hidden">
              {!isPreview ? (
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your article in markdown format..."
                  rows={15}
                  className="w-full px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  required
                />
              ) : (
                <div className="p-4 prose max-w-none bg-gray-50 min-h-[300px]">
                  {formData.content ? (
                    <ReactMarkdown>{formData.content}</ReactMarkdown>
                  ) : (
                    <p className="text-gray-500 italic">
                      Preview will appear here...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Publish Article
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
