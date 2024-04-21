import {json} from "stream/consumers";
import {HadithRequest} from "./HadithRequest"; // Adjust the path accordingly
import * as fs from "fs";

async function runGetCollectionsLocally() {
  try {
    const hadithRequest = new HadithRequest();
    // hadithRequest.getBooksFromScholar("adab");
    for (let i = 57; i < 58; i++) {
      await hadithRequest.exportHadithFromBook("adab", i.toString());
      await waitFor(7000);
    }
  } catch (error) {
    console.error("Error running getCollections locally:", error);
  }
}

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

async function parseJson() {
  const filePath = "../HadithdB/hadith_collections.json";

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return;
    }

    // Parse the JSON data
    try {
      const jsonData : HadithCollectionJson = JSON.parse(data);
      jsonData.data.forEach((hadith: HadithCollection) => {
        const documentObject = {
          name: hadith.name,
          short_intro: hadith.shortIntro,
          title: hadith.title,
          total_hadith: hadith.totalHadith,
        };

        console.log(hadith.id.toString(), documentObject);
      });
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  });
}


function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

parseJson();
