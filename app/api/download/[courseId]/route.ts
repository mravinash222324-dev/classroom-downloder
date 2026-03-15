import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getGoogleClassroom } from "@/lib/google"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session: any = await getServerSession(authOptions)
  const { courseId } = await params

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    console.log(`[API] Fetching materials for course: ${courseId}`)
    const classroom = getGoogleClassroom(session.accessToken)
    
    // Fetch with resilience: if one fails, we still get others
    const fetchSafe = async (promise: Promise<any>, name: string) => {
      try {
        const res = await promise
        return res.data
      } catch (err: any) {
        console.warn(`[API] Warning fetching ${name}:`, err.message)
        return null
      }
    }

    const [courseWork, courseWorkMaterials, announcements] = await Promise.all([
      fetchSafe(classroom.courses.courseWork.list({ courseId }), "CourseWork"),
      fetchSafe(classroom.courses.courseWorkMaterials.list({ courseId }), "CourseWorkMaterials"),
      fetchSafe(classroom.courses.announcements.list({ courseId }), "Announcements"),
    ])

    const allMaterials: any[] = []

    // Extract Drive files from CourseWork
    courseWork?.courseWork?.forEach((item: any) => {
      item.materials?.forEach((m: any) => {
        if (m.driveFile?.driveFile) {
          const driveFile = m.driveFile.driveFile
          allMaterials.push({ 
            id: driveFile.id,
            title: driveFile.title, // This is the actual filename
            assignmentTitle: item.title,
            source: "CourseWork" 
          })
        }
      })
    })

    // Extract Drive files from CourseWork Materials
    courseWorkMaterials?.courseWorkMaterial?.forEach((item: any) => {
      item.materials?.forEach((m: any) => {
        if (m.driveFile?.driveFile) {
          const driveFile = m.driveFile.driveFile
          allMaterials.push({ 
            id: driveFile.id,
            title: driveFile.title,
            assignmentTitle: item.title,
            source: "Material" 
          })
        }
      })
    })

    // Extract Drive files from Announcements
    announcements?.announcements?.forEach((item: any) => {
      item.materials?.forEach((m: any) => {
        if (m.driveFile?.driveFile) {
          const driveFile = m.driveFile.driveFile
          allMaterials.push({ 
            id: driveFile.id,
            title: driveFile.title,
            assignmentTitle: "Announcement",
            source: "Announcement" 
          })
        }
      })
    })

    console.log(`[API] Found ${allMaterials.length} materials for course ${courseId}`)
    return NextResponse.json({ materials: allMaterials })
  } catch (error: any) {
    console.error("[API] Fatal error fetching materials:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
