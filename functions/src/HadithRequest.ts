/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

import {AxiosService} from "./services/AxiosService";
import {AxiosRequestConfig} from "axios";

export class HadithRequest {
  private axiosService = new AxiosService("https://api.sunnah.com/v1/");
  private headers: AxiosRequestConfig = {
    "X-API-Key": "SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk",
  };

  public async getHadith(): Promise<HadithCollection> {
    try {
      const res = await this.axiosService.get(
          "hadiths/random",
          this.headers,
      );
      return res.data;
    } catch (error) {
      console.error("Error: ", error as string);
      throw error;
    }
  }
}
