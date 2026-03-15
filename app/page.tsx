"use client"

import { signIn, useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Download, LayoutDashboard, LogIn, Sparkles } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      {/* Abstract Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-400 mb-8 backdrop-blur-sm">
            <Sparkles className="w-3.0 h-3.0" />
            <span>Simplify your learning workflow</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8">
            <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
              Download everything
            </span>
            <br />
            <span className="text-white">with one click.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            The ultimate tool for Google Classroom. Access all your study materials, 
            assignments, and attachments in seconds. No more tedious manual downloads.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!session ? (
              <button
                onClick={() => signIn("google")}
                className="group relative px-8 py-4 bg-white text-black font-semibold rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <div className="relative z-10 flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign in with Google
                </div>
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="group relative px-8 py-4 bg-white text-black font-semibold rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <div className="relative z-10 flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5" />
                  Go to Dashboard
                </div>
              </Link>
            )}
            
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 font-semibold rounded-2xl transition-all backdrop-blur-md">
              Learn More
            </button>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          {[
            {
              title: "Unified Access",
              desc: "See all your courses and materials in a single, beautiful dashboard.",
              icon: LayoutDashboard,
            },
            {
              title: "Fast Downloads",
              desc: "Proxy-powered streaming for lightning-fast file retrievals.",
              icon: Download,
            },
            {
              title: "Smart Organization",
              desc: "Materials are automatically sorted by course and source type.",
              icon: Sparkles,
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 text-center text-zinc-500 text-sm">
        <p>&copy; 2026 ClassroomDownloader. Crafted for excellence.</p>
      </footer>
    </div>
  )
}
