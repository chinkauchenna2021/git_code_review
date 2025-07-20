import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuth(requireAuth: boolean = true) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      router.push('/login')
    }
  }, [requireAuth, status, router])

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    githubToken: session?.githubAccessToken,
    githubId: session?.githubId
  }
}
