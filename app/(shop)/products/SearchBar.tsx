"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar({ initialQ }: { initialQ?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQ ?? "");
  const [, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    params.delete("category"); // clear category when searching
    startTransition(() => router.push(`/products?${params.toString()}`));
  }

  function clear() {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    startTransition(() => router.push(`/products?${params.toString()}`));
  }

  return (
    <form onSubmit={submit} style={{ marginBottom: 32 }}>
      <div style={{ position: "relative", maxWidth: 520 }}>
        <svg
          width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-light)", pointerEvents: "none" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products by name…"
          className="input"
          style={{ paddingLeft: 42, paddingRight: query ? 80 : 100, fontSize: 14 }}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            style={{
              position: "absolute", right: 68, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-light)", fontSize: 18, lineHeight: 1, padding: "0 4px",
            }}
          >
            ×
          </button>
        )}
        <button
          type="submit"
          className="btn-primary"
          style={{
            position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
            padding: "7px 16px", fontSize: 13, borderRadius: 7,
          }}
        >
          Search
        </button>
      </div>
    </form>
  );
}
