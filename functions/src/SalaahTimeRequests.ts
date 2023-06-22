/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */

import {AxiosService} from "./services/AxiosService";
/**
 * Class SalaahTimeRequests
 */
export class SalaahTimeRequests {
  private axiosService = new AxiosService("https://api.aladhan.com/v1/timings/", null);

  public async getSalaahTimesDailyCapeTown(date: string): Promise<unknown> {
    return this.axiosService.get(
        `${date}?latitude=-33.9249&longitude=18.4241`
    ).then((response: unknown) => {
      console.log("Retrived response: ", response);
    })
        .catch((error: unknown) => {
          console.error("Error: ", error as string);
          throw error;
        });
  }
}

export default SalaahTimeRequests;
