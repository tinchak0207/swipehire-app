"use client";

import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandidateDiscoveryPage } from "@/components/pages/CandidateDiscoveryPage";
import { JobDiscoveryPage } from "@/components/pages/JobDiscoveryPage";
import { AiToolsPage } from "@/components/pages/AiToolsPage";
import { MatchesPage } from "@/components/pages/MatchesPage";
import { Users, Briefcase, Wand2, HeartHandshake, LayoutGrid } from 'lucide-react';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("findTalent");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tabItems = [
    { value: "findTalent", label: "Find Talent", icon: Users, component: <CandidateDiscoveryPage /> },
    { value: "findJobs", label: "Find Jobs", icon: Briefcase, component: <JobDiscoveryPage /> },
    { value: "aiTools", label: "AI Tools", icon: Wand2, component: <AiToolsPage /> },
    { value: "myMatches", label: "My Matches", icon: HeartHandshake, component: <MatchesPage /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-0 sm:px-4 py-4">
        <Tabs defaultValue="findTalent" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            <TabsContent key={item.value} value={item.value} className="mt-0 rounded-lg ">
              {/* Removed Card wrapper here as pages might have their own layout */}
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
