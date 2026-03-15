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

    const prompt = `You are an expert educational analyst. I will provide a list of materials from a Google Classroom course titled "${courseName}".
    
    Based on these materials, generate a JSON object with three parts:
    1. "knowledgeMap": A list of topics (nodes) and their relationships (edges).
    2. "youtubeFinder": A list of 3 high-quality YouTube tutorial recommendations (search queries/titles) with a brief reason why they fit.
    3. "microSlides": A list of 10-15 extremely concise study cards (title, summary, one key takeaway).

    Materials Context:
    ${contextString}

    Return EXACTLY this JSON structure:
    {
      "knowledgeMap": {
        "nodes": [{ "id": "Topic Name", "type": "concept|assignment|material" }],
        "edges": [{ "from": "Topic A", "to": "Topic B", "label": "Connection type" }]
      },
      "youtubeRecommendations": [{ "title": "Topic Name", "searchQuery": "YouTube Search Term", "reason": "Why this is recommended" }],
      "microSlides": [{ "title": "Short Title", "summary": "1-2 sentence max summary", "keyTakeaway": "Single core fact or formula" }]
    }

    Ensure the data is accurate to the context provided. Do not include any text outside the JSON block.`

    const modelName = "gemini-1.5-flash-latest"
    const model = genAI.getGenerativeModel({ model: modelName })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from potential markdown blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("Failed to parse AI response into JSON")
    
    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json(data)

  } catch (error: any) {
    console.error("Study Insights Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
