import type { AxiosError, AxiosRequestConfig } from "axios";
import http from "./http";

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  return http({
    ...config,
    ...options,
  }).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
