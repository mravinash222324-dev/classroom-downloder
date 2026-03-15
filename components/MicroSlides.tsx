"use client"

import React from "react"
import { motion } from "framer-motion"
import { Printer, Copy, Check } from "lucide-react"

interface Slide {
  title: string
  summary: string
  keyTakeaway: string
}

interface MicroSlidesProps {
  slides: Slide[]
}

export default function MicroSlides({ slides }: MicroSlidesProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopyText = () => {
    const text = slides.map(s => `${s.title}\n${s.summary}\nTakeaway: ${s.keyTakeaway}`).join("\n\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900 border border-white/5">
        <div>
          <h3 className="text-lg font-bold text-white">Micro-Slide Cards</h3>
          <p className="text-xs text-zinc-500 font-medium mt-1">Ultra-compact summaries for fast revision.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopyText}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 transition-all"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => window.print()}
            className="p-3 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 print:grid-cols-4 print:gap-1">
        {slides.map((slide, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-[20px] bg-white/5 border border-white/10 flex flex-col justify-between aspect-[3/4] hover:bg-white/10 transition-colors group print:border-zinc-300 print:text-black print:bg-white print:p-2"
          >
            <div>
              <div className="w-6 h-6 rounded-lg bg-white/5 mb-3 flex items-center justify-center text-[10px] font-bold text-zinc-500 group-hover:bg-purple-500 group-hover:text-white transition-all print:hidden">
                #{i + 1}
              </div>
              <h4 className="text-[11px] font-bold text-white mb-2 leading-tight uppercase tracking-tight print:text-black">{slide.title}</h4>
              <p className="text-[10px] text-zinc-400 leading-normal line-clamp-3 mb-2 print:text-zinc-600">{slide.summary}</p>
            </div>
            <div className="pt-2 border-t border-white/5 print:border-zinc-100">
              <span className="text-[8px] font-bold text-purple-400 uppercase tracking-widest block mb-1 print:text-purple-600">Key Takeaway</span>
              <p className="text-[10px] text-zinc-300 font-medium leading-tight print:text-zinc-800 italic">"{slide.keyTakeaway}"</p>
            </div>
          </motion.div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  )
}
