"use client"
import React from 'react'
import { Menu, Bell, Search } from 'lucide-react'
import useSeller from "@/hooks/useSeller"

type HeaderProps = {
    setSidebarOpen: (open: boolean) => void
}

const Header = ({ setSidebarOpen }: HeaderProps) => {
    const { seller, isLoading } = useSeller()

    return (
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-7 h-[60px] bg-white/80 backdrop-blur-md border-b border-black/[0.06]">

            {/* Mobile hamburger */}
            <button
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
            >
                <Menu size={19} />
            </button>

            {/* Search bar */}
            <div className="flex-1 max-w-sm hidden sm:flex items-center gap-2 h-9 px-3.5 rounded-xl bg-gray-100 border border-transparent focus-within:bg-white focus-within:border-[#378ADD]/30 transition-all">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search orders, products…"
                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
                />
            </div>

            <div className="ml-auto flex items-center gap-2">
                {/* Notifications */}
                <button className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
                </button>

                {/* Avatar */}
                <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#378ADD] to-[#185FA5] flex items-center justify-center text-white text-xs font-semibold uppercase">
                        {isLoading ? "..." : seller?.name ? seller.name.substring(0, 2) : "S"}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                        {isLoading ? "Loading..." : seller?.name || "Seller"}
                    </span>
                </button>
            </div>
        </header>
    )
}

export default Header
