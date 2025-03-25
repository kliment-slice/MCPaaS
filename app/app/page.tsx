'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [message, setMessage] = useState('')
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch hello message
        const messageResponse = await fetch('/api/hello')
        const messageData = await messageResponse.json()
        setMessage(messageData.message)
        
        // Fetch items
        const itemsResponse = await fetch('/api/items')
        const itemsData = await itemsResponse.json()
        setItems(itemsData.items)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">Next.js 15 + FastAPI</h1>
        
        {loading ? (
          <p className="text-lg">Loading data...</p>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-2">Message from API:</h2>
              <p className="text-xl">{message}</p>
            </div>
            
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-2">Items from API:</h2>
              <ul className="list-disc pl-5 space-y-2">
                {items.map((item, index) => (
                  <li key={index} className="text-xl">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}