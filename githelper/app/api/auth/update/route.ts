// app/api/user/update/route.ts
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/client"
import { logger } from "@/lib/utils/logger"
import { z } from "zod"

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  image: z.string().url().optional(),
  preferences: z.object({
    theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
    emailNotifications: z.boolean().optional(),
    reviewReminders: z.boolean().optional(),
    webhookNotifications: z.boolean().optional(),
  }).optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    
    const validatedData = updateUserSchema.parse(body)
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.email && { email: validatedData.email }),
        ...(validatedData.image && { image: validatedData.image }),
      },
    })

    // Update preferences if provided
    if (validatedData.preferences) {
      await prisma.userPreferences.upsert({
        where: { userId: session?.user?.id },
        update: validatedData?.preferences,
        create: {
          userId: session?.user?.id,
          ...validatedData?.preferences,
        },
      })
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error },
        { status: 400 }
      )
    }
    
    logger.error("Update user error", error as Error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}