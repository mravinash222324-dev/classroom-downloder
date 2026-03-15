import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getGoogleDrive } from "@/lib/google"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const session: any = await getServerSession(authOptions)
  const { fileId } = await params

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const drive = getGoogleDrive(session.accessToken)
    
    // Get file metadata to get the original filename
    const metadata = await drive.files.get({
      fileId,
      fields: "name, mimeType",
    })

    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    )

    const headers = new Headers()
    headers.set("Content-Disposition", `attachment; filename="${metadata.data.name}"`)
    headers.set("Content-Type", metadata.data.mimeType || "application/octet-stream")

    return new Response(response.data as any, {
      headers,
    })
  } catch (error: any) {
    console.error("Error downloading file:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
