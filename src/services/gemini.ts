import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateMindMap = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a mind map for the following topic: "${prompt}". 
    Return a hierarchical JSON structure with a root node and its children. 
    Each node should have a unique 'id' and a 'label'.
    Keep it concise but informative.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          root: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              children: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    children: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          label: { type: Type.STRING },
                        }
                      }
                    }
                  }
                }
              }
            },
            required: ["id", "label"]
          }
        },
        required: ["root"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const expandNode = async (nodeLabel: string, context: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Expand on the following topic within a mind map: "${nodeLabel}". 
    Context: "${context}".
    Generate 3-5 sub-topics. Return them as a JSON array of objects with 'id' and 'label'.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            label: { type: Type.STRING },
          },
          required: ["id", "label"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};
