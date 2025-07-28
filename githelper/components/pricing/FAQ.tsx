'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What's included in the free plan?",
    answer: "The free plan includes 50 AI code reviews per month, basic GitHub integration, pull request analysis, and email support. It's perfect for individual developers and small projects."
  },
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing cycle."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, we'll provide a full refund within the first 14 days."
  },
  {
    question: "How does the AI code review work?",
    answer: "Our AI analyzes your pull requests for code quality, security vulnerabilities, performance issues, and best practices. It provides detailed feedback with suggestions for improvement."
  },
  {
    question: "Is my code secure?",
    answer: "Yes, we take security seriously. Your code is processed securely and is never stored permanently. We're SOC 2 compliant and follow industry best practices for data protection."
  },
  {
    question: "What programming languages do you support?",
    answer: "We support all major programming languages including JavaScript, TypeScript, Python, Java, Go, Rust, C++, Ruby, PHP, and more. New languages are added regularly."
  },
  {
    question: "Can I use this with private repositories?",
    answer: "Yes, all plans support private repositories. We integrate securely with GitHub, GitLab, and other Git providers while maintaining the privacy of your code."
  },
  {
    question: "Do you offer enterprise features?",
    answer: "Yes, our Enterprise plan includes custom integrations, on-premise deployment, SSO, advanced security features, dedicated support, and custom SLAs."
  }
]

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions? We've got answers. If you don't find what you're looking for, 
            feel free to contact our support team.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">
                  {item.question}
                </span>
                {openItems.includes(index) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <div className="space-x-4">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </button>
            <span className="text-gray-300">•</span>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
