"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Download, 
  BookOpen, 
  LogOut, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FolderDown,
  Sparkles,
  MessageSquareText
} from "lucide-react"
import JSZip from "jszip"
import ChatInterface from "@/components/ChatInterface"

interface Course {
  id: string
  name: string
  section?: string
  description?: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null) // courseId or "ALL"
  const [progress, setProgress] = useState({ current: 0, total: 0, status: "" })
  
  // AI Chat State
  const [activeChat, setActiveChat] = useState<Course | null>(null)
  const [chatContext, setChatContext] = useState("")
  const [loadingChat, setLoadingChat] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/courses")
        .then((res) => res.json())
        .then((data) => {
          setCourses(data.courses || [])
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [status])

  const openAIChat = async (course: Course) => {
    setActiveChat(course)
    setLoadingChat(true)
    setChatContext("Loading course context...")

    try {
      const res = await fetch(`/api/download/${course.id}`)
      const { materials, error } = await res.json()

      if (error) throw new Error(error)

      if (!materials || materials.length === 0) {
        setChatContext(`Course: ${course.name}. No specific materials found in this classroom.`)
      } else {
        const contextString = materials.map((m: any) => 
          `- [${m.source}] ${m.title} (Assignment: ${m.assignmentTitle || "N/A"})`
        ).join("\n")
        setChatContext(`Course: ${course.name}\nSection: ${course.section || "N/A"}\n\nMaterials:\n${contextString}`)
      }
    } catch (err: any) {
      console.error(err)
      setChatContext(`Course: ${course.name}. (Failed to load full material list)`)
    } finally {
      setLoadingChat(false)
    }
  }

  const downloadCourseMaterials = async (courseId: string, courseName: string) => {
    setDownloading(courseId)
    setProgress({ current: 0, total: 0, status: "Fetching material list..." })

    try {
      const res = await fetch(`/api/download/${courseId}`)
      const { materials, error } = await res.json()

      if (error) throw new Error(error)

      if (!materials || materials.length === 0) {
        setProgress({ current: 0, total: 0, status: "No materials found." })
        setTimeout(() => setDownloading(null), 2000)
        return
      }

      setProgress({ current: 0, total: materials.length, status: "Initializing zip..." })
      const zip = new JSZip()
      const folder = zip.folder(courseName)

      for (let i = 0; i < materials.length; i++) {
        const file = materials[i]
        setProgress((prev) => ({ ...prev, current: i + 1, status: `Downloading: ${file.title || "File"}` }))
        
        try {
          const fileRes = await fetch(`/api/proxy-download/${file.id}`)
          if (!fileRes.ok) throw new Error("Failed to download file")
          const blob = await fileRes.blob()
          folder?.file(file.title || `file_${i}`, blob)
        } catch (err) {
          console.error(`Failed to download ${file.id}`, err)
        }
      }

      setProgress({ current: materials.length, total: materials.length, status: "Generating ZIP..." })
      const content = await zip.generateAsync({ type: "blob" })
      
      const link = document.createElement("a")
      link.href = URL.createObjectURL(content)
      link.download = `${courseName}_materials.zip`
      link.click()

      setProgress({ current: materials.length, total: materials.length, status: "Done!" })
      setTimeout(() => setDownloading(null), 2000)
    } catch (err: any) {
      console.error(err)
      setProgress({ current: 0, total: 0, status: `Error: ${err.message}` })
      setTimeout(() => setDownloading(null), 3000)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <p>Please sign in to access the dashboard.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <nav className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            Classroom Downloader
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 hidden sm:inline">{session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-zinc-400 hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto pb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-white">My Courses</h2>
            <p className="text-zinc-400">Select a course to download all its materials or ask the AI.</p>
          </div>
          <button 
            disabled={downloading !== null}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-semibold transition-all shadow-lg shadow-purple-500/20"
          >
            <FolderDown className="w-5 h-5" />
            Download All Courses
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {courses.map((course) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <button
                      onClick={() => openAIChat(course)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/20 hover:border-purple-500/30 text-zinc-400 hover:text-purple-400 transition-all flex items-center gap-2 text-xs font-bold"
                    >
                      <Sparkles className="w-4 h-4" />
                      ASK AI
                    </button>
                  </div>
                  <h3 className="text-xl font-bold mb-1 truncate text-white">{course.name}</h3>
                  <p className="text-zinc-500 text-sm mb-6 truncate">{course.section || "No Section"}</p>
                  
                  <button
                    onClick={() => downloadCourseMaterials(course.id, course.name)}
                    disabled={downloading !== null}
                    className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-black font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {downloading === course.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    {downloading === course.id ? "Preparing..." : "Download Materials"}
                  </button>
                </div>

                {downloading === course.id && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                    <p className="text-sm font-medium mb-1">{progress.status}</p>
                    {progress.total > 0 && (
                      <div className="w-full max-w-[200px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {courses.length === 0 && !loading && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-400">No courses found</h3>
            <p className="text-zinc-500">Make sure you have active classes in Google Classroom.</p>
          </div>
        )}
      </div>

      {activeChat && (
        <ChatInterface 
          courseName={activeChat.name} 
          context={chatContext} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  )
}
