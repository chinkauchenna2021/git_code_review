'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CreditCard, Plus, Trash2, Shield, CheckCircle } from 'lucide-react'

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault?: boolean
}

interface PaymentMethodsProps {
  paymentMethod: PaymentMethod | null
  onUpdate: () => void
  className?: string
}

export function PaymentMethods({ paymentMethod, onUpdate, className }: PaymentMethodsProps) {
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState(false)

  const handleAddPaymentMethod = async () => {
    setAdding(true)
    try {
      // In a real implementation, this would open Stripe Elements or similar
      console.log('Adding payment method...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      onUpdate()
    } catch (error) {
      console.error('Failed to add payment method:', error)
    } finally {
      setAdding(false)
    }
  }

  const handleRemovePaymentMethod = async () => {
    setRemoving(true)
    try {
      console.log('Removing payment method...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      onUpdate()
    } catch (error) {
      console.error('Failed to remove payment method:', error)
    } finally {
      setRemoving(false)
    }
  }

  const getCardIcon = (brand: string) => {
    // In a real implementation, you'd use actual card brand icons
    return <CreditCard className="w-8 h-8 text-gray-600" />
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
        <Button
          onClick={handleAddPaymentMethod}
          disabled={adding}
          size="sm"
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{adding ? 'Adding...' : 'Add Method'}</span>
        </Button>
      </div>

      {paymentMethod ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              {getCardIcon(paymentMethod.brand)}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 capitalize">
                    {paymentMethod.brand}
                  </span>
                  <span className="text-gray-600">**** {paymentMethod.last4}</span>
                  {paymentMethod.isDefault && (
                    <Badge variant="success" className="text-xs">Default</Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Expires {paymentMethod.expMonth.toString().padStart(2, '0')}/{paymentMethod.expYear}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemovePaymentMethod}
                disabled={removing}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Secure Payment Processing</h4>
              <p className="text-sm text-blue-800 mt-1">
                Your payment information is encrypted and processed securely by Stripe. 
                We never store your full card details on our servers.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Payment Method</h4>
          <p className="text-gray-600 mb-6">
            Add a payment method to upgrade your plan or for automatic billing.
          </p>
          <Button onClick={handleAddPaymentMethod} disabled={adding}>
            <Plus className="w-4 h-4 mr-2" />
            {adding ? 'Adding...' : 'Add Payment Method'}
          </Button>
        </div>
      )}
    </Card>
  )
}
