'use client'

import { useState, useEffect } from 'react'
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, User, signOut } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { AppHeader } from '@/components/AppHeader'
import { useUserPreferences } from '@/contexts/UserPreferencesContext'

interface CareerQuestionnaireData {
  education: string
  experience: string[]
  skills: string[]
  interests: string[]
  values: string[]
  careerExpectations: string
}

import FormsAppSurvey from '@/components/career-ai/FormsAppSurvey'
import CareerDashboard from '@/components/career-ai/CareerDashboard'

export default function CareerAIPage() {
  const [userData, setUserData] = useState<CareerQuestionnaireData | null>(null)
  const [completedQuestionnaire, setCompletedQuestionnaire] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const [isGuestMode, setIsGuestMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const { 
    fullBackendUser, 
    mongoDbUserId, 
    fetchAndSetUserPreferences,
    preferences: { isLoading: preferencesLoading } 
  } = useUserPreferences()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        setIsLoading(true)
        try {
          await fetchAndSetUserPreferences(user.uid)
        } catch (error) {
          toast({
            title: "Error loading profile",
            description: "Failed to load user profile data", 
            variant: "destructive"
          })
        }
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    })
    return () => unsubscribe()
  }, [mongoDbUserId, fetchAndSetUserPreferences, toast])

  const handleLoginRequest = () => {
    // Implement login redirect logic
    setIsGuestMode(false)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast({ title: "Logged Out", description: "You have been successfully logged out" })
    } catch (error) {
      toast({ title: "Logout Failed", description: "Could not log out", variant: "destructive" })
    }
  }

  const handleQuestionnaireSubmit = (data: CareerQuestionnaireData) => {
    setUserData(data)
    setCompletedQuestionnaire(true)
  }

  const handleSkipToDashboard = () => {
    // Create default data for users who want to skip the questionnaire
    const defaultData: CareerQuestionnaireData = {
      education: 'Not specified',
      experience: ['General experience'],
      skills: ['Communication', 'Problem solving'],
      interests: ['Career development'],
      values: ['Growth', 'Learning'],
      careerExpectations: 'Seeking career advancement opportunities'
    }
    setUserData(defaultData)
    setCompletedQuestionnaire(true)
  }

  const handleBackToQuestionnaire = () => {
    setCompletedQuestionnaire(false)
    setUserData(null)
  }

  const getUserDisplayName = () => {
    if (fullBackendUser?.name) return fullBackendUser.name
    if (currentUser?.displayName) return currentUser.displayName
    if (currentUser?.email) return currentUser.email
    return null
  }

  const getUserPhotoURL = () => {
    if (fullBackendUser?.profileAvatarUrl) {
      if (fullBackendUser.profileAvatarUrl.startsWith('/uploads/')) {
        return `${process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL}${fullBackendUser.profileAvatarUrl}`
      }
      return fullBackendUser.profileAvatarUrl
    }
    return currentUser?.photoURL || null
  }

  return (
    <div className="flex flex-col min-h-screen">
        <AppHeader 
          isAuthenticated={!!currentUser}
          isGuestMode={isGuestMode}
          onLoginRequest={handleLoginRequest}
          onLogout={handleLogout} 
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          userName={getUserDisplayName()}
          userPhotoURL={getUserPhotoURL()}
        />
        <main className="max-w-6xl mx-auto px-4 py-4 flex-grow">
          {!completedQuestionnaire ? (
            <div className="space-y-6">
              {/* Career Planning Header - Top Left, Smaller */}
              <div className="flex items-start justify-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full shadow-md">
                    <svg className="w-8 h-8 text-primary drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold drop-shadow-sm text-black">
                    Career PlanningAI
                  </h1>
                </div>
              </div>

              {/* Forms.app Survey - Clean Implementation */}
              <FormsAppSurvey onComplete={handleQuestionnaireSubmit} />

              {/* Divider */}
              <div className="divider divider-primary">
                <span className="text-white font-bold text-xl px-6 py-3 bg-primary rounded-full shadow-lg border-2 border-primary/20">
                  OR
                </span>
              </div>

              {/* Direct Access Button */}
              <div className="card bg-gradient-to-br from-primary via-secondary to-accent shadow-2xl border-2 border-white/20">
                <div className="card-body text-center p-8">
                  <div className="flex items-center justify-center space-x-4 mb-8">
                    <div className="p-4 bg-white/30 rounded-full backdrop-blur-sm shadow-lg border border-white/20">
                      <svg className="w-14 h-14 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h2 className="text-4xl font-black text-white drop-shadow-xl">
                      Quick Access to Career Dashboard
                    </h2>
                  </div>
                  <p className="mb-10 text-white text-xl font-semibold max-w-2xl mx-auto drop-shadow-lg">
                    Skip the questionnaire and go directly to your career planning dashboard with default recommendations.
                  </p>
                  <div className="card-actions justify-center">
                    <button 
                      onClick={handleSkipToDashboard}
                      className="btn btn-lg text-primary bg-white hover:bg-white/90 border-white hover:border-white/90 font-bold text-lg px-8 py-4 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
                    >
                      <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Go to Career Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : userData ? (
            <CareerDashboard 
              userData={userData} 
              onBackToQuestionnaire={userData.education === 'Not specified' ? handleBackToQuestionnaire : undefined}
              userName={getUserDisplayName()}
              userPhotoURL={getUserPhotoURL()}
            />
          ) : (
            <div className="alert alert-error">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="font-bold">Failed to Load Career Data</h3>
                <div className="text-xs">Please try refreshing the page or contact support.</div>
              </div>
            </div>
          )}
        </main>
      </div>
  )
}
