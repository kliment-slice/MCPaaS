import { useState } from 'react'
import { FaXTwitter } from 'react-icons/fa6'
import { FaLinkedinIn } from 'react-icons/fa'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

const ChatInterface = () => {
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
      <div className="h-[500px] overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-primary-500 mt-20">
            <p className="text-lg">Welcome to PublicBuilder</p>
            <p className="text-sm mt-2">Tell me what you want to post about and I'll help you create content based on your GitHub activity.</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[60%] rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-800 text-primary-500'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <span className="text-[10px] opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
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
            placeholder="What should you publish today?"
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