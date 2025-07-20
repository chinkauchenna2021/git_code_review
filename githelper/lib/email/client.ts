import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export class EmailService {
  private defaultFrom = 'DevTeams Copilot <noreply@devteamscopilot.com>'

  async send(options: EmailOptions): Promise<boolean> {
    try {
      await resend.emails.send({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html
      })
      
      logger.info('Email sent successfully', { to: options.to, subject: options.subject })
      return true
    } catch (error) {
      logger.error('Failed to send email', error instanceof Error ? error : new Error('Unknown error'), {
        to: options.to,
        subject: options.subject
      })
      return false
    }
  }

  async sendWelcome(userEmail: string, userName: string): Promise<boolean> {
    const html = `
      <h1>Welcome to DevTeams Copilot! 🚀</h1>
      <p>Hi ${userName},</p>
      <p>Thanks for joining DevTeams Copilot! We're excited to help you improve your code review process with AI-powered insights.</p>
      
      <h2>Get Started:</h2>
      <ol>
        <li>Install our GitHub App on your repositories</li>
        <li>Enable AI reviews for your projects</li>
        <li>Watch as we analyze your pull requests automatically</li>
      </ol>
      
      <p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Go to Dashboard
        </a>
      </p>
      
      <p>If you have any questions, just reply to this email!</p>
      <p>Happy coding!<br>The DevTeams Copilot Team</p>
    `

    return this.send({
      to: userEmail,
      subject: 'Welcome to DevTeams Copilot!',
      html
    })
  }

  async sendReviewSummary(userEmail: string, summary: any): Promise<boolean> {
    const html = `
      <h1>Weekly Review Summary 📊</h1>
      <p>Here's your code review activity for this week:</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>This Week's Stats:</h3>
        <ul>
          <li><strong>${summary.totalReviews}</strong> pull requests reviewed</li>
          <li><strong>${summary.issuesFound}</strong> issues identified</li>
          <li><strong>${summary.averageScore}</strong> average code quality score</li>
        </ul>
      </div>
      
      <p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/analytics" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          View Detailed Analytics
        </a>
      </p>
    `

    return this.send({
      to: userEmail,
      subject: 'Your Weekly Code Review Summary',
      html
    })
  }
}

export const emailService = new EmailService()
