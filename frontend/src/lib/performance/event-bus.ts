export type FrontendEvents = {
  "auth:changed": {
    userId: string | null;
    isAuthenticated: boolean;
    ready: boolean;
  };
  "cart:changed": {
    count: number;
    total: number;
  };
  "wishlist:changed": {
    count: number;
    ids: string[];
  };
  "dashboard:refresh-requested": {
    reason: string;
    silent: boolean;
  };
  "dashboard:changed": {
    at: number;
    reason: string;
  };
  "catalog:changed": {
    scope: "products" | "brands" | "banners" | "categories" | "all";
  };
};

type Listener<Payload> = (payload: Payload) => void;
type ListenerMap<Events extends Record<string, unknown>> = {
  [K in keyof Events]?: Set<Listener<Events[K]>>;
};

export class EventBus<Events extends Record<string, unknown>> {
  private listeners: ListenerMap<Events> = {};

  subscribe<K extends keyof Events>(eventName: K, listener: Listener<Events[K]>) {
    const listeners = (this.listeners[eventName] ||= new Set());
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  publish<K extends keyof Events>(eventName: K, payload: Events[K]) {
    const listeners = this.listeners[eventName];
    if (!listeners?.size) return;

    queueMicrotask(() => {
      listeners.forEach((listener) => listener(payload));
    });
  }

  clear() {
    Object.values(this.listeners).forEach((listeners) => listeners?.clear());
  }
}

export const frontendEventBus = new EventBus<FrontendEvents>();
