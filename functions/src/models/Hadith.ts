interface Hadith {
    lang: string;
    chapterNumber: string;
    chapterTitle: string;
    urn: number;
    body: string;
    grades: any[]; // You might want to replace 'any[]' with a more specific type for grades
}

interface HadithCollection {
    collection: string;
    bookNumber: string;
    chapterId: string;
    hadithNumber: string;
    hadith: Hadith[];
}