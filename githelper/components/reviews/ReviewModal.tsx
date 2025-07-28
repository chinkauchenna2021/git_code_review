'use client'

import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  GitPullRequest, 
  Clock, 
  Star, 
  AlertTriangle, 
  FileText,
  User,
  Calendar,
  ExternalLink
} from 'lucide-react'

interface ReviewModalProps {
  review: {
    id: string
    title: string
    description?: string
    status: string
    author: { name: string; avatar: string; login: string }
    repository: { name: string; fullName: string; language: string }
    aiAnalysis?: {
      overallScore: number
      summary: string
      issues: Array<{
        severity: string
        type: string
        file: string
        line: number
        message: string
        suggestion?: string
      }>
      recommendations: string[]
    }
    createdAt: string
    completedAt?: string
    filesChanged: number
    linesAdded: number
    linesDeleted: number
    branch: { head: string; base: string }
  }
  open: boolean
  onClose: () => void
}

export function ReviewModal({ review, open, onClose }: ReviewModalProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error'
      case 'high': return 'warning'  
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Review Details" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {review.title}
          </h2>
          {review.description && (
            <p className="text-gray-600">{review.description}</p>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                <strong>Author:</strong> {review.author.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <GitPullRequest className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                <strong>Repository:</strong> {review.repository.fullName}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                <strong>Created:</strong> {new Date(review.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                <strong>Files changed:</strong> {review.filesChanged}
              </span>
            </div>
            <div className="text-sm">
              <strong>Lines:</strong> +{review.linesAdded} -{review.linesDeleted}
            </div>
            <div className="text-sm">
              <strong>Branch:</strong> {review.branch.head} → {review.branch.base}
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {review.aiAnalysis && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI Analysis</h3>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-lg font-semibold">
                  {review.aiAnalysis.overallScore.toFixed(1)}/10
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{review.aiAnalysis.summary}</p>
            </div>

            {/* Issues */}
            {review.aiAnalysis.issues.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">
                  Issues Found ({review.aiAnalysis.issues.length})
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {review.aiAnalysis.issues.map((issue, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getSeverityColor(issue.severity) as any}>
                            {issue.severity}
                          </Badge>
                          <span className="text-sm font-medium">{issue.type}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {issue.file}:{issue.line}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{issue.message}</p>
                      {issue.suggestion && (
                        <div className="p-2 bg-blue-50 rounded text-sm text-blue-800">
                          <strong>Suggestion:</strong> {issue.suggestion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {review.aiAnalysis.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {review.aiAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="space-x-2">
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on GitHub
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
