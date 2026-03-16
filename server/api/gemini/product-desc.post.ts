import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { title, brand, category, specs } = body

  if (!config.geminiApiKey) {
    console.warn('⚠️ Missing Gemini API Key. Returning fallback mock description data.')
    return {
      textBlocks: [
        `${title} là một trong những sản phẩm nổi bật nhất của thương hiệu ${brand}, mang đến giải pháp tối ưu cho công việc hàng ngày của bạn. Với thiết kế tinh tế và độ hoàn thiện cao, đây là sự lựa chọn hàng đầu trong phân khúc ${category}.`,
        `Nhờ việc tích hợp các công nghệ tiên tiến, thiết bị đảm bảo khả năng vận hành bền bỉ và mạnh mẽ. Hệ thống được tinh chỉnh để tiết kiệm tối đa điện năng trong khi vẫn duy trì hiệu suất ở mức cao nhất, đáp ứng các tiêu chuẩn khắt khe.`,
        `Thao tác sử dụng cực kỳ thân thiện với người dùng. ${title} được trang bị các cơ chế an toàn tự động, giúp chủ động phòng tránh rủi ro trong quá trình thao tác. Bạn hoàn toàn có thể an tâm khi sử dụng sản phẩm này cho gia đình hoặc doanh nghiệp.`,
        `Chính sách bảo hành và hậu mãi đến từ hãng ${brand} cũng là một điểm cộng rất lớn. Bộ sản phẩm chính hãng đi kèm đầy đủ các phụ kiện thay thế cơ bản, giúp tiết kiệm thời gian và chi phí phát sinh sau một thời gian vận hành.`
      ]
    }
  }

  // Create a strict prompt asking for exactly an array of paragraphs.
  const prompt = `
Viết bài giới thiệu chi tiết, hấp dẫn và thuyết phục về sản phẩm thiết bị máy móc sau:
- Tên sản phẩm: ${title || 'Sản phẩm'}
- Thương hiệu: ${brand || 'Chưa rõ'}
- Danh mục: ${category || 'Thiết bị'}
- Một số thông số chính (nếu có): ${specs || ''}

Yêu cầu ĐẶC BIỆT: Trả về kết quả là một mảng chuỗi JSON hợp lệ (ví dụ: ["Đoạn 1", "Đoạn 2", "Đoạn 3"]). MỖI PHẦN TỬ TRONG MẢNG là một đoạn văn bản giới thiệu về một khía cạnh hoặc tính năng của sản phẩm. Không trả về bất kỳ định dạng markdown nào. Chỉ trả về một Array chứa các đoạn văn (String). Nhớ format text tự nhiên, không chứa HTML.
`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            responseMimeType: "application/json",
          }
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API Error:', errorText)
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to fetch content from Gemini API',
      })
    }

    const data = await response.json()
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]'

    // Attempt to parse JSON strictly since we requested a JSON array
    let textBlocks: string[] = []
    try {
      textBlocks = JSON.parse(textOutput)
    } catch (e) {
      // Fallback: split by newlines if Gemini failed to obey JSON exactly
      textBlocks = textOutput.split('\n').filter((t: string) => t.trim().length > 10)
    }

    // Force array shape if completely malformed
    if (!Array.isArray(textBlocks) || textBlocks.length === 0) {
      textBlocks = [textOutput]
    }

    return {
      textBlocks
    }
  } catch (err: any) {
    console.error('Error in /api/gemini/product-desc:', err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Internal Server Error'
    })
  }
})
