import { HfInference } from "@huggingface/inference";

/**
 * Analyzes an image URL using the HuggingFace Inference API.
 * Uses Salesforce/blip-image-captioning-large via the official @huggingface/inference client,
 * which handles endpoint routing automatically.
 *
 * Returns a lowercase caption string, or null if the model is unavailable.
 */
export async function analyzeImage(imageUrl: string): Promise<string | null> {
    try {
        const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

        // Fetch the image as a Blob
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            console.warn("[analyzeImage] Failed to fetch image:", imageResponse.status, imageUrl);
            return null;
        }
        const imageBlob = await imageResponse.blob();

        // Use the official client — handles new HF routing automatically
        const result = await hf.imageToText({
            model: "Salesforce/blip-image-captioning-large",
            data: imageBlob,
        });

        const caption = result?.generated_text?.toLowerCase().trim() ?? null;
        console.log("[analyzeImage] Caption:", caption);
        return caption || null;

    } catch (error: any) {
        console.error("[analyzeImage] Error:", error?.message ?? error);
        return null;
    }
}