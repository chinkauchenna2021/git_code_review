// import { NextRequest, NextResponse } from 'next/server'
// import { getSessionUser, getUserPermissions, checkUsageLimits } from '@/lib/auth/utils'
// import { logger } from '@/lib/utils/logger'
// import { auth } from '@/lib/auth/config'
// import { prisma } from '@/lib/db/client'

// export async function GET(request: NextRequest) {
//   try {

//     const session = await auth()
      
//     const dbUser:any = await prisma.user.findUnique({
//           where: { id: session?.user?.id },
//           include: {
//             subscription: true,
//             _count: {
//               select: {
//                 repositories: { where: { isActive: true } },
//                 reviews: true
//               }
//             }
//           }
//         })
    
//         if (!dbUser) {
//           logger.warn('User not found in database', { userId: session?.user?.id })
//           return null
//         }
    
//         const userdata = {
//           dbUser,
//           id: dbUser.id,
//           name: String(dbUser?.name) ||  dbUser.githubUsername || "GitHub User",
//           email: dbUser.email,
//           image: dbUser.image,
//           githubId: dbUser.githubId || undefined,
//           githubUsername: dbUser.githubUsername || undefined,
//           reviewsUsed: dbUser.reviewsUsed,
//           subscription: dbUser.subscription ? {
//             plan: dbUser.subscription.plan,
//             status: dbUser.subscription.status,
//             currentPeriodEnd: dbUser.subscription.currentPeriodEnd!
//           } : undefined,
//           stats: {
//             activeRepositories: dbUser._count.repositories,
//             totalReviews: dbUser._count.reviews
//           }
//         }
    
//     if (!userdata) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const permissions = getUserPermissions(userdata.subscription as any)
//     const usageLimits = await checkUsageLimits(userdata.id)
    
//     return NextResponse.json({
//       permissions,
//       usage: usageLimits,
//       subscription: userdata.subscription
//     })
//   } catch (error) {
//     logger.error('Permissions API error', error as Error)
//     return NextResponse.json(
//       { error: 'Failed to get permissions' },
//       { status: 500 }
//     )
//   }
// }





// app/api/user/permissions/route.ts
import { NextRequest, NextResponse } from "next/server"
import { requireAuth, getUserPermissions } from "@/lib/auth/utils"
import { logger } from "@/lib/utils/logger"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const permissions = await getUserPermissions(session?.user?.id as any)
    
    return NextResponse.json({
      success: true,
      permissions,
    })
  } catch (error) {
    logger.error("Get permissions error", error as Error)
    return NextResponse.json(
      { error: "Failed to get permissions" },
      { status: 500 }
    )
  }
}