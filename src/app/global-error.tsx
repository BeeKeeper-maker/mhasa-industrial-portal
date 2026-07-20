"use client";

import { AlertOctagon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-navy text-white">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gold/20 text-gold mb-6">
            <AlertOctagon className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-3 text-white">
            Application Error
          </h1>
          <p className="text-white/70 max-w-md mb-8">
            A critical error occurred while loading the application. Our team has been notified.
            Please try refreshing the page.
          </p>
          <Button
            onClick={reset}
            className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
          >
            <RefreshCw className="h-4 w-4 me-2" />
            Refresh Application
          </Button>
          {error.digest && (
            <p className="mt-6 text-xs text-white/40 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
