import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from '@/lib/db/client'

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === 'github') {
        token.githubAccessToken = account.access_token
        token.githubId = profile?.id
      }
      return token
    },
    async session({ session, token }) {
      session.githubAccessToken = token.githubAccessToken
      session.githubId = token.githubId
      return session
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
    error: '/auth/error'
  }
})

export { handler as GET, handler as POST }
