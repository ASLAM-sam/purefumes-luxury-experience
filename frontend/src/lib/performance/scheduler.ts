type TaskHandle = () => void;

type IdleDeadlineShim = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (
    callback: (deadline: IdleDeadlineShim) => void,
    options?: { timeout?: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export const scheduleIdleTask = (
  callback: () => void,
  options: { timeoutMs?: number } = {},
): TaskHandle => {
  if (typeof window === "undefined") {
    callback();
    return () => undefined;
  }

  const idleWindow = window as WindowWithIdleCallback;

  if (idleWindow.requestIdleCallback) {
    const handle = idleWindow.requestIdleCallback(
      () => {
        callback();
      },
      { timeout: options.timeoutMs ?? 1500 },
    );

    return () => idleWindow.cancelIdleCallback?.(handle);
  }

  const timeoutId = window.setTimeout(callback, Math.min(options.timeoutMs ?? 1500, 250));
  return () => window.clearTimeout(timeoutId);
};

export const throttle = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  waitMs: number,
) => {
  let lastRun = 0;
  let trailingTimeout: number | null = null;
  let lastArgs: Args | null = null;

  const run = (args: Args) => {
    lastRun = Date.now();
    trailingTimeout = null;
    lastArgs = null;
    callback(...args);
  };

  const throttled = (...args: Args) => {
    const remaining = waitMs - (Date.now() - lastRun);
    lastArgs = args;

    if (remaining <= 0) {
      if (trailingTimeout !== null && typeof window !== "undefined") {
        window.clearTimeout(trailingTimeout);
      }

      run(args);
      return;
    }

    if (trailingTimeout === null && typeof window !== "undefined") {
      trailingTimeout = window.setTimeout(() => {
        if (lastArgs) {
          run(lastArgs);
        }
      }, remaining);
    }
  };

  throttled.cancel = () => {
    if (trailingTimeout !== null && typeof window !== "undefined") {
      window.clearTimeout(trailingTimeout);
    }

    trailingTimeout = null;
    lastArgs = null;
  };

  return throttled;
};

export const debounce = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  waitMs: number,
) => {
  let timeoutId: number | null = null;

  const debounced = (...args: Args) => {
    if (timeoutId !== null && typeof window !== "undefined") {
      window.clearTimeout(timeoutId);
    }

    if (typeof window === "undefined") {
      callback(...args);
      return;
    }

    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      callback(...args);
    }, waitMs);
  };

  debounced.cancel = () => {
    if (timeoutId !== null && typeof window !== "undefined") {
      window.clearTimeout(timeoutId);
    }

    timeoutId = null;
  };

  return debounced;
};
