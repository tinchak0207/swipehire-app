'use client'

import React, { useEffect } from 'react'

interface FormsAppSurveyProps {
  onComplete: (data: any) => void
}

const FormsAppButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ 
  className,
  children 
}) => (
  <button
    data-formsapp-id="685190dedd9ab40002e7de9a"
    className={className}
  >
    {children}
  </button>
)

export default function FormsAppSurvey({ onComplete }: FormsAppSurveyProps) {
  useEffect(() => {
    // Initialize forms.app listener
    window.addEventListener('message', (event) => {
      if (event.data.type === 'formsapp') {
        // Extract relevant data from survey response
        const rawData = event.data.data 
        
        // Format data to match expected structure
        const formattedData = {
          education: rawData.education,
          experience: rawData.experience?.split(',') || [],
          skills: rawData.skills?.split(',') || [],
          interests: rawData.interests?.split(',') || [],
          values: rawData.values?.split(',') || [],
          careerExpectations: rawData.careerExpectations
        }
        
        onComplete(formattedData)
      }
    })

    // Cleanup
    return () => {
      window.removeEventListener('message', () => {})
    }
  }, [onComplete])

  useEffect(() => {
    // Dynamically load forms.app script
    const script = document.createElement('script')
    script.src = 'https://forms.app/cdn/embed.js'
    script.async = true
    script.defer = true
    script.onload = () => {
      new (window as any).formsapp(
        '685190dedd9ab40002e7de9a',
        'popup',
        {
          overlay: 'rgba(45,45,45,0.5)',
          button: {color: '#ff9e24', text: 'Click here!'},
          width: '800px',
          height: '600px',
          autoOpen: {action: 'onpageload'},
          openingAnimation: {entrance: 'animate__fadeIn', exit: 'animate__fadeOut'}
        },
        'https://17scaqk8.forms.app'
      )
    }
    
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="text-center py-8">
      <FormsAppButton
        className="px-6 py-3 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 transition-colors"
      >
        Start Career Questionnaire
      </FormsAppButton>
    </div>
  )
}
