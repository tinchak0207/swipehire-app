'use client'

import React from 'react'
import CareerPlanningDashboard from './CareerPlanningDashboard'

/**
 * Test Component for Career Planning Dashboard
 * 
 * This component provides a test harness for the CareerPlanningDashboard
 * with sample data to verify functionality and styling.
 */
export default function CareerPlanningTest() {
  const sampleUserData = {
    education: 'Bachelor\'s Degree in Computer Science',
    experience: [
      'Frontend Developer at Tech Startup (2 years)',
      'Junior Software Engineer at Mid-size Company (1 year)',
      'Internship at Fortune 500 Company (6 months)'
    ],
    skills: [
      'React',
      'TypeScript',
      'Node.js',
      'Python',
      'SQL',
      'Git',
      'Agile Development',
      'Problem Solving',
      'Communication'
    ],
    interests: [
      'Web Development',
      'Machine Learning',
      'User Experience Design',
      'Team Leadership',
      'Open Source Contribution'
    ],
    values: [
      'Innovation',
      'Work-Life Balance',
      'Continuous Learning',
      'Team Collaboration',
      'Making Impact'
    ],
    careerExpectations: 'Senior Software Engineer with focus on full-stack development and team leadership'
  }

  const handleBackToQuestionnaire = () => {
    console.log('Back to questionnaire clicked')
    // In real implementation, this would navigate back
  }

  return (
    <div className="min-h-screen">
      <CareerPlanningDashboard
        userData={sampleUserData}
        onBackToQuestionnaire={handleBackToQuestionnaire}
        userName="John Doe"
        userPhotoURL="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      />
    </div>
  )
}