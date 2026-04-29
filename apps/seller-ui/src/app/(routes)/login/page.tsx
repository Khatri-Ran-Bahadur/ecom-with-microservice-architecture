"use client"
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'

type FormData = {
    email: string
    password: string
}

const Login = () => {
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const [rememberMe, setRememberMe] = useState<boolean>(false)

    const router = useRouter()
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

    const loginMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/login-seller`, data, { withCredentials: true })
            return res.data
        },
        onSuccess: () => {
            setServerError(null);
            router.push("/seller/dashboard")
        },
        onError: (error: AxiosError) => {
            setServerError((error.response?.data as { message?: string })?.message || "Invalid credential!")
        }
    })

    const onSubmit = async (data: FormData) => {
        loginMutation.mutate(data);
    }

    return (
        <div className="w-full bg-[#F5F4F0] min-h-screen  flex items-center justify-center px-4 py-8"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <div className="w-full max-w-[440px] bg-white rounded-2xl border border-black/[0.07] p-10 shadow-sm">

                {/* Brand dot + label */}
                <div className="flex items-center gap-2 mb-5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#378ADD] inline-block" />
                    <span className="text-xs font-medium text-[#888] tracking-widest uppercase">Welcome back</span>
                </div>

                {/* Heading */}
                <h1 className="text-[28px] text-black leading-tight mb-1"
                    style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
                    Sign in to your account
                </h1>
                <p className="text-sm text-[#888] mb-8">Enter your details to continue</p>

                {/* Server error */}
                {serverError && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">
                            Email address
                        </label>
                        <input
                            type="text"
                            id="email"
                            placeholder="you@example.com"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Enter a valid email address"
                                }
                            })}
                            className={`w-full h-11 px-4 rounded-xl border text-sm text-black placeholder:text-[#bbb] bg-[#FAFAFA] outline-none transition-all
                                focus:border-[#378ADD] focus:ring-2 focus:ring-[#378ADD]/10 focus:bg-white
                                ${errors.email ? "border-red-400 bg-red-50/30" : "border-black/10"}`}
                        />
                        {errors.email && (
                            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                    <circle cx="6" cy="6" r="5.5" stroke="#ef4444" />
                                    <path d="M6 3.5v3M6 8v.5" stroke="#ef4444" strokeLinecap="round" />
                                </svg>
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={passwordVisible ? "text" : "password"}
                                id="password"
                                placeholder="Enter your password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                                className={`w-full h-11 pl-4 pr-11 rounded-xl border text-sm text-black placeholder:text-[#bbb] bg-[#FAFAFA] outline-none transition-all
                                    focus:border-[#378ADD] focus:ring-2 focus:ring-[#378ADD]/10 focus:bg-white
                                    ${errors.password ? "border-red-400 bg-red-50/30" : "border-black/10"}`}
                            />
                            {/* Eye toggle button — fixed with lucide-react */}
                            <button
                                type="button"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555] transition-colors p-0.5"
                                aria-label={passwordVisible ? "Hide password" : "Show password"}
                            >
                                {passwordVisible
                                    ? <EyeOff size={17} strokeWidth={1.75} />
                                    : <Eye size={17} strokeWidth={1.75} />
                                }
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                    <circle cx="6" cy="6" r="5.5" stroke="#ef4444" />
                                    <path d="M6 3.5v3M6 8v.5" stroke="#ef4444" strokeLinecap="round" />
                                </svg>
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Remember me + Forgot */}
                    <div className="flex items-center justify-between pt-0.5">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-[#666]">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded accent-[#378ADD] cursor-pointer"
                            />
                            Remember me
                        </label>
                        <button
                            type="button"
                            onClick={() => router.push('/forgot-password')}
                            className="text-sm text-[#378ADD] hover:text-[#185FA5] transition-colors font-medium"
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full h-11 mt-2 rounded-xl bg-[#378ADD] hover:bg-[#185FA5] active:scale-[0.985] text-white text-sm font-medium tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loginMutation.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.25" strokeWidth="3" />
                                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                Signing in...
                            </span>
                        ) : "Sign in"}
                    </button>

                </form>

                {/* Sign up link */}
                <p className="text-center text-sm text-[#999] mt-6">
                    Don&apos;t have an account?{" "}
                    <button
                        type="button"
                        onClick={() => router.push('/signup')}
                        className="text-[#378ADD] hover:text-[#185FA5] font-medium transition-colors"
                    >
                        Create one
                    </button>
                </p>

            </div>
        </div>
    )
}

export default Login