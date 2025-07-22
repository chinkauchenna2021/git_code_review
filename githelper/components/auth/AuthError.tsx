// components/auth/AuthError.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { handleAuthError } from '@/lib/auth/utils'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export function AuthError() {
  const searchParams = useSearchParams()
  const [errorInfo, setErrorInfo] = useState<{ type: string; message: string } | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const error = searchParams?.get('error')

  useEffect(() => {
    if (error) {
      setErrorInfo(handleAuthError(error))
    }
  }, [error])

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      window.location.href = '/login'
    } catch (err) {
      setIsRetrying(false)
    }
  }

  const getErrorDetails = (errorType: string) => {
    const details: Record<string, { title: string; description: string; action?: string }> = {
      'Configuration': {
        title: 'Configuration Error',
        description: 'There\'s an issue with our authentication setup. Please try again later or contact support.',
        action: 'Contact Support'
      },
      'AccessDenied': {
        title: 'Access Denied',
        description: 'You denied access to your GitHub account. We need these permissions to provide code review services.',
        action: 'Try Again'
      },
      'Verification': {
        title: 'Verification Failed',
        description: 'The verification link is invalid or has expired. Please try signing in again.',
        action: 'Sign In Again'
      },
      'OAuthCallback': {
        title: 'OAuth Error',
        description: 'Something went wrong during the GitHub authentication process.',
        action: 'Try Again'
      },
      'Default': {
        title: 'Authentication Error',
        description: 'An unexpected error occurred during sign in.',
        action: 'Try Again'
      }
    }

    return details[errorType] || details['Default']
  }

  const errorDetails = errorInfo ? getErrorDetails(errorInfo.type) : null

  return (
    <div className="max-w-md w-full">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {errorDetails?.title || 'Authentication Error'}
        </h1>

        <p className="text-gray-600 mb-6">
          {errorDetails?.description || errorInfo?.message || 'An error occurred during authentication.'}
        </p>

        {errorInfo && (
          <Alert variant="error" className="mb-6 text-left">
            <strong>Error Code:</strong> {errorInfo.type}
          </Alert>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Redirecting...
              </>
            ) : (
              errorDetails?.action || 'Try Again'
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Back to Homepage
          </Button>
        </div>
      </Card>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Need help?{' '}
          <a
            href="mailto:support@devteamscopilot.com"
            className="text-blue-600 hover:underline"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}
