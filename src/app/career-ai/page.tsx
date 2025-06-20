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
        <main className="max-w-6xl mx-auto px-4 py-8 flex-grow">
          {!completedQuestionnaire ? (
            <FormsAppSurvey onComplete={handleQuestionnaireSubmit} />
          ) : userData ? (
            <CareerDashboard userData={userData} />
          ) : (
            <div>Failed to load career data</div>
          )}
        </main>
      </div>
  )
}
