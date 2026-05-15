import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, MessageSquareText, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { useNotification } from "@/context/NotificationContext";
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter";
import { perfumeRequestsApi, type PerfumeRequest, type PerfumeRequestStatus } from "@/services/api";

export const Route = createFileRoute("/admin/requests")({
  component: AdminPerfumeRequests,
});

const STATUSES: PerfumeRequestStatus[] = ["new", "contacted", "sourced", "closed"];
const PAGE_SIZE = 12;

const statusLabel: Record<PerfumeRequestStatus, string> = {
  new: "New",
  contacted: "Contacted",
  sourced: "Sourced",
  closed: "Closed",
};

const statusStyles: Record<PerfumeRequestStatus, string> = {
  new: "bg-amber-100 text-amber-800",
  contacted: "bg-sky-100 text-sky-800",
  sourced: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-200 text-slate-700",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

function RequestImageGrid({ request }: { request: PerfumeRequest }) {
  if (!request.images.length) {
    return <span className="text-xs text-navy/45">No images</span>;
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {request.images.map((image, index) => (
        <a
          key={`${request.id}-${index}`}
          href={image}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-xl border border-border bg-beige/40 transition hover:-translate-y-0.5 hover:shadow-soft"
        >
          <OptimizedImage
            src={image}
            alt={`${request.perfumeName} reference ${index + 1}`}
            sizes="88px"
            className="aspect-square h-full w-full object-cover"
          />
        </a>
      ))}
    </div>
  );
}

function AdminPerfumeRequests() {
  const { addNotification } = useNotification();
  const dateRange = useDateRangeFilter({
    storageKey: "purefumes_admin_requests_date_range",
    initialRange: "30d",
  });
  const [requests, setRequests] = useState<PerfumeRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<PerfumeRequestStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(1);
  }, [dateRange.from, dateRange.range, dateRange.to, statusFilter]);

  const load = useCallback(
    async (silent = false) => {
      if (!dateRange.isValid) {
        setError(dateRange.validationError);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      try {
        const response = await perfumeRequestsApi.listPaginated({
          page,
          limit: PAGE_SIZE,
          status: statusFilter,
          ...dateRange.queryParams,
        });
        setRequests(response.requests);
        setTotalPages(Math.max(response.pagination.pages || 1, 1));
        setTotalRequests(response.pagination.total || 0);
      } catch (ex) {
        const message = ex instanceof Error ? ex.message : "Perfume requests could not be loaded.";
        setError(message);
        if (silent) {
          addNotification(message, "error");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [addNotification, dateRange.isValid, dateRange.queryParams, dateRange.validationError, page, statusFilter],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const refresh = () => load(true);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        load(true);
      }
    };

    window.addEventListener("focus", refresh);
    window.addEventListener("purefumes:requests-changed", refresh);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const intervalId = window.setInterval(refresh, 30000);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("purefumes:requests-changed", refresh);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [load]);

  const updateStatus = useCallback(
    async (id: string, status: PerfumeRequestStatus) => {
      try {
        const updated = await perfumeRequestsApi.updateStatus(id, status);
        setRequests((current) =>
          current.map((request) => (request.id === id || request._id === id ? updated : request)),
        );
        addNotification("Perfume request status updated.");
        load(true);
      } catch (ex) {
        addNotification(
          ex instanceof Error ? ex.message : "Perfume request status could not be updated.",
          "error",
        );
      }
    },
    [addNotification, load],
  );

  const counts = useMemo(
    () =>
      requests.reduce<Record<PerfumeRequestStatus, number>>(
        (acc, request) => {
          acc[request.status] += 1;
          return acc;
        },
        { new: 0, contacted: 0, sourced: 0, closed: 0 },
      ),
    [requests],
  );

  return (
    <AdminShell>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.4em] text-navy/50">
            Sourcing Desk
          </p>
          <h1 className="font-display text-4xl text-navy">Perfume Requests</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-navy/60">
            Track customer sourcing queries by date and status with a clean, responsive review flow.
          </p>
        </div>
        <span className="rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-navy/70">
          {totalRequests.toLocaleString("en-IN")} queries
        </span>
      </header>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <DateRangeFilter
          range={dateRange.range}
          from={dateRange.from}
          to={dateRange.to}
          maxDate={dateRange.maxDate}
          error={dateRange.validationError}
          disabled={refreshing}
          onRangeChange={dateRange.setRange}
          onFromChange={dateRange.setFrom}
          onToChange={dateRange.setTo}
          action={
            <Button
              variant="soft"
              size="sm"
              className="gap-2"
              disabled={refreshing || Boolean(dateRange.validationError)}
              onClick={() => load(true)}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          }
        />

        <section className="rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-[0_16px_36px_rgba(7,31,63,0.07)]">
          <label className="flex flex-col gap-2">
            <span className="text-[0.65rem] uppercase tracking-[0.24em] text-navy/45">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as PerfumeRequestStatus | "")
              }
              className="h-12 rounded-2xl border border-border bg-white/90 px-4 text-sm text-navy outline-none transition focus:border-gold/70"
            >
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel[status]}
                </option>
              ))}
            </select>
          </label>
        </section>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {STATUSES.map((status) => (
          <div key={status} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <p className="text-xs uppercase tracking-[0.2em] text-navy/50">{statusLabel[status]}</p>
            <p className="mt-3 font-display text-4xl text-navy">{counts[status]}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card shadow-soft">
        <div className="lg:hidden">
          {loading ? (
            <div className="px-5 py-10 text-center text-navy/50">Loading queries...</div>
          ) : error ? (
            <div className="px-5 py-10 text-center text-red-600">{error}</div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={<MessageSquareText className="h-6 w-6" />}
              title="No queries in this range"
              description="Try a wider date range or a different request status."
            />
          ) : (
            <div className="space-y-4 p-4">
              {requests.map((request) => (
                <article
                  key={request.id || request._id}
                  className="rounded-2xl border border-border/70 bg-beige/30 p-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gold">
                        {formatDate(request.createdAt)}
                      </p>
                      <h2 className="mt-2 font-display text-2xl text-navy">
                        {request.perfumeName}
                      </h2>
                      <p className="mt-1 text-sm text-navy/70">{request.customerName}</p>
                      <p className="text-sm text-navy/60">{request.phoneNumber}</p>
                    </div>
                    <select
                      value={request.status}
                      onChange={(event) =>
                        updateStatus(
                          request.id || request._id,
                          event.target.value as PerfumeRequestStatus,
                        )
                      }
                      className={`rounded-full border-0 px-3 py-2 text-xs uppercase tracking-[0.18em] outline-none ${statusStyles[request.status]}`}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel[status]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-navy/70">
                    <p>
                      <span className="font-medium text-navy">Preferred Size:</span>{" "}
                      {request.preferredSize || "-"}
                    </p>
                    <p>
                      <span className="font-medium text-navy">Budget:</span>{" "}
                      {request.budgetRange || "-"}
                    </p>
                    <p className="whitespace-pre-line">
                      <span className="font-medium text-navy">Notes:</span> {request.message}
                    </p>
                  </div>

                  <div className="mt-4">
                    <RequestImageGrid request={request} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-sm">
            <thead className="bg-beige/50 text-xs uppercase tracking-[0.2em] text-navy/70">
              <tr>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-left">Perfume</th>
                <th className="px-6 py-4 text-left">Size</th>
                <th className="px-6 py-4 text-left">Budget</th>
                <th className="px-6 py-4 text-left">Notes</th>
                <th className="px-6 py-4 text-left">Images</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-navy/50">
                    Loading queries...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && requests.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-navy/50">
                    No queries found in this range.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                requests.map((request) => (
                  <tr
                    key={request.id || request._id}
                    className="align-top transition-colors hover:bg-beige/30"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-navy">{request.customerName}</p>
                      <p className="mt-1 text-xs text-navy/60">{request.phoneNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-navy">{request.perfumeName}</p>
                    </td>
                    <td className="px-6 py-4 text-navy/70">{request.preferredSize || "-"}</td>
                    <td className="px-6 py-4 text-navy/70">{request.budgetRange || "-"}</td>
                    <td className="px-6 py-4">
                      <p className="max-w-xs whitespace-pre-line text-sm leading-6 text-navy/70">
                        {request.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-[14rem]">
                        <RequestImageGrid request={request} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={request.status}
                        onChange={(event) =>
                          updateStatus(
                            request.id || request._id,
                            event.target.value as PerfumeRequestStatus,
                          )
                        }
                        className={`rounded-full border-0 px-3 py-1.5 text-xs uppercase tracking-[0.18em] outline-none ${statusStyles[request.status]}`}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-xs text-navy/60">
                      {formatDate(request.createdAt)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-white/70 bg-white/72 px-4 py-4 shadow-[0_12px_24px_rgba(7,31,63,0.06)] sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-navy/58">
          Page <span className="font-semibold text-navy">{page}</span> of{" "}
          <span className="font-semibold text-navy">{totalPages}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="soft"
            size="sm"
            disabled={page <= 1}
            className="gap-2"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="soft"
            size="sm"
            disabled={page >= totalPages}
            className="gap-2"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}
