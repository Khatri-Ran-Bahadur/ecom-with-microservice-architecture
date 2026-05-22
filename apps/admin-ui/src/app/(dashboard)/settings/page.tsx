"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { useAdmin } from "../../../hooks/useAdmin";
import { useAdminTheme } from "../../../context/AdminThemeContext";
import {
  Settings,
  Palette,
  Save,
  Mail,
  Phone,
  Globe,
  Clock,
  DollarSign,
  Bell,
  Sun,
  Moon,
  Monitor,
  User,
  Lock,
  Loader2,
  Users
} from "lucide-react";

const tabs = [
  { id: "general", label: "General", icon: Settings },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "profile", label: "Profile & Security", icon: User }
];

function SettingsContent() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const { data: admin } = useAdmin();
  const { accentClass, refetchConfig } = useAdminTheme();
  const hydratedRef = useRef(false);

  const [activeTab, setActiveTab] = useState("general");
  const [themeMode, setThemeMode] = useState("system");
  const [accentColor, setAccentColor] = useState("blue");
  
  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    userRegistrations: false,
    weeklyReports: true,
  });

  const [layoutPreferences, setLayoutPreferences] = useState({
    compactSidebar: false,
    stickyHeader: true,
    blurEffects: true,
    reducedMotion: false,
  });

  const [storeInfo, setStoreInfo] = useState({
    name: "eShop Admin",
    url: "https://eshop.com",
    email: "admin@eshop.com",
    phone: "+1 (555) 000-1234",
    description: "Your one-stop online store for all your needs.",
    timezone: "UTC-05:00 Eastern Time",
    currency: "USD",
    language: "English (US)",
    dateFormat: "MM/DD/YYYY",
  });

  // Admin Profile form states
  const [adminName, setAdminName] = useState("");
  const [adminAvatarUrl, setAdminAvatarUrl] = useState("");
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: config, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["siteConfig"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/settings/site-config");
      return res.data?.config;
    },
  });

  // Handle URL query parameter ?tab=
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!config || hydratedRef.current) return;
    hydratedRef.current = true;

    setStoreInfo((prev) => ({
      ...prev,
      name: config.storeName ?? prev.name,
      url: config.storeUrl ?? prev.url,
      email: config.supportEmail ?? prev.email,
      phone: config.supportPhone ?? prev.phone,
      description: config.description ?? prev.description,
      timezone: config.timezone ?? prev.timezone,
      currency: config.currency ?? prev.currency,
      language: config.language ?? prev.language,
      dateFormat: config.dateFormat ?? prev.dateFormat,
    }));
    setThemeMode(config.themeMode ?? "system");
    setAccentColor(config.accentColor ?? "blue");
    setNotifications((prev) => ({
      ...prev,
      ...(config.adminNotifications ?? {}),
    }));
    setLayoutPreferences((prev) => ({
      ...prev,
      ...(config.layoutPreferences ?? {}),
    }));
  }, [config]);

  // Sync profile details when admin data loads
  useEffect(() => {
    if (admin) {
      setAdminName(admin.name || "");
      setAdminAvatarUrl(admin.avatar?.url || "");
    }
  }, [admin]);

  const { mutateAsync: saveConfig, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      return axiosInstance.put("/admin/api/settings/site-config", {
        storeName: storeInfo.name,
        storeUrl: storeInfo.url,
        supportEmail: storeInfo.email,
        supportPhone: storeInfo.phone,
        description: storeInfo.description,
        timezone: storeInfo.timezone,
        currency: storeInfo.currency,
        language: storeInfo.language,
        dateFormat: storeInfo.dateFormat,
        themeMode,
        accentColor,
        adminNotifications: notifications,
        layoutPreferences,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["siteConfig"] });
      await refetchConfig();
    },
  });

  const handleSaveSettings = async () => {
    try {
      await saveConfig();
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save settings");
    }
  };

  const { mutateAsync: updateProfile, isPending: isSavingProfile } = useMutation({
    mutationFn: async () => {
      return axiosInstance.put("/admin/api/settings/profile", {
        name: adminName,
        avatar: { url: adminAvatarUrl },
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin"] });
    }
  });

  const handleSaveProfile = async () => {
    try {
      if (!adminName.trim()) {
        return toast.error("Name is required");
      }
      await updateProfile();
      toast.success("Profile details updated successfully");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to update profile");
    }
  };

  const { mutateAsync: changePassword, isPending: isChangingPassword } = useMutation({
    mutationFn: async () => {
      return axiosInstance.put("/admin/api/settings/password", {
        currentPassword,
        newPassword,
      });
    }
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("All password fields are required");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("Confirm password does not match new password");
    }
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters long");
    }

    try {
      await changePassword();
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to change password");
    }
  };

  const accentColors = [
    { id: "blue", class: "bg-gradient-to-br from-blue-600 to-indigo-600" },
    { id: "emerald", class: "bg-gradient-to-br from-emerald-500 to-teal-500" },
    { id: "rose", class: "bg-gradient-to-br from-rose-500 to-pink-500" },
    { id: "violet", class: "bg-gradient-to-br from-violet-600 to-purple-600" },
    { id: "amber", class: "bg-gradient-to-br from-amber-500 to-orange-500" },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Settings
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Manage your store preferences and account configuration.
          </p>
        </div>
        {activeTab !== "profile" && (
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 bg-gradient-to-r ${accentClass.fromTo} text-white ${accentClass.shadow} hover:-translate-y-0.5 disabled:opacity-60`}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving…" : "Save Changes"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? `bg-white dark:bg-slate-800 ${accentClass.text} shadow-sm`
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── GENERAL TAB ── */}
      {activeTab === "general" && (
        <div className="space-y-6">
          {/* Store Information */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Store Information</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Basic details shown to customers across your storefront.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Store Name</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={storeInfo.name}
                    onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Store URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={storeInfo.url}
                    onChange={(e) => setStoreInfo({ ...storeInfo, url: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Support Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={storeInfo.email}
                    onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={storeInfo.phone}
                    onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Description</label>
                <textarea
                  value={storeInfo.description}
                  onChange={(e) => setStoreInfo({ ...storeInfo, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Regional Settings</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Configure your timezone, currency, and localization.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Timezone", icon: Clock, key: "timezone", options: ["UTC-05:00 Eastern Time", "UTC+00:00 London", "UTC+05:45 Kathmandu", "UTC+08:00 Singapore"] },
                { label: "Currency", icon: DollarSign, key: "currency", options: ["USD — US Dollar", "EUR — Euro", "GBP — British Pound", "NPR — Nepali Rupee"] },
                { label: "Language", icon: Globe, key: "language", options: ["English (US)", "English (UK)", "Nepali"] },
                { label: "Date Format", icon: Clock, key: "dateFormat", options: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"] },
              ].map(({ label, icon: Icon, key, options }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={storeInfo[key as keyof typeof storeInfo]}
                      onChange={(e) => setStoreInfo({ ...storeInfo, [key]: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      {options.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Notifications</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Choose which events trigger admin notifications.</p>
            <div className="space-y-0 divide-y divide-slate-200/50 dark:divide-slate-800/50">
              {[
                { key: "newOrders", label: "New Orders", desc: "Get notified when a new order is placed", icon: Bell },
                { key: "lowStock", label: "Low Stock Alerts", desc: "Alert when product inventory falls below threshold", icon: Bell },
                { key: "userRegistrations", label: "User Registrations", desc: "Notify when a new user signs up", icon: Users },
                { key: "weeklyReports", label: "Weekly Reports", desc: "Receive a weekly summary every Monday morning", icon: Bell },
              ].map(({ key, label, desc, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                      notifications[key as keyof typeof notifications]
                        ? `bg-gradient-to-r ${accentClass.fromTo}`
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                        notifications[key as keyof typeof notifications] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 bg-gradient-to-r ${accentClass.fromTo} text-white ${accentClass.shadow} hover:-translate-y-0.5 disabled:opacity-60`}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving Settings…" : "Save Settings"}
            </button>
          </div>
        </div>
      )}

      {/* ── APPEARANCE TAB ── */}
      {activeTab === "appearance" && (
        <div className="space-y-6">
          {/* Theme Mode */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Theme Mode</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Choose how the dashboard looks for all admin users.</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "light", label: "Light", icon: Sun, preview: "bg-white border-slate-200" },
                { id: "dark", label: "Dark", icon: Moon, preview: "bg-slate-900 border-slate-700" },
                { id: "system", label: "System", icon: Monitor, preview: "bg-gradient-to-br from-white to-slate-900 border-slate-400" },
              ].map(({ id, label, icon: Icon, preview }) => (
                <button
                  key={id}
                  onClick={() => setThemeMode(id)}
                  className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                    themeMode === id
                      ? `border-blue-500 bg-blue-50/50 dark:bg-blue-400/10`
                      : "border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                  style={{ borderColor: themeMode === id ? accentClass.hex : undefined }}
                >
                  <div className={`w-full h-16 rounded-xl border ${preview}`} />
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${themeMode === id ? accentClass.text : "text-slate-400"}`} />
                    <span className={`text-sm font-semibold ${themeMode === id ? accentClass.text : "text-slate-600 dark:text-slate-400"}`}>{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Accent Color</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Pick a primary color for buttons, links, and highlights.</p>
            <div className="flex items-center gap-4">
              {accentColors.map(({ id, class: cls }) => (
                <button
                  key={id}
                  onClick={() => setAccentColor(id)}
                  className={`w-10 h-10 rounded-xl ${cls} transition-all duration-200 ${
                    accentColor === id
                      ? `ring-2 ring-offset-2 scale-110`
                      : "hover:scale-105"
                  }`}
                  style={{
                    outlineColor: accentColor === id ? accentClass.hex : undefined,
                    boxShadow: accentColor === id ? `0 0 0 2px ${accentClass.hex}` : undefined
                  }}
                />
              ))}
            </div>
          </div>

          {/* Sidebar & Layout */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Layout Preferences</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Customize the admin dashboard layout and sidebar behavior.</p>
            <div className="space-y-0 divide-y divide-slate-200/50 dark:divide-slate-800/50">
              {[
                { key: "compactSidebar", label: "Compact Sidebar", desc: "Show only icons in the sidebar by default" },
                { key: "stickyHeader", label: "Sticky Header", desc: "Keep the top navigation bar fixed while scrolling" },
                { key: "blurEffects", label: "Blur Effects", desc: "Enable glassmorphism and backdrop blur across panels" },
                { key: "reducedMotion", label: "Reduced Motion", desc: "Minimize animations and transitions throughout the UI" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                  </div>
                  <button
                    onClick={() => setLayoutPreferences({ ...layoutPreferences, [key]: !layoutPreferences[key as keyof typeof layoutPreferences] })}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                      layoutPreferences[key as keyof typeof layoutPreferences]
                        ? `bg-gradient-to-r ${accentClass.fromTo}`
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                        layoutPreferences[key as keyof typeof layoutPreferences] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 bg-gradient-to-r ${accentClass.fromTo} text-white ${accentClass.shadow} hover:-translate-y-0.5 disabled:opacity-60`}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving Settings…" : "Save Settings"}
            </button>
          </div>
        </div>
      )}

      {/* ── PROFILE & SECURITY TAB ── */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Edit Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Personal Details</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Manage your administrator details and digital identity.</p>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
                  {adminAvatarUrl ? (
                    <img src={adminAvatarUrl} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover border-2" style={{ borderColor: accentClass.hex }} />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Avatar Image</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Specify an absolute link to your user profile picture.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Admin Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Admin Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={admin?.email || ""}
                        disabled
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Avatar URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/avatar.jpg"
                      value={adminAvatarUrl}
                      onChange={(e) => setAdminAvatarUrl(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 bg-gradient-to-r ${accentClass.fromTo} text-white ${accentClass.shadow} hover:-translate-y-0.5 disabled:opacity-60`}
                  >
                    {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSavingProfile ? "Saving Details…" : "Save Details"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Panel */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Security & Password</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Regularly update your credentials to safeguard systems.</p>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 bg-gradient-to-r ${accentClass.fromTo} text-white ${accentClass.shadow} hover:-translate-y-0.5 disabled:opacity-60`}
                >
                  {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isChangingPassword ? "Updating Password…" : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[500px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}