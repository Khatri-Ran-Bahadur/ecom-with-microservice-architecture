"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useTheme } from "next-themes";

export interface LayoutPreferences {
  compactSidebar?: boolean;
  stickyHeader?: boolean;
  blurEffects?: boolean;
  reducedMotion?: boolean;
}

export interface AccentStyle {
  id: string;
  bg: string;
  text: string;
  hoverText: string;
  hoverBg: string;
  activeBg: string;
  ring: string;
  border: string;
  fromTo: string;
  shadow: string;
  hex: string;
}

interface AdminThemeContextType {
  themeMode: string;
  accentColor: string;
  layoutPreferences: LayoutPreferences;
  accentClass: AccentStyle;
  isLoading: boolean;
  refetchConfig: () => Promise<any>;
}

const accentStylesMap: Record<string, AccentStyle> = {
  blue: {
    id: "blue",
    bg: "bg-blue-600",
    text: "text-blue-600 dark:text-blue-400",
    hoverText: "hover:text-blue-600 dark:hover:text-blue-400",
    hoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-900/20",
    activeBg: "bg-blue-50 dark:bg-blue-900/30",
    ring: "ring-blue-500/50 focus:ring-blue-500",
    border: "border-blue-500",
    fromTo: "from-blue-600 to-indigo-600",
    shadow: "shadow-blue-500/20 shadow-lg",
    hex: "#2563eb",
  },
  emerald: {
    id: "emerald",
    bg: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    hoverText: "hover:text-emerald-600 dark:hover:text-emerald-400",
    hoverBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20",
    activeBg: "bg-emerald-50 dark:bg-emerald-900/30",
    ring: "ring-emerald-500/50 focus:ring-emerald-500",
    border: "border-emerald-500",
    fromTo: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20 shadow-lg",
    hex: "#10b981",
  },
  rose: {
    id: "rose",
    bg: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    hoverText: "hover:text-rose-600 dark:hover:text-rose-400",
    hoverBg: "hover:bg-rose-50/50 dark:hover:bg-rose-900/20",
    activeBg: "bg-rose-50 dark:bg-rose-900/30",
    ring: "ring-rose-500/50 focus:ring-rose-500",
    border: "border-rose-500",
    fromTo: "from-rose-500 to-pink-500",
    shadow: "shadow-rose-500/20 shadow-lg",
    hex: "#f43f5e",
  },
  violet: {
    id: "violet",
    bg: "bg-violet-600",
    text: "text-violet-600 dark:text-violet-400",
    hoverText: "hover:text-violet-600 dark:hover:text-violet-400",
    hoverBg: "hover:bg-violet-50/50 dark:hover:bg-violet-900/20",
    activeBg: "bg-violet-50 dark:bg-violet-900/30",
    ring: "ring-violet-500/50 focus:ring-violet-500",
    border: "border-violet-500",
    fromTo: "from-violet-600 to-purple-600",
    shadow: "shadow-violet-500/20 shadow-lg",
    hex: "#7c3aed",
  },
  amber: {
    id: "amber",
    bg: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    hoverText: "hover:text-amber-600 dark:hover:text-amber-400",
    hoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-900/20",
    activeBg: "bg-amber-50 dark:bg-amber-900/30",
    ring: "ring-amber-500/50 focus:ring-amber-500",
    border: "border-amber-500",
    fromTo: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20 shadow-lg",
    hex: "#f59e0b",
  },
};

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();

  const { data: config, isLoading, refetch } = useQuery({
    queryKey: ["siteConfig"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/settings/site-config");
      return res.data?.config;
    },
  });

  const themeMode = config?.themeMode ?? "system";
  const accentColor = config?.accentColor ?? "blue";
  const layoutPreferences: LayoutPreferences = config?.layoutPreferences ?? {
    compactSidebar: false,
    stickyHeader: true,
    blurEffects: true,
    reducedMotion: false,
  };

  const accentClass = accentStylesMap[accentColor] || accentStylesMap.blue;

  useEffect(() => {
    if (config?.themeMode) {
      setTheme(config.themeMode);
    }
  }, [config?.themeMode, setTheme]);

  return (
    <AdminThemeContext.Provider
      value={{
        themeMode,
        accentColor,
        layoutPreferences,
        accentClass,
        isLoading,
        refetchConfig: refetch,
      }}
    >
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  }
  return context;
}
