/* eslint-disable valid-jsdoc */
/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

import {delay} from "./utils/Wait";
import * as fs from "fs";
import {AxiosService} from "./services/AxiosService";
import {HadithMapper} from "./mappers/HadithMapper";
import DateTimeHelper from "./helper/DateTimeHelper";
import {Format, Locale} from "./helper/DateEnums";

interface JsonObject {
  [key: string]: any;
}

const dateTimeHelper = new DateTimeHelper();

function saveJsonToFile(jsonBlob: JsonObject, filePath: string): void {
  try {
    const jsonString = JSON.stringify(jsonBlob, null, 2); // 2 is the number of spaces for indentation

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      // If the file doesn't exist, create it
      fs.writeFileSync(filePath, "", {flag: "wx"});
    }

    // Write JSON data to the file
    fs.writeFileSync(filePath, jsonString);
    console.log(`JSON data saved to ${filePath}`);
  } catch (error) {
    console.error(`Error saving JSON data to ${filePath}:`, error);
  }
}


export class HadithRequest {
  // Create the instance of axios to use with the baseURL of "https://api.sunnah.com/v1/"
  private axiosService = new AxiosService("https://api.sunnah.com/v1/");

  // An instance of a mapper used for conversion between the response and wanted output.
  private mapper = new HadithMapper();

  // API Key to use for requests to "https://api.sunnah.com/v1/" otherwise response will come back as { message: "Missing Authentication Token" }
  private headers = {
    "X-API-Key": "SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk",
  };

  /**
   * Retrieves a random Hadith from the designated endpoint.
   *
   * @returns {Promise<HadithCollection>} A Promise that resolves to a HadithCollection object representing the random Hadith.
   *
   * @throws {Error} If an error occurs during the API request.
   */
  public async getRandomHadith(): Promise<HadithCollection> {
    try {
      const response = await this.axiosService.get("hadiths/random", this.headers);

      console.log(await this.mapper.mapToHadith(response.data));
      return response.data as HadithCollection;
    } catch (error) {
      console.error("Error: ", error as string);
      throw error;
    }
  }

  /**
  * Fetches the full collection of books from each scholar.
  * @returns {Promise<CollectionInfo[]>} A Promise that resolves to an array of CollectionInfo.
  */
  public async getAllCollections(): Promise<Collections[]> {
    const allCollections: CollectionInfo[] = [];
    try {
      const response = await this.axiosService.get("collections/", this.headers);
      response.data.data.forEach((collectionInfo: CollectionInfo) => {
        // Early escape for when 0 hadiths are available, we don't care about it anymore.
        if (collectionInfo.totalAvailableHadith == 0) {
          return;
        }

        allCollections.push(collectionInfo);
      });

      const resultCollection = this.mapper.mapToCollection(allCollections);
      const currentDate = dateTimeHelper.getDate(Locale.SOUTH_AFRICA, "Africa/Johannesburg", Format.API_DATE);
      const jsonResult = {
        listId: "randomUUID",
        date: currentDate,
        data: await resultCollection,
      };

      saveJsonToFile(await jsonResult, "/home/yahya/projects/MasjidFinderFunctions/HadithdB/collections.json");

      return resultCollection;
    } catch (error) {
      console.error("Error: ", error as string);
      throw error;
    }
  }

  // /**
  //  * Returns all the scholars with associated hadith books.
  //  * Used to querry subsequent requests.
  //  * @returns
  //  */
  // public async getScholarsWithBooks(): Promise<Array<string>> {
  //   const allCollections = await this.getAllCollections();

  //   // We filter out malik and darimi manually because even though the `hasBooks` property is set to `true` when querrying the books it doesn't return anything.
  //   const hasBooks = allCollections
  //       .filter((collection) => collection.name !== "malik" && collection.name !== "darimi" && collection.hasBooks)
  //       .map((collection) => collection.name);

  //   console.log(hasBooks);

  //   return hasBooks;
  // }

  public async getBooksFromScholar(name: string): Promise<BookCollection[]> {
    const books: Array<Books> = [];
    try {
      let hasNextPage = true;
      let pageNumber = 1;

      while (hasNextPage) {
        console.log(`Extracting ${name}... currently on page ${pageNumber}.`);

        const querryParams = {
          page: pageNumber,
        };

        const response = await this.axiosService.get(
            `collections/${name}/books/`,
            this.headers,
            querryParams,
        );

        if (response.status == 403) {
          console.error("Error: 403! Possible rate limit");
        }

        books.push(response.data.data as Books);

        if (response.data.next == null || response.data.next == undefined) {
          hasNextPage = false;
        } else {
          pageNumber = response.data.next;
        }
        await delay(2000);
      }
      const mappedData = this.mapper.mapToBooks(books.flat(), name);

      saveJsonToFile(await mappedData, `/home/yahya/projects/MasjidFinderFunctions/HadithdB/${name}_books.json`);

      return mappedData;
    } catch (error) {
      console.error("Error fetching total scholars:", error);
      throw error;
    }
  }

  public async exportHadithFromBook(name: string, bookNumber: string): Promise<Hadith[]> {
    console.log(`Pulling hadiths from ${name}`);

    const hadithResponse: Array<HadithCollection> = [];
    try {
      let hasNextPage = true;
      let pageNumber = 1;

      while (hasNextPage) {
        console.log(`Dealing with ${pageNumber} of ${name}`);
        const querryParams = {
          page: pageNumber,
        };

        const response = await this.axiosService.get(
            `collections/${name}/books/${bookNumber}/hadiths`,
            this.headers,
            querryParams,
        );

        if (response.status == 403) {
          console.log("Error: 403");
        }

        hadithResponse.push(response.data.data as HadithCollection);

        if (response.data.next == null || response.data.next == undefined) {
          hasNextPage = false;
        } else {
          pageNumber = response.data.next;
        }

        await delay(2000);
      }

      const fusedData: HadithCollection[] = hadithResponse.flat();
      const mappedData = this.mapper.mapToHadiths(fusedData);

      saveJsonToFile(await mappedData, `/home/yahya/projects/MasjidFinderFunctions/HadithdB/${name}/${name}_book${bookNumber}_hadiths.json`);

      return mappedData;
    } catch (error) {
      console.error("Error fetching total scholars:", error);
      throw error;
    }
  }
}
