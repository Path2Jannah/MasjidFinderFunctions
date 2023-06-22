/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */

import {AxiosService} from "./services/AxiosService";
/**
 * Class SalaahTimeRequests
 */
export class SalaahTimeRequests {
  private axiosService = new AxiosService("https://api.aladhan.com/v1/timings/", null);

  public async getSalaahTimesDailyCapeTown(date: string): Promise<any> {
    this.axiosService.get(
        `${date}?latitude=-33.9249&longitude=18.4241`
    ).then((response: any) => {
      console.log("Retrived response: ", response);
      return response;
    })
        .catch((error: any) => {
          console.error("Error: ", error as string);
          throw error;
        });
  }
}

export default SalaahTimeRequests;
