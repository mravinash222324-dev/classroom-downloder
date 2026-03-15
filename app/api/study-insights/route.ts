import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getGoogleDrive } from "@/lib/google"
import mammoth from "mammoth"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  console.log("[Insights] Received request for study insights")
  const session: any = await getServerSession(authOptions)
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { courseName, materials } = await req.json()

    if (!materials || materials.length === 0) {
      return NextResponse.json({ error: "No materials provided for analysis" }, { status: 400 })
    }

    // Modern dynamic import for pdf-parse (handles CJS interop)
    // We do this inside the handler to avoid top-level build time issues
    const pdfImport = await import("pdf-parse")
    const pdf = pdfImport.default || pdfImport

    const drive = getGoogleDrive(session.accessToken)
    let aggregatedContent = `COURSE: ${courseName}\n\n`

    console.log(`[Insights] Deep parsing ${materials.length} materials...`)
    
    const parsingPromises = materials.map(async (m: any) => {
      try {
        if (!m.id || !m.mimeType) return `- [Metadata Only] ${m.title}`

        if (m.mimeType === "application/pdf" || m.mimeType === "application/vnd.google-apps.pdf") {
          const res = await drive.files.get({ fileId: m.id, alt: "media" }, { responseType: "arraybuffer" })
          const buffer = Buffer.from(res.data as ArrayBuffer)
          const data = await pdf(buffer) 
          return `MATERIAL: ${m.title}\nCONTENT: ${data.text.slice(0, 10000)}...`
        } 
        else if (m.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          const res = await drive.files.get({ fileId: m.id, alt: "media" }, { responseType: "arraybuffer" })
          const buffer = Buffer.from(res.data as ArrayBuffer)
          const { value } = await mammoth.extractRawText({ buffer })
          return `MATERIAL: ${m.title}\nCONTENT: ${value.slice(0, 10000)}...`
        }
        
        return `- [Metadata] ${m.title} (Type: ${m.mimeType})`
      } catch (err: any) {
        console.warn(`[Insights] Failed to parse ${m.title}:`, err.message)
        return `- [Metadata] ${m.title} (Fetch failed: ${err.message})`
      }
    })

    const results = await Promise.all(parsingPromises)
    aggregatedContent += results.join("\n\n---\n\n")

    const modelsToTry = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-flash-latest", "gemini-pro"]
    
    const prompt = `You are an Encyclopedic Professor. I will provide extracted text from materials in the Google Classroom course "${courseName}".
    
    TASK: Generate a VAST, ELABORATE, and MASTER-CLASS study sheet. It must be extremely dense with high-level academic content.
    
    Structure the study sheet with:
    1. "knowledgeMap": A list of topics and their intricate relationships.
    2. "youtubeRecommendations": 3 expert-level video searches.
    3. "studySections": 25-32 detailed academic deep-dives. Each section must be a standalone lesson with definitions, bullet points, technical terms, and complex explanations. Do not abbreviate. Use all available space on multiple A4 columns.
 
    RESOURCES CONTENT:
    ${aggregatedContent.slice(0, 50000)}
 
    Return EXACTLY this JSON structure:
    {
      "knowledgeMap": {
        "nodes": [{ "id": "Topic Name", "type": "concept|assignment|material" }],
        "edges": [{ "from": "Topic A", "to": "Topic B", "label": "Connection type" }]
      },
      "youtubeRecommendations": [{ "title": "Topic Name", "searchQuery": "YouTube Search Term", "reason": "Why this is recommended" }],
      "studySections": [{ "id": 1, "title": "Section Title", "content": "Encyclopedic detailed explanatory text. Use bullet points (•), bold terms, and complex structures. Fill the space with deep value." }]
    }`

    let lastError;
    for (const modelName of modelsToTry) {
      try {
        console.log(`[Insights] Attempting AI generation with: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0])
          return NextResponse.json(data)
        }
      } catch (e: any) {
        lastError = e
        console.warn(`[Insights] Model ${modelName} failed: ${e.message}`)
      }
    }

    throw new Error(lastError?.message || "All AI models failed")

  } catch (error: any) {
    console.error("Study Insights Final Handler Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
