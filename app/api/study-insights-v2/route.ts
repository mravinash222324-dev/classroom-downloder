import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getGoogleDrive } from "@/lib/google"
import mammoth from "mammoth"
import { createRequire } from "module"

// Use createRequire to bypass ESM import issues with broken CJS packages
const require = createRequire(import.meta.url)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  console.log("[v2] Received request for study insights")
  const session: any = await getServerSession(authOptions)
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { courseName, materials } = await req.json()
    console.log(`[v2] Processing ${materials?.length} materials for ${courseName}`)

    // Use require for pdf-parse to avoid the ESM import error 
    // and path resolution issues seen in the logs.
    let pdfParser: any;
    try {
      pdfParser = require("pdf-parse")
    } catch (e) {
      console.error("[v2] Failed to load pdf-parse via require:", e)
    }

    const drive = getGoogleDrive(session.accessToken)
    let aggregatedContent = `COURSE: ${courseName}\n\n`

    const parsingPromises = (materials || []).map(async (m: any) => {
      try {
        if (!m.id || !m.mimeType) return `- [Metadata Only] ${m.title}`

        if ((m.mimeType === "application/pdf" || m.mimeType === "application/vnd.google-apps.pdf")) {
          const res = await drive.files.get({ fileId: m.id, alt: "media" }, { responseType: "arraybuffer" })
          const buffer = Buffer.from(res.data as ArrayBuffer)
          
          if (pdfParser) {
            const data = await pdfParser(buffer) 
            return `MATERIAL: ${m.title}\nCONTENT: ${data.text.slice(0, 10000)}...`
          } else {
            return `MATERIAL: ${m.title}\nCONTENT: [PDF Parsing skipped due to library load failure]`
          }
        } 
        else if (m.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          const res = await drive.files.get({ fileId: m.id, alt: "media" }, { responseType: "arraybuffer" })
          const buffer = Buffer.from(res.data as ArrayBuffer)
          const { value } = await mammoth.extractRawText({ buffer })
          return `MATERIAL: ${m.title}\nCONTENT: ${value.slice(0, 10000)}...`
        }
        
        return `- [Metadata] ${m.title} (Type: ${m.mimeType})`
      } catch (err: any) {
        console.warn(`[v2] Failed to parse ${m.title}:`, err.message)
        return `- [Metadata] ${m.title} (Fetch failed)`
      }
    })

    const results = await Promise.all(parsingPromises)
    aggregatedContent += results.join("\n\n---\n\n")

    const prompt = `You are an Encyclopedic Professor. Course: "${courseName}". Generate a VAST, ELABORATE, MASTER-CLASS study sheet. Density is priority. 32 sections. Academic tone. Standalone lessons. Fill the space.
 
    CONTENT:
    ${aggregatedContent.slice(0, 50000)}
 
    Return EXACTLY this JSON structure:
    {
      "knowledgeMap": { "nodes": [], "edges": [] },
      "youtubeRecommendations": [],
      "studySections": [{ "id": 1, "title": "...", "content": "..." }]
    }`

    // Synchronize with models used in /api/chat
    const modelsToTry = ["gemini-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"]
    let lastError;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[v2] Attempting AI generation with: ${modelName}`)
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
        console.warn(`[v2] Model ${modelName} failed: ${e.message}`)
      }
    }

    throw new Error(lastError?.message || "AI Generation Failed - All models returned errors")

  } catch (error: any) {
    console.error("[v2] Final Error Handler:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
