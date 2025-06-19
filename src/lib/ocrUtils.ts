import Tesseract from "tesseract.js";

export async function extractTextFromImage(
  image: File | Blob
): Promise<string> {
  try {
    const { data } = await Tesseract.recognize(image, "eng", {
      logger: () => {}, // Optional: you can add progress logging here
    });
    return data.text;
  } catch (error: any) {
    throw new Error(error.message || "OCR failed");
  }
}
