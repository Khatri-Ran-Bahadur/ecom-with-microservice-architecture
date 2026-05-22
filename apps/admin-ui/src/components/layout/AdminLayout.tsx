"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAdminTheme } from "../../context/AdminThemeContext";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { layoutPreferences, accentClass, isLoading } = useAdminTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (layoutPreferences?.compactSidebar) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, [layoutPreferences?.compactSidebar]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300 overflow-hidden">
      {/* Dynamic Global Overrides & CSS Variables */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --accent-hex: ${accentClass.hex};
        }
        ${layoutPreferences?.reducedMotion ? '* { transition: none !important; animation: none !important; }' : ''}
        ${!layoutPreferences?.blurEffects ? '.backdrop-blur-xl { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; background-color: rgb(255 255 255 / 1) !important; } .dark .backdrop-blur-xl { background-color: rgb(15 23 42 / 1) !important; }' : ''}
      `}} />

      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

      <Sidebar 
        isExpanded={isExpanded} 
        toggleSidebar={toggleSidebar}
        isMobileOpen={isMobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <div 
        className={`relative z-10 flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
        ${isExpanded ? "lg:ml-64" : "lg:ml-20"}`}
      >
        <Header setMobileOpen={setMobileOpen} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
