'use client'

import { useState } from 'react'
import { useAuthForm } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { GithubIcon } from 'lucide-react'

interface SignInButtonProps {
  callbackUrl?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showIcon?: boolean
  children?: React.ReactNode
}

export function SignInButton({
  callbackUrl,
  className,
  size = 'md',
  variant = 'default',
  showIcon = true,
  children
}: SignInButtonProps) {
  const { signInWithGitHub, isLoading, error } = useAuthForm()

  const handleSignIn = () => {
    signInWithGitHub({ callbackUrl })
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSignIn}
        disabled={isLoading}
        size={size}
        variant={variant}
        className={className}
      >
        {isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            {showIcon && <GithubIcon className="w-4 h-4 mr-2" />}
            {children || 'Continue with GitHub'}
          </>
        )}
      </Button>
      
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
