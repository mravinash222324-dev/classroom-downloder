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
      <div className="flex items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900 border border-white/5 no-print">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Ultra-Dense Study Sheet <span className="text-[8px] text-zinc-600 opacity-50">v2.0.5</span></h3>
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
        <div className="column-container">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="study-section"
            >
              <h4 className="section-title">
                <span className="text-purple-600 tabular-nums">{section.id}.</span> 
                {section.title}
              </h4>
              <div className="section-content">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .column-container {
          columns: 1;
          gap: 1.5rem;
        }
        @media (min-width: 768px) { .column-container { columns: 2; } }
        @media (min-width: 1024px) { .column-container { columns: 3; } }

        .study-section {
          break-inside: avoid;
          margin-bottom: 2rem;
          display: block;
        }

        .section-title {
          font-size: 0.75rem;
          font-weight: 900;
          border-bottom: 2px solid #e1e1e1;
          padding-bottom: 0.375rem;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          display: flex;
          align-items: flex-start;
          gap: 0.375rem;
          line-height: 1;
          break-after: avoid;
        }

        .section-content {
          font-size: 0.625rem;
          line-height: 1.35;
          color: #27272a;
          white-space: pre-wrap;
          font-weight: 400;
        }

        @media print {
          /* Force A4 Portrait with Safe Margins */
          @page {
            size: A4 portrait;
            margin: 10mm 10mm;
          }

          /* Global Reset */
          :global(body), :global(html), :global(#__next), :global(main) {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Hide UI */
          :global(nav), :global(header), :global(footer), :global(.no-print), :global(button), :global([role="dialog"]), :global(.fixed:not(#study-insights-overlay)) {
            display: none !important;
          }

          /* Isolate Overlay */
          :global(#study-insights-overlay) {
            position: static !important;
            display: block !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            z-index: auto !important;
          }

          :global(#study-insights-overlay header), :global(#interactive-study-tools), :global(#dashboard-main-content) {
            display: none !important;
          }

          #study-sheet-root {
            display: block !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: white !important;
            border: none !important;
            border-radius: 0 !important;
          }

          .column-container {
            display: block !important;
            column-count: 3 !important;
            column-gap: 8mm !important;
            column-fill: auto !important; /* MUCH more stable for multi-page print than balance */
            width: 100% !important;
          }

          .study-section {
            break-inside: avoid !important;
            display: block !important;
            margin-bottom: 5mm !important;
            padding: 0 !important;
          }

          .section-title {
            border-bottom: 1.5pt solid #111 !important;
            font-size: 10pt !important;
            margin-bottom: 2mm !important;
            padding-bottom: 1.5mm !important;
            break-after: avoid !important;
          }

          .section-content {
            font-size: 9pt !important;
            line-height: 1.3 !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  )
}
