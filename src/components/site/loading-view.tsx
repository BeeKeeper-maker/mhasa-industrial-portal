// ============================================================================
// Loading View — shown during lazy view suspension.
// ============================================================================

export function LoadingView() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold animate-spin" />
        </div>
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    </div>
  );
}
