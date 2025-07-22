'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { CheckCircle, Github } from 'lucide-react'

export function GitHubCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [callbackStatus, setCallbackStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Completing GitHub authentication...')

  const code = searchParams?.get('code')
  const error = searchParams?.get('error')
  const state = searchParams?.get('state')

  useEffect(() => {
    if (error) {
      setCallbackStatus('error')
      setMessage(`Authentication failed: ${error}`)
      return
    }

    if (!code) {
      setCallbackStatus('error')
      setMessage('Missing authentication code')
      return
    }

    // If we have a session, redirect to dashboard
    if (status === 'authenticated' && session) {
      setCallbackStatus('success')
      setMessage('Authentication successful! Redirecting...')
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }, [code, error, state, session, status, router])

  const getStatusIcon = () => {
    switch (callbackStatus) {
      case 'processing':
        return <LoadingSpinner size="lg" />
      case 'success':
        return (
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        )
      case 'error':
        return (
          <div className="p-3 bg-red-100 rounded-full">
            <Github className="w-8 h-8 text-red-600" />
          </div>
        )
      default:
        return <LoadingSpinner size="lg" />
    }
  }

  const getStatusColor = () => {
    switch (callbackStatus) {
      case 'success':
        return 'text-green-900'
      case 'error':
        return 'text-red-900'
      default:
        return 'text-gray-900'
    }
  }

  return (
    <div className="max-w-md w-full">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>

        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {callbackStatus === 'success' ? 'Success!' : 
           callbackStatus === 'error' ? 'Authentication Failed' : 
           'Authenticating...'}
        </h1>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {callbackStatus === 'error' && (
          <Alert variant="error" className="mb-6 text-left">
            Please try signing in again. If the problem persists, contact support.
          </Alert>
        )}

        {callbackStatus === 'success' && session && (
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-green-800">
              Welcome back, {session.user?.name || session.user?.email}!
            </p>
          </div>
        )}

        {callbackStatus === 'error' && (
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full text-gray-600 hover:text-gray-800"
            >
              Back to Homepage
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}