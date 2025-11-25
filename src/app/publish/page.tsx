"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { createLicenseTerms } from "@campnetwork/origin";
import { zeroAddress } from "viem";
import { useAuth } from "@campnetwork/origin/react";
import { ROOT_PARENT_ID } from "@/lib/constants";
import { toast } from "sonner";

function PublishForm() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    content: "",
    tags: "",
    citations: [""],
    price: 0.001,
    duration: 7,
    royalty: 2.5,
  });
  const { origin } = useAuth();
  const [isPreview, setIsPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [publishingProgress, setPublishingProgress] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  // Validation function
  const validateForm = (data: typeof formData) => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!data.title.trim()) {
      errors.title = "Title is required";
    }
    if (!data.author.trim()) {
      errors.author = "Author is required";
    }
    if (!data.content.trim()) {
      errors.content = "Content is required";
    }

    // Price validation
    if (data.price < 0.001) {
      errors.price = "Price must be at least 0.001 $CAMP";
    }

    // Duration validation
    if (data.duration < 1 || data.duration > 30) {
      errors.duration = "Duration must be between 1 and 30 days";
    }

    // Royalty validation
    if (data.royalty < 0.1 || data.royalty > 10) {
      errors.royalty = "Royalty must be between 0.1% and 10%";
    }

    return errors;
  };

  // Check if form is valid
  const isFormValid = Object.keys(validationErrors).length === 0;

  // auto-fill citing if articleid is in query params
  useEffect(() => {
    const articleId = searchParams.get("citation");
    if (articleId) {
      setFormData((prev) => ({
        ...prev,
        citations: [articleId],
      }));
    }
  }, [searchParams]);

  // Initial validation
  useEffect(() => {
    const errors = validateForm(formData);
    setValidationErrors(errors);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    };

    setFormData(newFormData);

    // Validate on change
    const errors = validateForm(newFormData);
    setValidationErrors(errors);
  };

  const handleCitationChange = (index: number, value: string) => {
    const newCitations = [...formData.citations];
    newCitations[index] = value;
    const newFormData = {
      ...formData,
      citations: newCitations,
    };
    setFormData(newFormData);

    // Validate on change
    const errors = validateForm(newFormData);
    setValidationErrors(errors);
  };

  const addCitation = () => {
    if (formData.citations.length < 7) {
      setFormData({
        ...formData,
        citations: [...formData.citations, ""],
      });
    }
  };

  const removeCitation = (index: number) => {
    const newCitations = formData.citations.filter((_, i) => i !== index);
    // Ensure at least one citation field remains
    const citations = newCitations.length === 0 ? [""] : newCitations;
    setFormData({
      ...formData,
      citations,
    });
  };

  const createContentFile = (content: string): File => {
    // Convert the content string into a File with mimetype text/plain
    const blob = new Blob([content], { type: "text/plain" });
    const file = new File([blob], "article-content.txt", {
      type: "text/plain",
    });
    return file;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsPublishing(true);
    setPublishingProgress(0);

    try {
      const contentFile = createContentFile(formData.content);

      console.log("Publishing article:", {
        ...formData,
        contentFile: {
          name: contentFile.name,
          type: contentFile.type,
          size: contentFile.size,
        },
      });

      const excerpt = formData.content.slice(0, 50) + "...";

      const metadata = {
        name: formData.title,
        description: excerpt,
        mimetype: "text/plain",
        // image:
        //   "https://ivory-total-ox-210.mypinata.cloud/ipfs/bafkreiag4ghu2rmda6kocwjz4vps5rqoagt65dmef2bhb766aa3d5sf2xa",
        attributes: {
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
          author: formData.author,
        },
      };

      const price = BigInt(formData.price * 1e18);
      const durationInSeconds = formData.duration * 24 * 60 * 60;
      const royaltyRate = Math.floor(formData.royalty * 100);

      const license = createLicenseTerms(
        price,
        durationInSeconds,
        royaltyRate,
        zeroAddress
      );
      const parentsArray = [BigInt(ROOT_PARENT_ID)];

      // Add all non-empty citations
      formData.citations.forEach((citation) => {
        const trimmedCitation = citation.trim();
        if (trimmedCitation) {
          parentsArray.push(BigInt(trimmedCitation));
        }
      });

      const tokenId = await origin?.mintFile(
        contentFile,
        metadata,
        license,
        parentsArray,
        {
          progressCallback: (progress: number) => {
            setPublishingProgress(progress);
          },
        }
      );

      setPublishingProgress(100);

      setFormData({
        title: "",
        author: "",
        content: "",
        tags: "",
        citations: [""],
        price: 0.001,
        duration: 7,
        royalty: 2.5,
      });

      setIsPreview(false);

      setValidationErrors({});

      toast.success("Article published successfully!", {
        action: {
          label: "View Article",
          onClick: () => {
            window.location.href = `/article/${tokenId}`;
          },
        },
      });
      setTimeout(() => {
        setPublishingProgress(0);
      }, 2000);
    } catch (error) {
      console.error("Error publishing article:", error);
      setPublishingProgress(0);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          background: #d1d5db;
          outline: none;
          border-radius: 8px;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #f97316;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #f97316;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
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
                className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:border-transparent ${
                  validationErrors.title
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                required
              />
              {validationErrors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.title}
                </p>
              )}
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
                className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:border-transparent ${
                  validationErrors.author
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                required
              />
              {validationErrors.author && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.author}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tags (comma separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="blockchain, defi, nft (comma separated)..."
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Citations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Citing Article IDs (optional, up to 7)
              </label>
              <div className="space-y-2">
                {formData.citations.map((citation, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={citation}
                      onChange={(e) =>
                        handleCitationChange(index, e.target.value)
                      }
                      placeholder={`Article ID ${index + 1}...`}
                      className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {formData.citations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCitation(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-300"
                        title="Remove citation"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {formData.citations.length < 7 && (
                  <button
                    type="button"
                    onClick={addCitation}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-300"
                  >
                    + Add Citation
                  </button>
                )}
              </div>
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

              <div
                className={`border rounded-md overflow-hidden ${
                  validationErrors.content
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
              >
                {!isPreview ? (
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your article in markdown format..."
                    rows={15}
                    className={`w-full px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:border-transparent font-mono text-sm ${
                      validationErrors.content
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
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
              {validationErrors.content && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.content}
                </p>
              )}
            </div>

            {/* Licensing Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Licensing
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price */}
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Price ($CAMP)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0.001"
                    step="0.001"
                    placeholder="0.001"
                    className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:border-transparent ${
                      validationErrors.price
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                  />
                  {validationErrors.price ? (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.price}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum: 0.001 $CAMP
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    License Duration (days)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    max="30"
                    placeholder="7"
                    className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:border-transparent ${
                      validationErrors.duration
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                  />
                  {validationErrors.duration ? (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.duration}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Between 1-30 days
                    </p>
                  )}
                </div>

                {/* Royalty */}
                <div>
                  <label
                    htmlFor="royalty"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Royalty Rate: {formData.royalty}%
                  </label>
                  <input
                    type="range"
                    id="royalty"
                    name="royalty"
                    value={formData.royalty}
                    onChange={handleInputChange}
                    min="0.1"
                    max="10"
                    step="0.1"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1%</span>
                    <span>10%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Licensing Summary:</strong> Readers will pay{" "}
                  <span className="font-semibold text-orange-600">
                    {formData.price} $CAMP
                  </span>{" "}
                  for a{" "}
                  <span className="font-semibold text-orange-600">
                    {formData.duration}-day
                  </span>{" "}
                  license to access your full article. You'll receive{" "}
                  <span className="font-semibold text-orange-600">
                    {formData.royalty}%
                  </span>{" "}
                  royalty when people subscribe to articles that cite your work.
                </p>
              </div>
            </div>

            {/* Publishing Progress Bar */}
            {isPublishing && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Publishing Article...
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(publishingProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${publishingProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Please wait while your article is being published to the
                  blockchain...
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={!isFormValid || isPublishing}
                className={`px-6 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center space-x-2 ${
                  isFormValid && !isPublishing
                    ? "bg-orange-500 text-white hover:bg-orange-600 cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isPublishing ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Article</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function PublishPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      }
    >
      <PublishForm />
    </Suspense>
  );
}
