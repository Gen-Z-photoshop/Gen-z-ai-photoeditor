import { GoogleGenAI, Modality } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

// Helper function to convert a File object to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

export const editImageWithAI = async (imageFile: File, prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set. Please configure it to use the AI features.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let base64ImageData: string;
    try {
        base64ImageData = await fileToBase64(imageFile);
    } catch (error) {
        console.error("Error reading file:", error);
        throw new Error("Failed to read image file. It may be corrupted or in an unsupported format.");
    }

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: imageFile.type,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const firstPart = response.candidates?.[0]?.content?.parts?.[0];
        if (firstPart && firstPart.inlineData) {
            const base64ImageBytes: string = firstPart.inlineData.data;
            const mimeType = firstPart.inlineData.mimeType;
            return `data:${mimeType};base64,${base64ImageBytes}`;
        } else {
            // Check if the request was blocked for safety reasons to provide a more specific error.
            if (response.candidates?.[0]?.finishReason === 'SAFETY') {
                 throw new Error("The request was blocked for safety reasons. Please adjust your prompt and try again.");
            }
            throw new Error("The AI did not return an image. Please try a different prompt.");
        }

    } catch (error) {
        console.error("Error calling AI service:", error);
        if (error instanceof Error) {
            // Re-throw the specific message from our logic or the more detailed message from the AI service.
            throw error;
        }
        throw new Error("An unknown error occurred while communicating with the AI service.");
    }
};