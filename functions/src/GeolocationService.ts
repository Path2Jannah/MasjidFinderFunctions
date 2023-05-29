import {Client, GeocodeResponse} from "@googlemaps/google-maps-services-js";
/**
 * This class is used for geolocation features.
 */
export class GeolocationService {
  private apiKey: string;
  private client: Client;
  private timeout = 5000;

  /**
   * Constructor
   * @param {string} apiKey
   * @param {Client} client
   */
  constructor(apiKey: string, client: Client) {
    this.apiKey = apiKey;
    this.client = client;
  }
  /**
 * This function takes in coordiantes and returns an address
 * @param {number} latitude
 * @param {number} longitude
 * @return {Promise<string>} string
 */
  async getAddress(latitude: number, longitude: number): Promise<string> {
    try {
      const response: GeocodeResponse = await this.client.reverseGeocode({
        params: {
          key: this.apiKey,
          latlng: `${latitude},${longitude}`,
        },
        timeout: this.timeout,
      });
      if (response.status == 200 && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      } else {
        throw new Error("Unable to retrieve address.");
      }
    } catch (error) {
      throw new Error("Geocoding request failed.");
    }
  }

  /**
 * Gets coordinates
 * @param {string} address
 * @return {Promise}
 */
  async getCoordinates(address: string): Promise<
  {latitude:number;longitude:number}> {
    try {
      const response: GeocodeResponse = await this.client.geocode({
        params: {
          key: this.apiKey,
          address: address,
        },
        timeout: this.timeout,
      });
      if (response.status == 200 && response.data.results.length > 0) {
        const {lat, lng} = response.data.results[0].geometry.location;
        return {latitude: lat, longitude: lng};
      } else {
        throw new Error("Unable to retrieve coordinates.");
      }
    } catch (error) {
      throw new Error("Geocoding request failed.");
    }
  }
}
