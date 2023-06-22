/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */

import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
/**
 * AxiosService
 */
export class AxiosService {
  private axiosInstance: AxiosInstance;
  private apiKey: string | null;

  constructor(baseURL: string, apiKey: string | null) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 5000,
    });
    this.apiKey = apiKey;

    this.axiosInstance.interceptors.request.use(
        this.handleRequest,
        (error: any) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
        this.handleResponse,
        this.handleError
    );
  }

  private handleRequest(config: AxiosRequestConfig) {
    if (this.apiKey != null) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${this.apiKey}`;
    }
    return config;
  }

  private handleResponse(response: AxiosResponse) {
    console.log("Axios response data: ", response.data);
    return response.data;
  }

  private handleError(response: AxiosResponse) {
    console.log("Axios response error: ", response.data);
    return response.data;
  }

  public async get<T>(
      url: string,
      config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  public async post<T>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }
}

export default AxiosService;
