"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, errorMessage } from "./api-client";

type State<T> = { path: string | null; data: T | null; error: string | null };

// GET 조회 훅, refreshMs 지정 시 주기적으로 다시 조회
export function useApi<T>(path: string | null, options?: { refreshMs?: number }) {
  const [state, setState] = useState<State<T>>({ path: null, data: null, error: null });
  const [version, setVersion] = useState(0);
  const refreshMs = options?.refreshMs;

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    apiFetch<T>(path).then(
      (data) => {
        if (!cancelled) setState({ path, data, error: null });
      },
      (error) => {
        if (!cancelled) setState((previous) => ({ ...previous, path, error: errorMessage(error) }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [path, version]);

  useEffect(() => {
    if (!refreshMs) return;
    const timer = setInterval(() => setVersion((value) => value + 1), refreshMs);
    return () => clearInterval(timer);
  }, [refreshMs]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  const setData = useCallback(
    (data: T) => setState((previous) => ({ ...previous, data, error: null })),
    [],
  );

  const current = state.path === path;
  return {
    data: current ? state.data : null,
    error: current ? state.error : null,
    loading: path !== null && !current,
    reload,
    setData,
  };
}
