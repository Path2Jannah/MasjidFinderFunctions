/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
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
    console.info("Sending out Axois HTTPS request", `${config.baseURL}${config.url}`);
    return config;
  }

  private handleResponse(response: AxiosResponse) {
    return Promise.resolve(response);
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error("Resource not found (404)");
      } else {
        console.error("Axios response error status code:", error.response.status, error.response.request);
      }
    } else if (error.request) {
      console.error("Axios request error:", error.request);
    } else {
      console.error("Axios setup error:", error.message);
    }

    return error;
  }

  async get(
      url: string,
      headers?: Record<string, string>,
      querryParams?: Record<string, any>,
  ): Promise<AxiosResponse> {
    try {
      // Merge query parameters into the config object
      const mergedConfig: AxiosRequestConfig = {
        headers: headers,
        params: querryParams,
      };

      // Make the GET request with the merged configuration
      const response: AxiosResponse = await this.axiosInstance.get(url, mergedConfig);

      // Log the response data.
      console.debug(response.data.total);

      // Return the response
      return response;
    } catch (error) {
      // Handle errors
      console.error("Error in Axios GET request:", error);
      throw error;
    }
  }

  async post<T>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response;
  }
}

export default AxiosService;
