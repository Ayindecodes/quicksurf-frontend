"use client";
// Load data from the API for a component: { data, error, loading, reload, mutate }.
// `key` identifies what to load: when it changes the data is loaded again; null means "not yet".

import { useCallback, useEffect, useEffectEvent, useState } from "react";

type Result<T> = { token: string; data?: T; error?: unknown };

export function useApi<T>(key: string | null, load: () => Promise<T>) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const token = key === null ? null : `${key}#${version}`;
  const fetchData = useEffectEvent(load);

  useEffect(() => {
    if (token === null) return;
    let active = true;
    fetchData().then(
      (data) => active && setResult({ token, data }),
      (error: unknown) => active && setResult((previous) => ({ token, error, data: previous?.data })),
    );
    return () => {
      active = false;
    };
  }, [token]);

  const loading = token !== null && result?.token !== token;
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const mutate = useCallback((data: T) => setResult((previous) => ({ token: previous?.token ?? "", data })), []);
  return { data: result?.data, error: loading ? undefined : result?.error, loading, reload, mutate };
}

/** Call `tick` every `ms` while `active` (e.g. to follow a pending purchase). */
export function useInterval(tick: () => void, ms: number, active: boolean) {
  const onTick = useEffectEvent(tick);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => onTick(), ms);
    return () => window.clearInterval(id);
  }, [ms, active]);
}
