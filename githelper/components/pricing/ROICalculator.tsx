'use client'

import React, { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Calculator, TrendingUp, Clock, DollarSign } from 'lucide-react'

export function ROICalculator() {
  const [inputs, setInputs] = useState({
    teamSize: 5,
    avgSalary: 100000,
    reviewsPerWeek: 20,
    timePerReview: 45, // minutes
    issuesFoundPrev: 3, // per review
    timeToFixIssue: 120 // minutes
  })

  const calculations = useMemo(() => {
    const { teamSize, avgSalary, reviewsPerWeek, timePerReview, issuesFoundPrev, timeToFixIssue } = inputs
    
    // Current costs
    const hourlyRate = avgSalary / 2080 // assuming 40 hours/week * 52 weeks
    const weeklyReviewTime = reviewsPerWeek * timePerReview / 60 // hours
    const weeklyReviewCost = weeklyReviewTime * hourlyRate
    const yearlyReviewCost = weeklyReviewCost * 52
    
    // Issue costs
    const weeklyIssues = reviewsPerWeek * issuesFoundPrev
    const weeklyIssueCost = (weeklyIssues * timeToFixIssue / 60) * hourlyRate
    const yearlyIssueCost = weeklyIssueCost * 52
    
    // With DevTeams Copilot
    const improvedReviewTime = timePerReview * 0.6 // 40% faster
    const improvedIssueRate = issuesFoundPrev * 0.3 // 70% fewer issues make it to production
    
    const improvedWeeklyReviewTime = reviewsPerWeek * improvedReviewTime / 60
    const improvedWeeklyReviewCost = improvedWeeklyReviewTime * hourlyRate
    const improvedYearlyReviewCost = improvedWeeklyReviewCost * 52
    
    const improvedWeeklyIssues = reviewsPerWeek * improvedIssueRate
    const improvedWeeklyIssueCost = (improvedWeeklyIssues * timeToFixIssue / 60) * hourlyRate
    const improvedYearlyIssueCost = improvedWeeklyIssueCost * 52
    
    // Savings
    const yearlyReviewSavings = yearlyReviewCost - improvedYearlyReviewCost
    const yearlyIssueSavings = yearlyIssueCost - improvedYearlyIssueCost
    const totalSavings = yearlyReviewSavings + yearlyIssueSavings
    
    // ROI calculation (assuming Pro plan at $29/month per user)
    const toolCost = teamSize * 29 * 12
    const netSavings = totalSavings - toolCost
    const roi = ((netSavings / toolCost) * 100)
    
    return {
      currentYearlyCost: yearlyReviewCost + yearlyIssueCost,
      improvedYearlyCost: improvedYearlyReviewCost + improvedYearlyIssueCost + toolCost,
      totalSavings,
      netSavings,
      roi,
      toolCost,
      paybackMonths: toolCost / (totalSavings / 12)
    }
  }, [inputs])

  const updateInput = (key: string, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Calculator className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ROI Calculator
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate your potential savings and return on investment with DevTeams Copilot
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Controls */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Team Details</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Size (developers)
                </label>
                <input
                  type="number"
                  value={inputs.teamSize}
                  onChange={(e) => updateInput('teamSize', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Developer Salary ($)
                </label>
                <input
                  type="number"
                  value={inputs.avgSalary}
                  onChange={(e) => updateInput('avgSalary', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="30000"
                  max="300000"
                  step="5000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code Reviews per Week
                </label>
                <input
                  type="number"
                  value={inputs.reviewsPerWeek}
                  onChange={(e) => updateInput('reviewsPerWeek', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time per Review (minutes)
                </label>
                <input
                  type="number"
                  value={inputs.timePerReview}
                  onChange={(e) => updateInput('timePerReview', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="180"
                />
              </div>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Your ROI Analysis</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">
                    ${calculations.currentYearlyCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-red-700">Current Annual Cost</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    ${calculations.netSavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">Annual Savings</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ROI</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {calculations.roi.toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payback Period</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {calculations.paybackMonths.toFixed(1)} months
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Annual Tool Cost</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${calculations.toolCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Key Benefits</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 40% faster code reviews</li>
                  <li>• 70% fewer production issues</li>
                  <li>• Improved code quality</li>
                  <li>• Better team collaboration</li>
                </ul>
              </div>

              <Button className="w-full">
                Start Your Free Trial
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}