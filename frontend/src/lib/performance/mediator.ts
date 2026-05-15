import { apiTrafficProxy } from "@/lib/performance/api-proxy";
import { frontendEventBus } from "@/lib/performance/event-bus";

type DashboardRefreshOptions<T> = {
  reason: string;
  silent?: boolean;
  refresh: () => Promise<T>;
  cooldownMs?: number;
};

export const frontendMediator = {
  publishCatalogChanged(scope: "products" | "brands" | "banners" | "categories" | "all") {
    frontendEventBus.publish("catalog:changed", { scope });
  },

  requestDashboardRefresh<T>({
    reason,
    silent = true,
    refresh,
    cooldownMs = 900,
  }: DashboardRefreshOptions<T>) {
    frontendEventBus.publish("dashboard:refresh-requested", { reason, silent });

    return apiTrafficProxy
      .runExclusive({
        key: `dashboard:${reason}`,
        cooldownMs,
        action: refresh,
      })
      .then((value) => {
        frontendEventBus.publish("dashboard:changed", {
          at: Date.now(),
          reason,
        });
        return value;
      });
  },

  subscribeDashboardRefresh(listener: (payload: { reason: string; silent: boolean }) => void) {
    return frontendEventBus.subscribe("dashboard:refresh-requested", listener);
  },
};
