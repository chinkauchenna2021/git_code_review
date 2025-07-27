






// app/api/organizations/route.ts
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/client"
import { logger } from "@/lib/utils/logger"
import { z } from "zod"

const createOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    
    const organizations = await prisma.organizationMembership.findMany({
      where: { userId: session.user.id },
      include: {
        organization: {
          include: {
            _count: {
              select: {
                members: true,
              }
            }
          }
        },
      },
      orderBy: {
        createdAt: "desc",
      }
    })

    return NextResponse.json({
      success: true,
      organizations: organizations.map(membership => ({
        id: membership.id,
        organizationId: membership.organizationId,
        userId: membership.userId,
        role: membership.role,
        joinedAt: membership.createdAt,
        organization: {
          ...membership.organization,
          memberCount: membership.organization._count.members,
        }
      })),
    })
  } catch (error) {
    logger.error("Get organizations error", error as Error)
    return NextResponse.json(
      { error: "Failed to get organizations" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    
    const validatedData = createOrganizationSchema.parse(body)
    
    // Check if slug is available
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: validatedData.slug }
    })
    
    if (existingOrg) {
      return NextResponse.json(
        { error: "Organization slug already taken" },
        { status: 409 }
      )
    }
    
    // Create organization and add user as owner
    const organization = await prisma.organization.create({
      data: {
        name: validatedData?.name,
        slug: validatedData?.slug,
        description: validatedData?.description,
        plan: "FREE",
        ownerId: session.user.id,
        members: {
          create: {
            userId: session?.user?.id,
            role: "OWNER",
          }
        }
      },
      include: {
        members: true,
      }
    })

    return NextResponse.json({
      success: true,
      organization,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error },
        { status: 400 }
      )
    }
    
    logger.error("Create organization error", error as Error)
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    )
  }
}