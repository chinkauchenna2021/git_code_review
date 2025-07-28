// app/pricing/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { FAQ } from '@/components/pricing/FAQ'
import { TestimonialSection } from '@/components/pricing/TestimonialSection'
import { ComparisonTable } from '@/components/pricing/ComparisonTable'
import { ROICalculator } from '@/components/pricing/ROICalculator'
import { EnterpriseContact } from '@/components/pricing/EnterpriseContact'
import { 
  Check, 
  X, 
  Star, 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Headphones,
  GitBranch,
  Lock,
  Globe,
  MessageCircle,
  Clock,
  Infinity,
  ArrowRight,
  Sparkles,
  Crown,
  Building2
} from 'lucide-react'

interface PricingPlan {
  id: string
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  popular?: boolean
  enterprise?: boolean
  features: {
    category: string
    items: Array<{
      name: string
      included: boolean | 'limited' | 'unlimited'
      limit?: number
      tooltip?: string
    }>
  }[]
  cta: string
  highlight?: string
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for individual developers and small projects',
    price: { monthly: 0, yearly: 0 },
    features: [
      {
        category: 'Core Features',
        items: [
          { name: 'AI Code Reviews', included: 'limited', limit: 50 },
          { name: 'GitHub Integration', included: true },
          { name: 'Pull Request Analysis', included: true },
          { name: 'Basic Security Scanning', included: true },
          { name: 'Email Notifications', included: true }
        ]
      },
      {
        category: 'Limits',
        items: [
          { name: 'Repositories', included: 'limited', limit: 1 },
          { name: 'Team Members', included: 'limited', limit: 1 },
          { name: 'Review History', included: 'limited', limit: 30 }
        ]
      },
      {
        category: 'Support',
        items: [
          { name: 'Community Support', included: true },
          { name: 'Documentation', included: true },
          { name: 'Priority Support', included: false }
        ]
      }
    ],
    cta: 'Get Started Free'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professional developers who want advanced features',
    price: { monthly: 29, yearly: 24 },
    popular: true,
    features: [
      {
        category: 'Core Features',
        items: [
          { name: 'AI Code Reviews', included: 'limited', limit: 500 },
          { name: 'GitHub Integration', included: true },
          { name: 'Advanced Security Scanning', included: true },
          { name: 'Custom Review Rules', included: true },
          { name: 'Performance Analysis', included: true },
          { name: 'Code Quality Metrics', included: true }
        ]
      },
      {
        category: 'Analytics & Insights',
        items: [
          { name: 'Advanced Analytics', included: true },
          { name: 'Trend Analysis', included: true },
          { name: 'Custom Reports', included: true },
          { name: 'Export to PDF/CSV', included: true }
        ]
      },
      {
        category: 'Limits',
        items: [
          { name: 'Repositories', included: 'limited', limit: 10 },
          { name: 'Team Members', included: 'limited', limit: 1 },
          { name: 'Review History', included: 'unlimited' },
          { name: 'API Calls', included: 'limited', limit: 10000 }
        ]
      },
      {
        category: 'Support',
        items: [
          { name: 'Priority Email Support', included: true },
          { name: 'Live Chat Support', included: true },
          { name: 'Onboarding Session', included: true }
        ]
      }
    ],
    cta: 'Start Pro Trial',
    highlight: 'Most Popular'
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For teams that need collaboration and advanced workflows',
    price: { monthly: 99, yearly: 79 },
    features: [
      {
        category: 'Core Features',
        items: [
          { name: 'AI Code Reviews', included: 'unlimited' },
          { name: 'GitHub Integration', included: true },
          { name: 'Advanced Security Scanning', included: true },
          { name: 'Custom Review Rules', included: true },
          { name: 'Performance Analysis', included: true },
          { name: 'Automated Workflows', included: true }
        ]
      },
      {
        category: 'Team Collaboration',
        items: [
          { name: 'Team Dashboard', included: true },
          { name: 'Role-based Permissions', included: true },
          { name: 'Team Analytics', included: true },
          { name: 'Slack Integration', included: true },
          { name: 'Custom Notifications', included: true }
        ]
      },
      {
        category: 'Advanced Features',
        items: [
          { name: 'Custom AI Prompts', included: true },
          { name: 'Webhook Integration', included: true },
          { name: 'JIRA Integration', included: true },
          { name: 'Advanced Reporting', included: true }
        ]
      },
      {
        category: 'Limits',
        items: [
          { name: 'Repositories', included: 'unlimited' },
          { name: 'Team Members', included: 'limited', limit: 10 },
          { name: 'API Calls', included: 'limited', limit: 50000 }
        ]
      },
      {
        category: 'Support',
        items: [
          { name: 'Priority Support', included: true },
          { name: 'Phone Support', included: true },
          { name: 'Dedicated Success Manager', included: true },
          { name: 'Custom Training', included: true }
        ]
      }
    ],
    cta: 'Start Team Trial'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom requirements',
    price: { monthly: 299, yearly: 249 },
    enterprise: true,
    features: [
      {
        category: 'Everything in Team, plus:',
        items: [
          { name: 'Unlimited Everything', included: true },
          { name: 'Custom AI Models', included: true },
          { name: 'On-premise Deployment', included: true },
          { name: 'SSO Integration', included: true },
          { name: 'Advanced Security', included: true },
          { name: 'Compliance Reports', included: true }
        ]
      },
      {
        category: 'Enterprise Features',
        items: [
          { name: 'Custom Integrations', included: true },
          { name: 'White-label Solution', included: true },
          { name: 'SLA Guarantee', included: true },
          { name: 'Dedicated Infrastructure', included: true },
          { name: 'Advanced Analytics', included: true }
        ]
      },
      {
        category: 'Support & Services',
        items: [
          { name: '24/7 Priority Support', included: true },
          { name: 'Dedicated Account Manager', included: true },
          { name: 'Custom Implementation', included: true },
          { name: 'Training & Workshops', included: true },
          { name: 'Regular Business Reviews', included: true }
        ]
      }
    ],
    cta: 'Contact Sales'
  }
]

