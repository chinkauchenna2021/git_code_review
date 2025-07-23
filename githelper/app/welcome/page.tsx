import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { WelcomeFlow } from '@/components/auth/WelcomeFlow'

export const metadata: Metadata = {
  title: 'Welcome - DevTeams Copilot',
  description: 'Welcome to DevTeams Copilot! Let\'s get you started with AI-powered code reviews.',
}  

export default async function WelcomePage() {
  const session = await getServerSession(authOptions)
  
  // Redirect if not authenticated
  if (!session) {
    redirect('/login')
  }

  return <WelcomeFlow />
}