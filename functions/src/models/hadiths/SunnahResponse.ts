// This defines all the models that will be exposed
// on the server and sent to the client.
// Most of these are models of the response of the external APIs being used.

interface HadithResponse {
    lang: string;
    chapterNumber: string;
    chapterTitle: string;
    urn: number;
    body: string;
    grades: any[];
}

interface HadithCollection {
    collection: string;
    bookNumber: string;
    chapterId: string;
    hadithNumber: string;
    hadith: HadithResponse[];
}

interface AllCollections {
    data: CollectionInfo[],
    total: number;
    limit: number;
    previous: null | string;
    next: null | string;
}

interface CollectionInfo {
    name: string;
    hasBooks: boolean;
    hasChapters: boolean;
    collection: Collection[];
    totalHadith: number;
    totalAvailableHadith: number;
}
