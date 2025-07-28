'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Download, FileText, Calendar, DollarSign } from 'lucide-react'

interface Invoice {
  id: string
  number: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  created: string
  paidAt?: string
  hostedInvoiceUrl: string
  invoicePdf: string
  items: Array<{
    description: string
    amount: number
    quantity: number
  }>
}

interface InvoiceHistoryProps {
  invoices: Invoice[]
  className?: string
}

export function InvoiceHistory({ invoices, className }: InvoiceHistoryProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all')

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount / 100)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'error'
 case 'refunded': return 'secondary'
      default: return 'secondary'
    }
  }

  const years = [...new Set(invoices.map(invoice => 
    new Date(invoice.created).getFullYear().toString()
  ))].sort((a, b) => b.localeCompare(a))

  const filteredInvoices = selectedYear === 'all' 
    ? invoices 
    : invoices.filter(invoice => 
        new Date(invoice.created).getFullYear().toString() === selectedYear
      )

  const handleDownload = (invoice: Invoice) => {
    // In a real implementation, this would trigger the download
    window.open(invoice.invoicePdf, '_blank')
  }

  const totalPaid = filteredInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Invoice History</h3>
        <div className="flex items-center space-x-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(totalPaid)}
          </div>
          <div className="text-sm text-gray-600">Total Paid</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-900">{filteredInvoices.length}</div>
          <div className="text-sm text-gray-600">Total Invoices</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Calendar className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-900">
            {filteredInvoices.filter(i => i.status === 'paid').length}
          </div>
          <div className="text-sm text-gray-600">Paid Invoices</div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {filteredInvoices.map((invoice) => (
          <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">#{invoice.number}</div>
                <div className="text-sm text-gray-600">
                  {new Date(invoice.created).toLocaleDateString()}
                  {invoice.paidAt && (
                    <span> • Paid {new Date(invoice.paidAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </div>
                <Badge variant={getStatusVariant(invoice.status) as any} className="text-xs">
                  {invoice.status}
                </Badge>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(invoice)}
                className="flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No invoices found</p>
          <p className="text-sm">Invoices will appear here after your first payment</p>
        </div>
      )}
    </Card>
  )
}
