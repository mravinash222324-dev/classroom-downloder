import { google } from "googleapis"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accessToken = (session as any).accessToken as string

  const { courseId, courseName } = await req.json()

  if (!courseId || !courseName) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })

  const drive = google.drive({ version: "v3", auth })
  const classroom = google.classroom({ version: "v1", auth })

  try {
    // 1. Create a "Study Assistant" root folder if it doesn't exist
    const rootFolderName = "Study Assistant: Classroom Materials"
    let rootFolderId = ""

    const rootCheck = await drive.files.list({
      q: `name = '${rootFolderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id)",
    })

    if (rootCheck.data.files && rootCheck.data.files.length > 0) {
      rootFolderId = rootCheck.data.files[0].id!
    } else {
      const folderRes = await drive.files.create({
        requestBody: {
          name: rootFolderName,
          mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id",
      })
      rootFolderId = folderRes.data.id!
    }

    // 2. Create course-specific folder
    const courseFolderName = `${courseName}`
    let courseFolderId = ""

    const courseCheck = await drive.files.list({
      q: `name = '${courseFolderName}' and '${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id)",
    })

    if (courseCheck.data.files && courseCheck.data.files.length > 0) {
      courseFolderId = courseCheck.data.files[0].id!
    } else {
      const folderRes = await drive.files.create({
        requestBody: {
          name: courseFolderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [rootFolderId],
        },
        fields: "id",
      })
      courseFolderId = folderRes.data.id!
    }

    // 3. Fetch materials and create shortcuts
    // This is better than copying because it doesn't duplicate storage
    // AND Classroom/Drive shortcut API is reliable
    const [courseWork, materials, announcements] = await Promise.all([
      classroom.courses.courseWork.list({ courseId }).catch(() => ({ data: { courseWork: [] } })),
      classroom.courses.courseWorkMaterials.list({ courseId }).catch(() => ({ data: { courseWorkMaterial: [] } })),
      classroom.courses.announcements.list({ courseId }).catch(() => ({ data: { announcements: [] } })),
    ])

    const allMaterials: any[] = []

    // Extract files from all sources
    const extractFiles = (items: any[], type: string) => {
      items?.forEach(item => {
        item.materials?.forEach((m: any) => {
          if (m.driveFile?.driveFile) {
            allMaterials.push(m.driveFile.driveFile)
          }
        })
      })
    }

    extractFiles(courseWork.data.courseWork || [], "Assignment")
    extractFiles(materials.data.courseWorkMaterial || [], "Material")
    extractFiles(announcements.data.announcements || [], "Announcement")

    // Deduplicate by ID
    const uniqueFiles = Array.from(new Set(allMaterials.map(f => f.id)))
      .map(id => allMaterials.find(f => f.id === id))

    // 4. Create Copies in the course folder
    // Note: We only add files that aren't already there
    const existingFiles = await drive.files.list({
      q: `'${courseFolderId}' in parents and trashed = false`,
      fields: "files(originalFilename, name)",
    })

    const existingNames = new Set(
      existingFiles.data.files?.map(f => f.name) || []
    )

    for (const file of uniqueFiles) {
      if (!existingNames.has(file.title)) {
        try {
          await drive.files.copy({
            fileId: file.id,
            requestBody: {
              name: file.title,
              parents: [courseFolderId],
            }
          })
          console.log(`Copied: ${file.title}`)
        } catch (e) {
          console.error(`Failed to copy ${file.title}`, e)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      folderId: courseFolderId,
      url: `https://drive.google.com/drive/folders/${courseFolderId}`
    })

  } catch (error: any) {
    console.error("Sync Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
