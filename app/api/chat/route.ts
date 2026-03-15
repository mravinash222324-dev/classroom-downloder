import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json()
    const lastMessage = messages[messages.length - 1].content

    const systemPrompt = `You are a helpful Study Assistant for a Google Classroom. 
    You have access to the following classroom materials context:
    ${context}

    Use this context to answer the student's questions accurately and concisely. 
    If you don't know the answer based on the context, say you don't know, but try to be as helpful as possible within the scope of their studies.`

    const fullPrompt = `${systemPrompt}\n\nUser: ${lastMessage}`

    // Gemini requires the first message in history to be from 'user'
    let history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }))

    const firstUserIndex = history.findIndex((m: any) => m.role === "user")
    if (firstUserIndex !== -1) {
      history = history.slice(firstUserIndex)
    } else {
      history = []
    }

    // Try these models in order of preference
    const modelsToTry = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"]
    let lastError;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting AI request with model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        
        const chat = model.startChat({
          history,
          generationConfig: { maxOutputTokens: 1000 },
        })

        const result = await chat.sendMessage(fullPrompt)
        const response = await result.response
        const text = response.text()

        if (text) {
          console.log(`Success with model: ${modelName}`)
          return NextResponse.json({ text })
        }
      } catch (e: any) {
        lastError = e
        console.warn(`Model ${modelName} failed: ${e.message}`)
        // Continue to next model
      }
    }

    throw new Error(
      "All Gemini models failed (404). This usually means the 'Generative Language API' is not enabled in your Google Cloud Project or the API key doesn't have permission for these models."
    )

  } catch (error: any) {
    console.error("Final Chat Error:", {
      message: error.message,
      status: error.status,
      details: error.errorDetails
    })
    return NextResponse.json({ 
      error: error.message || "Failed to communicate with AI. Please check your API key and ensure 'Generative Language API' is enabled in Google Cloud Console." 
    }, { status: 500 })
  }
}
