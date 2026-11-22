import type { ApiResponse } from "@/shared/api/response";

// 화면에서 쓰는 API 호출 오류, 서버가 준 안내 문구 포함
export class ApiClientError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const FALLBACK_MESSAGE = "연결이 잠시 끊겼어요. 다시 시도해 주세요";

// 공통 응답 형식을 풀어 data만 반환
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
      cache: "no-store",
    });
  } catch {
    throw new ApiClientError("NETWORK_ERROR", FALLBACK_MESSAGE, 0);
  }

  const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!response.ok || !body?.success) {
    throw new ApiClientError(
      body?.code ?? "UNKNOWN",
      body?.message ?? FALLBACK_MESSAGE,
      response.status,
    );
  }
  return body.data as T;
}

export const postJson = <T>(path: string, payload: unknown = {}) =>
  apiFetch<T>(path, { method: "POST", body: JSON.stringify(payload) });

export const patchJson = <T>(path: string, payload: unknown) =>
  apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(payload) });

export const errorMessage = (error: unknown) =>
  error instanceof ApiClientError ? error.message : FALLBACK_MESSAGE;
