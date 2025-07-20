import { NextRequest, NextResponse } from 'next/server'
import { Webhooks } from '@octokit/webhooks'
import { prisma } from '@/lib/db/client'
import { handlePullRequestEvent } from '@/lib/github/webhook-handlers'

const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET!
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-hub-signature-256')
    const event = request.headers.get('x-github-event')

    if (!signature || !event) {
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 })
    }

    // Verify webhook signature
    const isValid = await webhooks.verify(body, signature)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)

    switch (event) {
      case 'pull_request':
        await handlePullRequestEvent(payload)
        break
      case 'pull_request_review':
        // Handle review events
        console.log('PR Review event:', payload.action)
        break
      case 'installation':
        // Handle GitHub App installation
        console.log('Installation event:', payload.action)
        break
      default:
        console.log('Unhandled event:', event)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' }, 
      { status: 500 }
    )
  }
}
