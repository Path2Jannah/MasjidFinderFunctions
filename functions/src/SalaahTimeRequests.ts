/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */

import {SalaahTime} from "./models/SalaahTime";
import {AxiosService} from "./services/AxiosService";
/**
 * Class SalaahTimeRequests
 */
export class SalaahTimeRequests {
  private axiosService = new AxiosService("https://api.aladhan.com/v1/timings/");

  public async getSalaahTimesDailyCapeTown(date: string): Promise<SalaahTime> {
    try {
      const response = await this.axiosService.get(
          `${date}?latitude=-33.9249&longitude=18.4241`
      );
      const responseData: SalaahTime = response.data;
      console.log("Retrived response: ", responseData);
      return responseData;
    } catch (error) {
      console.error("Error: ", error as string);
      throw error;
    }
  }
}

export default SalaahTimeRequests;
