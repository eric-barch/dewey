import { getHighlightedBookRow, setHighlightedBookRow } from "./global.js";

const getBook = async (isbn) => {
  const response = await fetch(`/api/v1/book/${isbn}`, { method: "GET" });
  const book = await response.json();
  return book;
};

const postBook = async (isbn) => {};

const putBook = async (isbn) => {};

const deleteBook = async (isbn) => {};

const createBookRow = (book) => {
  const bookRow = document
    .importNode(bookRowTemplate.content, true)
    .querySelector("tr");

  bookRow.setAttribute("data-isbn", book.scannedIsbn);

  const cells = bookRow.querySelectorAll("td");

  cells.forEach((cell) => {
    const className = cell.className;
    const value = book[className];

    switch (className) {
      case "thumbnail":
        const img = document.createElement("img");
        img.src = value;
        img.alt = `Book cover for ${book.title}`;
        cell.textContent = "";
        cell.appendChild(img);
        break;
      case "title":
        const a = document.createElement("a");
        a.href = "javascript:void(0)";
        a.textContent = book.title;
        cell.appendChild(a);
        break;
      case "lcClassification":
        const lcClassification = `${book.lcClass || ""}${book.lcTopic || ""} ${book.lcSubjectCutter || ""} ${book.lcAuthorCutter || ""}`;
        cell.textContent = lcClassification;
        break;
      default:
        cell.textContent = value;
    }
  });

  return bookRow;
};

const createAllBookRows = async () => {
  const bookTableBody = document.getElementById("bookTableBody");

  const response = await fetch("/api/v1/book", { method: "GET" });
  const books = await response.json();

  books.forEach((book) => {
    const bookRow = createBookRow(book);
    bookTableBody.appendChild(bookRow);
  });
};

const insertBookRow = async (isbn) => {
  const book = getBook(isbn);
  const newBookRow = createBookRow(book);

  const bookRows = bookTableBody.querySelectorAll("tr[data-isbn]");

  for (const bookRow of bookRows) {
    const lcClassification =
      bookRow.querySelector(".lcClassification")?.textContent;

    if (book.lcClassification < lcClassification) {
      bookRow.before(newBookRow);
      return;
    }
  }

  bookTableBody.appendChild(newBookRow);
};

const updateBookRow = async (isbn) => {
  const book = getBook(isbn);
  const bookRow = bookTableBody.querySelector(
    `tr[data-isbn="${book.scannedIsbn}"]`,
  );

  if (!bookRow) {
    console.error(`Did not find book with ISBN ${isbn}.`);
    throw new Error(`Did not find book with ISBN ${isbn}.`);
  }

  const lcClassification =
    bookRow.querySelector(".lcClassification")?.textContent;

  if (lcClassification !== book.lcClassification) {
    bookRow.remove();
    await insertBookRow(isbn);
  } else {
    /**Classification hasn't changed. No need to re-sort. */
    const newBookRow = createBookRow(book);
    bookRow.replaceWith(newBookRow);
  }
};

const deleteBookRow = async (isbn) => {
  const bookRow = bookTableBody.querySelector(`tr[data-isbn="${isbn}"]`);
  bookRow.remove();
};

const searchBook = async (event) => {
  event.preventDefault();
  const searchInput = document.getElementById("searchInput");

  const isbn = searchInput.value;
  const bookRow = document.querySelector(`tr[data-isbn="${isbn}"]`);

  if (bookRow) {
    const highlightedBookRow = getHighlightedBookRow();
    highlightedBookRow && (highlightedBookRow.style.backgroundColor = "");

    bookRow.style.backgroundColor = "lightyellow";
    bookRow.scrollIntoView({ behavior: "smooth", block: "center" });

    setHighlightedBookRow(bookRow);
  } else {
    const book = await getBook(isbn);
    showPopup(book);
  }

  searchInput.value = "";
};

const bookEventListener = () => {
  const eventSource = new EventSource("/api/v1/book-events");

  eventSource.onmessage = async (event) => {
    const { isbn, action } = JSON.parse(event.data);

    switch (action) {
      case "insertBookRow":
        await insertBookRow(isbn);
        break;
      case "updateBookRow":
        await updateBookRow(isbn);
        break;
      case "deleteBookRow":
        await deleteBook(isbn);
        break;
      default:
        throw new Error(`Unrecognized action: ${action}`);
    }
  };
};

const titleClickListener = () => {
  const bookTableBody = document.getElementById("bookTableBody");

  bookTableBody.addEventListener("click", function (event) {
    let targetRow = event.target;

    while (targetRow != this && !targetRow.hasAttribute("data-isbn")) {
      targetRow = targetRow.parentNode;
    }

    if (!targetRow.hasAttribute("data-isbn")) return;

    console.log("targetRow", targetRow);

    const bookData = {
      title: targetRow.querySelector(".title").textContent,
      authors: targetRow.querySelector(".authors").textContent,
      deweyClassification: targetRow.querySelector(".deweyClassification")
        .textContent,
      lcClassification:
        targetRow.querySelector(".lcClassification").textContent,
      isCheckedIn: targetRow.querySelector(".isCheckedIn").textContent,
    };

    showPopup(bookData);
  });

  const showPopup = (bookData) => {
    document.getElementById("popupTitle").textContent = bookData.title;
    document.getElementById("popupAuthors").textContent = bookData.authors;
    document.getElementById("popupDewey").textContent =
      `Dewey Classification: ${bookData.deweyClassification}`;
    document.getElementById("popupLoC").textContent =
      `Library of Congress Classification: ${bookData.lcClassification}`;
    document.getElementById("popupCheckedIn").textContent =
      `Checked In: ${bookData.isCheckedIn}`;

    document.getElementById("popupOverlay").style.display = "flex";
  };

  window.closePopup = function () {
    document.getElementById("popupOverlay").style.display = "none";
  };
};

createAllBookRows();
document.getElementById("searchForm").addEventListener("submit", searchBook);
document.addEventListener("DOMContentLoaded", bookEventListener);
document.addEventListener("DOMContentLoaded", titleClickListener);