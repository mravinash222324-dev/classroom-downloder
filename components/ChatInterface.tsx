"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, User, Bot, X, Loader2, Minimize2, Maximize2, Sparkles, MessageSquare, GraduationCap } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  role: "user" | "ai"
  content: string
}

interface ChatInterfaceProps {
  courseName: string
  context: string
  onClose: () => void
}

export default function ChatInterface({ courseName, context, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: `Hi there! I'm your **Intelligent Study Assistant** for the course **${courseName}**. \n\nI've analyzed your classroom materials and I'm ready to help you summarize, explain, or find anything you need. What should we look at first?` }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content
          })),
          context
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setMessages((prev) => [...prev, { role: "ai", content: data.text }])
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "ai", content: "### ⚠️ System Error\nI encountered a connection issue. Please ensure your API key is active and try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          filter: "blur(0px)",
          height: isMinimized ? "72px" : (isExpanded ? "80vh" : "600px"),
          width: isExpanded ? "600px" : "420px"
        }}
        exit={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-6 right-6 bg-zinc-950/80 border border-white/10 rounded-[32px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] z-50 overflow-hidden backdrop-blur-3xl"
      >
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent blur-md" />

        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#050505]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-white leading-none">Study AI</h3>
                <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider border border-purple-500/20">Pro</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium mt-1 truncate max-w-[180px]">Teaching {courseName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 transition-all active:scale-90 hidden sm:block"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 transition-all active:scale-90"
            >
              <Minimize2 className="w-4 h-4 rotate-45" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-zinc-400 transition-all active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="flex flex-col h-[calc(100%-80px)]">
            {/* Context Stats/Badge */}
            <div className="px-5 py-2 bg-purple-500/5 flex items-center gap-2 border-b border-white/5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] text-purple-300/70 font-semibold uppercase tracking-widest">
                Contextual Learning Active
              </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: i === messages.length - 1 ? 0.1 : 0 }}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-1 shadow-sm ${
                    m.role === "user" 
                      ? "bg-zinc-800 text-zinc-400" 
                      : "bg-purple-500/20 text-purple-400"
                  }`}>
                    {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div className={`flex flex-col gap-1.5 ${m.role === "user" ? "items-end" : "items-start"} max-w-[80%]`}>
                    <div className={`px-4 py-3 rounded-[20px] text-sm leading-relaxed ${
                      m.role === "user" 
                        ? "bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-900/20" 
                        : "bg-white/5 border border-white/10 text-zinc-200 rounded-tl-none"
                    }`}>
                      <div className="markdown-content prose prose-invert prose-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-medium px-1 capitalize">
                      {m.role === "user" ? "You" : "Assistant"}
                    </span>
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1.5">
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 pt-2">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-[22px] opacity-20 group-focus-within:opacity-40 transition-opacity blur" />
                <div className="relative flex items-center bg-zinc-900/90 border border-white/10 rounded-[20px] p-1.5 shadow-inner">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask anything about the course..."
                    className="flex-1 bg-transparent border-none py-2 px-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-0"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                    className="p-2.5 bg-white text-black hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-[9px] text-zinc-600 text-center mt-3 font-medium uppercase tracking-widest">
                Powered by Gemini & Google Classroom
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Styles for Markdown */}
      <style jsx global>{`
        .markdown-content p { margin-bottom: 0.75rem; last-child: 0; }
        .markdown-content ul, .markdown-content ol { margin-left: 1.25rem; margin-bottom: 0.75rem; }
        .markdown-content li { margin-bottom: 0.25rem; }
        .markdown-content strong { color: white; font-weight: 700; }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 { 
          color: white; 
          font-weight: 800; 
          margin-top: 1rem; 
          margin-bottom: 0.5rem;
          font-size: 1.1em;
        }
        .markdown-content code {
          background: rgba(255,255,255,0.1);
          padding: 0.1rem 0.3rem;
          border-radius: 0.3rem;
          font-family: monospace;
          font-size: 0.9em;
        }
        .markdown-content pre {
          background: rgba(0,0,0,0.3);
          padding: 0.75rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin-bottom: 0.75rem;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .markdown-content pre code {
          background: transparent;
          padding: 0;
        }
      `}</style>
    </AnimatePresence>
  )
}
