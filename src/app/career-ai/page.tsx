'use client'

import { useState } from 'react'
import CareerQuestionnaire from '@/components/career-ai/CareerQuestionnaire'
import CareerDashboard from '@/components/career-ai/CareerDashboard'

export default function CareerAIPage() {
  const [userData, setUserData] = useState(null)
  const [completedQuestionnaire, setCompletedQuestionnaire] = useState(false)

  const handleQuestionnaireSubmit = (data) => {
    setUserData(data)
    setCompletedQuestionnaire(true)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {!completedQuestionnaire ? (
        <CareerQuestionnaire onSubmit={handleQuestionnaireSubmit} />
      ) : (
        <CareerDashboard userData={userData} />
      )}
    </div>
  )
}
