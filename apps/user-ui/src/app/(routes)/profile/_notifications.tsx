import React, { useState, useEffect } from 'react'
import { Bell, AlertCircle, ShoppingBag, Clock } from 'lucide-react'
import axiosInstance from '@/utils/axiosInstance'

const Notifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axiosInstance.get("/auth/api/user-notifications");
                if (res.data.success) {
                    setNotifications(res.data.notifications);
                }
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-slate-500 font-medium">Loading notifications...</p>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Bell size={24} className="text-blue-300" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">You're all caught up!</h3>
                <p className="text-sm text-slate-500 max-w-sm">There are no new notifications for you at this time.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Bell size={16} className="text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-black text-slate-800 leading-tight">Notifications</h2>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Stay updated on your account activity</p>
                    </div>
                </div>
                <button className="text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    Mark all as read
                </button>
            </div>

            <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                    <div key={notif.id} className={`p-5 flex gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-blue-50/20'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.notificationType === 'order' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {notif.notificationType === 'order' ? <ShoppingBag size={18} /> : <AlertCircle size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`text-[14px] ${notif.isRead ? 'font-semibold' : 'font-black'} text-slate-800 mb-0.5`}>
                                {notif.title}
                            </h4>
                            <p className="text-[13px] text-slate-500 leading-relaxed">
                                {notif.description}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-slate-400">
                                <Clock size={12} />
                                <span>{new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                        {!notif.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Notifications