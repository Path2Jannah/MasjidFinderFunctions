/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */

import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
/**
 * AxiosService
 */
export class AxiosService {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 5000,
    });

    this.axiosInstance.interceptors.request.use(
        this.handleRequest,
        (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
        this.handleResponse,
        this.handleError
    );
  }

  private handleRequest(config: AxiosRequestConfig) {
    console.log("Sending out Axois HTTPS request", config.baseURL);
    console.log("Full url should be defined as: ", config.baseURL, config.url);
    return config;
  }

  private handleResponse(response: AxiosResponse) {
    console.log("Axios response data: ", response.data);
    return response.data;
  }

  private handleError(response: AxiosResponse) {
    console.log("Axios response error: ", response);
    return response.data;
  }

  public async get(
      url: string,
      config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    console.log("Axios request URL: ", url);
    const response = await this.axiosInstance.get(url, config);
    return response.data;
  }

  public async post<T>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response;
  }
}

export default AxiosService;
