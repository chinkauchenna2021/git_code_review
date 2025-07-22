import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

// ===========================
// EXTENDED AUTH TYPES
// ===========================

export interface ExtendedUser extends DefaultUser {
  id: string
  githubId?: number
  githubUsername?: string
  reviewsUsed?: number
  subscription?: {
    plan: string
    status: string
    currentPeriodEnd: Date
  }
  stats?: {
    activeRepositories: number
    totalReviews: number
  }
}

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser
    githubAccessToken?: string
    githubId?: number
    githubUsername?: string
  }

  interface User extends ExtendedUser {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    githubAccessToken?: string
    githubRefreshToken?: string
    githubId?: number
    githubUsername?: string
    tokenExpiresAt?: number
    user?: ExtendedUser
  }
}

// ===========================
// AUTH CONTEXT TYPES
// ===========================

export interface AuthContextType {
  user: ExtendedUser | null
  session: DefaultSession | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: () => void
  signOut: () => void
  refreshSession: () => Promise<void>
}

// ===========================
// AUTH HOOK RETURN TYPES
// ===========================

export interface UseAuthReturn {
  user: ExtendedUser | null
  session: DefaultSession | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  isLoading: boolean
  isAuthenticated: boolean
  githubToken?: string
  githubUsername?: string
  signIn: () => void
  signOut: () => void
  update: () => Promise<void>
}

// ===========================
// GITHUB INTEGRATION TYPES
// ===========================

export interface GitHubProfile {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  twitter_username: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  plan?: {
    name: string
    space: number
    private_repos: number
    collaborators: number
  }
}

export interface GitHubAuthScope {
  scope: string
  description: string
  required: boolean
}

export interface GitHubTokenInfo {
  access_token: string
  token_type: string
  scope: string[]
  expires_in?: number
  refresh_token?: string
  created_at: number
}

// ===========================
// AUTH ERROR TYPES
// ===========================

export type AuthErrorType =
  | 'Configuration'
  | 'AccessDenied'
  | 'Verification'
  | 'Default'
  | 'EmailSignInError'
  | 'SessionTokenError'
  | 'CallbackRouteError'
  | 'CredentialsSignin'
  | 'EmailCreateAccount'

export interface AuthError {
  type: AuthErrorType
  message: string
  details?: string
}

// ===========================
// MIDDLEWARE TYPES
// ===========================

export interface AuthMiddlewareConfig {
  publicPaths: string[]
  authPaths: string[]
  afterSignInRedirect: string
  afterSignOutRedirect: string
}

export interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireSubscription?: boolean
  requiredPlan?: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE'
}

// ===========================
// SERVER-SIDE AUTH TYPES
// ===========================

export interface ServerAuthSession {
  user: ExtendedUser
  expires: string
  githubAccessToken?: string
  githubId?: number
  githubUsername?: string
}

export interface AuthServerOptions {
  required?: boolean
  redirectTo?: string
}

// ===========================
// AUTH PROVIDER TYPES
// ===========================

export interface AuthProviderProps {
  children: React.ReactNode
  session?: DefaultSession | null
}

// ===========================
// SUBSCRIPTION INTEGRATION
// ===========================

export interface UserSubscription {
  plan: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE'
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  limits: {
    reviews: number
    repositories: number
    teamMembers: number
  }
  usage: {
    reviews: number
    repositories: number
    teamMembers: number
  }
}

export interface UserPermissions {
  canCreateReview: boolean
  canAccessPremiumFeatures: boolean
  canManageTeam: boolean
  canAccessAnalytics: boolean
  maxRepositories: number
  maxReviewsPerMonth: number
}

// ===========================
// OAUTH CALLBACK TYPES
// ===========================

export interface OAuthCallbackParams {
  code?: string
  state?: string
  error?: string
  error_description?: string
  error_uri?: string
}

export interface GitHubInstallationCallback {
  installation_id: string
  setup_action: 'install' | 'update'
  repositories?: Array<{
    id: number
    name: string
    full_name: string
  }>
}

// ===========================
// AUTH UTILITIES TYPES
// ===========================

export interface TokenValidation {
  isValid: boolean
  isExpired: boolean
  expiresAt?: Date
  scopes?: string[]
}

export interface UserSession {
  id: string
  email: string
  name?: string
  image?: string
  githubUsername?: string
  subscription?: UserSubscription
  permissions: UserPermissions
  lastActiveAt: Date
}