

interface Summary {
    name: string,
    collection: Collection[],
}

interface Collection {
    lang: string;
    title: string;
    shortIntro: string;
}

interface BookInfo {
    lang: string;
    name: string;
  }

interface Books {
    bookNumber: string;
    book: BookInfo[];
    hadithStartNumber: number;
    hadithEndNumber: number;
    numberOfHadith: number;
  }

interface BooksResponse {
    data: Books[];
    total: number;
    limit: number;
    previous: null | string;
    next: null | string;
  }

interface BooksRes {
    data: Books[];
    total: number;
}
