import { useEffect, useState } from "react";

export type LoadingStrategyName =
  | "mobile"
  | "desktop"
  | "low-bandwidth"
  | "aggressive-preload"
  | "lazy-deferred";

export type LoadingStrategy = {
  name: LoadingStrategyName;
  imageLoading: "eager" | "lazy";
  imageDecoding: "async" | "sync" | "auto";
  fetchPriority: "high" | "low" | "auto";
  deferBelowFold: boolean;
  reduceMotion: boolean;
  prefetchDistancePx: number;
};

type NavigatorWithConnection = Navigator & {
  connection?: {
    effectiveType?: string;
    saveData?: boolean;
    addEventListener?: (type: "change", listener: () => void) => void;
    removeEventListener?: (type: "change", listener: () => void) => void;
  };
};

const desktopStrategy: LoadingStrategy = {
  name: "desktop",
  imageLoading: "lazy",
  imageDecoding: "async",
  fetchPriority: "auto",
  deferBelowFold: true,
  reduceMotion: false,
  prefetchDistancePx: 900,
};

export const getFallbackLoadingStrategy = (): LoadingStrategy => desktopStrategy;

export const detectLoadingStrategy = (): LoadingStrategy => {
  if (typeof window === "undefined") {
    return desktopStrategy;
  }

  const connection = (navigator as NavigatorWithConnection).connection;
  const isLowBandwidth =
    Boolean(connection?.saveData) ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g";
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (isLowBandwidth) {
    return {
      name: "low-bandwidth",
      imageLoading: "lazy",
      imageDecoding: "async",
      fetchPriority: "low",
      deferBelowFold: true,
      reduceMotion: true,
      prefetchDistancePx: 300,
    };
  }

  if (isMobile) {
    return {
      name: "mobile",
      imageLoading: "lazy",
      imageDecoding: "async",
      fetchPriority: "auto",
      deferBelowFold: true,
      reduceMotion,
      prefetchDistancePx: 500,
    };
  }

  return {
    name: "aggressive-preload",
    imageLoading: "lazy",
    imageDecoding: "async",
    fetchPriority: "auto",
    deferBelowFold: true,
    reduceMotion,
    prefetchDistancePx: 1100,
  };
};

export const useAdaptiveLoadingStrategy = () => {
  const [strategy, setStrategy] = useState<LoadingStrategy>(getFallbackLoadingStrategy);

  useEffect(() => {
    const updateStrategy = () => setStrategy(detectLoadingStrategy());
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as NavigatorWithConnection).connection;

    updateStrategy();
    mobileQuery.addEventListener("change", updateStrategy);
    motionQuery.addEventListener("change", updateStrategy);
    connection?.addEventListener?.("change", updateStrategy);

    return () => {
      mobileQuery.removeEventListener("change", updateStrategy);
      motionQuery.removeEventListener("change", updateStrategy);
      connection?.removeEventListener?.("change", updateStrategy);
    };
  }, []);

  return strategy;
};

export const resolveImageStrategy = (
  strategy: LoadingStrategy,
  priority: "critical" | "normal" | "background" = "normal",
) => {
  if (priority === "critical") {
    return {
      loading: "eager" as const,
      decoding: strategy.imageDecoding,
      fetchPriority: "high" as const,
    };
  }

  if (priority === "background" || strategy.name === "low-bandwidth") {
    return {
      loading: "lazy" as const,
      decoding: strategy.imageDecoding,
      fetchPriority: "low" as const,
    };
  }

  return {
    loading: strategy.imageLoading,
    decoding: strategy.imageDecoding,
    fetchPriority: strategy.fetchPriority,
  };
};
