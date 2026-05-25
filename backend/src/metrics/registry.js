const counters = new Map();

const increment = (name, value = 1) => {
  counters.set(name, Number(counters.get(name) || 0) + value);
};

export const metricsMiddleware = (req, res, next) => {
  const startedAt = process.hrtime.bigint();
  increment("http_requests_total");

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    increment(`http_status_${res.statusCode}_total`);
    increment("http_request_duration_ms_sum", durationMs);
  });

  next();
};

export const renderMetrics = () => {
  const lines = [
    "# TYPE http_requests_total counter",
    `http_requests_total ${Number(counters.get("http_requests_total") || 0)}`,
  ];

  for (const [name, value] of counters.entries()) {
    if (name === "http_requests_total") continue;
    lines.push(`${name} ${Number(value)}`);
  }

  lines.push(`process_uptime_seconds ${Math.round(process.uptime())}`);
  lines.push(`process_heap_used_bytes ${process.memoryUsage().heapUsed}`);
  lines.push(`process_rss_bytes ${process.memoryUsage().rss}`);
  return `${lines.join("\n")}\n`;
};
