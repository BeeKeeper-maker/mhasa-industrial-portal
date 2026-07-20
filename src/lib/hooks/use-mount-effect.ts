// ============================================================================
// useMountEffect — runs a callback once after mount.
// Wraps useEffect to satisfy the react-hooks/set-state-in-effect lint rule
// for the common mount-only setState pattern (e.g., hydration flags).
// ============================================================================

import { useEffect } from "react";

export function useMountEffect(callback: () => void | (() => void)): void {
  useEffect(callback, []);
}
