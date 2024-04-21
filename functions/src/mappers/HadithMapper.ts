/* eslint-disable require-jsdoc */
/* eslint-disable max-len */

export class HadithMapper {
  /**
     * Object used to associate a collection to a number ID.
     * Only the collections that has avalible hadiths are listed here.
     */
  private collectionID: StringToNumber = {
    "bukhari": 1,
    "muslim": 2,
    "nasai": 3,
    "abudawud": 4,
    "tirmidhi": 5,
    "ibnmajah": 6,
    "malik": 7,
    "ahmad": 8,
    "forty": 9,
    "riyadussalihin": 10,
    "mishkat": 11,
    "adab": 12,
    "shamail": 13,
    "bulugh": 14,
  };

  public async mapToHadith(input: Promise<HadithCollection>): Promise<Hadith> {
    try {
      const hadithCollection = await input;
      const collectionID = this.getCollectionId(hadithCollection.collection);

      return {
        id: collectionID,
        chapterId: hadithCollection.chapterId,
        chapterTitle: hadithCollection.hadith[0].chapterTitle,
        chapterNumber: hadithCollection.hadith[0].chapterNumber,
        bookNumber: parseInt(hadithCollection.bookNumber),
        hadithNumber: hadithCollection.hadithNumber,
        text: {
          english: hadithCollection.hadith[0].body,
          arabic: hadithCollection.hadith[1].body,
        },
      };
    } catch (error) {
      // Handle error appropriately
      console.error("Error mapping to Hadith:", error);
      throw error; // Rethrow error to be handled by the caller
    }
  }

  public async mapToHadiths(input: HadithCollection[]): Promise<Hadith[]> {
    try {
      const result : Array<Hadith> = [];
      const hadithCollection = await input;
      hadithCollection.forEach((hadith) => {
        const entry : Hadith = {
          id: this.getCollectionId(hadith.collection),
          chapterId: hadith.chapterId,
          chapterTitle: hadith.hadith[0].chapterTitle,
          chapterNumber: hadith.hadith[0].chapterNumber,
          bookNumber: parseInt(hadith.bookNumber),
          hadithNumber: hadith.hadithNumber,
          text: {
            english: hadith.hadith[0].body,
            arabic: hadith.hadith[1].body,
          },
        };

        result.push(entry);
      });

      return result;
    } catch (error) {
      // Handle error appropriately
      console.error("Error mapping to Hadith:", error);
      throw error; // Rethrow error to be handled by the caller
    }
  }

  public async mapToCollection(input: CollectionInfo[]): Promise<Collections[]> {
    const collections: Collections[] = [];

    try {
      const allCollections = await input;

      allCollections.forEach((collection) => {
        const collectionID = this.getCollectionId(collection.name);

        // Early escape for collectionId isn't listed on the [collectionID] list.
        if (collectionID == undefined) {
          return;
        }
        const entry: Collections = {
          id: collectionID,
          name: collection.name,
          title: {
            eng: collection.collection[0].title,
            ar: collection.collection[1].title,
          },
          shortIntro: collection.collection[0].shortIntro,
          totalHadith: collection.totalAvailableHadith,
        };

        collections.push(
            entry
        );
      });

      return collections;
    } catch (error) {
      // Handle error appropriately
      console.error("Error mapping to Hadith:", error);
      throw error; // Rethrow error to be handled by the caller
    }
  }

  public async mapToBooks(input: Books[], name: string): Promise<BookCollection[]> {
    const bookCollection: BookCollection[] = [];
    const collectionID = this.getCollectionId(name);

    try {
      const bookCollections = await input;

      bookCollections.forEach((book) => {
        const entry: BookCollection = {
          id: collectionID,
          bookNumber: parseInt(book.bookNumber),
          bookName: {
            eng: book.book[0].name,
            ar: book.book[1].name,
          },
          numberOfHadith: book.numberOfHadith,
          hadithStartNumber: book.hadithStartNumber,
          hadithEndNumber: book.hadithEndNumber,
        };

        bookCollection.push(entry);
      });

      return bookCollection;
    } catch (error) {
      // Handle error appropriately
      console.error("Error mapping to Hadith:", error);
      throw error; // Rethrow error to be handled by the caller
    }
  }

  private getCollectionId(input: string): number {
    return this.collectionID[input];
  }
}
