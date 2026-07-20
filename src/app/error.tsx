"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-6">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-foreground font-display mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        An unexpected error occurred. Please try again, or return to the home page if the problem persists.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} className="bg-navy text-white hover:bg-navy-light">
          <RefreshCw className="h-4 w-4 me-2" />
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.href = "/"}
        >
          <Home className="h-4 w-4 me-2" />
          Home
        </Button>
      </div>
      {error.digest && (
        <p className="mt-4 text-xs text-muted-foreground font-mono">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
