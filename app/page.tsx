import { ChatInput } from '../components/ChatInput'
import WelcomeMessage from '../components/WelcomeMessage'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <WelcomeMessage />
      <div className="container mx-auto px-4">
        <ChatInput />
      </div>
    </main>
  )
} 