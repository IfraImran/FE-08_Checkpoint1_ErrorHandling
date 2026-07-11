"use client";

import { useEffect } from "react";

export default function ChatRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[chat route error]", error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-red-50 p-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Something broke on our end
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          The chat couldn&apos;t load. This is usually a network hiccup —
          try again in a moment.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Try again
        </button>
        <a
          href="/support"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Contact support
        </a>
      </div>
    </div>
  );
}
