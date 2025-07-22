'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CheckCircle, Github, Zap, Users, ArrowRight, ExternalLink, Check } from 'lucide-react'

export function WelcomeFlow() {
  const { user, update } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const [githubInstalled, setGithubInstalled] = useState(false)

  const steps = [
    {
      title: 'Welcome to DevTeams Copilot!',
      description: 'Thanks for joining us. Let\'s get you started with AI-powered code reviews.',
      icon: Zap,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">🎉 What you get with your free account:</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                50 AI reviews per month
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                1 active repository
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Basic security scanning
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                GitHub integration
              </li>
            </ul>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Ready to supercharge your code reviews? Let's set everything up!
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Connect Your Repositories',
      description: 'Install our GitHub App to start reviewing your code automatically.',
      icon: Github,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Github className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-600 mb-6">
              Our GitHub App will analyze your pull requests and provide intelligent feedback
              on code quality, security issues, and best practices.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">What happens next:</h5>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. You'll be redirected to GitHub</li>
              <li>2. Choose which repositories to install the app on</li>
              <li>3. Grant the necessary permissions</li>
              <li>4. Return here to complete setup</li>
            </ol>
          </div>

          {githubInstalled ? (
            <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">GitHub App installed successfully!</span>
            </div>
          ) : (
            <Button
              onClick={() => {
                window.open('/api/github/install', '_blank')
                // Simulate installation check (in real app, you'd check via API)
                setTimeout(() => setGithubInstalled(true), 3000)
              }}
              className="w-full"
              size="lg"
            >
              <Github className="w-5 h-5 mr-2" />
              Install GitHub App
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      )
    },
    {
      title: 'You\'re All Set!',
      description: 'Start creating reviews and unlock the power of AI for your development workflow.',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3">🚀 Next steps:</h4>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 mr-2" />
                Enable AI reviews on your repositories
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 mr-2" />
                Create your first pull request review
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 mr-2" />
                Explore analytics and insights
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 mr-2" />
                Invite your team members
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/repositories'}>
              <div className="flex items-center space-x-3">
                <Github className="w-6 h-6 text-blue-600" />
                <div>
                  <h5 className="font-medium">Manage Repositories</h5>
                  <p className="text-xs text-gray-500">Configure your repos</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/pricing'}>
              <div className="flex items-center space-x-3">
                <Zap className="w-6 h-6 text-yellow-600" />
                <div>
                  <h5 className="font-medium">Upgrade Plan</h5>
                  <p className="text-xs text-gray-500">Unlock more features</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeWelcome()
    }
  }

  const handleSkip = () => {
    completeWelcome()
  }

  const completeWelcome = async () => {
    setIsCompleting(true)
    try {
      // Mark welcome as completed
      await fetch('/api/user/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true })
      })
      
      await update() // Refresh session
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to complete welcome:', error)
      router.push('/dashboard') // Fallback
    }
  }

  const canProceed = () => {
    if (currentStep === 1) {
      return githubInstalled
    }
    return true
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <Card className="p-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-600' :
                    index < currentStep ? 'bg-blue-200' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <Badge variant="secondary" size="sm">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>

          {/* Step Content */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-gray-600">
              {currentStepData.description}
            </p>
          </div>

          <div className="mb-8">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isCompleting}
            >
              Skip Setup
            </Button>

            <Button
              onClick={handleNext}
              disabled={isCompleting || !canProceed()}
              loading={isCompleting}
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              {!isCompleting && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}