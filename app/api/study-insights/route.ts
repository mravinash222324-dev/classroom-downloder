import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { courseName, materials } = await req.json()

    if (!materials || materials.length === 0) {
      return NextResponse.json({ error: "No materials provided for analysis" }, { status: 400 })
    }

    const contextString = materials.map((m: any) => 
      `- [${m.source}] ${m.title} (Assignment: ${m.assignmentTitle || "N/A"})`
    ).join("\n")

    const prompt = `You are a world-class academic summarizer. I will provide a list of materials from a Google Classroom course titled "${courseName}".
    
    TASK: Generate a COMPREHENSIVE full-module study sheet. It must cover EVERY major topic found across all materials. 
    
    Based on these materials, generate a JSON object with:
    1. "knowledgeMap": A list of topics (nodes) and their relationships (edges).
    2. "youtubeFinder": A list of 3 high-quality YouTube tutorial recommendations.
    3. "studySections": A list of 14-16 VERY detailed study sections. Each section must be extremely dense with definitions, core concepts, formulas, and explanations. Do not skip any details. Think of it as a "complete module guide" compressed into a 3-column sheet. Each content block should be substantial in length.

    Materials Context:
    ${contextString}

    Return EXACTLY this JSON structure:
    {
      "knowledgeMap": {
        "nodes": [{ "id": "Topic Name", "type": "concept|assignment|material" }],
        "edges": [{ "from": "Topic A", "to": "Topic B", "label": "Connection type" }]
      },
      "youtubeRecommendations": [{ "title": "Topic Name", "searchQuery": "YouTube Search Term", "reason": "Why this is recommended" }],
      "studySections": [{ "id": 1, "title": "Section Title", "content": "VERY detailed explanatory text. Use bullet points (•), numbered lists, and bold terms within the string where appropriate. Cover as much ground as possible." }]
    }

    Ensure the data is accurate to the context provided. Do not include any text outside the JSON block.`

    // Try these models in order of preference (same as chat route)
    const modelsToTry = ["gemini-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"]
    let lastError;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting Study Insights with model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        
        // Extract JSON from potential markdown blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0])
          console.log(`Success with model: ${modelName}`)
          return NextResponse.json(data)
        }
      } catch (e: any) {
        lastError = e
        console.warn(`Model ${modelName} failed for insights: ${e.message}`)
      }
    }

    throw new Error(
      "All Gemini models failed (404). This usually means the 'Generative Language API' is not enabled or the API key doesn't have permission for these models."
    )

  } catch (error: any) {
    console.error("Study Insights Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
