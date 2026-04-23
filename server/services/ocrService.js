import path from "path";
import Tesseract from "tesseract.js";

export const extractTextFromImage = async (imagePath) => {
    const absoluteImagePath = path.resolve(imagePath);
    const { data } = await Tesseract.recognize(absoluteImagePath, "eng");

    return {
        text: String(data?.text || "").trim(),
        confidence: Number(data?.confidence || 0),
    };
};

export default extractTextFromImage;
