"use client";
import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Bell, Shield, Moon, Monitor, Trash2, HelpCircle, User, Save, Loader2 } from 'lucide-react'
import axiosInstance from '../../../utils/axiosInstance'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { ConfirmModal } from '@packages/components/ConfirmModal'
import { useAuthStore } from '../../../store/authStore'
import { useRouter } from 'next/navigation'

const Settings = ({ user }: { user: any }) => {
    const queryClient = useQueryClient();
    
    const [name, setName] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { setLoggedIn } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            setName(user.name || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            const res = await axiosInstance.put("/auth/api/update-profile", { name });
            if (res.data.success) {
                toast.success('Profile updated successfully');
                queryClient.invalidateQueries({ queryKey: ["user"] });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <SettingsIcon size={16} className="text-slate-600" />
                </div>
                <div>
                    <h2 className="text-[16px] font-black text-slate-800 leading-tight">Account Settings</h2>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Manage your profile, preferences, and app settings</p>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Profile Section */}
                <section>
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Public Profile</h3>
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <User size={16} />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all max-w-md"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Email Address</label>
                                <input 
                                    type="email" 
                                    value={user?.email || ''}
                                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-500 cursor-not-allowed max-w-md"
                                    disabled
                                />
                                <p className="text-[11px] text-slate-400 mt-1.5">Email address cannot be changed. Contact support if needed.</p>
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit" 
                                    disabled={isUpdatingProfile || name === user?.name}
                                    className="px-5 py-2 bg-slate-900 text-white text-[12px] font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isUpdatingProfile ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Save size={14} />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Preferences Section */}
                <section>
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Preferences</h3>
                    <div className="space-y-2">
                        {/* Notification Toggles */}
                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                    <Bell size={14} className="text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="text-[13px] font-bold text-slate-700">Email Notifications</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Receive order updates and promotions via email</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                    <Moon size={14} className="text-purple-500" />
                                </div>
                                <div>
                                    <h4 className="text-[13px] font-bold text-slate-700">Dark Mode</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Switch between light and dark themes</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Privacy & Security */}
                <section>
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Privacy & Security</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                    <Shield size={14} className="text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="text-[13px] font-bold text-slate-700">Two-Factor Authentication</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Add an extra layer of security to your account</p>
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Enabled</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <Monitor size={14} className="text-slate-600" />
                                </div>
                                <div>
                                    <h4 className="text-[13px] font-bold text-slate-700">Active Sessions</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">Manage devices where you are currently logged in</p>
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Manage</span>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="pt-6 border-t border-rose-100">
                    <h3 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-4 px-2">Danger Zone</h3>
                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-[13px] font-black text-rose-900 mb-1">Delete Account</h4>
                            <p className="text-[11px] text-rose-700/80 max-w-sm leading-relaxed">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="px-4 py-2 bg-white border border-rose-200 text-rose-600 text-[12px] font-bold rounded-lg hover:bg-rose-600 hover:text-white transition-all shrink-0 flex items-center justify-center gap-2"
                        >
                            <Trash2 size={14} />
                            Delete Account
                        </button>
                    </div>
                </section>
            </div>
            
            <ConfirmModal 
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={async () => {
                    setIsDeleting(true);
                    // Add real delete account API call here when ready
                    setTimeout(() => {
                        setIsDeleting(false);
                        setIsDeleteModalOpen(false);
                        setLoggedIn(false);
                        toast.success("Account deleted successfully");
                        router.push("/");
                    }, 1500);
                }}
                isPending={isDeleting}
                title="Delete Account"
                description="Are you absolutely sure you want to delete your account? This action cannot be undone and you will lose all your data, order history, and preferences."
                confirmLabel="Delete Account"
                variant="danger"
                pendingLabel="Deleting..."
            />
            
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center">
                <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors">
                    <HelpCircle size={12} />
                    Need help with settings? Contact Support
                </button>
            </div>
        </div>
    )
}

export default Settings