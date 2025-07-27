// lib/auth/client.ts
import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/plugins/organization/client"
import { twoFactorClient } from "better-auth/plugins/two-factor/client"
import { adminClient } from "better-auth/plugins/admin/client"
import type { auth } from "./config"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    organizationClient(),
    twoFactorClient(),
    adminClient(),
  ],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  organization,
  twoFactor,
  admin,
} = authClient

// Type-safe auth client
export type AuthClient = typeof authClient

// Export session hook with proper typing
export { useSession as useAuthSession }