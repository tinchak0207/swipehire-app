
"use client";

import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateDiscoveryPage } from "@/components/pages/CandidateDiscoveryPage";
import { JobDiscoveryPage } from "@/components/pages/JobDiscoveryPage";
import { AiToolsPage } from "@/components/pages/AiToolsPage";
import { MatchesPage } from "@/components/pages/MatchesPage";
import { RoleSelectionPage } from "@/components/pages/RoleSelectionPage";
import type { UserRole } from "@/lib/types";
import { Users, Briefcase, Wand2, HeartHandshake, LayoutGrid, Loader2 } from 'lucide-react';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("findTalent"); // Default, will be updated
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const storedRoleValue = localStorage.getItem('userRole');
    // Explicitly check for valid roles
    if (storedRoleValue === 'recruiter' || storedRoleValue === 'jobseeker') {
      setUserRole(storedRoleValue);
      setActiveTab(storedRoleValue === 'recruiter' ? "findTalent" : "findJobs");
    } else {
      // If no valid role is stored (null, undefined, or invalid string),
      // ensure userRole is null to show RoleSelectionPage.
      // Also, clear any invalid entry from localStorage.
      if (storedRoleValue !== null) { // Only remove if there was an invalid item that's not 'null' literal
        localStorage.removeItem('userRole');
      }
      setUserRole(null); 
      // activeTab will be set by handleRoleSelect or the other useEffect based on userRole
    }
    setIsInitialLoading(false);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    localStorage.setItem('userRole', role);
    setUserRole(role);
    setActiveTab(role === 'recruiter' ? "findTalent" : "findJobs");
  };

  useEffect(() => {
    // This ensures activeTab is correctly set if userRole changes (e.g. after selection or load)
    if (userRole) {
      setActiveTab(userRole === 'recruiter' ? "findTalent" : "findJobs");
    }
    // If userRole is null, activeTab might remain its default or what it was, 
    // but it won't matter as tabs aren't shown.
  }, [userRole]);


  const tabItems = [
    { value: "findTalent", label: "Find Talent", icon: Users, component: <CandidateDiscoveryPage /> },
    { value: "findJobs", label: "Find Jobs", icon: Briefcase, component: <JobDiscoveryPage /> },
    { value: "aiTools", label: "AI Tools", icon: Wand2, component: <AiToolsPage /> },
    { value: "myMatches", label: "My Matches", icon: HeartHandshake, component: <MatchesPage /> },
  ];

  if (isInitialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!userRole) {
    return <RoleSelectionPage onRoleSelect={handleRoleSelect} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {isMobile ? (
            <MobileNavMenu activeTab={activeTab} setActiveTab={setActiveTab} tabItems={tabItems} />
          ) : (
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 h-auto sm:h-12 rounded-lg shadow-sm bg-card border p-1">
              {tabItems.map(item => (
                <TabsTrigger 
                  key={item.value} 
                  value={item.value} 
                  className="py-2.5 sm:py-2 text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-md transition-all duration-200 ease-in-out"
                >
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 opacity-80" />
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          {tabItems.map(item => (
            <TabsContent key={item.value} value={item.value} className="mt-0 rounded-lg">
              {item.component}
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} SwipeHire. All rights reserved.
      </footer>
    </div>
  );
}


interface MobileNavMenuProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  tabItems: { value: string; label: string; icon: React.ElementType; component: JSX.Element }[];
}

function MobileNavMenu({ activeTab, setActiveTab, tabItems }: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ActiveIcon = tabItems.find(item => item.value === activeTab)?.icon || LayoutGrid;
  const activeLabel = tabItems.find(item => item.value === activeTab)?.label || "Menu";

  return (
    <div className="sm:hidden mb-4 px-2">
      <Button 
        onClick={() => setIsOpen(!isOpen)} 
        variant="outline" 
        className="w-full justify-between text-lg py-3 bg-card shadow"
      >
        <div className="flex items-center">
          <ActiveIcon className="w-5 h-5 mr-2" />
          {activeLabel}
        </div>
        <LayoutGrid className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </Button>
      {isOpen && (
        <div className="grid grid-cols-2 gap-2 mt-2 bg-card p-2 rounded-md shadow-lg border">
          {tabItems.map(item => (
            <Button
              key={item.value}
              variant={activeTab === item.value ? "default" : "ghost"}
              onClick={() => {
                setActiveTab(item.value);
                setIsOpen(false);
              }}
              className="flex items-center justify-start text-left h-12 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <item.icon className="w-5 h-5 mr-2 opacity-80" />
              {item.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
