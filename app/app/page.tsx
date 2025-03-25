'use client'

import Sidebar from '../components/Sidebar'
import ChatInterface from '../components/ChatInterface'
import WelcomeMessage from '../components/WelcomeMessage'

export default function Home() {
  return (
    <div className="flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-14">
        <WelcomeMessage />
        <ChatInterface />
      </main>
    </div>
  )
}