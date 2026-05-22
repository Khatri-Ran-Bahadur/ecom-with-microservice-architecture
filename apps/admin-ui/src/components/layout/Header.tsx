"use client";

import React from "react";
import { Menu, Bell, User } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { useAdmin } from "../../hooks/useAdmin";
import { useRouter } from "next/navigation";
import { useAdminTheme } from "../../context/AdminThemeContext";

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export function Header({ setMobileOpen }: HeaderProps) {
  const { data: admin } = useAdmin();
  const router = useRouter();
  const { accentClass } = useAdminTheme();

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">Dashboard</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <ThemeToggle />
        
        <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900"></span>
        </button>

        <div 
          onClick={() => router.push("/settings?tab=profile")}
          className={`flex items-center gap-2 pl-2 sm:pl-4 sm:border-l border-slate-200 dark:border-slate-800 cursor-pointer group hover:opacity-85 transition-all`}
        >
          {admin?.avatar?.url ? (
            <img 
              src={admin.avatar.url} 
              alt="Admin avatar" 
              className={`w-8 h-8 rounded-full object-cover shrink-0 border border-slate-300 dark:border-slate-700 group-hover:border-${accentClass.id}-500`}
            />
          ) : (
            <div className={`w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700 group-hover:border-${accentClass.id}-500`}>
              <User size={16} className="text-slate-500 dark:text-slate-400" />
            </div>
          )}
          <div className="hidden sm:block text-sm">
            <p className="font-semibold text-slate-700 dark:text-slate-200 leading-none group-hover:text-slate-950 dark:group-hover:text-white transition-colors">{admin?.name ?? "Admin"}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-none">{admin?.email ?? "admin@eshop.com"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
