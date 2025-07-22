// app/auth/error/page.tsx
import { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthError } from '@/components/auth/AuthError'

export const metadata: Metadata = {
  title: 'Authentication Error - DevTeams Copilot',
  description: 'An error occurred during authentication.',
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthError />
      </Suspense>
    </div>
  )
}
