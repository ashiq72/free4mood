import type { ApiResponse } from "./types";

const toErrorMessage = (data: unknown, status: number) => {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    const message = (data as { message?: string }).message;
    if (message) return message;

    const error = (data as { error?: string }).error;
    if (error) return error;

    const errorSources = (data as { errorSources?: { message?: string }[] })
      .errorSources;
    const sourceMessage = errorSources?.[0]?.message;
    if (sourceMessage) return sourceMessage;
  }
  return `Request failed (${status})`;
};

export const parseJson = async <T>(res: Response): Promise<T | string> => {
  const text = await res.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text;
  }
};

export const requestJson = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> => {
  const res = await fetch(input, init);
  const data = await parseJson<T>(res);

  if (!res.ok) {
    const endpoint =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : res.url;
    const message = toErrorMessage(data, res.status);
    throw new Error(`[${res.status}] ${message} @ ${endpoint}`);
  }

  return data as T;
};

export const unwrapData = <T>(response: ApiResponse<T>): T => response.data;

export const assertSuccess = <T>(
  response: ApiResponse<T>,
  fallbackMessage: string
) => {
  if ("success" in response && response.success === false) {
    throw new Error(response.message ?? fallbackMessage);
  }
  return response;
};
