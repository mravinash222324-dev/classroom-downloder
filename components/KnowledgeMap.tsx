"use client"

import React from "react"
import { motion } from "framer-motion"
import { Share2, Zap } from "lucide-react"

interface Node {
  id: string
  type: "concept" | "assignment" | "material"
}

interface Edge {
  from: string
  to: string
  label: string
}

interface KnowledgeMapProps {
  data: {
    nodes: Node[]
    edges: Edge[]
  }
}

export default function KnowledgeMap({ data }: KnowledgeMapProps) {
  // Simple circular/random layout generation for nodes
  const nodesWithPos = data.nodes.map((node, i) => {
    const angle = (i / data.nodes.length) * Math.PI * 2
    const radius = 150
    return {
      ...node,
      x: 250 + Math.cos(angle) * radius,
      y: 250 + Math.sin(angle) * radius,
    }
  })

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-white/5 rounded-[40px] border border-white/10 overflow-hidden backdrop-blur-xl group">
      <div className="absolute top-6 left-8">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
          <Share2 className="w-3 h-3" />
          Knowledge Graph
        </div>
      </div>

      <svg viewBox="0 0 500 500" className="w-full h-full p-10">
        <defs>
          <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Draw Edges */}
        {data.edges.map((edge, i) => {
          const from = nodesWithPos.find(n => n.id === edge.from)
          const to = nodesWithPos.find(n => n.id === edge.to)
          if (!from || !to) return null

          return (
            <motion.line
              key={`edge-${i}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.2 }}
              transition={{ duration: 1.5, delay: i * 0.1 }}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="white"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )
        })}

        {/* Draw Nodes */}
        {nodesWithPos.map((node, i) => (
          <motion.g
            key={`node-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: i * 0.1 }}
            className="cursor-pointer"
          >
            <circle cx={node.x} cy={node.y} r="25" fill="url(#nodeGradient)" />
            <circle 
              cx={node.x} 
              cy={node.y} 
              r="6" 
              className={node.type === 'assignment' ? 'fill-red-400' : 'fill-purple-400'} 
            />
            <foreignObject x={node.x - 60} y={node.y + 15} width="120" height="40">
              <div className="text-[9px] font-bold text-zinc-400 text-center leading-tight uppercase tracking-tighter">
                {node.id}
              </div>
            </foreignObject>
          </motion.g>
        ))}
      </svg>

      <div className="absolute bottom-6 right-8">
        <div className="text-[10px] text-zinc-500 font-medium flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-yellow-500" />
          AI Generated Connections
        </div>
      </div>
    </div>
  )
}
