import sharp from "sharp";
import Tesseract from "tesseract.js";

export const preprocessImageForOcr = async (imageBuffer) => {
    try {
        // Preprocessing steps to improve OCR accuracy:
        // - Resize to a higher width (helps Tesseract read small text)
        // - Grayscale
        // - Normalize contrast
        // - Sharpen edges
        // - Threshold (binarize) to make text pop
        
        const processedBuffer = await sharp(imageBuffer)
            .resize({ width: 2500, withoutEnlargement: true }) // Increase width
            .grayscale()
            .normalize()
            .sharpen()
            .threshold(128) // Binarize image
            .toBuffer();

        return processedBuffer;
    } catch (error) {
        console.error("Image preprocessing failed:", error);
        return imageBuffer; // Fallback to original buffer if sharp fails
    }
};

export const runImprovedOcr = async (imageBuffer) => {
    try {
        const processedBuffer = await preprocessImageForOcr(imageBuffer);
        
        // Setup Tesseract worker with improved config
        // lang: eng, oem: 1 (LSTM), psm: 6 (Assume a single uniform block of text)
        const worker = await Tesseract.createWorker("eng", 1);
        
        await worker.setParameters({
            tessedit_pageseg_mode: "6", // PSM 6
        });
        
        const { data } = await worker.recognize(processedBuffer);
        
        await worker.terminate();
        
        return String(data?.text || "").trim();
    } catch (error) {
        console.error("Prescription improved OCR extraction failed:", error.message);
        return "";
    }
};
