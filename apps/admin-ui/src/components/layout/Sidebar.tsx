"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Package,
  Wallet,
  PartyPopper,
  Logs,
  Bell
} from "lucide-react";

import { useAdminTheme } from "../../context/AdminThemeContext";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface SidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ isExpanded, toggleSidebar, isMobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accentClass } = useAdminTheme();

  const handleLogout = async () => {
    try {
      // auth-service doesn't currently expose an explicit logout route in this repo;
      // clearing cookies is handled on the backend per service. For now we just reset local state and redirect.
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Orders", href: "/orders", icon: ShoppingBag },
    { name: "Payments", href: "/payments", icon: Wallet },
    { name: "Categories", href: "/categories", icon: Package },
    { name: "Products", href: "/products", icon: Package },
    { name: "Events", href: "/events", icon: PartyPopper },
    { name: "Users", href: "/users", icon: Users },
    { name: "Sellers", href: "/sellers", icon: Users },
    { name: "Loggers", href: "/loggers", icon: Logs },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Notifications", href: "/notifications", icon: Bell },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-r border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isExpanded ? "w-64" : "w-20"}`}
      >
        {/* Header/Logo area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/50 dark:border-slate-800/50 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accentClass.fromTo} flex items-center justify-center shrink-0 shadow-lg ${accentClass.shadow}`}>
              <span className="text-white font-bold text-lg">E</span>
            </div>
            {isExpanded && (
              <span className="font-bold text-lg text-slate-800 dark:text-white whitespace-nowrap">
                Admin Panel
              </span>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0"
          >
            {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.slice(0, pathname.length) === item.href;
            const isTabActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group relative
                  ${isTabActive
                    ? `${accentClass.activeBg} ${accentClass.text} font-semibold shadow-sm`
                    : `text-slate-600 dark:text-slate-400 ${accentClass.hoverBg} hover:text-slate-900 dark:hover:text-white`
                  }
                `}
                title={!isExpanded ? item.name : undefined}
              >
                <item.icon size={20} className="shrink-0" />
                {isExpanded && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50 shrink-0">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-rose-50/80 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors w-full group`}
            title={!isExpanded ? "Logout" : undefined}
          >
            <LogOut size={20} className="shrink-0" />
            {isExpanded && <span className="whitespace-nowrap">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
