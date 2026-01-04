import { GoogleGenAI } from "@google/genai";
import { UploadedImage, CompositionConfig } from "../types";

// Ensure API Key is available
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY environment variable is missing.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-ts-check' });

export const generateComposition = async (
  backdrop: UploadedImage,
  asset: UploadedImage,
  config: CompositionConfig
): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash-image";

    // Construct a prompt that leverages the model's editing and multimodal capabilities
    let prompt = `Actúa como un retocador fotográfico profesional experto en composición.
    
    Tienes dos imágenes:
    1. La primera imagen es el "FONDO" (Backdrop).
    2. La segunda imagen contiene el "SUJETO" (Asset/Object/Person).

    Tu tarea:
    1. Recorta inteligentemente al sujeto de la segunda imagen, eliminando su fondo original por completo (remoción de fondo precisa).
    2. Coloca al sujeto recortado sobre la imagen de FONDO de manera realista.
    3. Ajustes de Composición (CRUCIAL):
       - Iguala la temperatura de color del sujeto para que coincida con el fondo.
       - Ajusta la exposición, contraste y niveles de negro del sujeto para que parezca que pertenece a la escena.
       - Genera sombras de contacto y sombras proyectadas realistas basadas en la dirección de la luz del fondo.
    
    ${config.instruction ? `Instrucción adicional del usuario: "${config.instruction}"` : ''}
    
    Devuelve SOLAMENTE la imagen final compuesta en alta calidad.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: backdrop.mimeType,
              data: backdrop.base64,
            },
          },
          {
            inlineData: {
              mimeType: asset.mimeType,
              data: asset.base64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Extract the image from the response
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        const parts = candidates[0].content.parts;
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            }
        }
    }

    throw new Error("No se generó ninguna imagen en la respuesta.");

  } catch (error: any) {
    console.error("Error generating composition:", error);
    throw new Error(error.message || "Error al procesar la composición.");
  }
};