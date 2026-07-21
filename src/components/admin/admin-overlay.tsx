// ============================================================================
// Admin Overlay — full-screen authenticated admin dashboard.
// Login gate → dashboard with CRUD panels.
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Lock, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";

export function AdminOverlay() {
  const adminOpen = useAppStore((s) => s.adminOpen);
  const setAdminOpen = useAppStore((s) => s.setAdminOpen);
  const { data: session, status } = useSession();

  // Close on Escape
  useEffect(() => {
    if (!adminOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAdminOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [adminOpen, setAdminOpen]);

  return (
    <AnimatePresence>
      {adminOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background"
        >
          <div className="flex h-full flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-border bg-navy px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/20 text-gold">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm">MHASA Admin</div>
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">
                    Content Management System
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-white hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAdminOpen(false)}
                  className="text-white hover:bg-white/10 hover:text-white"
                  aria-label="Close admin"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {status === "loading" ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : session ? (
                <AdminDashboard />
              ) : (
                <AdminLogin />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// -------- Login Form --------
function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    }
  };

  return (
    <div className="flex h-full items-center justify-center bg-muted/30 p-4">
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
        </div>
      </motion.div>
    </div>
  );
}
