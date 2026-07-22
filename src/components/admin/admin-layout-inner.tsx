// ============================================================================
// Admin Layout Inner — client component that checks session.
// Shows login form if not authenticated (NO sidebar/topbar).
// Shows AdminDashboard shell if authenticated.
// ============================================================================

"use client";

import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { toast } from "sonner";

export function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Loading state — spinner only, no sidebar
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated — show login form ONLY (no sidebar, no topbar)
  if (!session) {
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
        toast.success("Welcome back, Administrator!");
        // Force full page reload to get new session cookie + re-render
        setTimeout(() => window.location.reload(), 500);
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white mb-4">
                <Lock className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-bold text-foreground font-display">Admin Login</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to manage your website content
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
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

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to website
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Authenticated — show full admin dashboard shell with sidebar + topbar
  return (
    <AdminDashboard>
      {children}
    </AdminDashboard>
  );
}
