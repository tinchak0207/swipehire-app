'use client'

import React from 'react'
import { Users, Briefcase, Wand2, HeartHandshake, UserCog, FilePlus2, BookOpenText, UserCircle, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserRole } from '@/lib/types'

interface NavigationItem {
  value: string
  label: string
  icon: React.ElementType
  component: JSX.Element
}

interface DashboardSidebarProps {
  activeTab: string
  setActiveTab: (value: string) => void
  tabItems: NavigationItem[]
  currentUserRole: UserRole | null
  isGuestMode: boolean
  userName?: string | null
  userPhotoURL?: string | null
}

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  tabItems,
  currentUserRole,
  isGuestMode,
  userName,
  userPhotoURL
}: DashboardSidebarProps) {
  // Group navigation items by category
  const primaryItems = tabItems.filter(item => 
    ['findJobs', 'findTalent', 'myProfile'].includes(item.value)
  )
  
  const jobManagementItems = tabItems.filter(item => 
    ['postJob', 'manageJobs'].includes(item.value)
  )
  
  const toolsItems = tabItems.filter(item => 
    ['aiTools', 'myMatches', 'myDiary'].includes(item.value)
  )
  
  const settingsItems = tabItems.filter(item => 
    ['settings'].includes(item.value)
  )

  const renderMenuItems = (items: NavigationItem[], showIcons = true) => (
    <SidebarMenu className="space-y-1">
      {items.map((item) => (
        <SidebarMenuItem key={item.value}>
          <SidebarMenuButton
            onClick={() => setActiveTab(item.value)}
            isActive={activeTab === item.value}
            className={cn(
              "w-full justify-start transition-all duration-200 rounded-lg px-4 py-3",
              "text-gray-700 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm",
              "focus:ring-2 focus:ring-blue-500/30 focus:outline-none",
              activeTab === item.value && 
                "bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 hover:text-white"
            )}
          >
            {showIcons && <item.icon className="h-5 w-5 mr-3" />}
            <span className="text-base">{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )

  return (
    <Sidebar className="border-r border-gray-200/60 bg-white/85 backdrop-blur-md shadow-sm relative">
      <SidebarHeader className="border-b border-gray-200/50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">Dashboard</span>
            {isGuestMode ? (
              <Badge variant="secondary" className="w-fit text-xs bg-blue-100 text-blue-700 border-blue-200">
                Guest Mode
              </Badge>
            ) : (
              <span className="text-sm text-gray-600 capitalize font-medium">
                {currentUserRole || 'User'}
              </span>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        {/* Primary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3 px-2">
            {currentUserRole === 'recruiter' ? 'Talent & Jobs' : 'Discover'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(primaryItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Job Management (Recruiters only) */}
        {jobManagementItems.length > 0 && (
          <>
            <SidebarSeparator className="my-6 bg-gray-200/60" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3 px-2">
                Job Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                {renderMenuItems(jobManagementItems)}
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Tools & Features */}
        {toolsItems.length > 0 && (
          <>
            <SidebarSeparator className="my-6 bg-gray-200/60" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3 px-2">
                Tools & Features
              </SidebarGroupLabel>
              <SidebarGroupContent>
                {renderMenuItems(toolsItems)}
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Settings */}
        {settingsItems.length > 0 && (
          <>
            <SidebarSeparator className="my-6 bg-gray-200/60" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3 px-2">
                Account
              </SidebarGroupLabel>
              <SidebarGroupContent>
                {renderMenuItems(settingsItems)}
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200/50 p-6 bg-white/70 backdrop-blur-sm">
        {!isGuestMode && userName && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 ring-2 ring-blue-200/50">
              {userPhotoURL ? (
                <img 
                  src={userPhotoURL} 
                  alt={userName} 
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-gray-900 truncate">{userName}</span>
              <span className="text-sm text-gray-600 capitalize">
                {currentUserRole || 'User'}
              </span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}