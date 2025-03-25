import { ChatInput } from '../components/ChatInput'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex-1">
        {/* Chat messages will go here */}
      </div>
      <ChatInput />
    </main>
  )
} 