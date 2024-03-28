// This defines all the models that will be used for internal mapping.

/**
 * Interface representing a Hadith.
 * This is the model that is used in the internal databse.
 */
interface Hadith {
    /**
     * ID number that represets the collection.
     */
    id: number,
    /**
     * The ID of the chapter. This relates somewhat to
     * the chapter number but shows the sub chapters.
     */
    chapterId: string
    /**
     * The title of the chapter the Hadith comes from.
     */
    chapterTitle: string,
    /**
     * The chapter number the Hadith comes from.
     */
    chapterNumber: string,
    /**
     * The book number the Hadith comes from.
     */
    bookNumber: number,
    /**
     * The hadith number.
     */
    hadithNumber: string,
    /**
     * The content of the Hadith.
     */
    text: {
        /**
         * English transaltion
         */
        english: string,
        /**
         * Original Arabic
         */
        arabic: string,
    }
}

interface Collections {
    id: number,
    name: string
    title: {
        eng: string,
        ar: string
    },
    shortIntro: string,
    totalHadith: number
}

interface BookCollection {
    id: number,
    bookNumber: number,
    bookName: {
        eng: string,
        ar: string,
    },
    numberOfHadith: number
    hadithStartNumber: number,
    hadithEndNumber: number,
}
