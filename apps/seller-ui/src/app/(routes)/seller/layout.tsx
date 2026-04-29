"use client"
import React, { useState } from 'react'
import Sidebar from '../../shared/components/sidebar'
import Header from '../../shared/components/header'
import { Toaster } from "react-hot-toast";




const Layout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-[#F5F6FA]">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main area */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* ── Top navbar ── */}
                <Header setSidebarOpen={setSidebarOpen} />

                {/* ── Page content ── */}
                <main className="flex-1 overflow-auto p-4 lg:p-7">
                    <Toaster position="top-right" />
                    {children}

                </main>

            </div>
        </div>
    )
}

export default Layout