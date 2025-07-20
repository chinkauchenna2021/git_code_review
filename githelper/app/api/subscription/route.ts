import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { stripe } from '@/lib/payment/stripe'
import { prisma } from '@/lib/db/client'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: { subscription: true }
    })

    return NextResponse.json({
      subscription: user?.subscription || null,
      usage: {
        reviewsUsed: user?.reviewsUsed || 0,
        reviewsLimit: user?.subscription?.plan === 'pro' ? 500 : 50,
        repositoriesActive: await prisma.repository.count({
          where: { ownerId: user?.id, isActive: true }
        })
      }
    })

  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' }, 
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

    const { priceId, plan } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        plan
      }
    })

    return NextResponse.json({
      url: checkoutSession.url
    })

  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' }, 
      { status: 500 }
    )
  }
}