import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { title, brand, category, specs } = body

  if (!config.geminiApiKey) {
    console.warn('?? Missing Gemini API Key. Returning fallback mock description data.')
    return {
      textBlocks: [
        `${title} là m?t trong nh?ng s?n ph?m n?i b?t nh?t c?a thuong hi?u ${brand}, mang d?n gi?i pháp t?i uu cho công vi?c hàng ngày c?a b?n. V?i thi?t k? tinh t? và d? hoàn thi?n cao, dây là s? l?a ch?n hàng d?u trong phân khúc ${category}.`,
        `Nh? vi?c tích h?p các công ngh? tiên ti?n, thi?t b? d?m b?o kh? nang v?n hành b?n b? và m?nh m?. H? th?ng du?c tinh ch?nh d? ti?t ki?m t?i da di?n nang trong khi v?n duy trì hi?u su?t ? m?c cao nh?t, dáp ?ng các tiêu chu?n kh?t khe.`,
        `Thao tác s? d?ng c?c k? thân thi?n v?i ngu?i dùng. ${title} du?c trang b? các co ch? an toàn t? d?ng, giúp ch? d?ng phòng tránh r?i ro trong quá trình thao tác. B?n hoàn toàn có th? an tâm khi s? d?ng s?n ph?m này cho gia dình ho?c doanh nghi?p.`,
        `Chính sách b?o hành và h?u mãi d?n t? hãng ${brand} cung là m?t di?m c?ng r?t l?n. B? s?n ph?m chính hãng di kèm d?y d? các ph? ki?n thay th? co b?n, giúp ti?t ki?m th?i gian và chi phí phát sinh sau m?t th?i gian v?n hành.`
      ]
    }
  }

  // Create a strict prompt asking for exactly an array of paragraphs.
  const prompt = `
Vi?t bài gi?i thi?u chi ti?t, h?p d?n và thuy?t ph?c v? s?n ph?m thi?t b? máy móc sau:
- Tên s?n ph?m: ${title || 'S?n ph?m'}
- Thuong hi?u: ${brand || 'Chua rõ'}
- Danh m?c: ${category || 'Thi?t b?'}
- M?t s? thông s? chính (n?u có): ${specs || ''}

Yêu c?u Ð?C BI?T: Tr? v? k?t qu? là m?t m?ng chu?i JSON h?p l? (ví d?: ["Ðo?n 1", "Ðo?n 2", "Ðo?n 3"]). M?I PH?N T? TRONG M?NG là m?t do?n van b?n gi?i thi?u v? m?t khía c?nh ho?c tính nang c?a s?n ph?m. Không tr? v? b?t k? d?nh d?ng markdown nào. Ch? tr? v? m?t Array ch?a các do?n van (String). Nh? format text t? nhiên, không ch?a HTML.
`

  // Retry logic with exponential backoff
  const maxRetries = 3
  let lastError: any = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiApiKey}`,
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
        console.error(`Gemini API Error (attempt ${attempt + 1}/${maxRetries}):`, response.status, errorText)
        
        // If 429 (rate limit), wait and retry
        if (response.status === 429 && attempt < maxRetries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000 // Exponential backoff: 1s, 2s, 4s
          console.warn(`Rate limited. Retrying in ${waitTime}ms...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }
        
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
      lastError = err
      if (attempt === maxRetries - 1) {
        throw err
      }
      // Continue to next retry
    }
  }
  
  throw lastError || createError({
    statusCode: 500,
    statusMessage: 'Failed to get response from Gemini API after retries'
  })
})
