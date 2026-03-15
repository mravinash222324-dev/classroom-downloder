import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "../auth/[...nextauth]/route"
import { getGoogleClassroom } from "@/lib/google"

export async function GET() {
  const session: any = await getServerSession(authOptions)

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const classroom = getGoogleClassroom(session.accessToken)
    const response = await classroom.courses.list({
      courseStates: ["ACTIVE"],
    })

    return NextResponse.json({ courses: response.data.courses || [] })
  } catch (error: any) {
    console.error("Error fetching courses:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
