import { useEffect, useRef } from "react";
import { perfInstrumentation } from "@/lib/performance/instrumentation";

export const useRenderInstrumentation = (componentName: string) => {
  const renderCountRef = useRef(0);
  const renderStartRef = useRef(0);

  if (import.meta.env.DEV && typeof performance !== "undefined") {
    renderStartRef.current = performance.now();
  }

  useEffect(() => {
    if (!import.meta.env.DEV || typeof performance === "undefined") return;

    renderCountRef.current += 1;
    perfInstrumentation.renderCommit(
      componentName,
      renderCountRef.current,
      performance.now() - renderStartRef.current,
    );
  });
};
