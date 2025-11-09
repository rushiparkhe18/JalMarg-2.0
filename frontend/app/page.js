'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Always redirect to landing page
    router.replace('/landing')
  }, [router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-gray-400 text-lg">Loading Jalmarg...</p>
      </div>
    </div>
  )
}
