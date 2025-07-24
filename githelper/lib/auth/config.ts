import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GitHubProvider from 'next-auth/providers/github'
import  prisma  from '@/lib/db/client'
// import { logger } from '@/lib/utils/logger'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET as string,
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
          id: profile.id!,
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
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
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
        }
        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    },

    async jwt({ token, account, profile }) {
      if (account?.provider === 'github') {
        token.githubAccessToken = account.access_token
        token.githubId = (profile as any)?.id
        token.githubUsername = (profile as any)?.login
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.githubAccessToken = token.githubAccessToken as string
        session.githubId = token.githubId as number
        session.githubUsername = token.githubUsername as string
      }
      return session
    }
  },
}
