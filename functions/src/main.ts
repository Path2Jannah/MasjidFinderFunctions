/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

import * as functions from "firebase-functions";
// import axios from "axios";
import * as admin from "firebase-admin";
// import {Client, GeocodeResponse} from "@googlemaps/google-maps-services-js";
// import {GeolocationService} from "./services/GeolocationService";
// import {AreaGeolocation} from "./models/AreaGeolocation";
import {FirestoreService} from "./services/FirestoreService";
import {RealtimeDatabaseService} from "./services/RealtimeDatabaseService";
import {SalaahTimeRequests} from "./SalaahTimeRequests";
import {SalaahTime} from "./models/SalaahTime";
import {PredefinedLocations} from "./models/PredefinedLocations";
import {DateTimeHelper} from "./helper/DateTimeHelper";
import {Format, Locale} from "./helper/DateEnums";
import {createUniqueID} from "./helper/DateLocationID";
// import {HadithRequest} from "./HadithRequest";
import {Storage, Bucket} from "@google-cloud/storage";
import {error} from "console";
import {haversineDistance} from "./helper/DistanceCalculation";

admin.initializeApp();
// const googleMaps = new Client();
const realtimeDatabase = admin.database();
const firestoreDatabase = new admin.firestore.Firestore();
const dateTimeHelper = new DateTimeHelper();
const storage: Bucket = new Storage().bucket("gs://masjidfinder-bb912.appspot.com");

const salaahTimeRequests =
new SalaahTimeRequests();

// const hadithRequest =
// new HadithRequest();

const successResponse = {
  status: "success",
};

function getErrorResponse(error: string): { status: string; message: string } {
  return {
    status: "error",
    message: error,
  };
}

// const geolocationService =
// new GeolocationService("AIzaSyCgK6O9xJIpjntal0ARJFm9noqxN4wHDXc", googleMaps);

// const firestoreService =
// new FirestoreService(firestoreDatabase, "masjid_cape_town");

const userdB =
new FirestoreService(firestoreDatabase, "user_registry");

const masjiddB =
new FirestoreService(firestoreDatabase, "masjid_cape_town");

const hadithCollectionsdB =
new FirestoreService(firestoreDatabase, "/HadithCollection/ddfbd6e6-ecfa-4081-8bdd-adcf6335bcfc/HadithCompilers");

const realtimeDatabaseService =
new RealtimeDatabaseService(realtimeDatabase);

/**
 * Admin level API that is triggered on a Google cloud schedular.
 *
 * Pulls in the Salaah times from the external API.
 * Then populates the Realtime database with the response from the external API.
 */
export const SalaahTimesDailyCapeTown =
functions.https.onRequest(async (_req, res) => {
  const currentDate = dateTimeHelper.getDate(Locale.SOUTH_AFRICA, "Africa/Johannesburg", Format.API_DATE);
  const dateLocationID = createUniqueID(currentDate, "CT_ZA");
  const timesPath = "/CapeTown/Daily/Times";
  const datePath = "/CapeTown/Daily/Dates";
  const idPath = "/CapeTown/Daily/";
  salaahTimeRequests.getSalaahTimesDaily(currentDate, PredefinedLocations.CAPE_TOWN).
      then(async (response:SalaahTime) => {
        console.log("Success: ", response);
        const salaahTimes = response.data.timings;
        const dates = response.data.date;
        const id = {dateLocationID};
        realtimeDatabaseService.addData(timesPath, salaahTimes);
        realtimeDatabaseService.addData(datePath, dates);
        realtimeDatabaseService.addData(idPath, id);
        res.status(200).send(successResponse + "IDToken: " + dateLocationID);
      })
      .catch((error) => {
        console.log("Fatal error: ", error as string);
        res.status(400).send(getErrorResponse(error as string));
      });
});

type myResults = {
  name: string,
  distance: number
}

export const getMasjidList =
functions.https.onRequest(async (req, res) => {
  const userLat = req.body.lat;
  const userLong = req.body.long;

  if (!userLat || !userLong) {
    res.status(400).send(getErrorResponse("INVALID REQUEST"));
  }

  const snapshot = await masjiddB.getCollection();
  const results: myResults[] = [];

  snapshot.forEach((doc) => {
    const geoPoint = doc["co-ord"];
    if (geoPoint != null) {
      const latitude = geoPoint.latitude as number;
      const longitude = geoPoint.longitude as number;
      // Use latitude and longitude as needed

      const distance = haversineDistance(userLat, userLong, latitude, longitude);

      results.push({
        name: doc.masjid_name,
        distance: distance,
      });
    } else {
      // Handle the case where the GeoPoint is null
      console.log("No value");
    }
  });

  const sortedResults = results.sort((a, b) => a.distance - b.distance);

  res.status(200).send(sortedResults);
});

