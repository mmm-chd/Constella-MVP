import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const ASTRONOT_SYSTEM_INSTRUCTION = `
You are Astronot, a space-themed emotional AI companion for the application "Constella".
Your goal is to help users journal their emotions and watch their emotional universe evolve.

TONE:
- Calibration: calming, emotional, reflective, magical, cinematic, personal.
- Human-like, warm, and empathetic. NEVER sound robotic or clinical.
- Use occasional space metaphors (e.g., "galactic storms", "stellar winds", "deep orbit").
- Support Indonesian and English naturally.

CAPABILITIES:
- Respond to user journals with deep empathy.
- Extract emotional insights.
- Help the user reflect on their growth.
- Maintain continuity over time (Memory Layers).

MEMORY LAYERS:
- Session: Current conversation.
- Planet: Emotional patterns during current planet lifecycle.
- Long-term: Recurring fears, happiness triggers, habits.

You will be asked to provide TWO outputs for each interaction:
1. A warm, empathetic response to the user.
2. A structured JSON analysis of the emotion.
`;

export async function generatePlanetDescription(stage: string, emotion: string = "neutral") {
  const prompt = `Provide a short, evocative atmospheric description (max 3 sentences) for a planet in the "${stage}" stage with a dominant emotional aura of "${emotion}".
  Focus on unique planetary phenomena, colors, and sensory details. 
  Example: "The oceans churn with a deep sapphire glow, reflecting the quiet melancholy of the shifting tides."`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are the Planetary Archivist of Constella. Your descriptions are poetic, scientific yet mystical, and very brief.",
    }
  });

  return response.text;
}

export async function analyzeJournal(text: string, previousContext: string = "") {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze the following journal entry within the context of the user's emotional history if provided.
    
    Emotional History Context: ${previousContext}
    
    Journal Entry: "${text}"
    
    Provide the analysis in the specified JSON format.`,
    config: {
      systemInstruction: ASTRONOT_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          response: { 
            type: Type.STRING, 
            description: "Empathetic response back to the user." 
          },
          analysis: {
            type: Type.OBJECT,
            properties: {
              dominantEmotion: { type: Type.STRING },
              blend: { type: Type.ARRAY, items: { type: Type.STRING } },
              intensity: { type: Type.NUMBER, description: "1 to 10" },
              sentimentScore: { type: Type.NUMBER, description: "Normalized score between 0 and 1. 1 is very positive, 0 is very negative, 0.5 is neutral." },
              summary: { type: Type.STRING }
            },
            required: ["dominantEmotion", "blend", "intensity", "sentimentScore", "summary"]
          }
        },
        required: ["response", "analysis"]
      }
    }
  });

  return JSON.parse(response.text);
}
