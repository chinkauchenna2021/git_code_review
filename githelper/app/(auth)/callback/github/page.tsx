import { Metadata } from 'next'
import { Suspense } from 'react'
import { GitHubCallback } from '@/components/auth/GitHubCallback'

export const metadata: Metadata = {
  title: 'Connecting to GitHub - DevTeams Copilot',
  description: 'Completing GitHub authentication...',
}

export default function GitHubCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <GitHubCallback />
      </Suspense>
    </div>
  )
}
