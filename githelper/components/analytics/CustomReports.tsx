'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { FileText, Plus, BarChart3, Download, Settings } from 'lucide-react'

interface CustomReportsProps {
  onGenerateReport: (config: any) => void
}

export function CustomReports({ onGenerateReport }: CustomReportsProps) {
  const [showModal, setShowModal] = useState(false)
  const [reportConfig, setReportConfig] = useState({
    name: '',
    type: 'summary',
    timeRange: '30d',
    metrics: ['reviews', 'quality', 'security'],
    repositories: [],
    format: 'pdf'
  })
  const [savedReports, setSavedReports] = useState([
    {
      id: '1',
      name: 'Weekly Quality Report',
      type: 'quality',
      lastGenerated: '2025-01-20',
      status: 'ready'
    },
    {
      id: '2',
      name: 'Security Assessment',
      type: 'security',
      lastGenerated: '2025-01-18',
      status: 'generating'
    }
  ])

  const handleCreateReport = () => {
    onGenerateReport(reportConfig)
    setShowModal(false)
    setReportConfig({
      name: '',
      type: 'summary',
      timeRange: '30d',
      metrics: ['reviews', 'quality', 'security'],
      repositories: [],
      format: 'pdf'
    })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Custom Reports</h3>
          <p className="text-sm text-gray-600">Create and manage custom analytics reports</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      {/* Saved Reports */}
      <div className="space-y-3">
        {savedReports.map((report) => (
          <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{report.name}</p>
                <p className="text-sm text-gray-500">
                  Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={report.status === 'ready' ? 'success' : 'warning'}>
                {report.status}
              </Badge>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Report Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Custom Report">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Name
            </label>
            <Input
              value={reportConfig.name}
              onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter report name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportConfig.type}
              onChange={(e) => setReportConfig(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="summary">Summary Report</option>
              <option value="quality">Code Quality Report</option>
              <option value="security">Security Report</option>
              <option value="performance">Performance Report</option>
              <option value="team">Team Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={reportConfig.timeRange}
              onChange={(e) => setReportConfig(prev => ({ ...prev, timeRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              value={reportConfig.format}
              onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="xlsx">Excel</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReport}>
              Generate Report
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  )
}
