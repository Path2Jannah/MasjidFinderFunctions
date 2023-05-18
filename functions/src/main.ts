import * as functions from "firebase-functions";
import axios from "axios";

interface SalaahTimingParams {
  date: string;
  latitude: number;
  longitude: number;
  method: number;
}
/**
 * AddJdoc
 * @param {SalaahTimingParams} params
 */
async function fetchSalaahTimings(params: SalaahTimingParams) {
  try {
    const {date, latitude, longitude, method} = params;
    const response = await axios.get(`http://api.aladhan.com/v1/timings/${date}`, {
      params: {
        latitude,
        longitude,
        method,
      },
    });
    const prayerTimings = response.data.data.timings;
    console.log(prayerTimings);
  } catch (error) {
    // Handle error
    console.error("Error fetching prayer timings:", error);
  }
}

export const getSalaahTiming = functions.https.onRequest(
    async (request, response) => {
      try {
        const params: SalaahTimingParams = {
          date: request.query.date as string,
          latitude: parseFloat(request.query.latitude as string),
          longitude: parseFloat(request.query.longitude as string),
          method: parseInt(request.query.method as string, 3),
        };

        const prayerTimings = await fetchSalaahTimings(params);

        response.json(prayerTimings);
      } catch (error) {
        console.error("Error fetching prayer timings:", error);
        response.status(500).send(
            "An error occurred while fetching prayer timings."
        );
      }
    });
