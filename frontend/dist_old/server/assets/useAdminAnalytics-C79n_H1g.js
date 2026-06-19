import { r as reactExports, j as jsxRuntimeExports } from "./vendor-react-98xxEzFV.js";
import { m as motion } from "./vendor-motion-3kNaalGV.js";
import { J as adminApi } from "./router-DvCKRw9U.js";
import { u as useDateRangeFilter } from "./useDateRangeFilter-BRGCZQlN.js";
const AnalyticsChart = reactExports.memo(function AnalyticsChart2({
  title,
  description,
  action,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.section,
    {
      layout: true,
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      className: "overflow-hidden rounded-[var(--radius-panel)] border border-white/70 bg-white/82 p-4 shadow-[0_18px_48px_rgba(7,31,63,0.1)] backdrop-blur sm:p-5 lg:p-6",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[clamp(1.35rem,1vw+1rem,2rem)] text-navy", children: title }),
            description ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "fluid-body-sm mt-2 text-navy/58", children: description }) : null
          ] }),
          action ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0", children: action }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5", children })
      ]
    }
  );
});
const useAdminAnalytics = ({ initialRange = "30d" } = {}) => {
  const dateRange = useDateRangeFilter({
    storageKey: "purefumes_admin_analytics_date_range",
    initialRange
  });
  const [analytics, setAnalytics] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [refreshing, setRefreshing] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const hasLoadedRef = reactExports.useRef(false);
  const lastQueryKeyRef = reactExports.useRef("");
  const loadAnalytics = reactExports.useCallback(
    async (forceRefresh = false) => {
      if (!dateRange.isValid) {
        setError(dateRange.validationError);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      const rangeChanged = lastQueryKeyRef.current !== dateRange.queryKey;
      const showInitialLoader = (!hasLoadedRef.current || rangeChanged) && !forceRefresh;
      try {
        if (showInitialLoader) {
          setAnalytics(null);
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        const response = await adminApi.analytics(
          dateRange.queryParams,
          { forceFresh: true }
        );
        hasLoadedRef.current = true;
        lastQueryKeyRef.current = dateRange.queryKey;
        setAnalytics(response);
        setError("");
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Analytics could not be loaded."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dateRange.isValid, dateRange.queryKey, dateRange.queryParams, dateRange.validationError]
  );
  reactExports.useEffect(() => {
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
    refresh: () => loadAnalytics(true)
  };
};
export {
  AnalyticsChart as A,
  useAdminAnalytics as u
};
