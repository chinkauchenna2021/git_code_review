// app/(dashboard)/settings/billing/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { UsageChart } from '@/components/billing/UsageChart'
import { InvoiceHistory } from '@/components/billing/InvoiceHistory'
import { PaymentMethods } from '@/components/billing/PaymentMethods'
import { BillingAddress } from '@/components/billing/BillingAddress'
import { PlanComparison } from '@/components/billing/PlanComparison'
import { 
  CreditCard, 
  Download, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Crown,
  Shield,
  Zap,
  Users,
  BarChart3,
  Clock,
  RefreshCw,
  ExternalLink,
  Settings,
  FileText,
  DollarSign,
  Package,
  ArrowRight,
  Gift,
  Star
} from 'lucide-react'

interface BillingData {
  subscription: {
    id: string
    plan: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE'
    status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING'
    currentPeriodStart: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
    trialEnd?: string
    amount: number
    currency: string
    interval: 'month' | 'year'
  }
  usage: {
    reviews: { used: number; limit: number; percentage: number }
    repositories: { used: number; limit: number; percentage: number }
    apiCalls: { used: number; limit: number; percentage: number }
    teamMembers: { used: number; limit: number; percentage: number }
  }
  paymentMethod: {
    id: string
    brand: string
    last4: string
    expMonth: number
    expYear: number
  } | null
  invoices: Array<{
    id: string
    number: string
    amount: number
    currency: string
    status: string
    created: string
    paidAt?: string
    hostedInvoiceUrl: string
    invoicePdf: string
  }>
  upcomingInvoice?: {
    amount: number
    currency: string
    periodStart: string
    periodEnd: string
  }
}

