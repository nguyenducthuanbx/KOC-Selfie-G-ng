
import { GoogleGenAI } from "@google/genai";
import { SceneChoice } from "../types";

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    if (!apiKey) return false;
    const ai = new GoogleGenAI({ apiKey: apiKey });
    // Sử dụng model text nhẹ để kiểm tra kết nối nhanh
    // Chuyển sang gemini-3-flash-preview vì gemini-2.5-flash-latest không tồn tại (gây lỗi 404)
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: 'ping' }] },
    });
    return true;
  } catch (error) {
    console.error("Key validation failed:", error);
    return false;
  }
};

export const generateMirrorSelfie = async (
  apiKey: string,
  model: string,
  kocBase64: string,
  outfitBase64: string,
  scene: SceneChoice,
  additionalPrompt: string,
  holdingPhone: boolean
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in settings.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  // Map 'nano-banana' to the actual model name 'gemini-2.5-flash-image'
  const actualModel = model === 'nano-banana' ? 'gemini-2.5-flash-image' : model;
  
  const cleanKoc = kocBase64.replace(/^data:image\/[a-z]+;base64,/, "");
  const cleanOutfit = outfitBase64.replace(/^data:image\/[a-z]+;base64,/, "");

  const phonePrompt = holdingPhone 
    ? `- VỊ TRÍ ĐIỆN THOẠI: Tay cầm điện thoại selfie phải được đặt ở vị trí THẤP (tầm ngực) hoặc LỆCH SANG BÊN CẠNH.\n- HIỂN THỊ KHUÔN MẶT: Phải hiển thị đầy đủ 100% khuôn mặt người mẫu trong gương. TUYỆT ĐỐI KHÔNG ĐỂ ĐIỆN THOẠI HAY CÁNH TAY CHE KHUẤT BẤT KỲ BỘ PHẬN NÀO CỦA KHUÔN MẶT (mắt, mũi, miệng, cằm phải rõ ràng).`
    : `- KHÔNG CẦM ĐIỆN THOẠI: Người mẫu tạo dáng tự nhiên trước gương (tạo dáng thời trang, để tay vào túi quần, hoặc buông thõng tự nhiên). TUYỆT ĐỐI KHÔNG CÓ ĐIỆN THOẠI TRONG HÌNH.\n- HIỂN THỊ KHUÔN MẶT: Phải hiển thị đầy đủ 100% khuôn mặt người mẫu trong gương.`;

  const prompt = `
YÊU CẦU CHẤT LƯỢNG HÌNH ẢNH SIÊU CẤP (ULTRA HD - 1080P RESOLUTION):
- Độ sắc nét: Cực cao, mọi chi tiết đều phải rõ ràng (Super Sharp, High Fidelity).
- Đường nét: Giữ nguyên vẹn các đường nét vector, cạnh sắc sảo (crisp edges), không bị nhòe hay mờ (no blur).
- Chân thực: Tái tạo cấu trúc da chân thực, chất liệu vải chi tiết, ánh sáng phản chiếu trong gương trong vắt (crystal clear reflection).

QUY TẮC BỐ CỤC "KHÔNG CHE MẶT" TUYỆT ĐỐI:
${phonePrompt}
- KHUÔN MẶT: Sử dụng chính xác 100% các đường nét và đặc điểm từ ảnh tham chiếu 1 (KOC).

TRANG PHỤC & BỐI CẢNH:
- TRANG PHỤC: Sử dụng chính xác bộ đồ từ ảnh tham chiếu 2. Đảm bảo form dáng và màu sắc chuẩn xác.
- BỐI CẢNH: ${scene}.
- ÁNH SÁNG: Ánh sáng chuyên nghiệp, studio quality, tạo chiều sâu cho bức ảnh.

PHONG CÁCH:
- Ảnh chụp Mirror Selfie chất lượng cao, chuyên nghiệp. 
- Tone màu hiện đại, sang trọng, tinh tế.
${additionalPrompt ? `- GHI CHÚ RIÊNG: ${additionalPrompt}` : ""}

LƯU Ý CUỐI CÙNG: Đây là ảnh chất lượng 1080p, yêu cầu độ trung thực tối đa với người mẫu và trang phục, đồng thời đảm bảo khuôn mặt luôn là tâm điểm, không bị che khuất.
`.trim();

  let retries = 3;
  let lastError: any;

  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: actualModel,
        contents: {
          parts: [
            { inlineData: { data: cleanKoc, mimeType: 'image/png' } },
            { inlineData: { data: cleanOutfit, mimeType: 'image/png' } },
            { text: prompt },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "9:16"
          }
        },
      });

      let generatedUrl = "";
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            generatedUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!generatedUrl) {
        throw new Error("Không thể trích xuất hình ảnh từ phản hồi của AI.");
      }

      return generatedUrl;
    } catch (error: any) {
      console.error(`Gemini API Error (Retries left: ${retries - 1}):`, error);
      lastError = error;
      
      const errorMessage = error?.message || JSON.stringify(error);
      const isRateLimit = errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED");
      const isPermissionDenied = errorMessage.includes("403") || errorMessage.includes("PERMISSION_DENIED");
      
      if (isPermissionDenied) {
        throw new Error(`Lỗi quyền truy cập (403): API Key không có quyền sử dụng model ${model}. Vui lòng đảm bảo API Key thuộc dự án đã bật thanh toán (Billing).`);
      }

      if (isRateLimit && retries > 1) {
        retries--;
        // Đợi 5 giây trước khi thử lại
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
      
      if (isRateLimit) {
        throw new Error(`Lỗi giới hạn (429): API Key đã hết hạn mức hoặc gọi quá nhanh. Vui lòng thử lại sau.`);
      }

      throw error;
    }
  }
  
  throw lastError;
};
