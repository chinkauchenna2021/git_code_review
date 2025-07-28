'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Download, FileText, Table, Database } from 'lucide-react'

interface ExportAnalyticsProps {
  data: any
  timeRange: string
  open: boolean
  onClose: () => void
}

export function ExportAnalytics({ data, timeRange, open, onClose }: ExportAnalyticsProps) {
  const [exporting, setExporting] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv' | 'xlsx' | 'json'>('pdf')

  const exportOptions = [
    {
      format: 'pdf' as const,
      name: 'PDF Report',
      description: 'Formatted report with charts and visualizations',
      icon: FileText,
      size: '~2-5 MB'
    },
    {
      format: 'xlsx' as const,
      name: 'Excel Spreadsheet',
      description: 'Raw data in Excel format with multiple sheets',
      icon: Table,
      size: '~1-3 MB'
    },
    {
      format: 'csv' as const,
      name: 'CSV Data',
      description: 'Comma-separated values for data analysis',
      icon: Table,
      size: '~100-500 KB'
    },
    {
      format: 'json' as const,
      name: 'JSON Data',
      description: 'Raw JSON data for API integration',
      icon: Database,
      size: '~200-800 KB'
    }
  ]

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await fetch(`/api/analytics/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: selectedFormat,
          timeRange,
          data
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${timeRange}.${selectedFormat}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        onClose()
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Export Analytics">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Export Format</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportOptions.map((option) => (
              <Card
                key={option.format}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedFormat === option.format
                    ? 'ring-2 ring-blue-500 border-blue-500'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedFormat(option.format)}
              >
                <div className="flex items-start space-x-3">
                  <option.icon className="h-6 w-6 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{option.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                    <p className="text-xs text-gray-400 mt-2">Estimated size: {option.size}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <input
                      type="radio"
                      checked={selectedFormat === option.format}
                      onChange={() => setSelectedFormat(option.format)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Export Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Time Range: {timeRange}</li>
            <li>• Data includes: Overview metrics, trends, repository analytics</li>
            <li>• Export will be downloaded to your device</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {selectedFormat.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
