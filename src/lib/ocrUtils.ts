import tesseract from "node-tesseract-ocr";

export async function extractTextFromImage(
  image: File | Blob
): Promise<string> {
  const arrayBuffer = await image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const config = {
    lang: "eng",
    oem: 1,
    psm: 3,
  };
  try {
    const text = await tesseract.recognize(buffer, config);
    return text;
  } catch (error: any) {
    throw new Error(error.message || "OCR failed");
  }
}
