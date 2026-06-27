import type { ApiResponse } from "./types";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

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
  init?: RequestInit,
): Promise<T> => {
  let res: Response;
  try {
    res = await fetch(input, {
      ...init,
      signal: init?.signal || AbortSignal.timeout(30_000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("The server took too long to respond");
    }
    throw new Error("Unable to reach the server");
  }

  const data = await parseJson<T>(res);

  if (!res.ok) {
    const message = toErrorMessage(data, res.status);
    throw new ApiRequestError(message, res.status, data);
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
