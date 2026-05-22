import React, { useState, useEffect } from 'react'
import { Star, MessageSquare, ThumbsUp, MoreHorizontal } from 'lucide-react'
import axiosInstance from '@/utils/axiosInstance'

const MyReviews = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axiosInstance.get("/auth/api/user-reviews");
                if (res.data.success) {
                    setReviews(res.data.reviews);
                }
            } catch (err) {
                console.error("Failed to fetch reviews", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className={i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"} />
        ));
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-slate-500 font-medium">Loading your reviews...</p>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare size={24} className="text-amber-300" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">No reviews written yet</h3>
                <p className="text-sm text-slate-500 max-w-sm">Share your experiences and help other shoppers make informed decisions.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                </div>
                <div>
                    <h2 className="text-[16px] font-black text-slate-800 leading-tight">My Reviews</h2>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Manage the reviews you've written</p>
                </div>
            </div>

            <div className="divide-y divide-slate-100">
                {reviews.map((review) => (
                    <div key={review.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                        <div className="flex flex-col sm:flex-row gap-5">
                            
                            {/* Review Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1">
                                        {renderStars(review.rating)}
                                        <span className="ml-2 text-[12px] font-bold text-slate-700">{review.rating}.0</span>
                                    </div>
                                    <button className="text-slate-400 hover:text-slate-700 transition-colors p-1">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                                
                                <h3 className="text-[14px] font-black text-slate-800 mb-1">
                                    Review for: {review.shop?.name || "A shop"}
                                </h3>
                                <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
                                    {review.reviews || "No written review provided."}
                                </p>
                                
                                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                                    <span>{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-blue-500 transition-colors">
                                        <ThumbsUp size={12} />
                                        <span>Helpful (0)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MyReviews