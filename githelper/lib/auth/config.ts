import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GitHubProvider from 'next-auth/providers/github'
import  prisma  from '@/lib/db/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo admin:repo_hook"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === 'github') {
        token.githubAccessToken = account.access_token
        token.githubId = profile?.id
        token.githubUsername = profile?.login
      }
      return token
    },
    async session({ session, token, user }) {
      session.githubAccessToken = token.githubAccessToken as string
      session.githubId = token.githubId as number
      session.githubUsername = token.githubUsername as string
      session.userId = user?.id
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  session: { strategy: 'database' }
}
