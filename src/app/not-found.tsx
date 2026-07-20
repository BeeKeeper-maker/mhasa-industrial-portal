// ============================================================================
// 404 Error Page — branded not-found for unmatched routes.
// Uses CSS animations (server-renderable) instead of Framer Motion.
// ============================================================================

import Link from "next/link";
import { Home, Search, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy px-6 text-center text-white">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 start-1/4 h-64 w-64 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-1/4 end-1/4 h-64 w-64 rounded-full bg-gold blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gold/20 text-gold">
            <AlertCircle className="h-10 w-10" />
          </div>
        </div>

        <h1 className="text-7xl md:text-8xl font-bold font-display text-gold">
          404
        </h1>

        <h2 className="mt-4 text-2xl md:text-3xl font-bold text-white font-display">
          Page Not Found
        </h2>

        <p className="mt-3 text-white/70 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/">
            <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold">
              <Home className="h-4 w-4" />
              Back to Home
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
            >
              <Search className="h-4 w-4" />
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
