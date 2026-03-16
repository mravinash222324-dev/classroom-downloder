"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-purple-500/30 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <nav className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2 text-purple-400">
            <Shield className="w-5 h-5" />
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
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-8 tracking-tight">Privacy Policy</h1>
          <p className="text-zinc-500 mb-12 italic">Last Updated: March 16, 2026</p>

          <section className="space-y-12">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                Welcome to ClassroomDownloader. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you as to how we look after your personal data when you visit our website 
                and tell you about your privacy rights and how the law protects you.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Data We Collect</h2>
              <p className="leading-relaxed mb-4">
                We use Google OAuth to provide our services. By using our application, we may access:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your Google Account email and basic profile information.</li>
                <li>Metadata about your Google Classroom courses and materials.</li>
                <li>Content of files you explicitly choose to download or analyze using our AI features.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Data</h2>
              <p className="leading-relaxed mb-4">
                Our application uses your data strictly for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To display your Google Classroom courses and materials.</li>
                <li>To facilitate the downloading of these materials to your local device.</li>
                <li>To generate study insights and summaries using AI based on the documents you provide.</li>
                <li>To organize files into your Google Drive for integration with NotebookLM.</li>
              </ul>
              <p className="mt-4 text-purple-400 font-medium">
                We do not sell your personal data to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Retention</h2>
              <p className="leading-relaxed">
                We do not store your Google Classroom materials on our servers. All parsing and processing happen in real-time. 
                Your session data is managed via encrypted cookies that expire and are cleared when you sign out.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about this privacy policy or our privacy practices, please contact us via our GitHub repository 
                or the contact information provided in the Google Cloud Console.
              </p>
            </div>
          </section>
        </motion.div>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-zinc-600 text-sm">
        <p>&copy; 2026 ClassroomDownloader. Built with privacy in mind.</p>
      </footer>
    </div>
  )
}
