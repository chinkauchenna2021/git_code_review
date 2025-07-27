// app/api/auth/switch-organization/route.ts
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/client"
import { logger } from "@/lib/utils/logger"

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { organizationId } = await request.json()

    // Verify user is a member of the organization
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        userId: session.user.id,
        organizationId,
      },
      include: {
        organization: true,
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: "Organization not found or access denied" },
        { status: 403 }
      )
    }

    // Update session with active organization (in a real app, you'd store this in the session)
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        role: membership.role,
      }
    })
  } catch (error) {
    logger.error("Switch organization error", error as Error)
    return NextResponse.json(
      { error: "Failed to switch organization" },
      { status: 500 }
    )
  }
}