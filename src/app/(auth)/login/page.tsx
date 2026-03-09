"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/home");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-vela-white px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-ink">Welcome back</h1>
          <p className="mt-2 font-sans text-sm text-clay">
            Sign in to your cabinet.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block font-sans text-xs uppercase tracking-widest text-stone"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-parchment bg-cream px-3 py-2 font-sans text-sm text-ink placeholder:text-stone focus:outline-none focus:ring-1 focus:ring-stone"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block font-sans text-xs uppercase tracking-widest text-stone"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-parchment bg-cream px-3 py-2 font-sans text-sm text-ink placeholder:text-stone focus:outline-none focus:ring-1 focus:ring-stone"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="font-sans text-sm text-risk">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-ink py-2.5 font-sans text-sm text-cream transition-opacity disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center font-sans text-sm text-clay">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-ink underline underline-offset-2">
            Start here
          </Link>
        </p>
      </div>
    </div>
  );
}
