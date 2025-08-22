import { GoogleGenAI, Type } from "@google/genai";
import type { Monster } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

type MonsterGenerationResponse = {
    name: string;
    description: string;
    hp: number;
    attack: number;
};

export const generateMonster = async (storyContext: string): Promise<Omit<Monster, 'imageUrl' | 'currentHp' | 'locationId'>> => {
  try {
    const prompt = `Based on this fantasy story excerpt, create a unique and challenging monster for the writers to fight.
    Story: "${storyContext.slice(-1000)}"
    Provide a creative name, a vivid one-sentence description, a base HP between 100 and 500, and an attack value between 10 and 50.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            hp: { type: Type.INTEGER },
            attack: { type: Type.INTEGER },
          },
          required: ["name", "description", "hp", "attack"],
        },
      },
    });

    const monsterData = JSON.parse(response.text) as MonsterGenerationResponse;
    return {
      name: monsterData.name,
      description: monsterData.description,
      maxHp: monsterData.hp,
      attack: monsterData.attack,
    };
  } catch (error) {
    console.error("Error generating monster:", error);
    // Return a fallback monster on error
    return {
      name: "Glitched Gremlin",
      description: "A creature born of API errors and digital chaos.",
      maxHp: 100,
      attack: 10,
    };
  }
};

export const generateMonsterImage = async (monsterDescription: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `A fantasy RPG monster concept art for: "${monsterDescription}". Dark, atmospheric, digital painting.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        throw new Error("No image generated");
    } catch (error) {
        console.error("Error generating monster image:", error);
        return "https://picsum.photos/512/512"; // Fallback image
    }
};

export const getAICritique = async (text: string): Promise<string> => {
  if (!text.trim()) {
    return "There's nothing to critique yet. Write something first!";
  }
  try {
    const prompt = `You are a helpful and encouraging writing coach. Provide constructive critique on the following piece of writing. Focus on one or two key areas for improvement, such as pacing, imagery, character voice, or flow. Keep the feedback concise and actionable.
    
    Writing: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error getting AI critique:", error);
    return "The AI editor is currently unavailable. Please try again later.";
  }
};

export const isFeedbackConstructive = async (feedback: string): Promise<{ isConstructive: boolean; reason: string }> => {
  try {
    const prompt = `Analyze the following feedback from a writer for a collaborative writing game. Your goal is to be a relaxed moderator. Determine if the feedback is acceptable. Block only feedback that is clearly offensive, hateful, a personal attack, or nonsensical spam. Allow subjective opinions and brief comments. Respond with JSON, setting 'isConstructive' to true if it's acceptable.

    Feedback: "${feedback}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isConstructive: { type: Type.BOOLEAN },
            reason: { type: Type.STRING, description: "A brief explanation for your decision. If it is constructive, say why. If not, explain what makes it unconstructive." },
          },
          required: ["isConstructive", "reason"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error validating feedback:", error);
    return {
      isConstructive: false,
      reason: "Could not validate feedback due to a service error. Please try again.",
    };
  }
};

export const getInspirationWord = async (storyContext: string): Promise<string> => {
    try {
        const prompt = `Based on the following fantasy story context, provide a single, evocative, and inspiring word to help a writer continue.
        Story: "${storyContext.slice(-500)}"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        // Clean up the response to get just one word
        return response.text.trim().split(/\s+/)[0].replace(/[^a-zA-Z]/g, '');
    } catch (error) {
        console.error("Error getting inspiration word:", error);
        return "Ephemeral";
    }
};

export const highlightComplexSentences = async (text: string): Promise<string> => {
    if (!text.trim()) {
        return "There's no text to analyze.";
    }
    try {
        const prompt = `Analyze the following text. Identify the most complex or structurally interesting sentences. Return the original text, but wrap these identified sentences with a special marker: {{highlight}}sentence{{/highlight}}.
        
        Text: "${text}"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error highlighting sentences:", error);
        return "The analysis tool is currently unavailable.";
    }
};