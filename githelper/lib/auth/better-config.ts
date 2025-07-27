// lib/auth/config.ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { oauth2 } from "better-auth/plugins/oauth2"
import { organization } from "better-auth/plugins/organization"
import { twoFactor } from "better-auth/plugins/two-factor"
import { admin } from "better-auth/plugins/admin"
import { bearer } from "better-auth/plugins/bearer"
import { prisma } from "@/lib/db/client"
import { logger } from "@/lib/utils/logger"

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required")
}

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  throw new Error("GitHub OAuth credentials are required")
}

export const auth = betterAuth({
  // Database adapter
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "sqlite"
  }),

  // Email configuration (optional)
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      // Implement your email sending logic here
      logger.info(`Reset password email for ${user.email}: ${url}`)
    },
    sendVerificationEmail: async ({ user, url }) => {
      // Implement your email verification logic here
      logger.info(`Verification email for ${user.email}: ${url}`)
    },
  },

  // Social providers
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: ["user:email", "read:user", "repo", "read:org"],
      // Map GitHub profile to user
      mapProfileToUser: (profile) => ({
        id: profile.id.toString(),
        name: profile.name || profile.login,
        email: profile.email,
        image: profile.avatar_url,
        emailVerified: true, // GitHub emails are considered verified
      }),
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // Cookie configuration
  cookies: nextCookies(),

  // Security settings
  advanced: {
    crossSubDomainCookies: {
      enabled: false, // Set to true if using subdomains
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    generateId: () => crypto.randomUUID(),
  },

  // Plugins
  plugins: [
    // OAuth2 plugin for additional providers
    oauth2(),
    
    // Organization plugin for team management
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      sendInvitationEmail: async ({ email, organization, inviter, inviteLink }) => {
        // Implement your invitation email logic here
        logger.info(`Invitation email sent to ${email} for ${organization.name}`)
      },
    }),

    // Two-factor authentication
    twoFactor({
      issuer: "DevTeams Copilot",
      totpOptions: {
        period: 30,
        digits: 6,
        algorithm: "sha1",
      },
    }),

    // Admin plugin for user management
    admin(),

    // Bearer token plugin for API authentication
    bearer(),
  ],

  // Rate limiting
  rateLimit: {
    enabled: true,
    storage: "memory", // Use "redis" in production
    window: 60, // 1 minute
    max: 100, // 100 requests per minute
  },

  // Logging
  logger: {
    level: process.env.NODE_ENV === "development" ? "debug" : "warn",
    disabled: false,
  },

  // Account linking
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["github"],
    },
  },

  // Hooks for custom logic
  hooks: {
    after: [
      {
        matcher(context) {
          return context.path === "/sign-up" && context.method === "POST"
        },
        handler: async (ctx) => {
          // Custom logic after user signs up
          const { user } = ctx.context
          if (user) {
            logger.info(`New user registered: ${user.email}`)
            
            // Initialize user preferences, create default repositories, etc.
            try {
              await prisma.userPreferences.create({
                data: {
                  userId: user.id,
                  theme: "system",
                  emailNotifications: true,
                  reviewReminders: true,
                },
              })
            } catch (error) {
              logger.error("Failed to create user preferences", error)
            }
          }
        },
      },
      {
        matcher(context) {
          return context.path === "/sign-in" && context.method === "POST"
        },
        handler: async (ctx) => {
          // Update last login time
          const { user } = ctx.context
          if (user) {
            try {
              await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
              })
            } catch (error) {
              logger.error("Failed to update last login", error)
            }
          }
        },
      },
    ],
    before: [
      {
        matcher(context) {
          return context.path.startsWith("/api/") && context.method !== "GET"
        },
        handler: async (ctx) => {
          // Rate limiting for API endpoints
          const ip = ctx.request.headers.get("x-forwarded-for") || "unknown"
          logger.debug(`API request from ${ip}: ${ctx.path}`)
        },
      },
    ],
  },

  // Custom pages (optional)
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    resetPassword: "/auth/reset-password",
    verifyEmail: "/auth/verify-email",
    error: "/auth/error",
  },

  // CSRF protection
  csrf: {
    enabled: true,
    sameSite: "lax",
  },

  // Trust host
  trustedOrigins: [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
    ...(process.env.TRUSTED_ORIGINS?.split(",") || []),
  ],
})

export type Auth = typeof auth