"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Scale } from "lucide-react"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-purple-500/30 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <nav className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2 text-blue-400">
            <Scale className="w-5 h-5" />
            <span className="font-bold tracking-tight text-white">ClassroomDownloader</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">Terms of Service</h1>
          <p className="text-zinc-500 mb-12 italic">Last Updated: March 16, 2026</p>

          <section className="space-y-12">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing and using ClassroomDownloader, you agree to comply with and be bound by these Terms of Service. 
                If you do not agree, please do not use the application.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="leading-relaxed">
                ClassroomDownloader is a productivity tool designed to help students and educators download and organize materials 
                from Google Classroom. We provide features for file retrieval, AI-generated study summaries, and cloud organization.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Obligations</h2>
              <p className="leading-relaxed mb-4">
                You agree to use this service only for its intended purpose and in compliance with Google's Terms of Service. You must not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the tool to scrape data from accounts you do not own.</li>
                <li>Attempt to reverse engineer the application.</li>
                <li>Use AI-generated content for academic dishonesty.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Intellectual Property</h2>
              <p className="leading-relaxed">
                The software, design, and branding of ClassroomDownloader are the intellectual property of the developers. 
                The materials you download through the service remain the property of their respective owners (e.g., your teachers or schools).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
              <p className="leading-relaxed">
                ClassroomDownloader is provided "as is" without warranty of any kind. We are not responsible for any data loss, 
                interruption of service, or issues arising from the use of AI-generated content.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these terms at any time. Your continued use of the service after changes are posted 
                constitutes your acceptance of the new terms.
              </p>
            </div>
          </section>
        </motion.div>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-zinc-600 text-sm">
        <p>&copy; 2026 ClassroomDownloader. Professional education tools.</p>
      </footer>
    </div>
  )
}
