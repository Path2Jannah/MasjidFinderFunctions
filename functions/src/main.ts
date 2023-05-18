import * as functions from "firebase-functions";
import axios from "axios";
import {SalaahTimesDaily} from "./models/SalaahTimesByCity";
// import {SalaahTimeCalendarByCity} from "./models/SalaahTimeCalendarByCity";
// import {Response} from "./models/Response";

// type Time = {
//   time: string;
// }

// type getTimeResponse = {
//   data: Time[];
// }

interface SalaahTimingParams {
  date: string;
  latitude: number;
  longitude: number;
  method: number;
}

async function fetchSalaahTimings(params: SalaahTimingParams) {
  try {
    const { date, latitude, longitude, method } = params;
    const response = await axios.get(`http://api.aladhan.com/v1/timings/${date}`, {
      params: {
        latitude,
        longitude,
        method
      }
    });
    const prayerTimings = response.data.data.timings;
    console.log(prayerTimings);
  } catch (error) {
    // Handle error
    console.error('Error fetching prayer timings:', error);
  }
}

export const getSalaahTiming = functions.https.onRequest(async (request, response) => {
  try {
    const params: SalaahTimingParams = {
      date: request.query.date as string,
      latitude: parseFloat(request.query.latitude as string),
      longitude: parseFloat(request.query.longitude as string),
      method: parseInt(request.query.method as string, 10)
    };

    const prayerTimings = await fetchSalaahTimings(params);

    response.json(prayerTimings);
  } catch (error) {
    console.error('Error fetching prayer timings:', error);
    response.status(500).send('An error occurred while fetching prayer timings.');
  }
});

/**
 * Initiates a api request
 * @param {string} country The selected country
 * @param {string} city The selected city
 * @return {any} Returns data or error
 */
// async function getSalaahTimes(country: string, city: string) {
//   try {
//     const {data, status} = await axios.get<SalaahTimesDaily>(
//         "http://api.aladhan.com/v1/timingsByCity", {
//           params: {
//             country: country,
//             city: city,
//             method: "8",
//           },
//         },
//     );
//     console.log("response status is:", status);

//     return data.data.timings;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       console.log("Error message: ", error.message);
//       return error.message;
//     } else {
//       console.log("unexpected error: ", error);
//       return "Unexpected error";
//     }
//   }
// }

// /**
//  * Initiates a api request
//  * @param {string} country The selected country
//  * @param {string} city The selected city
//  * @return {any} Returns data or error
//  */
// async function getSalaahTimesCalendar(country: string, city: string) {
//   try {
//     const {data, status} = await axios.get<SalaahTimeCalendarByCity>(
//         "http://api.aladhan.com/v1/calendarByCity", {
//           params: {
//             country: country,
//             city: city,
//             method: "8",
//           },
//         },
//     );
//     console.log("response status is:", status);

//     return data.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       console.log("Error message: ", error.message);
//       return error.message;
//     } else {
//       console.log("unexpected error: ", error);
//       return "Unexpected error";
//     }
//   }
// }

// /**
//  * Initiates a api request
//  * @param {string} country The selected country
//  * @param {string} city The selected city
//  * @return {any} Returns data or error
//  */
// async function getCurrentTime(country: string, city: string) {
//   try {
//     const {data, status} = await axios.get<getTimeResponse>(
//         "http://api.aladhan.com/v1/currentTime", {
//           params: {
//             zone: `${country}/${city}`,
//           },
//         },
//     );
//     console.log("response status is:", status);

//     return data.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       console.log("Error message: ", error.message);
//       return error.message;
//     } else {
//       console.log("unexpected error: ", error);
//       return "Unexpected error";
//     }
//   }
// }

// export const callSalaahTimeDailyonCall = functions.https.onCall(async (
//     data, context
// ) => {
//   const country = data.country;
//   const city = data.city;
//   return (await getSalaahTimes(country, city));
// });

// export const callSalaahTimeDaily = functions.https.onRequest(async (
//     request, response
// ) => {
//   const country = request.body.country;
//   const city = request.body.city;
//   response.send(await getSalaahTimes(country, city));
// });
