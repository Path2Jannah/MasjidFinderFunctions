import * as functions from "firebase-functions";
import axios from "axios";
import admin from "firebase-admin";
import {Client, GeocodeResponse} from "@googlemaps/google-maps-services-js";

admin.initializeApp();
const googleMaps = new Client({});

export const getCoordinates = functions.https.onRequest(async (req, res) => {
  const address = req.query.address;

  try {
    const response: GeocodeResponse = await googleMaps.geocode({
      params: {
        address: address as string,
        key: "AIzaSyCgK6O9xJIpjntal0ARJFm9noqxN4wHDXc",
      },
    });

    console.log("Response:", response);

    const {lat, lng} = response.data.results[0].geometry.location;

    res.send({lat, lng});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred");
  }
});

export const closestList = functions.https.onRequest(async (req, res) => {
  try {
    const data = await getJsonArray();
    const uniqueAreas = [...new Set(data.map((entry) => entry.area))];
    const uniqueAreaObj = {areas: uniqueAreas};
    const areaInLowercase = uniqueAreaObj.areas.map(
        (area:string) => area.toLowerCase());
    const resultJson: any = {};
    for (const entries of areaInLowercase) {
      const response = await googleMaps.geocode({
        params: {
          address: entries,
          key: "AIzaSyCgK6O9xJIpjntal0ARJFm9noqxN4wHDXc",
        },
      });
      const {lat, lng} = response.data.results[0].geometry.location;
      const areaData = {
        area: entries,
        lat: lat,
        lng: lng,
      };
      resultJson[entries] = areaData;
    }
    res.status(200).json(resultJson);
  } catch (error) {
    console.error("Error reading Firestore collection: ", error);
    res.status(500).send("Error reading Firestore collection");
  }
});

/**
 * Add JDoc
 * @return {Promise<admin.firestore.DocumentData[]>}
 */
async function getJsonArray(): Promise<admin.firestore.DocumentData[]> {
  try {
    // Read the collection from Firestore
    const collectionRef = admin.firestore().collection("masjid_cape_town");
    const snapshot = await collectionRef.get();
    const data = snapshot.docs.map((doc) => doc.data());
    return data;
  } catch (error) {
    console.error("Error reading Firestore collection:", error);
    throw error;
  }
}

// ****** TODO ******
// Use the function to read the collection
// Write a function that takes the JSON array and gets the area of each masjid.
// Confirm the area in the firestore database
// Get the geolocation data of each area
// Store that geolocation data of each area in a realtime database
// Write a function that takes the geolocation data of the user.
// Use this data to then determine which area the user is in.
// Write a function that will collect all the
// masjids in the users area from the JSON array
// Determine the order of the location.

export const getAddress = functions.https.onRequest(async (req, res) => {
  const placeName = req.query.place as string;

  try {
    // Use the Geocoding API to get the address of the place
    const response: GeocodeResponse = await googleMaps.geocode({
      params: {
        address: placeName,
        key: "AIzaSyCgK6O9xJIpjntal0ARJFm9noqxN4wHDXc",
      },
    });

    // Extract the formatted address from the response
    const address = response.data.results[0].formatted_address;

    res.send({address});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred");
  }
});

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
    const salaahTimings = response.data.data.timings;
    console.log(salaahTimings);
  } catch (error) {
    // Handle error
    console.error("Error fetching prayer timings:", error);
  }
}

exports.readFirestoreCollection =
functions.https.onRequest(
    async (req, res) => {
      try {
        const collectionName = req.query.collection as string;
        // Assuming the input is passed in the request body

        // Read the collection from Firestore
        const collectionRef = admin.firestore().collection(collectionName);
        const snapshot = await collectionRef.get();
        const data = snapshot.docs.map((doc) => doc.data());
        const areas = data.map((entry) => entry.area);

        console.log(areas);
        res.status(200).json(data);
      } catch (error) {
        console.error("Error reading Firestore collection:", error);
        res.status(500).send("Error reading Firestore collection");
      }
    });

export const getSalaahTiming = functions.https.onRequest(
    async (request, response) => {
      try {
        const params: SalaahTimingParams = {
          date: request.query.date as string,
          latitude: parseFloat(request.query.latitude as string),
          longitude: parseFloat(request.query.longitude as string),
          method: parseInt(request.query.method as string, 3),
        };

        const salaahTimings = await fetchSalaahTimings(params);

        response.json(salaahTimings);
      } catch (error) {
        console.error("Error fetching prayer timings:", error);
        response.status(500).send(
            "An error occurred while fetching prayer timings."
        );
      }
    });
