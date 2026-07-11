"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { EmptyState, MessageSkeleton } from "./EmptyState";

const SLOW_RESPONSE_MS = 6000;

export function ChatPanel() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
  } = useChat({
    api: "/api/chat",
    onError(err) {
      console.error("[chat stream error]", err);
    },
  });

  const [isSlow, setIsSlow] = useState(false);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading) {
      slowTimer.current = setTimeout(() => setIsSlow(true), SLOW_RESPONSE_MS);
    } else {
      setIsSlow(false);
      if (slowTimer.current) clearTimeout(slowTimer.current);
    }
    return () => {
      if (slowTimer.current) clearTimeout(slowTimer.current);
    };
  }, [isLoading]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;
    handleSubmit(e);
  }

  const isRateLimited = error?.message?.toLowerCase().includes("rate limit");

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLoading && (
          <EmptyState
            title="Ask me anything"
            description="Try: “Summarize this document” or “What changed in the last release?”"
            actionLabel="See example prompts"
            onAction={() => handleInputChange({ target: { value: "What can you help me with?" } } as any)}
          />
        )}

        {messages.map((m) => (
          <div key={m.id} className="p-4">
            <p className="text-xs font-medium text-gray-400">{m.role}</p>
            <p className="whitespace-pre-wrap text-sm text-gray-900">{m.content}</p>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <MessageSkeleton />
        )}

        {isSlow && isLoading && (
          <div className="mx-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            This is taking longer than usual.
            <button onClick={() => stop()} className="ml-2 underline">
              Cancel
            </button>
          </div>
        )}

        {error && (
          <div className="mx-4 flex items-center justify-between rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <span>
              {isRateLimited
                ? "We're getting a lot of requests right now. Please wait a moment."
                : "That response didn't go through."}
            </span>
            {!isRateLimited && (
              <button
                onClick={() => reload()}
                className="ml-3 shrink-0 rounded-md bg-red-100 px-3 py-1 font-medium hover:bg-red-200"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 border-t p-3">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Message..."
          className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
