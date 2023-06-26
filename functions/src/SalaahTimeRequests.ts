/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

import {PredefinedLocations} from "./models/PredefinedLocations";
import {SalaahTime} from "./models/SalaahTime";
import {AxiosService} from "./services/AxiosService";
/**
 * Class SalaahTimeRequests
 */
export class SalaahTimeRequests {
  private axiosService = new AxiosService("https://api.aladhan.com/v1/timings/");

  public async getSalaahTimesDaily(date: string, location: PredefinedLocations): Promise<SalaahTime> {
    try {
      const result = this.getLocationCoords(location);
      const response = await this.axiosService.get(
          `${date}?latitude=${result.latitude}&longitude=${result.longitude}`
      );
      const responseData: SalaahTime = response.data;
      console.log("Retrived response: ", responseData);
      return responseData;
    } catch (error) {
      console.error("Error: ", error as string);
      throw error;
    }
  }

  private getLocationCoords(location: PredefinedLocations) {
    let result: Coordinates;
    switch (location) {
      case PredefinedLocations.CAPE_TOWN:
        result = {
          latitude: "-33.9249",
          longitude: "18.4241",
        };
        break;
      default:
        result = {
          latitude: "1",
          longitude: "1",
        };
    }
    return result;
  }
}

interface Coordinates {
  latitude: string,
  longitude: string
}

export default SalaahTimeRequests;
