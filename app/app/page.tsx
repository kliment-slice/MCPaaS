'use client'

import Sidebar from '../components/Sidebar'
import ChatInterface from '../components/ChatInterface'

export default function Home() {
  return (
    <div className="flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-14">
        <ChatInterface />
      </main>
    </div>
  )
}