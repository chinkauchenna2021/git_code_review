'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthForm } from '@/lib/hooks/use-auth'
// import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { handleAuthError } from '@/lib/auth/utils'
import { Github, Zap, Shield, BarChart3 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { Button as HeroButton  , Card , CardHeader , CardBody , CardFooter} from '@heroui/react'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signInWithGitHub, isLoading, error, clearError } = useAuthForm()
  const [authError, setAuthError] = useState<string | null>(null)

  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
  const errorParam = searchParams?.get('error')

  useEffect(() => {
    if (errorParam) {
      const { message } = handleAuthError(errorParam)
      setAuthError(message)
    }
  }, [errorParam])

  useEffect(() => {
    if (error) {
      setAuthError(error)
    }
  }, [error])

  function handlegitlogin(){
    console.log('Signing in with GitHub...')
    // clearError()
    // setAuthError(null)
    // signIn('github')
    // signInWithGitHub({callbackUrl})
  }

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Reviews',
      description: 'Get intelligent feedback on code quality, security, and best practices'
    },
    {
      icon: Shield,
      title: 'Security Scanning',
      description: 'Automatically detect security vulnerabilities and suggest fixes'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track code quality trends and team performance metrics'
    }
  ]

  return (
   <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>}>
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <Github className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Welcome to DevTeams Copilot
            </h2>
            <p className="mt-2 text-gray-600">
              AI-powered code reviews for your development team
            </p>
          </div>
          <Card className="p-8">

              <CardBody>
              {(authError || error) && (
                <Alert variant="error" dismissible onDismiss={() => setAuthError(null)}>
                  {authError || error}
                </Alert>
              )}
              <HeroButton
                onPress={handlegitlogin}
                // disabled={isLoading}
                size="lg"
                variant='solid'
                isLoading={isLoading}
                color="default"
                className="flex items-center justify-center space-x-3 bg-black text-white hover:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-4 py-2 w-full"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <>
                    <Github className="w-5 h-5 mr-3" />
                    Continue with GitHub
                  </>
                )}
              </HeroButton>
              </CardBody>
               <CardFooter className="text-center mt-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  By signing in, you agree to our{' '}
                  <a href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
              </CardFooter>
          </Card>

          <div className="text-center">
            <a
              href="/"
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to homepage
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Features */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-blue-900 text-white">
        <div className="max-w-md mx-auto">
          <h3 className="text-2xl font-bold mb-8">
            Supercharge your code reviews
          </h3>
          
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-blue-800 rounded-lg">
                    <feature.icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-blue-100 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-800 rounded-lg">
            <p className="text-sm text-blue-100">
              Join thousands of developers who trust DevTeams Copilot to improve their code quality and ship faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Suspense>
  )
}
