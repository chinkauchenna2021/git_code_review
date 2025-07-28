'use client'

import React from 'react'
import { Star, Quote } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  avatar: string
  content: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Engineering Manager',
    company: 'TechFlow Inc',
    avatar: '/avatars/sarah.jpg',
    content: 'DevTeams Copilot has transformed our code review process. The AI insights catch issues we might have missed and the team collaboration features are outstanding.',
    rating: 5
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    role: 'Senior Developer',
    company: 'InnovateStudio',
    avatar: '/avatars/marcus.jpg',
    content: 'The security scanning alone has saved us countless hours. It\'s like having a senior security engineer reviewing every pull request.',
    rating: 5
  },
  {
    id: '3',
    name: 'Emily Watson',
    role: 'CTO',
    company: 'StartupVenture',
    avatar: '/avatars/emily.jpg',
    content: 'As a startup, code quality is crucial. This tool helps us maintain high standards even as we move fast. The analytics are incredibly valuable.',
    rating: 5
  }
]

export function TestimonialSection() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Loved by developers worldwide
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See what teams are saying about how DevTeams Copilot has improved 
            their development workflow and code quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
              </div>
              
              <div className="mb-4">
                <Quote className="w-8 h-8 text-blue-500 opacity-50 mb-2" />
                <p className="text-gray-700 leading-relaxed">
                  {testimonial.content}
                </p>
              </div>

              <div className="flex items-center">
                <img
                  src={testimonial.avatar || '/default-avatar.png'}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
            <div className="text-gray-600">Developers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">500M+</div>
            <div className="text-gray-600">Lines Reviewed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">4.9/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>
    </div>
  )
}
