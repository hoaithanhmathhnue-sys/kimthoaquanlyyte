import { GoogleGenAI } from "@google/genai";

const MODELS = ["gemini-3-flash-preview", "gemini-3-pro-preview", "gemini-2.5-flash"];

export async function analyzeInventoryWithAI(data: any, prompt: string, modelIndex = 0): Promise<string> {
  // Use environment variable as primary, fallback to local storage if user set it manually
  const envKey = process.env.GEMINI_API_KEY;
  const localKey = localStorage.getItem("gemini_api_key");
  const apiKey = envKey || localKey;

  if (!apiKey) {
    throw new Error("Vui lòng cấu hình API Key trong cài đặt hoặc biến môi trường.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODELS[modelIndex],
      contents: `Dữ liệu kho hiện tại: ${JSON.stringify(data)}\n\nYêu cầu: ${prompt}\n\nHãy trả lời bằng tiếng Việt, định dạng Markdown rõ ràng, ngắn gọn và tập trung vào phân tích, cảnh báo và đề xuất hành động.`,
      config: {
        temperature: 0.7,
      },
    });

    return response.text || "Không có phản hồi từ AI.";
  } catch (error: any) {
    console.error(`AI Error (Model ${MODELS[modelIndex]}):`, error);
    // Fallback to next model if available and error is likely a rate limit or model issue
    if (modelIndex < MODELS.length - 1) {
      console.log(`Thử lại với model ${MODELS[modelIndex + 1]}...`);
      return analyzeInventoryWithAI(data, prompt, modelIndex + 1);
    }
    throw new Error(error.message || "Đã xảy ra lỗi khi gọi AI.");
  }
}
