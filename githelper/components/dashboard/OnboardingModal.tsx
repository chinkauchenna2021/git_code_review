'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, Github, Zap, BarChart3, Users } from 'lucide-react'
import React from 'react'

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: any
  completed: boolean
  action?: () => void
}

export function OnboardingModal({ open, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'connect-github',
      title: 'Connect GitHub Account',
      description: 'Link your GitHub account to enable repository access',
      icon: Github,
      completed: true // Assuming already connected
    },
    {
      id: 'add-repositories',
      title: 'Add Repositories',
      description: 'Select repositories you want to enable for AI code reviews',
      icon: Zap,
      completed: false,
      action: () => window.location.href = '/dashboard/repositories'
    },
    {
      id: 'configure-settings',
      title: 'Configure Review Settings',
      description: 'Set up your review preferences and quality thresholds',
      icon: BarChart3,
      completed: false,
      action: () => window.location.href = '/dashboard/settings'
    },
    {
      id: 'invite-team',
      title: 'Invite Team Members',
      description: 'Add team members to collaborate on code reviews',
      icon: Users,
      completed: false,
      action: () => window.location.href = '/dashboard/team'
    }
  ])

  const handleStepComplete = (stepId: string) => {
    setSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, completed: true }
          : step
      )
    )
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  const completedSteps = steps.filter(step => step.completed).length
  const progress = (completedSteps / steps.length) * 100

  return (
    <Modal 
      isOpen={open} 
      onClose={onClose} 
      title="Welcome to CodeReview AI!"
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Setup Progress</span>
            <span className="text-sm text-gray-600">{completedSteps}/{steps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <Card className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              {React.createElement(steps[currentStep]?.icon, {
                className: "h-6 w-6 text-blue-600"
              })}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {steps[currentStep]?.title}
              </h3>
              <p className="text-gray-600">
                {steps[currentStep]?.description}
              </p>
            </div>
            {steps[currentStep]?.completed && (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
          </div>

          {steps[currentStep]?.action && !steps[currentStep]?.completed && (
            <div className="mt-4">
              <Button 
                onClick={steps[currentStep].action}
                className="mr-3"
              >
                Complete This Step
              </Button>
            </div>
          )}
        </Card>

        {/* All Steps Overview */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Setup Checklist</h4>
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                index === currentStep ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded ${
                step.completed ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {step.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  React.createElement(step.icon, {
                    className: "h-4 w-4 text-gray-600"
                  })
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  step.completed ? 'text-green-900' : 'text-gray-900'
                }`}>
                  {step.title}
                </p>
              </div>
              {step.completed && (
                <Badge variant="success" className="text-xs">
                  Complete
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleSkip}>
            Skip for now
          </Button>
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                Previous
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Finish Setup' : 'Next Step'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}