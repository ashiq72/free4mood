export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data: T;
  [key: string]: unknown;
};
