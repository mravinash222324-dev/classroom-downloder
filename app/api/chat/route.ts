import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json()

    // Try gemini-1.5-flash first, fallback to gemini-pro if needed
    const modelName = "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName })

    const systemPrompt = `You are a helpful Study Assistant for a Google Classroom. 
    You have access to the following classroom materials context:
    ${context}

    Use this context to answer the student's questions accurately and concisely. 
    If you don't know the answer based on the context, say you don't know, but try to be as helpful as possible within the scope of their studies.`

    // Gemini requires the first message in history to be from 'user'
    let history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }))

    // Find the first user message and slice the history from there
    const firstUserIndex = history.findIndex((m: any) => m.role === "user")
    if (firstUserIndex !== -1) {
      history = history.slice(firstUserIndex)
    } else {
      history = []
    }

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    })

    const lastMessage = messages[messages.length - 1].content
    const fullPrompt = `${systemPrompt}\n\nUser: ${lastMessage}`
    
    const result = await chat.sendMessage(fullPrompt)
    const response = await result.response
    const text = response.text()

    if (!text) throw new Error("Empty response from AI")

    return NextResponse.json({ text })
  } catch (error: any) {
    console.error("Chat Error Detail:", {
      message: error.message,
      stack: error.stack,
      status: error.status,
      details: error.errorDetails
    })
    return NextResponse.json({ 
      error: "The AI is currently unavailable for this model. Please try again in a moment or check your API key permissions." 
    }, { status: 500 })
  }
}
