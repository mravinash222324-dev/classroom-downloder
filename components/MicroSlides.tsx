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
      <div id="study-sheet-root" className="bg-[#fcfcfc] text-[#1a1a1a] rounded-[24px] p-8 sm:p-10 shadow-2xl overflow-hidden print:p-0 print:bg-white print:shadow-none print:rounded-none w-full">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 print:columns-3 print:gap-8 w-full">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="break-inside-avoid mb-8 block"
            >
              <h4 className="text-[12px] font-black border-b-2 border-zinc-200 pb-1 mb-2 uppercase tracking-tight flex items-start gap-1.5 leading-none">
                <span className="text-purple-600 tabular-nums">{section.id}.</span> 
                {section.title}
              </h4>
              <div className="text-[10px] leading-[1.35] text-zinc-900 font-normal whitespace-pre-wrap">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          /* Force A4 Portrait */
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          /* Disable animations for print stability */
          * {
            animation: none !important;
            transition: none !important;
            transform: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* HIDE EVERYTHING UNNECESSARY */
          nav, header, footer, button, .no-print,
          #dashboard-main-content, 
          #interactive-study-tools,
          #study-insights-overlay header {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          /* RESET CORE CONTAINERS */
          body, html, #__next, main {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* FORCE OVERLAY TO BE STATIC */
          #study-insights-overlay {
            position: static !important;
            display: block !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }

          /* FORCE SHEET TO TAKE FULL WIDTH */
          #study-sheet-root {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          #study-sheet-root > div {
            display: block !important;
            column-count: 3 !important;
            column-gap: 8mm !important;
            column-fill: auto !important;
            width: 100% !important;
          }

          .break-inside-avoid {
            display: block !important;
            break-inside: avoid-column !important;
            page-break-inside: avoid !important;
            margin-bottom: 8mm !important;
            position: relative !important;
          }
          
          h4 { border-bottom: 1pt solid #ccc !important; }
        }
      `}</style>
    </div>
  )
}
