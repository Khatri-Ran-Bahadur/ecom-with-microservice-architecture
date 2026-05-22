"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    DollarSign,
    User, Package, MapPin, Edit3,
    ChevronRight, Bell, LogOut, Star,
    Clock, Settings, Loader2, CheckCircle2, Camera, Lock, Mail
} from "lucide-react";
import useUser from "apps/user-ui/src/hooks/useUser";
import axiosInstance from "@/utils/axiosInstance";
import StatCard from "../../shared/components/cards/statcard";
import Overview from "./_overview";
import Order from "./_order";
import Addresses from "./_addresses";

import Notifications from "./_notifications";
import ChangePassword from "./_change-password";
import MyReviews from "./_reviews";
import EditProfileModal from "./_edit-profile-modal";
import SettingsTab from "./_settings";

// ─── Types ─────────────────────────────────────────────────────────────────────

type NavItem = {
    key: string;
    label: string;
    icon: any;
    badge?: number;
};




// ─── Profile Page ───────────────────────────────────────────────────────────────

const ProfilePage = () => {
    const { user, isLoading } = useUser();
    const [activeNav, setActiveNav] = useState("overview");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [statsData, setStatsData] = useState({ totalOrders: 0, totalSpending: 0, totalReviews: 0 });
    const [unreadNotifs, setUnreadNotifs] = useState(0);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (!user) return;
        const fetchStatsAndNotifs = async () => {
            try {
                const [statsRes, notifsRes] = await Promise.all([
                    axiosInstance.get("/auth/api/user-stats"),
                    axiosInstance.get("/auth/api/user-notifications")
                ]);
                
                if (statsRes.data.success) {
                    setStatsData(statsRes.data.stats);
                }
                
                if (notifsRes.data.success) {
                    const unread = notifsRes.data.notifications.filter((n: any) => !n.isRead).length;
                    setUnreadNotifs(unread);
                }
            } catch (err) {
                console.error("Failed to fetch user data", err);
            }
        };
        fetchStatsAndNotifs();
    }, [user]);

    const navItems: NavItem[] = [
        { key: "overview", label: "Overview", icon: User },
        { key: "orders", label: "My Orders", icon: Package, badge: statsData.totalOrders > 0 ? statsData.totalOrders : undefined },
        { key: "reviews", label: "My Reviews", icon: Star },
        { key: "addresses", label: "Addresses", icon: MapPin },
        { key: "notifications", label: "Notifications", icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : undefined },
        { key: "change-password", label: "Change Password", icon: Lock },
        { key: "settings", label: "Settings", icon: Settings },
    ];

    const stats = [
        { title: "Total Orders", count: statsData.totalOrders, Icon: Package, color: "blue" as const },
        { title: "Total Spending", count: statsData.totalSpending, Icon: DollarSign, color: "green" as const, suffix: "$" },
        { title: "Total Reviews", count: statsData.totalReviews, Icon: Star, color: "yellow" as const },
    ];

    const displayName = isLoading ? null : (user?.name ?? "Guest");
    const initials = displayName
        ? displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
                <p className="text-slate-500 font-medium">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/80">

            {/* ── Hero banner ── */}
            <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
                {/* Geometric decoration */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <div className="absolute top-0 left-[10%] w-64 h-64 rounded-full bg-blue-400 blur-3xl" />
                    <div className="absolute bottom-0 right-[15%] w-72 h-72 rounded-full bg-violet-400 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-24 rounded-full bg-cyan-300 blur-2xl opacity-30" />
                </div>
                {/* Dot grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
                />
            </div>

            <div className="w-[94%] xl:w-[88%] mx-auto">

                {/* ── Profile identity row (overlapping banner) ── */}
                <div className="relative -mt-14 mb-8 flex flex-col sm:flex-row sm:items-end gap-5">

                    {/* Avatar */}
                    <div className="relative w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-blue-500 to-violet-600 shrink-0 group cursor-pointer">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={displayName ?? ""} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-2xl font-black text-white tracking-tight">{initials}</span>
                            </div>
                        )}
                        {/* Edit overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera size={18} className="text-white" />
                        </div>
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 pb-1 mt-16">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-[22px] font-black text-slate-900 tracking-tight leading-none">
                                {isLoading ? (
                                    <Loader2 size={20} className="inline animate-spin text-slate-400" />
                                ) : displayName}
                            </h1>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <CheckCircle2 size={10} className="fill-emerald-500 text-emerald-500" />
                                Verified
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            {user?.email && (
                                <span className="flex items-center gap-1 text-[12px] text-slate-500">
                                    <Mail size={11} className="text-slate-400" />
                                    {user.email}
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-[12px] text-slate-500">
                                <Clock size={11} className="text-slate-400" />
                                Member since Jan 2024
                            </span>
                        </div>
                    </div>

                    {/* Edit profile button */}
                    <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-[12px] font-bold rounded-xl hover:bg-slate-700 transition-colors shadow-sm shrink-0 self-start sm:self-auto mt-2 sm:mt-0">
                        <Edit3 size={13} />
                        Edit Profile
                    </button>
                </div>

                {/* ── Stats grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3.5 mb-8">
                    {stats.map((s) => (
                        <StatCard
                            key={s.title}
                            title={s.title}
                            count={s.count}
                            Icon={s.Icon}
                            color={s.color}
                            trend={(s as any).trend}
                            suffix={(s as any).suffix}
                        />
                    ))}
                </div>

                {/* ── Sidebar + Content layout ── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pb-14">

                    {/* ── Sidebar nav ── */}
                    <aside className="md:col-span-3">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-4">
                            {/* User mini-card at top */}
                            <div className="px-4 py-4 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
                                        <span className="text-[11px] font-black text-white">{initials}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-bold text-slate-800 truncate">
                                            {isLoading ? "…" : displayName}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium">Premium Member</p>
                                    </div>
                                </div>
                            </div>

                            {/* Nav items */}
                            <nav className="p-2">
                                {navItems.map((item) => {
                                    const isActive = activeNav === item.key;
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => setActiveNav(item.key)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group mb-0.5
                                                ${isActive
                                                    ? "bg-slate-900 text-white shadow-sm"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                }`}
                                        >
                                            <item.icon
                                                size={15}
                                                className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}
                                                strokeWidth={isActive ? 2.5 : 2}
                                            />
                                            <span className={`flex-1 text-[12px] font-${isActive ? "bold" : "semibold"} leading-none`}>
                                                {item.label}
                                            </span>
                                            {item.badge ? (
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none
                                                    ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                                                    {item.badge}
                                                </span>
                                            ) : (
                                                <ChevronRight size={11} className={isActive ? "text-white/50" : "text-slate-300 group-hover:text-slate-400"} />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* Sign out */}
                            <div className="p-2 border-t border-slate-100 mt-1">
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-rose-500 hover:bg-rose-50 transition-colors group">
                                    <LogOut size={15} className="text-rose-400 group-hover:text-rose-500" strokeWidth={2} />
                                    <span className="text-[12px] font-semibold">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* ── Main content area ── */}
                    <main className="md:col-span-9 space-y-5">
                        {activeNav === "overview" && <Overview user={user} />}
                        {activeNav === "orders" && <Order />}
                        {activeNav === "reviews" && <MyReviews />}
                        {activeNav === "addresses" && <Addresses />}
                        {activeNav === "notifications" && <Notifications />}
                        {activeNav === "change-password" && <ChangePassword />}
                        {activeNav === "settings" && <SettingsTab user={user} />}
                    </main>
                </div>
            </div>

            {/* Edit profile modal */}
            {user && isEditModalOpen && (
                <EditProfileModal
                    user={user}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ProfilePage;