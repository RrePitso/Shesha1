import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedMenuItem } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const menuGenerationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "A creative and catchy name for the menu item.",
      },
      description: {
        type: Type.STRING,
        description: "An enticing, brief description of the dish, highlighting key ingredients and flavors.",
      },
      price: {
        type: Type.STRING,
        description: "A suggested price point for the menu item, formatted as a string (e.g., 'R15.99').",
      },
    },
    required: ["name", "description", "price"],
  },
};

export const generateMenuItems = async (prompt: string): Promise<GeneratedMenuItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 3 creative menu item ideas for a restaurant based on the following concept: "${prompt}". For each item, provide a catchy name, a brief, enticing description, and a suggested price point.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: menuGenerationSchema,
      },
    });

    const jsonText = response.text.trim();
    const generatedItems = JSON.parse(jsonText);
    
    // Basic validation
    if (!Array.isArray(generatedItems)) {
        throw new Error("API did not return an array.");
    }

    return generatedItems as GeneratedMenuItem[];

  } catch (error) {
    console.error("Error generating menu items:", error);
    throw new Error("Failed to generate menu ideas. Please check your API key and try again.");
  }
};