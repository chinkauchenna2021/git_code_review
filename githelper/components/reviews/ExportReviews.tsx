'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Download, FileText, Table, Code } from 'lucide-react'

interface ExportReviewsProps {
  reviews: any[]
  open: boolean
  onClose: () => void
}

export function ExportReviews({ reviews, open, onClose }: ExportReviewsProps) {
  const [format, setFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, you would:
      // 1. Format the data according to the selected format
      // 2. Generate the file
      // 3. Trigger download
      
      console.log(`Exporting ${reviews.length} reviews as ${format}`)
      onClose()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Export Reviews">
      <div className="space-y-6">
        <div>
          <p className="text-gray-600 mb-4">
            Export {reviews.length} reviews in your preferred format.
          </p>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={format === 'csv'}
                onChange={(e) => setFormat(e.target.value as any)}
                className="text-blue-600"
              />
              <Table className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium">CSV</div>
                <div className="text-sm text-gray-500">Spreadsheet compatible format</div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="format"
                value="json"
                checked={format === 'json'}
                onChange={(e) => setFormat(e.target.value as any)}
                className="text-blue-600"
              />
              <Code className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium">JSON</div>
                <div className="text-sm text-gray-500">Structured data format</div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={format === 'pdf'}
                onChange={(e) => setFormat(e.target.value as any)}
                className="text-blue-600"
              />
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium">PDF Report</div>
                <div className="text-sm text-gray-500">Formatted report with charts</div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}