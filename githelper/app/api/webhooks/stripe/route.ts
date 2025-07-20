import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/payment/stripe'
import { prisma } from '@/lib/db/client'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      await handleSuccessfulPayment(session)
      break
    
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice
      await handleSuccessfulRenewal(invoice)
      break
    
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription
      await handleCancelledSubscription(subscription)
      break
  }

  return NextResponse.json({ received: true })
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const plan = session.metadata?.plan

  if (userId && plan) {
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        stripeSubscriptionId: session.subscription as string,
        stripeCustomerId: session.customer as string,
        plan,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      create: {
        userId,
        stripeSubscriptionId: session.subscription as string,
        stripeCustomerId: session.customer as string,
        plan,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    // Reset user's review count
    await prisma.user.update({
      where: { id: userId },
      data: { reviewsUsed: 0 }
    })
  }
}

async function handleSuccessfulRenewal(invoice: Stripe.Invoice) {
  // Handle subscription renewal
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription as string
  )
  
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  })
}

async function handleCancelledSubscription(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'cancelled' }
  })
}