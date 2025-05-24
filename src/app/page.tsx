
"use client";

import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateDiscoveryPage } from "@/components/pages/CandidateDiscoveryPage";
import { JobDiscoveryPage } from "@/components/pages/JobDiscoveryPage";
import { AiToolsPage } from "@/components/pages/AiToolsPage";
import { MatchesPage } from "@/components/pages/MatchesPage";
import { RoleSelectionPage } from "@/components/pages/RoleSelectionPage";
import { LoginPage } from "@/components/pages/LoginPage"; // Added
import type { UserRole } from "@/lib/types";
import { Users, Briefcase, Wand2, HeartHandshake, LayoutGrid, Loader2 } from 'lucide-react';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Added
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("findTalent"); 
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      const storedRoleValue = localStorage.getItem('userRole');
      if (storedRoleValue === 'recruiter' || storedRoleValue === 'jobseeker') {
        setUserRole(storedRoleValue);
        setActiveTab(storedRoleValue === 'recruiter' ? "findTalent" : "findJobs");
      } else {
        if (storedRoleValue !== null) {
          localStorage.removeItem('userRole');
        }
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null); // Ensure role is also cleared if not authenticated
    }
    setIsInitialLoading(false);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    // After login, user might still need to select a role
    const storedRoleValue = localStorage.getItem('userRole');
    if (storedRoleValue === 'recruiter' || storedRoleValue === 'jobseeker') {
        setUserRole(storedRoleValue);
        setActiveTab(storedRoleValue === 'recruiter' ? "findTalent" : "findJobs");
    } else {
        setUserRole(null);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    localStorage.setItem('userRole', role);
    setUserRole(role);
    setActiveTab(role === 'recruiter' ? "findTalent" : "findJobs");
  };

  // This useEffect ensures activeTab is correctly set if userRole changes (e.g. after selection or load)
  // Also ensures that if the activeTab is not relevant for the current role, it defaults to the primary tab for that role.
  useEffect(() => {
    if (userRole) {
      const defaultRoleTab = userRole === 'recruiter' ? "findTalent" : "findJobs";
      const commonTabs = ["aiTools", "myMatches"];
      if (activeTab !== defaultRoleTab && !commonTabs.includes(activeTab)) {
         setActiveTab(defaultRoleTab);
      } else if (userRole === 'recruiter' && activeTab === 'findJobs') {
         setActiveTab('findTalent');
      } else if (userRole === 'jobseeker' && activeTab === 'findTalent') {
         setActiveTab('findJobs');
      }
    }
  }, [userRole, activeTab]);


  const recruiterTabItems = [
    { value: "findTalent", label: "Find Talent", icon: Users, component: <CandidateDiscoveryPage /> },
    { value: "aiTools", label: "AI Tools", icon: Wand2, component: <AiToolsPage /> },
    { value: "myMatches", label: "My Matches", icon: HeartHandshake, component: <MatchesPage /> },
  ];

  const jobseekerTabItems = [
    { value: "findJobs", label: "Find Jobs", icon: Briefcase, component: <JobDiscoveryPage /> },
    { value: "aiTools", label: "AI Tools", icon: Wand2, component: <AiToolsPage /> },
    { value: "myMatches", label: "My Matches", icon: HeartHandshake, component: <MatchesPage /> },
  ];
  
  const currentTabItems = userRole === 'recruiter' ? recruiterTabItems : jobseekerTabItems;


  if (isInitialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
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
            <MobileNavMenu activeTab={activeTab} setActiveTab={setActiveTab} tabItems={currentTabItems} />
          ) : (
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 h-auto sm:h-12 rounded-lg shadow-sm bg-card border p-1">
              {currentTabItems.map(item => (
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

          {currentTabItems.map(item => (
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

