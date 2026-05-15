import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi, type AdminAnalytics, type AnalyticsRangeKey } from "@/services/api";
import {
  getRangeInputDates,
  useDateRangeFilter,
  type AdminDateRangeKey,
} from "@/hooks/useDateRangeFilter";

type Options = {
  initialRange?: AdminDateRangeKey;
};

export { getRangeInputDates };

export const useAdminAnalytics = ({ initialRange = "30d" }: Options = {}) => {
  const dateRange = useDateRangeFilter({
    storageKey: "purefumes_admin_analytics_date_range",
    initialRange,
  });
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);

  const loadAnalytics = useCallback(
    async (forceRefresh = false) => {
      if (!dateRange.isValid) {
        setError(dateRange.validationError);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const showInitialLoader = !hasLoadedRef.current && !forceRefresh;

      try {
        if (showInitialLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const response = await adminApi.analytics(
          dateRange.queryParams as {
            range?: AnalyticsRangeKey;
            from?: string;
            to?: string;
          },
        );

        hasLoadedRef.current = true;
        setAnalytics(response);
        setError("");
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Analytics could not be loaded.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange.isValid, dateRange.queryParams, dateRange.validationError],
  );

  useEffect(() => {
    if (!dateRange.isValid) {
      setError(dateRange.validationError);
      return;
    }

    void loadAnalytics();
  }, [dateRange.isValid, dateRange.validationError, loadAnalytics]);

  return {
    analytics,
    loading,
    refreshing,
    error: dateRange.validationError || error,
    range: dateRange.range,
    from: dateRange.from,
    to: dateRange.to,
    maxDate: dateRange.maxDate,
    dateRangeError: dateRange.validationError,
    setFrom: dateRange.setFrom,
    setTo: dateRange.setTo,
    setRange: dateRange.setRange,
    refresh: () => loadAnalytics(true),
  };
};
