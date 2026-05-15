import { memo, useEffect, useRef, useState, type ReactNode } from "react";
import { scheduleIdleTask } from "@/lib/performance/scheduler";

type DeferredSectionProps = {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  idleTimeoutMs?: number;
};

export const DeferredSection = memo(function DeferredSection({
  children,
  fallback = null,
  rootMargin = "800px 0px",
  idleTimeoutMs = 1800,
}: DeferredSectionProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;

    let cancelled = false;
    let cancelIdleTask: (() => void) | undefined;
    const reveal = () => {
      if (cancelled) return;

      cancelIdleTask = scheduleIdleTask(
        () => {
          if (!cancelled) {
            setReady(true);
          }
        },
        { timeoutMs: idleTimeoutMs },
      );
    };

    if (typeof IntersectionObserver === "undefined" || !rootRef.current) {
      reveal();
      return () => {
        cancelled = true;
        cancelIdleTask?.();
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(rootRef.current);

    return () => {
      cancelled = true;
      cancelIdleTask?.();
      observer.disconnect();
    };
  }, [idleTimeoutMs, ready, rootMargin]);

  return <div ref={rootRef}>{ready ? children : fallback}</div>;
});
