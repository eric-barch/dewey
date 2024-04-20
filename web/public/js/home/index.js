import { getHighlightedBookRow, setHighlightedBookRow } from "/js/global.js";
import { getBook } from "./apiRequests.js";
import { postAllBookRows } from "./bookRows.js";
import { openPopup } from "./popup.js";

const searchForBookRow = (query) => {
  const highlightedBookRow = getHighlightedBookRow();
  const bookRow = document.querySelector(`tr[data-isbn="${query}"]`);

  if (highlightedBookRow) {
    highlightedBookRow.style.backgroundColor = "";
  }

  if (!bookRow) {
    throw new Error(`${query} is not an ISBN in bookTable.`);
  }

  setHighlightedBookRow(bookRow);

  bookRow.style.backgroundColor = "lightyellow";
  bookRow.scrollIntoView({ behavior: "smooth", block: "center" });
};

const searchForBook = async (event) => {
  event.preventDefault();

  const searchInput = document.getElementById("searchInput");
  const query = searchInput.value;

  try {
    searchForBookRow(query);
  } catch {
    const { source, book } = await getBook(query);

    const inLibrary = source === "db";
    const isbn = book.isbn13 || book.isbn10;

    try {
      searchForBookRow(isbn);
    } catch {
      openPopup(inLibrary, book);
    }
  }

  searchInput.value = "";
};

document.getElementById("searchForm").addEventListener("submit", searchForBook);

postAllBookRows();
