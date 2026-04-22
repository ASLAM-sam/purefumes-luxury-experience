/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type NotificationType = "success" | "error" | "info";

type Notification = {
  id: string;
  message: string;
  type: NotificationType;
};

type NotificationContextValue = {
  addNotification: (message: string, type?: NotificationType) => void;
  removeNotification: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);
const NOTIFICATION_DURATION_MS = 3000;

const getNotificationIcon = (type: NotificationType) => {
  if (type === "error") return AlertCircle;
  if (type === "info") return Info;
  return CheckCircle2;
};

const typeStyles: Record<NotificationType, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeoutsRef = useRef<Map<string, number>>(new Map());

  const removeNotification = useCallback((id: string) => {
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }

    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const addNotification = useCallback(
    (message: string, type: NotificationType = "success") => {
      const cleanMessage = message.trim();
      if (!cleanMessage) return;

      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      setNotifications((current) => [...current, { id, message: cleanMessage, type }]);

      const timeoutId = window.setTimeout(() => {
        removeNotification(id);
      }, NOTIFICATION_DURATION_MS);
      timeoutsRef.current.set(id, timeoutId);
    },
    [removeNotification],
  );

  useEffect(
    () => () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    },
    [],
  );

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <div className="fixed right-5 top-5 z-[140] w-[min(24rem,calc(100vw-2.5rem))] space-y-3">
        {notifications.map((notification) => {
          const Icon = getNotificationIcon(notification.type);

          return (
            <div
              key={notification.id}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-luxe transition ${typeStyles[notification.type]}`}
              role="status"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="flex-1 text-sm leading-5">{notification.message}</p>
              <button
                type="button"
                onClick={() => removeNotification(notification.id)}
                className="rounded-full p-1 opacity-60 transition hover:bg-white/60 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }

  return context;
}
