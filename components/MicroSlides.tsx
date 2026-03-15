"use client"

import React from "react"
import { motion } from "framer-motion"
import { Printer, Copy, Check, FileText } from "lucide-react"

interface Section {
  id: number
  title: string
  content: string
}

interface MicroSlidesProps {
  sections: Section[]
}

export default function MicroSlides({ sections }: MicroSlidesProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopyText = () => {
    const text = sections.map(s => `${s.id}. ${s.title}\n${s.content}`).join("\n\n")
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900 border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Ultra-Dense Study Sheet</h3>
            <p className="text-xs text-zinc-500 font-medium mt-1">High-density textbook style for final revision.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopyText}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 transition-all"
            title="Copy as Text"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => window.print()}
            className="px-5 py-3 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all font-bold flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print Study Sheet
          </button>
        </div>
      </div>

      {/* The Sheet Container */}
      <div className="bg-[#fcfcfc] text-[#1a1a1a] rounded-[24px] p-8 sm:p-12 shadow-2xl overflow-hidden print:p-0 print:bg-white print:shadow-none print:rounded-none">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-10 space-y-8 print:columns-3 print:gap-8">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="break-inside-avoid mb-10"
            >
              <h4 className="text-base font-black border-b-2 border-zinc-200 pb-1.5 mb-3 uppercase tracking-tight flex items-start gap-2 leading-none">
                <span className="text-purple-600 tabular-nums">{section.id}.</span> 
                {section.title}
              </h4>
              <div className="text-[11px] leading-relaxed text-zinc-800 font-normal whitespace-pre-wrap">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { 
            position: absolute !important; 
            left: 10mm !important; 
            top: 10mm !important; 
            width: calc(100% - 20mm) !important; 
          }
          
          /* Force columns on print */
          .columns-1, .md\\:columns-2, .lg\\:columns-3 {
            columns: 3 !important;
            gap: 10mm !important;
          }
          
          /* Hide non-print UI elements */
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}
