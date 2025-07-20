import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db/client'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: {
        ownedTeams: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true, image: true } } }
            }
          }
        },
        teamMemberships: {
          include: {
            team: {
              include: {
                owner: { select: { name: true, email: true } },
                members: { include: { user: { select: { name: true, email: true } } } }
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      ownedTeams: user?.ownedTeams || [],
      memberTeams: user?.teamMemberships?.map(m => m.team) || []
    })

  } catch (error) {
    console.error('Team fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        ownerId: user.id
      }
    })

    return NextResponse.json({ team })

  } catch (error) {
    console.error('Team creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create team' }, 
      { status: 500 }
    )
  }
}