interface HadithCollection {
  id: number
  name: string,
  title: {
      eng: string,
      ar: string,
  }
  shortIntro: string,
  totalHadith: number
}

interface HadithCollectionJson {
  listId: string,
  date: string,
  data: [HadithCollection]
}

interface HadithJson {
  id: string,
  chapterId: string,
  chapterTitle: string,
  chapterNumber: string,
  bookNumber: number,
  hadithNumber: string,
  text: {
    english: string,
    arabic: string,
  }
}

interface HadithBooksJson {
  id: number,
  bookNumber: number,
  bookName: {
    eng: string,
    ar: string,
  },
  numberOfHadith: number,
  hadithStartNumber: number,
  hadithEndNumber: number,
}

export const saveHadithCollections =
functions.https.onRequest(async (req, res) => {
  const fileName = "hadith_collections.json";
  console.log(`Looking for ${fileName}`);
  const file = storage.file(fileName);

  const [fileData] = (await file.download());

  // Parse the JSON data
  try {
    const jsonData : HadithCollectionJson = JSON.parse(fileData.toString());
    jsonData.data.forEach(async (hadith: HadithCollection) => {
      const documentObject = {
        name: hadith.name,
        short_intro: hadith.shortIntro,
        title: hadith.title,
        total_hadith: hadith.totalHadith,
      };

      const collectionId: string = hadith.id.toString();

      await hadithCollectionsdB.addDocumentWithID(collectionId, documentObject);
    });
    console.log(jsonData); // Your JSON object
    res.send("Success").status(200);
  } catch (err) {
    console.error("Error parsing JSON:", err);
    res.send(error.toString()).status(401);
  }
});

