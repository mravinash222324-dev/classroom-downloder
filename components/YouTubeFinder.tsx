"use client"

import React from "react"
import { Youtube, ExternalLink, PlayCircle } from "lucide-react"

interface Recommendation {
  title: string
  searchQuery: string
  reason: string
}

interface YouTubeFinderProps {
  recommendations: Recommendation[]
}

export default function YouTubeFinder({ recommendations }: YouTubeFinderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <Youtube className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Recommended Classmates</h3>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Supplemental Tutorials</p>
        </div>
      </div>

      <div className="grid gap-3">
        {recommendations.map((rec, i) => (
          <a
            key={i}
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(rec.searchQuery)}`}
            target="_blank"
            className="group block p-4 rounded-[24px] bg-white/5 border border-white/10 hover:border-red-500/30 transition-all hover:bg-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors uppercase tracking-tight">{rec.title}</h4>
              <PlayCircle className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-all" />
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">{rec.reason}</p>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-red-500/80 uppercase tracking-widest">
              Search on YouTube
              <ExternalLink className="w-3 h-3" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
