'use client'

import { useState, useRef, useEffect } from 'react'
import { CareerChatMessage, CandidateProfileForAI, Goal } from '@/lib/types'
import { sendCareerChatMessage } from '@/services/careerService'

interface CareerAIChatProps {
  profile?: CandidateProfileForAI
  goals?: Goal[]
  currentStage?: string
  onGoalUpdate?: (goalId: number) => void
}

export default function CareerAIChat({ 
  profile, 
  goals, 
  currentStage, 
  onGoalUpdate 
}: CareerAIChatProps) {
  const [messages, setMessages] = useState<CareerChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '👋 Hi! I\'m your AI career assistant. I can help you with career planning, skill development, goal setting, and answering questions about your professional growth. What would you like to discuss today?',
      timestamp: new Date().toISOString(),
      type: 'text'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: CareerChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const aiResponse = await sendCareerChatMessage(inputMessage, {
        profile,
        goals,
        currentStage
      })
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: CareerChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date().toISOString(),
        type: 'text'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser.')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputMessage(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
      alert('Voice recognition error. Please try again.')
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const quickQuestions = [
    "What should I do next in my career?",
    "How can I improve my skills?",
    "What's my ideal career path?",
    "How do I negotiate salary?",
    "How to maintain work-life balance?",
    "What skills should I learn?"
  ]

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question)
    inputRef.current?.focus()
  }

  return (
    <div className="card bg-base-100 shadow-xl h-[600px] flex flex-col">
      <div className="card-body p-0 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-base-200">
          <div className="flex items-center space-x-3">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-content text-lg">🤖</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold">AI Career Assistant</h3>
              <p className="text-sm text-base-content/60">
                {isLoading ? 'Thinking...' : 'Online'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}
            >
              <div className="chat-image avatar">
                <div className="w-8 h-8 rounded-full">
                  {message.role === 'user' ? (
                    <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-secondary-content text-sm">👤</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-content text-sm">🤖</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="chat-header">
                <time className="text-xs opacity-50">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </time>
              </div>
              <div className={`chat-bubble ${
                message.role === 'user' 
                  ? 'chat-bubble-secondary' 
                  : 'chat-bubble-primary'
              } max-w-xs lg:max-w-md`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-content text-sm">🤖</span>
                </div>
              </div>
              <div className="chat-bubble chat-bubble-primary">
                <span className="loading loading-dots loading-sm"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <p className="text-sm text-base-content/60 mb-2">Quick questions to get started:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="btn btn-outline btn-xs"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-base-200">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your career..."
                className="input input-bordered w-full pr-12"
                disabled={isLoading}
              />
              <button
                onClick={startVoiceRecognition}
                disabled={isLoading || isListening}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm btn-circle ${
                  isListening ? 'text-error animate-pulse' : 'text-base-content/60'
                }`}
                title="Voice input"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Additional Quick Questions */}
          {messages.length > 1 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {quickQuestions.slice(3).map((question, index) => (
                  <button
                    key={index + 3}
                    onClick={() => handleQuickQuestion(question)}
                    className="btn btn-outline btn-xs"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}