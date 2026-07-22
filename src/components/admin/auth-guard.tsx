// ============================================================================
// Admin Auth Guard — client-side wrapper that checks session.
// Shows loading state, login form redirect, or children.
// ============================================================================

"use client";

import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status !== "authenticated") {
    // Show inline login form (prevents redirect loop)
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      setLoading(false);
      if (res?.error) {
        toast.error("Invalid credentials. Please try again.");
      } else if (res?.ok) {
        toast.success("Welcome back!");
      }
    };

    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white mb-4">
                <Lock className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-foreground font-display">Sign In Required</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Please sign in to access this section
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guard-email">Email</Label>
                <Input
                  id="guard-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11"
                  placeholder="admin@mhaksa.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guard-password">Password</Label>
                <Input
                  id="guard-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11"
                  placeholder="Enter your password"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-navy text-white hover:bg-navy-light font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <Lock className="me-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to website
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
