import { useState } from 'react'
import { FaXTwitter } from 'react-icons/fa6'
import { FaLinkedinIn } from 'react-icons/fa'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I am analyzing your GitHub repositories and will suggest some posts shortly.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-primary-900 rounded-lg shadow-xl">
      <div className="max-h-[400px] overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.sender === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-primary-800 text-primary-200'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-primary-800 bg-primary-900 p-4 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What will you publish today?"
            className="flex-1 bg-transparent text-white placeholder-primary-700 outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 text-primary-500 hover:bg-primary-800 rounded-full transition-colors"
              title="Share on X (formerly Twitter)"
            >
              <FaXTwitter className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 text-primary-500 hover:bg-primary-800 rounded-full transition-colors"
              title="Share on LinkedIn"
            >
              <FaLinkedinIn className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatInterface 