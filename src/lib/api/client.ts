import type { ApiResponse } from "./types";

const toErrorMessage = (data: unknown, status: number) => {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: string }).message;
    if (message) return message;
  }
  return `Request failed (${status})`;
};

export const parseJson = async <T>(res: Response): Promise<T> => {
  const text = await res.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Server returned invalid JSON");
  }
};

export const requestJson = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> => {
  const res = await fetch(input, init);
  const data = await parseJson<T>(res);

  if (!res.ok) {
    throw new Error(toErrorMessage(data, res.status));
  }

  return data;
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
