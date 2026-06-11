import type { AxiosError, AxiosRequestConfig } from "axios";
import http from "./http";

export interface CustomRequestConfig extends AxiosRequestConfig {
  skipAuthRefresh?: boolean;
}

export const customInstance = <T>(
  config: CustomRequestConfig,
  options?: CustomRequestConfig,
): Promise<T> => {
  return http({
    ...config,
    ...options,
  }).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
