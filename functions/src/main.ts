import * as functions from "firebase-functions";
import axios from "axios";
import admin from "firebase-admin";
import {Client, GeocodeResponse} from "@googlemaps/google-maps-services-js";

admin.initializeApp();
const googleMaps = new Client({});
const API_KEY = "AIzaSyBdZ1SEBOrlJWam8oXAUvJQgs6AGoyw7wY";

export const getCoordinates = functions.https.onRequest(async (req, res) => {
  const address = req.query.address;

  try {
    const response: GeocodeResponse = await googleMaps.geocode({
      params: {
        address: address as string,
        key: "AIzaSyBdZ1SEBOrlJWam8oXAUvJQgs6AGoyw7wY",
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
