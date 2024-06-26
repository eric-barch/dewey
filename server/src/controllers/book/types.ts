type GoogleBook = {
  googleId: string | undefined;
  title: string | undefined;
  subtitle: string | undefined;
  authors: string[] | undefined;
  description: string | undefined;
  publishDate: Date | undefined;
  isbn10: string | undefined;
  isbn13: string | undefined;
  thumbnail: string | undefined;
};

type OpenLibraryBook = {
  openLibraryKey: string | undefined;
  title: string | undefined;
  subtitle: string | undefined;
  description: string | undefined;
  publishDate: Date | undefined;
  isbn10: string | undefined;
  isbn13: string | undefined;
  lccn: string | undefined;
  lc: LcClassification | undefined;
  dewey: string | undefined;
};

type LcBook = {
  lccn: string | undefined;
  title: string | undefined;
  subtitle: string | undefined;
  authors: string[] | undefined;
  publishDate: Date | undefined;
  lc: LcClassification | undefined;
  dewey: string | undefined;
};

type LcClassification = {
  class: string | undefined;
  topic: number | undefined;
  subjectCutter: string | undefined;
  authorCutter: string | undefined;
  year: number | undefined;
};

export { GoogleBook, OpenLibraryBook, LcBook, LcClassification };
