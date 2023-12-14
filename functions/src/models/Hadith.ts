interface Hadith {
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
    hadith: Hadith[];
}