export default function PricingPage() {
  const { user } = useAuth()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showROICalculator, setShowROICalculator] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const handlePlanSelection = async (planId: string) => {
    if (planId === 'free') {
      window.location.href = '/auth/signup'
      return
    }

    if (planId === 'enterprise') {
      // Scroll to enterprise contact form
      document.getElementById('enterprise-contact')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    if (!user) {
      window.location.href = `/auth/signup?plan=${planId}&billing=${billingCycle}`
      return
    }

    setLoading(true)
    setSelectedPlan(planId)

    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle,
          userId: user.id
        })
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Failed to create checkout session:', error)
    } finally {
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  const getFeatureIcon = (included: boolean | 'limited' | 'unlimited') => {
    if (included === true || included === 'unlimited') {
      return <Check className="h-4 w-4 text-green-500" />
    }
    if (included === 'limited') {
      return <Check className="h-4 w-4 text-yellow-500" />
    }
    return <X className="h-4 w-4 text-gray-300" />
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free'
    return `${price}`
  }

  const getSavingsPercent = () => {
    return Math.round(((1 - (24 / 29)) * 100))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Supercharge your code reviews with AI-powered insights. Start free and scale as you grow.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-12">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <Switch
                checked={billingCycle === 'yearly'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
              />
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <Badge variant="success" className="ml-2">
                  Save {getSavingsPercent()}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-200 hover:shadow-xl ${
                plan.popular ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''
              } ${plan.enterprise ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                  <Star className="inline h-4 w-4 mr-1" />
                  {plan.highlight}
                </div>
              )}
              
              {plan.enterprise && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-2 text-sm font-medium">
                  <Crown className="inline h-4 w-4 mr-1" />
                  Enterprise
                </div>
              )}

              <div className={`p-8 ${plan.popular || plan.enterprise ? 'pt-16' : ''}`}>
                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(plan.price[billingCycle])}
                    </span>
                    {plan.price[billingCycle] > 0 && (
                      <span className="text-gray-500 ml-1">
                        /{billingCycle === 'yearly' ? 'month*' : 'month'}
                      </span>
                    )}
                  </div>

                  {billingCycle === 'yearly' && plan.price.yearly < plan.price.monthly && (
                    <div className="text-sm text-green-600 mb-4">
                      Save ${(plan.price.monthly - plan.price.yearly) * 12}/year
                    </div>
                  )}

                  <Button
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : plan.enterprise
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={loading && selectedPlan === plan.id}
                  >
                    {loading && selectedPlan === plan.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </div>

                {/* Features */}
                <div className="space-y-6">
                  {plan.features.map((category) => (
                    <div key={category.category}>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        {category.category}
                      </h4>
                      <ul className="space-y-2">
                        {category.items.map((feature) => (
                          <li key={feature.name} className="flex items-center">
                            {getFeatureIcon(feature.included)}
                            <span className="ml-3 text-sm text-gray-700">
                              {feature.name}
                              {feature.limit && (
                                <span className="text-gray-500 ml-1">
                                  ({feature.limit.toLocaleString()})
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Actions */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-gray-600">
            *Yearly plans are billed annually. All plans include a 14-day free trial.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowComparison(!showComparison)}
              className="flex items-center"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Compare Features
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowROICalculator(!showROICalculator)}
              className="flex items-center"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              ROI Calculator
            </Button>
            
            <Button variant="ghost" className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Talk to Sales
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Comparison Table */}
      {showComparison && (
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ComparisonTable plans={pricingPlans} />
          </div>
        </div>
      )}

      {/* ROI Calculator */}
      {showROICalculator && (
        <div className="bg-blue-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ROICalculator />
          </div>
        </div>
      )}

      {/* Trust Indicators */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by developers worldwide
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of developers and teams who have improved their code quality with our AI-powered reviews.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 items-center justify-center opacity-60">
            {/* Mock company logos */}
            <div className="flex items-center justify-center">
              <Building2 className="h-8 w-8 text-gray-400 mr-2" />
              <span className="text-lg font-semibold text-gray-500">TechCorp</span>
            </div>
            <div className="flex items-center justify-center">
              <Building2 className="h-8 w-8 text-gray-400 mr-2" />
              <span className="text-lg font-semibold text-gray-500">DevStudio</span>
            </div>
            <div className="flex items-center justify-center">
              <Building2 className="h-8 w-8 text-gray-400 mr-2" />
              <span className="text-lg font-semibold text-gray-500">CodeLabs</span>
            </div>
            <div className="flex items-center justify-center">
              <Building2 className="h-8 w-8 text-gray-400 mr-2" />
              <span className="text-lg font-semibold text-gray-500">InnovateTech</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Developers Using Our Platform</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">500M+</div>
              <div className="text-gray-600">Lines of Code Reviewed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime SLA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <TestimonialSection />

      {/* Enterprise Contact */}
      <div id="enterprise-contact">
        <EnterpriseContact />
      </div>

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to improve your code quality?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Start your free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => handlePlanSelection('pro')}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}