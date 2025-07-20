import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export const plans = {
  free: {
    name: 'Free',
    price: 0,
    reviewsLimit: 50,
    repositoriesLimit: 1,
    features: ['Basic AI reviews', 'GitHub integration', 'Email support']
  },
  pro: {
    name: 'Pro',
    price: 29,
    reviewsLimit: 500,
    repositoriesLimit: 10,
    features: ['Advanced AI reviews', 'Custom rules', 'Priority support', 'Analytics']
  },
  team: {
    name: 'Team',
    price: 99,
    reviewsLimit: -1, // Unlimited
    repositoriesLimit: -1, // Unlimited
    features: ['Everything in Pro', 'Team collaboration', 'Custom integrations', 'SLA']
  }
}

export class PaymentService {
  async createCheckoutSession(userId: string, priceId: string, plan: string) {
    return stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: { userId, plan }
    })
  }

  async createPortalSession(customerId: string) {
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/billing`
    })
  }

  async getUserUsage(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })

    if (!user) throw new Error('User not found')

    const currentPlan = plans[user.subscription?.plan as keyof typeof plans] || plans.free
    
    return {
      reviewsUsed: user.reviewsUsed,
      reviewsLimit: currentPlan.reviewsLimit,
      repositoriesActive: await prisma.repository.count({
        where: { ownerId: userId, isActive: true }
      }),
      repositoriesLimit: currentPlan.repositoriesLimit,
      plan: user.subscription?.plan || 'free'
    }
  }
}