export default function BillingPage() {
  const { user } = useAuth()
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingAction, setProcessingAction] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showUsageDetails, setShowUsageDetails] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/billing')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setProcessingAction('portal')
      const response = await fetch('/api/billing/portal', { method: 'POST' })
      const { url } = await response.json()
      window.open(url, '_blank')
    } catch (error) {
      console.error('Failed to open billing portal:', error)
    } finally {
      setProcessingAction(null)
    }
  }

  const handleUpgrade = async (planId: string) => {
    try {
      setProcessingAction('upgrade')
      const response = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Failed to upgrade plan:', error)
    } finally {
      setProcessingAction(null)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setProcessingAction('cancel')
      await fetch('/api/billing/cancel', { method: 'POST' })
      await fetchBillingData()
      setShowCancelModal(false)
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
    } finally {
      setProcessingAction(null)
    }
  }

  const handleReactivateSubscription = async () => {
    try {
      setProcessingAction('reactivate')
      await fetch('/api/billing/reactivate', { method: 'POST' })
      await fetchBillingData()
    } catch (error) {
      console.error('Failed to reactivate subscription:', error)
    } finally {
      setProcessingAction(null)
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'PRO': return <Zap className="h-5 w-5 text-blue-500" />
      case 'TEAM': return <Users className="h-5 w-5 text-purple-500" />
      case 'ENTERPRISE': return <Crown className="h-5 w-5 text-yellow-500" />
      default: return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'PRO': return 'blue'
      case 'TEAM': return 'purple'
      case 'ENTERPRISE': return 'yellow'
      default: return 'gray'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount / 100)
  }

  const getDaysUntilRenewal = () => {
    if (!data?.subscription?.currentPeriodEnd) return 0
    const now = new Date()
    const renewalDate = new Date(data.subscription.currentPeriodEnd)
    return Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  const isTrialing = data?.subscription?.status === 'TRIALING'
  const isCancelled = data?.subscription?.cancelAtPeriodEnd
  const isPastDue = data?.subscription?.status === 'PAST_DUE'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Unable to load billing information</p>
        <Button onClick={fetchBillingData} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Usage</h1>
          <p className="mt-1 text-gray-600">
            Manage your subscription, usage, and billing information
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManageSubscription}
            disabled={processingAction === 'portal'}
            className="flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Billing Portal</span>
          </Button>
          
          {data.subscription.plan !== 'ENTERPRISE' && (
            <Button
              size="sm"
              onClick={() => setShowPlanModal(true)}
              className="flex items-center space-x-2"
            >
              <Crown className="h-4 w-4" />
              <span>Upgrade Plan</span>
            </Button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {isPastDue && (
        <Alert variant="error" className="p-4">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Payment Failed</h4>
            <p className="text-sm mt-1">
              Your payment method was declined. Please update your payment information to avoid service interruption.
            </p>
          </div>
          <Button size="sm" onClick={handleManageSubscription} className="ml-auto">
            Update Payment
          </Button>
        </Alert>
      )}

      {isCancelled && (
        <Alert variant="warning" className="p-4">
          <Clock className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Subscription Cancelled</h4>
            <p className="text-sm mt-1">
              Your subscription will end on {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}.
              You can reactivate anytime before then.
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={handleReactivateSubscription}
            disabled={processingAction === 'reactivate'}
            className="ml-auto"
          >
            Reactivate
          </Button>
        </Alert>
      )}

      {isTrialing && (
        <Alert variant="info" className="p-4">
          <Gift className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Free Trial Active</h4>
            <p className="text-sm mt-1">
              Your free trial ends on {new Date(data.subscription.trialEnd!).toLocaleDateString()}.
              Add a payment method to continue service.
            </p>
          </div>
          <Button size="sm" onClick={handleManageSubscription} className="ml-auto">
            Add Payment Method
          </Button>
        </Alert>
      )}

      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
          <Badge variant={getPlanColor(data.subscription.plan) as any} className="text-sm">
            {data.subscription.plan}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4">
            {getPlanIcon(data.subscription.plan)}
            <div>
              <p className="font-medium text-gray-900">{data.subscription.plan} Plan</p>
              <p className="text-sm text-gray-500">
                {formatCurrency(data.subscription.amount, data.subscription.currency)}
                /{data.subscription.interval}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600">Next Billing Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              {getDaysUntilRenewal()} days remaining
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600">Status</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge 
                variant={
                  data.subscription.status === 'ACTIVE' ? 'success' :
                  data.subscription.status === 'TRIALING' ? 'default' :
                  data.subscription.status === 'PAST_DUE' ? 'error' : 'warning'
                }
                className="text-xs"
              >
                {data.subscription.status}
              </Badge>
              {data.subscription.status === 'ACTIVE' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Usage Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Usage Overview</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUsageDetails(true)}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>View Details</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(data.usage).map(([key, usage]) => (
            <div key={key} className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <span className="text-sm text-gray-500">
                  {usage.used} / {usage.limit === -1 ? '∞' : usage.limit}
                </span>
              </div>
              <ProgressBar
                value={usage.percentage}
                variant={
                  usage.percentage >= 100 ? 'error' :
                  usage.percentage >= 80 ? 'warning' : 'default'
                }
                className="h-2"
              />
              {usage.percentage >= 80 && (
                <p className="text-xs text-orange-600">
                  {usage.percentage >= 100 ? 'Limit reached' : 'Near limit'}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'invoices', label: 'Invoices', icon: FileText },
            { id: 'payment', label: 'Payment Methods', icon: CreditCard },
            { id: 'address', label: 'Billing Address', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className={`mr-2 h-4 w-4 ${
                activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'
              }`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Chart */}
            <UsageChart data={data.usage} />
            
            {/* Upcoming Invoice */}
            {data.upcomingInvoice && (
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Next Invoice</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold">
                      {formatCurrency(data.upcomingInvoice.amount, data.upcomingInvoice.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Billing Period</span>
                    <span className="text-sm">
                      {new Date(data.upcomingInvoice.periodStart).toLocaleDateString()} - 
                      {new Date(data.upcomingInvoice.periodEnd).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Your card ending in {data.paymentMethod?.last4} will be charged on{' '}
                      {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <InvoiceHistory invoices={data.invoices as any} />
        )}

        {activeTab === 'payment' && (
          <PaymentMethods 
            paymentMethod={data.paymentMethod}
            onUpdate={fetchBillingData}
          />
        )}

        {activeTab === 'address' && (
          <BillingAddress onUpdate={fetchBillingData} />
        )}
      </div>

      {/* Plan Actions */}
      {data.subscription.plan !== 'FREE' && !isCancelled && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Subscription Actions</h4>
              <p className="text-sm text-gray-600 mt-1">
                Manage your subscription settings
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(true)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      {showCancelModal && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Subscription"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to cancel your subscription? You'll continue to have access 
              until {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}.
            </p>
            <div className="flex items-center space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Subscription
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={processingAction === 'cancel'}
              >
                {processingAction === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showPlanModal && (
        <Modal
          isOpen={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          title="Upgrade Your Plan"
          size="lg"
        >
          <PlanComparison
            currentPlan={data.subscription.plan}
            onSelectPlan={handleUpgrade}
            loading={processingAction === 'upgrade'}
          />
        </Modal>
      )}

      {showUsageDetails && (
        <Modal
          isOpen={showUsageDetails}
          onClose={() => setShowUsageDetails(false)}
          title="Detailed Usage Analytics"
          size="lg"
        >
          <div className="space-y-6">
            <UsageChart data={data.usage} detailed />
            <div className="text-center">
              <Button onClick={() => window.location.href = '/dashboard/analytics'}>
                <ArrowRight className="h-4 w-4 mr-2" />
                View Full Analytics
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}