import path from "path";
import fs from "fs";
import PDFParser from "pdf2json";

// Helper function to create a temporary file
export const createTempFile = async (file) => {
  const tempDir = path.join(process.cwd(), "tmp");

  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // Define the path for the temporary file
  const tempFilePath = path.join(tempDir, `${Date.now()}-${file.originalname}`);

  // Write the uploaded file to the temp directory
  await fs.promises.writeFile(tempFilePath, file.buffer);

  return tempFilePath;
};

// Helper function to extract text from a PDF
export const extractTextFromPdf = (filePath) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      reject(errData.parserError);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      let text = "";
      pdfData.Pages.forEach((page) => {
        page.Texts.forEach((textItem) => {
          textItem.R.forEach((r) => {
            text += decodeURIComponent(r.T) + " ";
          });
        });
      });
      resolve(text.trim());
    });

    pdfParser.loadPDF(filePath);
  });
};


/**
 * fileUtils.js
 *
 * 📦 Utility functions for handling temporary files and extracting text from PDF documents.
 *
 * 📂 Location:
 * //GPT/gptcore/node/utils/fileUtils.js
 *
 * 🛠 Functionality:
 * - Creates a temporary file from an uploaded file buffer.
 * - Extracts plain text content from PDF files using `pdf2json`.
 *
 * 🧩 Dependencies:
 * - `path`: Node.js module for handling and transforming file paths.
 * - `fs`: Node.js file system module for reading/writing files.
 * - `pdf2json`: Library for parsing PDF files and extracting raw text.
 *
 * --------------------------------------------------
 *
 * @function createTempFile
 * @description Saves an uploaded file buffer to a temporary file in the `/tmp` directory.
 *
 * @param {Object} file - The uploaded file object (must contain `.buffer` and `.originalname`).
 * @returns {Promise<string>} - Full path to the saved temporary file.
 *
 * @example
 * const filePath = await createTempFile(req.file);
 *
 * --------------------------------------------------
 *
 * @function extractTextFromPdf
 * @description Extracts plain text from a PDF file given its path using the `pdf2json` library.
 *
 * @param {string} filePath - The absolute path to the PDF file on the server.
 * @returns {Promise<string>} - The extracted text content from the PDF.
 *
 * @example
 * const rawText = await extractTextFromPdf("/tmp/document.pdf");
 *
 * ⚠️ Notes:
 * - The text is URL-decoded using `decodeURIComponent`.
 * - Text is concatenated with spaces and returned as a single string.
 * - The structure/formatting of the PDF is not preserved (plain sequential text only).
 */
