'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, Rocket, Send } from 'lucide-react'
import { motion } from 'framer-motion'

const BackgroundQuotes = () => {
  const quotes = [
    "Share Progress Often",
    "Build and Share Publicly",
    "Be Open and Transparent",
    "Document Your Journey",
    "Share Your Story",
    "Build in the Open",
    "Transparency Matters",
    "Share Your Process",
    "Openly Build and Share",
    "Show Your Work",
    "Be Transparent Always",
    "Share Your Progress",
    "Publicly Document Growth",
    "Build with Transparency",
    "Share Your Experience",
    "Openly Share Progress",
    "Document Everything",
    "Share Your Journey",
    "Build Openly Always",
    "Transparency Builds Trust"
  ]

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {quotes.map((quote, index) => {
        // Create a grid-like distribution with 5 columns and 4 rows
        const columns = 5
        const rows = 4
        const column = index % columns
        const row = Math.floor(index / columns)
        
        // Calculate positions to spread across the screen with equal spacing
        const baseX = (column / (columns - 1)) * 100 - 50 // Spread from -50% to 50%
        const baseY = (row / (rows - 1)) * 100 - 50 // Spread from -50% to 50%
        
        return (
          <motion.div
            key={index}
            className="absolute text-white/[0.12] whitespace-nowrap font-light tracking-wide"
            style={{
              left: `${50 + baseX}%`,
              top: `${50 + baseY}%`,
              fontSize: `${0.9 + (index % 3) * 0.1}rem`,
            }}
            animate={{
              x: [
                Math.random() * 20 - 10,
                Math.random() * 20 - 10,
                Math.random() * 20 - 10
              ],
              y: [
                Math.random() * 20 - 10,
                Math.random() * 20 - 10,
                Math.random() * 20 - 10
              ],
              opacity: [0.12, 0.15, 0.12]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              times: [0, 0.5, 1],
              delay: index * 0.2
            }}
          >
            {quote}
          </motion.div>
        )
      })}
    </div>
  )
}

// Add this at the top level of your CSS or in your Tailwind config
const styles = {
  '.animate-spin-slow': {
    animation: 'spin 60s linear infinite',
  },
  '@keyframes spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
}

export default function Home() {
  const [commits, setCommits] = useState('')
  const [isLoadingCommits, setIsLoadingCommits] = useState(false)
  const [isExecutingTweet, setIsExecutingTweet] = useState(false)
  const [tweetSuccess, setTweetSuccess] = useState(false)
  const [yoloMode, setYoloMode] = useState(false)

  const refreshLatestCommits = async () => {
    setIsLoadingCommits(true)
    setCommits('')
    setTweetSuccess(false)
    
    try {
      const response = await fetch('/api/mcphack/summarizescrape')
      const result = await response.json()
      
      if (result.error) {
        console.error('Error:', result.error)
      } else {
        const tweetContent = result.tweet || 'No tweet summary available'
        setCommits(tweetContent)
        
        // Auto-execute tweet if YOLO mode is enabled
        if (yoloMode && tweetContent && tweetContent !== 'No tweet summary available') {
          await executeTweet(tweetContent)
        }
      }
    } catch (error) {
      console.error('Error connecting to API:', error)
    } finally {
      setIsLoadingCommits(false)
    }
  }

  const executeTweet = async (content = null) => {
    const tweetContent = content || commits
    if (!tweetContent.trim()) return
    
    setIsExecutingTweet(true)
    setTweetSuccess(false)
    
    try {
      const response = await fetch('/api/mcphack/composio/tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: `Tweet: ${tweetContent}` }),
      })
      
      const result = await response.json()
      
      if (result.error) {
        console.error('Error:', result.error)
      } else {
        setTweetSuccess(true)
      }
    } catch (error) {
      console.error('Error connecting to API:', error)
    } finally {
      setIsExecutingTweet(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 relative">
      <BackgroundQuotes />
      {/* Header */}
      <div className="w-full max-w-md mb-8 mt-4">
        <div className="flex items-center justify-between gap-4 text-white/90">
          <h1 className="text-xl font-normal">Tweet your Dev Updates</h1>
          
          {/* YOLO Mode Toggle */}
          <label className="glass-morphism px-3 py-2 rounded-full cursor-pointer flex items-center gap-2 hover:bg-white/10 transition-colors">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={yoloMode}
                onChange={() => setYoloMode(!yoloMode)}
              />
              <div className={`w-9 h-5 rounded-full 
                ${yoloMode ? 'bg-purple-500' : 'bg-white/10'} 
                peer-focus:ring-4 peer-focus:ring-purple-500/20
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                after:bg-white after:rounded-full after:h-4 after:w-4 
                after:transition-all after:duration-300
                ${yoloMode ? 'after:translate-x-full' : ''}`}
              ></div>
            </div>
            <div className="flex items-center gap-1">
              <Rocket className={`h-3.5 w-3.5 ${yoloMode ? 'text-purple-400 animate-pulse' : 'text-white/60'}`} />
              <span className="text-xs font-medium text-white/90">YOLO</span>
            </div>
          </label>
        </div>
        
        {/* YOLO Mode Notification */}
        {yoloMode && (
          <div className="mt-3 text-center">
            <div className="inline-block glass-morphism px-4 py-2 rounded-full bg-purple-500/10">
              <p className="text-purple-300 text-xs flex items-center gap-2">
                <span>⚠️</span>
                YOLO mode active - Messages will auto-send
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Container */}
      <div className="chat-container w-full max-w-md flex-1 flex flex-col p-6">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <p className="text-[clamp(0.75rem,1.5vw,1rem)] text-white/90 max-w-[90%] mx-auto">
            Let's publish what you've been working on.
          </p>
          <button
            onClick={refreshLatestCommits}
            disabled={isLoadingCommits}
            className="mt-4 px-4 py-2 bg-white/10 text-white/90 rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingCommits ? 'animate-spin' : ''}`} />
            <span>Refresh Latest Commits</span>
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 space-y-4">
          <textarea
            value={commits}
            onChange={(e) => setCommits(e.target.value)}
            className="w-full p-4 bg-white/5 text-white/90 rounded-2xl border border-white/10 resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
            rows={4}
            placeholder="Latest commit summary will appear here..."
            disabled={isLoadingCommits || yoloMode}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-center">
          {!yoloMode && (
            <button
              onClick={refreshLatestCommits}
              disabled={isLoadingCommits}
              className="floating-button w-full py-4 px-6 bg-white text-black rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoadingCommits ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Publish Tweet</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Status Messages */}
        {tweetSuccess && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>{yoloMode ? 'Auto-tweet sent!' : 'Message sent!'}</span>
            </div>
          </div>
        )}

        {/* Quote */}
        <div className="mt-4">
          <blockquote className="relative">
            <div className="absolute top-0 left-0 text-4xl text-white/20 -translate-x-4 -translate-y-4">"</div>
            <p className="italic text-white/70 text-center text-sm leading-relaxed">
              By not talking about what I was working on, no one else was emotionally invested in these projects like I was.
            </p>
            <div className="absolute bottom-0 right-0 text-4xl text-white/20 translate-x-2 translate-y-2">"</div>
          </blockquote>
        </div>

        {/* Powered by section */}
        <div className="mt-4 text-center">
          <p className="text-white/50 text-xs">
            Powered by <a href="https://groq.com/" className="text-white/50 hover:text-white/50">Groq</a> / <a href="https://composio.dev/" className="text-white/50 hover:text-white/50">composio</a> / <a href="https://toolhouse.ai" className="text-white/50 hover:text-white/50">toolhouse</a>
          </p>
        </div>
      </div>
    </main>
  )
}