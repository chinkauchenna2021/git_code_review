'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MapPin, Edit, CheckCircle } from 'lucide-react'

interface BillingAddressProps {
  onUpdate: () => void
  className?: string
}

export function BillingAddress({ onUpdate, className }: BillingAddressProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [address, setAddress] = useState({
    line1: '123 Main Street',
    line2: 'Suite 100',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94105',
    country: 'US'
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real implementation, this would save to your backend
      console.log('Saving billing address:', address)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEditing(false)
      onUpdate()
    } catch (error) {
      console.error('Failed to save address:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
        {!editing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 *
            </label>
            <Input
              value={address.line1}
              onChange={(e) => handleChange('line1', e.target.value)}
              placeholder="Street address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <Input
              value={address.line2}
              onChange={(e) => handleChange('line2', e.target.value)}
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <Input
                value={address.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province *
              </label>
              <Input
                value={address.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="State or Province"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code *
              </label>
              <Input
                value={address.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                placeholder="Postal Code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                value={address.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <div className="text-gray-900">
                {address.line1}
                {address.line2 && <>, {address.line2}</>}
              </div>
              <div className="text-gray-900">
                {address.city}, {address.state} {address.postal_code}
              </div>
              <div className="text-gray-600">{address.country}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Address verified</span>
          </div>
        </div>
      )}
    </Card>
  )
}
