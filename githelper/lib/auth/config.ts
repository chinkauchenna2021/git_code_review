import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GitHubProvider from 'next-auth/providers/github'
import  prisma  from '@/lib/db/client'
import { logger } from '@/lib/utils/logger'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo admin:repo_hook read:org"
        }
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubId: profile.id,
          githubUsername: profile.login,
        }
      }
    })
  ],
  
  // Use JWT for Edge Runtime compatibility
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Configure JWT
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'github' && profile) {
          const githubProfile = profile as any
          
          // Update or create user with GitHub data
          await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              githubId: githubProfile.id,
              githubUsername: githubProfile.login,
              name: user.name || githubProfile.name || githubProfile.login,
              image: user.image || githubProfile.avatar_url,
              updatedAt: new Date(),
            },
            create: {
              email: user.email!,
              githubId: githubProfile.id,
              githubUsername: githubProfile.login,
              name: user.name || githubProfile.name || githubProfile.login,
              image: user.image || githubProfile.avatar_url,
            }
          })

          console.log('User signed in successfully', {
            userId: user.id,
            email: user.email,
            provider: account.provider,
            githubUsername: githubProfile.login
          })
        }
        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    },

    async jwt({ token, account, profile, user, trigger }) {
      try {
        // Initial sign in
        if (account?.provider === 'github') {
          token.githubAccessToken = account.access_token
          token.githubRefreshToken = account.refresh_token
          token.githubId = (profile as any)?.id
          token.githubUsername = (profile as any)?.login
          token.tokenExpiresAt = account.expires_at ? account.expires_at * 1000 : undefined
        }

        // Update session
        if (trigger === 'update' && user) {
          token.name = user.name
          token.email = user.email
          token.picture = user.image
        }

        // Refresh user data periodically
        if (token.githubAccessToken && (!token.lastRefresh || Date.now() - (token.lastRefresh as number) > 24 * 60 * 60 * 1000)) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: token.email! },
              include: {
                subscription: true,
                _count: {
                  select: {
                    repositories: { where: { isActive: true } },
                    reviews: true
                  }
                }
              }
            })

            if (dbUser) {
              token.user = {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                image: dbUser.image,
                githubId: Number(dbUser.githubId),
                githubUsername: String(dbUser.githubUsername),
                reviewsUsed: dbUser.reviewsUsed,
                subscription: dbUser.subscription ? {
                  plan: dbUser.subscription.plan,
                  status: dbUser.subscription.status,
                  currentPeriodEnd: dbUser.subscription.currentPeriodEnd
                } as any : undefined,
                stats: {
                  activeRepositories: dbUser._count.repositories,
                  totalReviews: dbUser._count.reviews
                }
              }
              token.lastRefresh = Date.now()
            }
          } catch (error) {
            console.error('Error refreshing user data in JWT:', error)
          }
        }

        return token
      } catch (error) {
        console.error('JWT callback error:', error)
        return token
      }
    },

    async session({ session, token }) {
      try {
        if (token) {
          session.user = {
            ...session.user,
            id: token.sub!,
            ...(token.user as any)
          }
          session.githubAccessToken = token.githubAccessToken as string
          session.githubId = token.githubId as number
          session.githubUsername = token.githubUsername as string
        }
        return session
      } catch (error) {
        console.error('Session callback error:', error)
        return session
      }
    }
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', {
        userId: user.id,
        email: user.email,
        isNewUser,
        provider: account?.provider
      })
    },
    
    async signOut({ session, token }) {
      console.log('User signed out:', {
        userId: token?.sub || session?.user?.id
      })
    }
  },

  debug: process.env.NODE_ENV === 'development',
}