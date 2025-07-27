import NextAuth from 'next-auth';
import GitHubProvider from '@/app/providers/auth/github'; 
import { prisma } from '@/lib/db/client';
import { PrismaAdapter } from '@auth/prisma-adapter'
import { NextAuthConfig } from 'next-auth'


export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET as string,
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
   pages: {
    signIn: '/login',
  },
  
  // pages: {
  //   signIn: '/(auth)/login',
  //   error: '/auth/error',
  // },
  providers: [
    GitHubProvider
  ],
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
        token.email = (profile as any)?.email || token.email
      }
      return token
    },

    async session({ session, token , user }) {
      if (token) {
        session.user.id = token.sub!
        session.githubAccessToken = token.githubAccessToken as string
        session.githubId = token.githubId as number
        session.githubUsername = token.githubUsername as string
        session.user.email = user.email || (token.email as string)
      }
      return session
    }
  },
  events: {
    async createUser({ user }) {
      // Send welcome email or perform post-registration actions
    },
  },
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
