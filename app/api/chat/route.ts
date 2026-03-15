import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const systemPrompt = `You are a helpful Study Assistant for a Google Classroom. 
    You have access to the following classroom materials context:
    ${context}

    Use this context to answer the student's questions accurately and concisely. 
    If you don't know the answer based on the context, say you don't know, but try to be as helpful as possible within the scope of their studies.`

    const chat = model.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    })

    const lastMessage = messages[messages.length - 1].content
    const fullPrompt = `${systemPrompt}\n\nUser: ${lastMessage}`
    
    const result = await chat.sendMessage(fullPrompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ text })
  } catch (error: any) {
    console.error("Chat Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
