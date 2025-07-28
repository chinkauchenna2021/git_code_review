'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Building2, Mail, Phone, Calendar, CheckCircle } from 'lucide-react'

export function EnterpriseContact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '',
    phone: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Enterprise contact form submitted:', formData)
    setSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (submitted) {
    return (
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Thank you for your interest!
          </h2>
          <p className="text-gray-600 mb-8">
            Our enterprise team will contact you within 24 hours to discuss your requirements.
          </p>
          <Button onClick={() => setSubmitted(false)}>
            Submit Another Request
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Enterprise Solutions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get a custom solution tailored to your organization's needs with dedicated support, 
            advanced security, and enterprise-grade features.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Contact Our Enterprise Team
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Email *
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company *
                  </label>
                  <Input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    placeholder="Your Company"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size *
                  </label>
                  <select
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select team size</option>
                    <option value="10-50">10-50 developers</option>
                    <option value="50-100">50-100 developers</option>
                    <option value="100-500">100-500 developers</option>
                    <option value="500+">500+ developers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your requirements
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What are your specific needs? Any compliance requirements?"
                />
              </div>

              <Button type="submit" className="w-full">
                Request Enterprise Demo
              </Button>
            </form>
          </Card>

          {/* Enterprise Features */}
          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Enterprise Features</h4>
              <ul className="space-y-3">
                {[
                  'On-premise or private cloud deployment',
                  'Single Sign-On (SSO) integration',
                  'Advanced security and compliance',
                  'Custom integrations and APIs',
                  'Dedicated customer success manager',
                  '24/7 priority support with SLA',
                  'Custom training and onboarding',
                  'Advanced analytics and reporting'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Contact Options</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-gray-600">enterprise@devteams.com</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Phone</div>
                    <div className="text-sm text-gray-600">+1 (555) 123-4567</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Schedule a Call</div>
                    <div className="text-sm text-gray-600">Book a 30-minute demo</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}