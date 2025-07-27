import { createAuthClient } from "better-auth/react"
import { adminClient  , twoFactorClient, organizationClient} from "better-auth/client/plugins"

export const authClient:any = createAuthClient({
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