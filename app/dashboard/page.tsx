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
  MessageSquareText,
  ExternalLink,
  BrainCircuit,
  Map,
  Lightbulb,
  X
} from "lucide-react"
import JSZip from "jszip"
import ChatInterface from "@/components/ChatInterface"
import KnowledgeMap from "@/components/KnowledgeMap"
import YouTubeFinder from "@/components/YouTubeFinder"
import MicroSlides from "@/components/MicroSlides"

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

  // NotebookLM Sync State
  const [syncing, setSyncing] = useState<string | null>(null)
  const [syncSuccess, setSyncSuccess] = useState<{ courseName: string, url: string } | null>(null)

  // Advanced Study Features State
  const [activeStudyInsights, setActiveStudyInsights] = useState<Course | null>(null)
  const [studyData, setStudyData] = useState<any>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)

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

  const handleNotebookLMSync = async (courseId: string, courseName: string) => {
    setSyncing(courseId)
    try {
      const res = await fetch("/api/notebooklm/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, courseName }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      setSyncSuccess({ courseName, url: data.url })
    } catch (err: any) {
      console.error(err)
      alert(`Sync failed: ${err.message}`)
    } finally {
      setSyncing(null)
    }
  }

  const handleStudyInsights = async (course: Course) => {
    setActiveStudyInsights(course)
    setLoadingInsights(true)
    setStudyData(null)

    try {
      const res = await fetch(`/api/download/${course.id}`)
      const { materials } = await res.json()
      
      const insightRes = await fetch("/api/study-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseName: course.name, materials }),
      })
      const data = await insightRes.json()
      if (data.error) throw new Error(data.error)
      setStudyData(data)
    } catch (err: any) {
      console.error(err)
      alert(`Failed to load study insights: ${err.message}`)
    } finally {
      setLoadingInsights(false)
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
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-8">
      <nav className="flex justify-between items-center mb-10 sm:mb-12">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500 flex items-center justify-center">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            Classroom Downloader
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-zinc-400 hidden lg:inline text-sm">{session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-zinc-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 sm:mb-12">
          <div className="max-w-md">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">My Courses</h2>
            <p className="text-zinc-400 text-sm sm:text-base">Select a course to download all its materials or ask the AI.</p>
          </div>
          <button 
            disabled={downloading !== null}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-semibold transition-all shadow-lg shadow-purple-500/20 text-sm sm:text-base"
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
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => openAIChat(course)}
                        className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500 hover:text-white text-purple-400 transition-all flex items-center gap-2 text-[11px] font-bold shadow-lg shadow-purple-500/5 group/ai"
                      >
                        <Sparkles className="w-3.5 h-3.5 group-hover/ai:animate-pulse" />
                        AI CHAT
                      </button>
                      <button
                        onClick={() => handleNotebookLMSync(course.id, course.name)}
                        disabled={syncing !== null}
                        className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-600 hover:text-white text-blue-400 transition-all flex items-center gap-2 text-[11px] font-bold shadow-lg shadow-blue-500/5 group/notebook disabled:opacity-50"
                      >
                        {syncing === course.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <BrainCircuit className="w-3.5 h-3.5 group-hover/notebook:scale-110 transition-transform" />
                        )}
                        SYNC NOTEBOOK
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1 truncate text-white">{course.name}</h3>
                  <p className="text-zinc-500 text-sm mb-6 truncate">{course.section || "No Section"}</p>
                  
                    <button
                      onClick={() => downloadCourseMaterials(course.id, course.name)}
                      disabled={downloading !== null}
                      className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-black font-semibold transition-all flex items-center justify-center gap-2 mb-2"
                    >
                      {downloading === course.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                      {downloading === course.id ? "Preparing..." : "Download Materials"}
                    </button>

                    <button
                      onClick={() => handleStudyInsights(course)}
                      className="w-full py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Map className="w-5 h-5" />
                      STUDY INSIGHTS
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

      {/* Sync Success Modal */}
      <AnimatePresence>
        {syncSuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-[32px] max-w-lg w-full shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Sync Successful!</h3>
              <p className="text-zinc-400 mb-6 leading-relaxed">
                I've organized the materials for <span className="text-white font-bold">{syncSuccess.courseName}</span> into a dedicated Drive folder. 
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Next Steps</p>
                  <ol className="text-sm text-zinc-300 space-y-2 list-decimal list-inside">
                    <li>Go to NotebookLM</li>
                    <li>Choose "Google Drive" as source</li>
                    <li>Select the <span className="text-purple-400">"{syncSuccess.courseName}"</span> folder</li>
                  </ol>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <a 
                  href={syncSuccess.url} 
                  target="_blank" 
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                >
                  View in Google Drive <ExternalLink className="w-4 h-4" />
                </a>
                <a 
                  href="https://notebooklm.google.com" 
                  target="_blank" 
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all"
                >
                  Open NotebookLM <BrainCircuit className="w-4 h-4" />
                </a>
                <p className="text-[10px] text-zinc-500 text-center mt-2 px-4 italic">
                  Tip: If the folder is empty, try logging out and back in to grant permissions.
                </p>
                <button 
                  onClick={() => setSyncSuccess(null)}
                  className="mt-2 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Study Insights Overlay */}
      <AnimatePresence>
        {activeStudyInsights && (
          <div className="fixed inset-0 z-[70] bg-[#050505] flex flex-col overflow-y-auto">
            <header className="sticky top-0 z-10 px-6 py-4 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Study Insights</h2>
                  <p className="text-xs text-zinc-500 font-medium">{activeStudyInsights.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveStudyInsights(null)}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </header>

            <div className="max-w-7xl mx-auto w-full p-6 sm:p-10">
              {loadingInsights ? (
                <div className="flex flex-col items-center justify-center py-40">
                  <div className="relative w-20 h-20 mb-8">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500/20"
                    />
                    <Loader2 className="absolute inset-0 m-auto w-10 h-10 text-blue-500 animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Analyzing Classroom...</h3>
                  <p className="text-zinc-500 text-center max-w-sm">
                    Gemini is scanning your materials to build a knowledge map and find the best tutorials.
                  </p>
                </div>
              ) : studyData ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-10 print-area"
                >
                  {/* Left Column: Knowledge Map & Tutorials */}
                  <div className="lg:col-span-4 space-y-10">
                    <section>
                      <KnowledgeMap data={studyData.knowledgeMap} />
                    </section>
                    <section>
                      <YouTubeFinder recommendations={studyData.youtubeRecommendations} />
                    </section>
                  </div>

                  {/* Right Column: Micro Slides */}
                  <div className="lg:col-span-8">
                    <MicroSlides slides={studyData.microSlides} />
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-40">
                  <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">Failed to load insights. Please try again.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
