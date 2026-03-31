import { GoogleGenAI, Modality, ThinkingLevel, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Generates a video from an image using Veo.
 */
export async function animateImage(imageBase64: string, prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'Animate this hazard scene to show the environment clearly.',
      image: {
        imageBytes: imageBase64,
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Failed to generate video link");

    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey || '',
      },
    });

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
}

/**
 * Uses Google Maps grounding to get accessibility information.
 */
export async function getAccessibilityInfo(location: string, lat: number, lng: number) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What are the accessibility features and potential hazards near ${location}?`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    return {
      text: response.text,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Error getting accessibility info:", error);
    throw error;
  }
}

/**
 * Uses Google Maps grounding to find nearby services.
 */
export async function getNearbyServices(serviceType: string, lat: number, lng: number) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find the 3 most accessible ${serviceType}s near latitude ${lat}, longitude ${lng}. For each, provide the name, address, and a brief accessibility note.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // We'll return the text and grounding. The UI will parse or display this.
    return {
      text: response.text,
      grounding: grounding
    };
  } catch (error) {
    console.error("Error getting nearby services:", error);
    throw error;
  }
}

/**
 * High thinking mode for complex queries.
 */
export async function complexQuery(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: query,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error in complex query:", error);
    throw error;
  }
}

/**
 * Text-to-Speech for accessibility.
 */
export async function textToSpeech(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/pcm;rate=24000' });
      return URL.createObjectURL(blob);
    }
    throw new Error("No audio data returned");
  } catch (error) {
    console.error("Error in TTS:", error);
    throw error;
  }
}
