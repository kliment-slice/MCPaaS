'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, Rocket } from 'lucide-react'

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
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="max-w-2xl w-full space-y-6">
        <h1 className="text-3xl font-bold text-center">Twitter MCPaaS</h1>
        
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={refreshLatestCommits}
            disabled={isLoadingCommits}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 ${isLoadingCommits ? 'animate-spin' : ''}`} />
            <span>Refresh Latest Commits</span>
          </button>
          
          {/* YOLO Mode Toggle */}
          <div className="flex flex-col items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={yoloMode}
                onChange={() => setYoloMode(!yoloMode)}
              />
              <div className={`w-11 h-6 rounded-full peer 
                ${yoloMode ? 'bg-red-600' : 'bg-gray-700'} 
                peer-focus:outline-none peer-focus:ring-4 
                peer-focus:ring-red-300 dark:peer-focus:ring-red-800 
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                after:bg-white after:border-gray-300 after:border after:rounded-full 
                after:h-5 after:w-5 after:transition-all 
                dark:border-gray-600 
                ${yoloMode ? 'after:translate-x-full' : ''}`}
              ></div>
              <span className="ml-3 text-sm font-medium text-white flex items-center gap-1">
                <Rocket className={`h-4 w-4 ${yoloMode ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} />
                YOLO mode auto-tweet {yoloMode ? 'ON' : 'OFF'}
              </span>
            </label>
            
            {yoloMode && (
              <div className="p-2 bg-red-900/30 border border-red-500/30 rounded-lg text-center w-full max-w-xs">
                <p className="text-red-300 text-xs">
                  ⚠️ YOLO mode is active! Tweets will be auto-posted.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className={`bg-gray-800 rounded-lg p-4 ${yoloMode ? 'opacity-80' : ''}`}>
          <h2 className="text-xl font-semibold mb-3">Tweet Content</h2>
          <textarea
            value={commits}
            onChange={(e) => setCommits(e.target.value)}
            className={`w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 resize-none
                        ${yoloMode ? 'cursor-not-allowed' : ''}`}
            rows={5}
            placeholder="Latest commits will appear here..."
            disabled={isLoadingCommits || yoloMode}
          />
          
          {/* Character count */}
          <div className="mt-2 text-right text-sm text-gray-400">
            {commits.length}/280 characters
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={() => executeTweet()}
            disabled={isExecutingTweet || !commits.trim() || yoloMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${tweetSuccess ? 'bg-green-600 text-white' : 'bg-green-600 text-white hover:bg-green-700'}`}
          >
            {tweetSuccess ? (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Tweet Executed!</span>
              </>
            ) : (
              <span>Execute Tweet</span>
            )}
          </button>
        </div>
        
        {tweetSuccess && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-6 w-6" />
              <span>{yoloMode ? 'Auto-tweet executed successfully!' : 'Tweet executed successfully!'}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}