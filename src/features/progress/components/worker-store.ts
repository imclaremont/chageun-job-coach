"use client";

import { useSyncExternalStore } from "react";
import { findWorker, type Worker } from "../workers";

// 이 기기에서 일하는 근로자, 로그인 대신 브라우저 저장소에 보관
const STORAGE_KEY = "chageun.workerId";
const CHANGE_EVENT = "chageun-worker-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

const readWorkerId = () => window.localStorage.getItem(STORAGE_KEY);

// 선택된 근로자, 서버 렌더링과 첫 화면에서는 undefined (아직 모름)
export function useCurrentWorker(): Worker | null | undefined {
  const workerId = useSyncExternalStore<string | null | undefined>(
    subscribe,
    readWorkerId,
    () => undefined,
  );
  if (workerId === undefined) return undefined;
  return workerId ? findWorker(workerId) : null;
}

export function selectWorker(workerId: string | null): void {
  if (workerId) window.localStorage.setItem(STORAGE_KEY, workerId);
  else window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