export const saveHadithBooks = functions.https.onRequest(async (req, res) => {
  try {
    const fileName = "hadith_collections.json";
    const file = storage.file(fileName);
    console.log(`Looking for ${fileName}`);
    const [fileData] = await file.download();
    const jsonData: HadithCollectionJson = JSON.parse(fileData.toString());

    console.log(jsonData.date);

    for (const hadith of jsonData.data) {
      const collectionId: string = hadith.id.toString();
      if (collectionId === "7") {
        // Ignore collection with ID 7
        continue;
      }

      const hadithBooksFileName = `${hadith.name}_books.json`;
      console.log(`Processing books for collection: ${hadith.title.eng}`);
      const booksFile = storage.file(hadithBooksFileName);
      const [booksFileData] = await booksFile.download();
      const booksJsonData: HadithBooksJson[] = JSON.parse(booksFileData.toString());

      const firebaseCollection = new FirestoreService(firestoreDatabase, `/HadithCollection/ddfbd6e6-ecfa-4081-8bdd-adcf6335bcfc/HadithCompilers/${collectionId}/Books`);

      for (const books of booksJsonData) {
        const documentObject = {
          book_name: books.bookName,
          hadith_end: books.hadithEndNumber,
          hadith_start: books.hadithStartNumber,
          num_of_hadith: books.numberOfHadith,
        };

        if (books.bookNumber == null) {
          continue;
        }

        const bookId: string = books.bookNumber.toString();

        await firebaseCollection.addDocumentWithID(bookId, documentObject);
        console.log(`Added document for book ${bookId}`);
      }
    }
    res.send("Success").status(200);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

export const getHadithBooks =
functions.https.onRequest(async (req, res) => {
  try {
    const collectionId = req.body.collectionId;
    const bookNumber = req.body.bookNumber;
    const hadithData: Hadith[] = [];
    if (bookNumber == null) {
      const firebaseCollection = new FirestoreService(firestoreDatabase, `/HadithCollection/ddfbd6e6-ecfa-4081-8bdd-adcf6335bcfc/HadithCompilers/${collectionId}/Books`);
      const numberOfBooks = await firebaseCollection.getBookNumbers(collectionId);
      numberOfBooks.forEach(async (id) => {
        // Id can be used as the book number.
        const allHadithInBook = await getHadithData(collectionId, id);
        allHadithInBook.forEach((hadith) => {
          hadithData.push(hadith);
        });
      });
    } else {
      const allHadithInBook = getHadithData(collectionId, bookNumber);
      (await allHadithInBook).forEach((hadith) => {
        hadithData.push(hadith);
      });
    }
    res.status(200).send(hadithData);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).send("Error retriving from Firebase Storage.");
  }
});

export const addBukhariHadith = functions.https.onRequest(async (req, res) => {
  try {
    for (let i = 1; i <= 97; i++) {
      const fileName = `Hadith Bukhari/bukhari_book${i}_hadiths.json`;
      console.log(`Looking for ${fileName}`);

      const file = storage.file(fileName);
      const [exists] = await file.exists();

      if (!exists) {
        console.log(`File not found: ${fileName}`);
        continue; // Move to the next iteration
      }

      console.log(`File found: ${fileName}`);

      const [fileData] = await file.download();
      const jsonData: HadithJson[] = JSON.parse(fileData.toString());

      console.log(jsonData);

      await processHadithData(1, jsonData, i);
      console.log(`Hadith data processed for book ${i}`);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const addMuslimHadith = functions.https.onRequest(async (req, res) => {
  try {
    for (let i = 1; i <= 56; i++) {
      const fileName = `Hadith Muslim/muslim_book${i}_hadiths.json`;
      console.log(`Looking for ${fileName}`);

      const file = storage.file(fileName);
      const [exists] = await file.exists();

      if (!exists) {
        console.log(`File not found: ${fileName}`);
        continue; // Move to the next iteration
      }

      console.log(`File found: ${fileName}`);

      const [fileData] = await file.download();
      const jsonData: HadithJson[] = JSON.parse(fileData.toString());

      await processHadithData(2, jsonData, i);
      console.log(`Hadith data processed for book ${i}`);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const addNasaiHadith = functions.https.onRequest(async (req, res) => {
  try {
    for (let i = 1; i <= 51; i++) {
      const fileName = `Hadith Nasai/nasai_book${i}_hadiths.json`;
      console.log(`Looking for ${fileName}`);

      const file = storage.file(fileName);
      const [exists] = await file.exists();

      if (!exists) {
        console.log(`File not found: ${fileName}`);
        continue; // Move to the next iteration
      }

      console.log(`File found: ${fileName}`);

      const [fileData] = await file.download();
      const jsonData: HadithJson[] = JSON.parse(fileData.toString());

      console.log(jsonData);

      await processHadithData(3, jsonData, i);
      console.log(`Hadith data processed for book ${i}`);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const addAbudawudHadith = functions.https.onRequest(async (req, res) => {
  try {
    for (let i = 1; i <= 43; i++) {
      const fileName = `Hadith Abudawud/abudawud_book${i}_hadiths.json`;
      console.log(`Looking for ${fileName}`);

      const file = storage.file(fileName);
      const [exists] = await file.exists();

      if (!exists) {
        console.log(`File not found: ${fileName}`);
        continue; // Move to the next iteration
      }

      console.log(`File found: ${fileName}`);

      const [fileData] = await file.download();
      const jsonData: HadithJson[] = JSON.parse(fileData.toString());

      console.log(jsonData);

      await processHadithData(4, jsonData, i);
      console.log(`Hadith data processed for book ${i}`);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const addIbnmajahHadith = functions.https.onRequest(async (req, res) => {
  try {
    for (let i = 1; i <= 37; i++) {
      const fileName = `Hadith Ibnmajah/ibnmajah_book${i}_hadiths.json`;
      console.log(`Looking for ${fileName}`);

      const file = storage.file(fileName);
      const [exists] = await file.exists();

      if (!exists) {
        console.log(`File not found: ${fileName}`);
        continue; // Move to the next iteration
      }

      console.log(`File found: ${fileName}`);

      const [fileData] = await file.download();
      const jsonData: HadithJson[] = JSON.parse(fileData.toString());

      console.log(jsonData);

      await processHadithData(6, jsonData, i);
      console.log(`Hadith data processed for book ${i}`);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const addTirmidhiHadith = functions.https.onRequest(async (req, res) => {
  try {
    for (let i = 1; i <= 49; i++) {
      const fileName = `Hadith Tirmidhi/tirmidhi_book${i}_hadiths.json`;
      console.log(`Looking for ${fileName}`);

      const file = storage.file(fileName);
      const [exists] = await file.exists();

      if (!exists) {
        console.log(`File not found: ${fileName}`);
        continue; // Move to the next iteration
      }

      console.log(`File found: ${fileName}`);

      const [fileData] = await file.download();
      const jsonData: HadithJson[] = JSON.parse(fileData.toString());

      console.log(jsonData);

      await processHadithData(5, jsonData, i);
      console.log(`Hadith data processed for book ${i}`);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const addAhmadHadith = functions.https.onRequest(async (req, res) => {
  try {
    for (let i = 1; i <= 7; i++) {
      const fileName = `Hadith Ahmad/ahmad_book${i}_hadiths.json`;
      console.log(`Looking for ${fileName}`);

      const file = storage.file(fileName);
      const [exists] = await file.exists();

      if (!exists) {
        console.log(`File not found: ${fileName}`);
        continue; // Move to the next iteration
      }

      console.log(`File found: ${fileName}`);

      const [fileData] = await file.download();
      const jsonData: HadithJson[] = JSON.parse(fileData.toString());

      console.log(jsonData);

      await processHadithData(8, jsonData, i);
      console.log(`Hadith data processed for book ${i}`);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const addFortyHadith = functions.https.onRequest(async (req, res) => {
  try {
    for (let i = 1; i <= 3; i++) {
      const fileName = `Hadith Forty/forty_book${i}_hadiths.json`;
      console.log(`Looking for ${fileName}`);

      const file = storage.file(fileName);
      const [exists] = await file.exists();

      if (!exists) {
        console.log(`File not found: ${fileName}`);
        continue; // Move to the next iteration
      }

      console.log(`File found: ${fileName}`);

      const [fileData] = await file.download();
      const jsonData: HadithJson[] = JSON.parse(fileData.toString());

      console.log(jsonData);

      await processHadithData(9, jsonData, i);
      console.log(`Hadith data processed for book ${i}`);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const addRiyadussalihinHadith = functions.https.onRequest(async (req, res) => {
  try {
    for (let i = 1; i <= 19; i++) {
      const fileName = `Hadith Riyadussalihin/riyadussalihin_book${i}_hadiths.json`;
      console.log(`Looking for ${fileName}`);

      const file = storage.file(fileName);
      const [exists] = await file.exists();

      if (!exists) {
        console.log(`File not found: ${fileName}`);
        continue; // Move to the next iteration
      }

      console.log(`File found: ${fileName}`);

      const [fileData] = await file.download();
      const jsonData: HadithJson[] = JSON.parse(fileData.toString());

      console.log(jsonData);

      await processHadithData(10, jsonData, i);
      console.log(`Hadith data processed for book ${i}`);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const addMishkatHadith = functions.https.onRequest(async (req, res) => {
  try {
    for (let i = 1; i <= 24; i++) {
      const fileName = `Hadith Mishkat/mishkat_book${i}_hadiths.json`;
      console.log(`Looking for ${fileName}`);

      const file = storage.file(fileName);
      const [exists] = await file.exists();

      if (!exists) {
        console.log(`File not found: ${fileName}`);
        continue; // Move to the next iteration
      }

      console.log(`File found: ${fileName}`);

      const [fileData] = await file.download();
      const jsonData: HadithJson[] = JSON.parse(fileData.toString());

      console.log(jsonData);

      await processHadithData(11, jsonData, i);
      console.log(`Hadith data processed for book ${i}`);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const addAdabHadith = functions.https.onRequest(async (req, res) => {
  try {
    for (let i = 1; i <= 57; i++) {
      const fileName = `Hadith Adab/adab_book${i}_hadiths.json`;
      console.log(`Looking for ${fileName}`);

      const file = storage.file(fileName);
      const [exists] = await file.exists();

      if (!exists) {
        console.log(`File not found: ${fileName}`);
        continue; // Move to the next iteration
      }

      console.log(`File found: ${fileName}`);

      const [fileData] = await file.download();
      const jsonData: HadithJson[] = JSON.parse(fileData.toString());

      console.log(jsonData);

      await processHadithData(12, jsonData, i);
      console.log(`Hadith data processed for book ${i}`);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const addShamailHadith = functions.https.onRequest(async (req, res) => {
  try {
    for (let i = 1; i <= 56; i++) {
      const fileName = `Hadith Shamail/shamail_book${i}_hadiths.json`;
      console.log(`Looking for ${fileName}`);

      const file = storage.file(fileName);
      const [exists] = await file.exists();

      if (!exists) {
        console.log(`File not found: ${fileName}`);
        continue; // Move to the next iteration
      }

      console.log(`File found: ${fileName}`);

      const [fileData] = await file.download();
      const jsonData: HadithJson[] = JSON.parse(fileData.toString());

      console.log(jsonData);

      await processHadithData(13, jsonData, i);
      console.log(`Hadith data processed for book ${i}`);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const addBulughHadith = functions.https.onRequest(async (req, res) => {
  try {
    for (let i = 1; i <= 14; i++) {
      const fileName = `Hadith Bulugh/bulugh_book${i}_hadiths.json`;
      console.log(`Looking for ${fileName}`);

      const file = storage.file(fileName);
      const [exists] = await file.exists();

      if (!exists) {
        console.log(`File not found: ${fileName}`);
        continue; // Move to the next iteration
      }

      console.log(`File found: ${fileName}`);

      const [fileData] = await file.download();
      const jsonData: HadithJson[] = JSON.parse(fileData.toString());

      console.log(jsonData);

      await processHadithData(14, jsonData, i);
      console.log(`Hadith data processed for book ${i}`);
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

async function processHadithData(scholarId: number, hadithData: HadithJson[], bookNumber: number) {
  const firebaseCollection = new FirestoreService(firestoreDatabase, `/HadithCollection/ddfbd6e6-ecfa-4081-8bdd-adcf6335bcfc/HadithCompilers/${scholarId}/Books/${bookNumber}/hadith`);

  const batch = firestoreDatabase.batch();

  hadithData.forEach((hadith) => {
    const documentObject = {
      chapter_id: hadith.chapterId,
      chapter_num: hadith.chapterNumber,
      chapter_title: hadith.chapterTitle,
      text: {
        ar: hadith.text.arabic,
        eng: hadith.text.english,
      },
    };

    const hadithNumberAsDocumentString = hadith.hadithNumber.toString().replace(/\//g, "_");

    const documentRef = firebaseCollection.getNewDocumentRef(hadithNumberAsDocumentString);
    batch.set(documentRef, documentObject);
  });

  await batch.commit();
}

async function getHadithData(collectionId: number, bookNumber: number): Promise<Hadith[]> {
  const firebaseCollection = new FirestoreService(firestoreDatabase, `/HadithCollection/ddfbd6e6-ecfa-4081-8bdd-adcf6335bcfc/HadithCompilers/${collectionId}/Books/${bookNumber}/hadith`);
  return firebaseCollection.getHadithCollectionWithId(collectionId, bookNumber);
}

export const getHadithBookListFromStorage =
functions.https.onRequest(async (req, res) => {
  try {
    const fileName = "muslim_books.json";
    console.log(`Looking for ${fileName}`);
    const file = storage.file(fileName);

    const [fileData] = await file.download();

    res.status(200).send(fileData);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).send("Error retriving from Firebase Storage.");
  }
});

export const getHadithCollectionsFromStorage =
functions.https.onRequest(async (req, res) => {
  try {
    const fileName = "hadith_collections.json";
    console.log(`Looking for ${fileName}`);
    const file = storage.file(fileName);

    const [fileData] = await file.download();

    res.status(200).send(fileData);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).send("Error retriving from Firebase Storage.");
  }
});

// export const SalaahTimesDaily =
// functions.https.onRequest(async (req, res) => {
//   if (isSalaahTimeLocationRequestBody(req.body)) {
//     const requestBody = req.body;
//     if (requestBody.location == undefined) {
//       res.status(400).send(getErrorResponse("INVALID LOCATION"));
//     } else {
//       if (requestBody.source == "external") {
//         const salaahTimes = await salaahTimeRequests.getSalaahTimesDaily(dateTimeHelper.getDate(Locale.SOUTH_AFRICA, Timezone.GMT_PLUS_2, Format.API_DATE), PredefinedLocations.CAPE_TOWN);
//         res.status(200).send({successResponse, timings: salaahTimes.data.timings, date: salaahTimes.data.date.gregorian.date});
//       } else if (requestBody.source == "internal") {
//         const salaahTimes = await realtimeDatabaseService.getValue("/CapeTown/Daily/Times");
//         const date = await realtimeDatabaseService.getValue("/CapeTown/Daily/Dates/gregorian/date");
//         res.status(200).send({successResponse, timings: salaahTimes, date: date});
//       } else {
//         res.status(400).send(getErrorResponse("INVALID SOURCE"));
//       }
//     }
//   } else {
//     res.status(400).send(getErrorResponse("INVALID REQUEST"));
//   }
// });

// export const SalaahTimesDaily =
// functions.https.onRequest(async (req, res) => {
//   if (isSalaahTimeLocationRequestBody(req.body)) {
//     const requestBody = req.body;
//     if (requestBody.location == undefined) {
//       res.status(400).send(getErrorResponse("INVALID LOCATION"));
//     } else {
//       if (requestBody.source == "external") {
//         const salaahTimes = await salaahTimeRequests.getSalaahTimesDaily(dateTimeHelper.getDate(Locale.SOUTH_AFRICA, Timezone.GMT_PLUS_2, Format.API_DATE), PredefinedLocations.CAPE_TOWN);
//         res.status(200).send({successResponse, timings: salaahTimes.data.timings, date: salaahTimes.data.date.gregorian.date});
//       } else if (requestBody.source == "internal") {
//         const salaahTimes = await realtimeDatabaseService.getValue("/CapeTown/Daily/Times");
//         const date = await realtimeDatabaseService.getValue("/CapeTown/Daily/Dates/gregorian/date");
//         res.status(200).send({successResponse, timings: salaahTimes, date: date});
//       } else {
//         res.status(400).send(getErrorResponse("INVALID SOURCE"));
//       }
//     }
//   } else {
//     res.status(400).send(getErrorResponse("INVALID REQUEST"));
//   }
// });

// Function to validate the request body
// function validateDataStructure(data: any, expectedData: SalaahTimeLocationRequest): boolean {
//   // Check if the data is an object
//   if (typeof data !== "object" || data === null) {
//     return false;
//   }

//   // Check if all expected fields are present and have the correct types
//   for (const key in expectedData) {
//     if (!(key in data) || typeof data[key] !== typeof expectedData[key as keyof typeof expectedData]) {
//       return false;
//     }
//   }

//   return true;
// }

/**
 * Inital setup of the user node in the firestore database.
 * This function will be triggered when a new user is added to the Firebase Authentication list.
 * Should have a function that verifies these fields and make it easier for new fields to be added to existing users.
 */
export const CreateNewUserNode = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
  const {uid, email, displayName} = user;
  const data = {
    uid: uid,
    email: email,
    displayName: displayName,
    salaahHistory: {},
  };

  await userdB.addDocumentWithID(data.uid, data);
});

/**
 * This removes a user node in the Firestore database when a user is removed from the Firebase Authentication list.
 * Currently a full deletion of a user.
 */
export const DeleteUserNode = functions.auth.user().onDelete(async (user: admin.auth.UserRecord) => {
  await userdB.deleteDocument(user.uid);
});

export const getHadithBookFromStorage =
functions.https.onRequest(async (req, res) => {
  try {
    const bookNumber = req.body.bookNumber;
    const fileName = `Hadith Muslim/muslim_book${bookNumber}_hadiths.json`;
    console.log(`Looking for ${fileName}`);
    const file = storage.file(fileName);

    const [fileData] = await file.download();

    res.status(200).send(fileData);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).send("Error retriving from Firebase Storage.");
  }
});

// export const writeLocationGeocodeTableToRealtimeDatabase =
// functions.https.onRequest(async (req, res) => {
//   const data = await getAreaList();
//   const result: { areas: AreaGeolocation[] } = {areas: []};
//   await Promise.all(
//       data.map(async (areaLocation) => {
//         try {
//           const geocode = await geolocationService.getCoordinates(areaLocation);
//           const resultObject: AreaGeolocation = {
//             area: areaLocation,
//             lat: geocode.latitude,
//             long: geocode.longitude,
//           };
//           result.areas.push(resultObject);
//         } catch (error) {
//           console.error(error as string);
//           const errorObject: AreaGeolocation = {
//             area: areaLocation,
//             lat: 0,
//             long: 0,
//           };
//           result.areas.push(errorObject);
//         }
//       })
//   );
//   realtimeDatabaseService.setValue("/", result);
//   res.status(200).send("Success");
// });

// async function AreaGeolocationTable(): Promise<{areas: AreaGeolocation[]}> {
//   const areaInLowercase = await getAreaList();
//   const resultJson: { areas: AreaGeolocation[] } = {areas: []};
//   await Promise.all(
//       areaInLowercase.map(async (str) => {
//         try {
//           const location = await geolocationService.getCoordinates(str);
//           const areaJson: AreaGeolocation = {
//             area: str,
//             lat: location.latitude,
//             long: location.longitude,
//           };
//           resultJson.areas.push(areaJson);
//         } catch (error) {
//           console.error(error as string);
//           const areaJson: AreaGeolocation = {
//             area: str,
//             lat: 1,
//             long: 1,
//           };
//           resultJson.areas.push(areaJson);
//         }
//       })
//   );
//   return resultJson;
// }

// export const constructAreaGeolocationTable = functions.https.onRequest(
//     async (req, res) => {
//       const areaInLowercase = await getAreaList();
//       const resultJson: { areas: AreaGeolocation[] } = {areas: []};
//       await Promise.all(
//           areaInLowercase.map(async (str) => {
//             try {
//               const location = await geolocationService.getCoordinates(str);
//               const areaJson: AreaGeolocation = {
//                 area: str,
//                 lat: location.latitude,
//                 long: location.longitude,
//               };
//               resultJson.areas.push(areaJson);
//             } catch (error) {
//               console.error(error as string);
//               const areaJson: AreaGeolocation = {
//                 area: str,
//                 lat: 1,
//                 long: 1,
//               };
//               resultJson.areas.push(areaJson);
//             }
//           })
//       );
//       res.json(resultJson);
//     });

// export const getCoordinates = functions.https.onRequest(async (req, res) => {
//   const address = req.query.address;

//   try {
//     const response: GeocodeResponse = await googleMaps.geocode({
//       params: {
//         address: address as string,
//         key: "AIzaSyCgK6O9xJIpjntal0ARJFm9noqxN4wHDXc",
//       },
//     });

//     console.log("Response:", response);

//     const {lat, lng} = response.data.results[0].geometry.location;

//     res.send({lat, lng});
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send("An error occurred");
//   }
// });

// /**
//  *
//  * @return {Promise<string[]>}
//  */
// async function getAreaList(): Promise<string[]> {
//   try {
//     const data = await firestoreService.getCollection();
//     const uniqueAreas = [...new Set(data.map((entry) => entry.area))];
//     const uniqueAreaObj = {areas: uniqueAreas};
//     const areaInLowercase = uniqueAreaObj.areas.map(
//         (area:string) => area.toLowerCase());
//     return areaInLowercase;
//   } catch (error) {
//     throw new Error("Error fetching firestore collection list");
//   }
// }

// async function getUniqueListOfAreas(): Promise<string[]> {
//   try {
//     const data = await firestoreService.getCollection();
//     const uniqueAreas = [...new Set(data.map((entry) => entry.area))];
//     const uniqueAreaObj = {areas: uniqueAreas};
//     const areaInLowercase = uniqueAreaObj.areas.map(
//         (area:string) => area.toLowerCase());
//     return areaInLowercase;
//   } catch (error) {
//     throw new Error("Error fetching firestore collection list");
//   }
// }

// export const closestList = functions.https.onRequest(async (req, res) => {
//   try {
//     const data = await firestoreService.getCollection();
//     const uniqueAreas = [...new Set(data.map((entry) => entry.area))];
//     const uniqueAreaObj = {areas: uniqueAreas};
//     const areaInLowercase = uniqueAreaObj.areas.map(
//         (area:string) => area.toLowerCase());
//     const resultJson: any = {};
//     for (const entries of areaInLowercase) {
//       console.log(entries);
//       const response = await googleMaps.geocode({
//         params: {
//           address: entries,
//           key: "AIzaSyCgK6O9xJIpjntal0ARJFm9noqxN4wHDXc",
//         },
//       });
//       console.log(response.data.results[0].geometry.location);
//       const {lat, lng} = response.data.results[0].geometry.location;
//       const areaData = {
//         area: entries,
//         lat: lat,
//         lng: lng,
//       };
//       resultJson[entries] = areaData;
//     }
//     res.status(200).json(resultJson);
//   } catch (error) {
//     console.error("Error reading Firestore collection: ", error);
//     res.status(500).send("Error reading Firestore collection");
//   }
// });

// /**
//  * Add JDoc
//  * @return {Promise<admin.firestore.DocumentData[]>}
//  */
// async function getJsonArray(): Promise<admin.firestore.DocumentData[]> {
//   try {
//     // Read the collection from Firestore
//     const collectionRef = admin.firestore().collection("masjid_cape_town");
//     const snapshot = await collectionRef.get();
//     const data = snapshot.docs.map((doc) => doc.data());
//     return data;
//   } catch (error) {
//     console.error("Error reading Firestore collection:", error);
//     throw error;
//   }
// }

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

// export const getAddress = functions.https.onRequest(async (req, res) => {
//   const placeName = req.query.place as string;

//   try {
//     // Use the Geocoding API to get the address of the place
//     const response: GeocodeResponse = await googleMaps.geocode({
//       params: {
//         address: placeName,
//         key: "AIzaSyCgK6O9xJIpjntal0ARJFm9noqxN4wHDXc",
//       },
//     });

//     // Extract the formatted address from the response
//     const address = response.data.results[0].formatted_address;

//     res.send({address});
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send("An error occurred");
//   }
// });

// interface SalaahTimingParams {
//   date: string;
//   latitude: number;
//   longitude: number;
//   method: number;
// }
// /**
//  * AddJdoc
//  * @param {SalaahTimingParams} params
//  */
// async function fetchSalaahTimings(params: SalaahTimingParams) {
//   try {
//     const {date, latitude, longitude, method} = params;
//     const response = await axios.get(`http://api.aladhan.com/v1/timings/${date}`, {
//       params: {
//         latitude,
//         longitude,
//         method,
//       },
//     });
//     const salaahTimings = response.data.data.timings;
//     console.log(salaahTimings);
//   } catch (error) {
//     // Handle error
//     console.error("Error fetching prayer timings:", error);
//   }
// }

// export const getSalaahTiming = functions.https.onRequest(
//     async (request, response) => {
//       try {
//         const params: SalaahTimingParams = {
//           date: request.query.date as string,
//           latitude: parseFloat(request.query.latitude as string),
//           longitude: parseFloat(request.query.longitude as string),
//           method: parseInt(request.query.method as string, 3),
//         };

//         const salaahTimings = await fetchSalaahTimings(params);

//         response.json(salaahTimings);
//       } catch (error) {
//         console.error("Error fetching prayer timings:", error);
//         response.status(500).send(
//             "An error occurred while fetching prayer timings."
//         );
//       }
//     });

// export const getNearbyMosques = functions.https.onRequest(async (req, res) => {
//   const currentLocation = req.query.currentLocation;
//   const response = await geolocationService.getCoordinates(
//     currentLocation as string);
//   res.status(200).send(`Response: ${response.latitude}, ${response.longitude}`);
// });

// /**
//  * Calculates the distance (in kms) between point A and B using earth's radius as the spherical surface
//  * @param pointA Coordinates from Point A
//  * @param pointB Coordinates from Point B
//  * Based on https://www.movable-type.co.uk/scripts/latlong.html
//  */
// function haversineDistance(pointA: Coordinates, pointB: Coordinates): number {
//   const radius = 6371; // Earth radius in km

//   // convert latitude and longitude to radians
//   const deltaLatitude = (pointB.latitude - pointA.latitude) * Math.PI / 180;
//   const deltaLongitude = (pointB.longitude - pointA.longitude) * Math.PI / 180;

//   const halfChordLength = Math.cos(
//       pointA.latitude * Math.PI / 180) * Math.cos(pointB.latitude * Math.PI / 180) *
//       Math.sin(deltaLongitude/2) * Math.sin(deltaLongitude/2) +
//       Math.sin(deltaLatitude/2) * Math.sin(deltaLatitude/2);

//   const angularDistance = 2 * Math.atan2(Math.sqrt(halfChordLength), Math.sqrt(1 - halfChordLength));

//   return radius * angularDistance;
// }

// interface Coordinates {
//   latitude: number;
//   longitude: number;
// }
