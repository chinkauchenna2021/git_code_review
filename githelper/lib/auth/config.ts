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
      // Enhanced profile mapping
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
  
  session: { 
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'github' && profile) {
          // Enhanced user data from GitHub
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

          logger.info('User signed in successfully', {
            userId: user.id,
            email: user.email,
            provider: account.provider,
            githubUsername: githubProfile.login
          })
        }
        return true
      } catch (error) {
        logger.error('Sign in error', error as Error, {
          userId: user.id,
          email: user.email,
          provider: account?.provider
        })
        return false
      }
    },

    async jwt({ token, account, profile, user, trigger }) {
      try {
        // Initial sign in
        if (account?.provider === 'github') {
          token.githubAccessToken = account.access_token
          token.githubRefreshToken = account.refresh_token
          // token.githubId = profile?.id
          token.githubEmail = profile?.email
          token.name = profile?.name
          token.githubUsername = (profile as any)?.login
          token.tokenExpiresAt = (account.expires_at ? account.expires_at * 1000 : null) as any
        }

        // Subsequent requests - refresh token if needed
        if (token.tokenExpiresAt && Number(Date.now()) > Number(token.tokenExpiresAt)) {
          logger.warn('GitHub token expired, attempting refresh', {
            userId: token.sub,
            expiresAt: token.tokenExpiresAt
          })
          
          // Here you would implement token refresh logic
          // For now, we'll just log it
        }

        // Get fresh user data on update
        if (trigger === 'update' && token.sub) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
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
              githubUsername: dbUser.githubUsername,
              reviewsUsed: dbUser.reviewsUsed,
              subscription: dbUser.subscription,
              stats: {
                activeRepositories: dbUser._count.repositories,
                totalReviews: dbUser._count.reviews
              }
            }
          }
        }

        return token
      } catch (error) {
        logger.error('JWT callback error', error as Error, {
          userId: token.sub
        })
        return token
      }
    },

    async session({ session, token, user }) {
      try {
        // Add custom properties to session
        if (token) {
          session.githubAccessToken = token.githubAccessToken as string
          session.githubId = token.githubId as number
          session.githubUsername = token.githubUsername as string
          session.user = {
            ...session.user,
            id: token.sub!,
            ...(token.user as any)
          }
        }

        // Add database user data
        if (user) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
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
            session.user = {
              ...session.user,
              id: dbUser.id as string,
              reviewsUsed: dbUser.reviewsUsed,
              subscription: dbUser.subscription,
              stats: {
                activeRepositories: dbUser._count.repositories,
                totalReviews: dbUser._count.reviews
              }
            }
          }
        }

        return session
      } catch (error) {
        logger.error('Session callback error', error as Error, {
          email: session.user?.email
        })
        return session
      }
    },

    async redirect({ url, baseUrl }) {
      // Handle redirects after sign in/out
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      } else if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl + '/dashboard'
    }
  },

  pages: {
    signIn: '/login',
    error: '/auth/error',
    newUser: '/welcome'
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      logger.info('User signed in', {
        userId: user.id,
        email: user.email,
        isNewUser,
        provider: account?.provider
      })

      // Track sign in event
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            entity: 'USER',
            entityId: user.id,
            newValues: {
              provider: account?.provider,
              isNewUser,
              timestamp: new Date().toISOString()
            },
            metadata: {
              userAgent: 'unknown', // Would need to pass from request
              ipAddress: 'unknown'  // Would need to pass from request
            }
          }
        })
      } catch (error) {
        logger.error('Failed to log sign in event', error as Error)
      }

      // Send welcome email for new users
      if (isNewUser && user.email) {
        // Queue welcome email
        logger.info('New user registered, queuing welcome email', {
          userId: user.id,
          email: user.email
        })
      }
    },

    async signOut({ token }) {
      logger.info('User signed out', {
        userId: token?.sub
      })

      // Track sign out event
      if (token?.sub) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: token.sub,
              action: 'LOGOUT',
              entity: 'USER',
              entityId: token.sub,
              newValues: {
                timestamp: new Date().toISOString()
              }
            }
          })
        } catch (error) {
          logger.error('Failed to log sign out event', error as Error)
        }
      }
    },

    async createUser({ user }) {
      logger.info('New user created', {
        userId: user.id,
        email: user.email
      })

      try {
        // Initialize user subscription
        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: 'FREE',
            status: 'ACTIVE',
            reviewsLimit: 50,
            repositoriesLimit: 1,
            teamMembersLimit: 1,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        })

        // Track user creation
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'CREATE',
            entity: 'USER',
            entityId: user.id,
            newValues: {
              email: user.email,
              name: user.name,
              provider: 'github',
              timestamp: new Date().toISOString()
            }
          }
        })

        logger.info('User initialization completed', { userId: user.id })
      } catch (error) {
        logger.error('Failed to initialize new user', error as Error, {
          userId: user.id,
          email: user.email
        })
      }
    }
  },

  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code, metadata) => {
      logger.error(`NextAuth Error: ${code}`, new Error(code), metadata)
    },
    warn: (code) => {
      logger.warn(`NextAuth Warning: ${code}`)
    },
    debug: (code, metadata) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`NextAuth Debug: ${code}`, metadata as any)
      }
    }
  }
}