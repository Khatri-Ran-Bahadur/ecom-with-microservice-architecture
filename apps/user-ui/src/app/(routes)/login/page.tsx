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
            const res = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/login-user`, data, { withCredentials: true })
            return res.data
        },
        onSuccess: () => {
            setServerError(null);
            router.push("/")
        },
        onError: (error: AxiosError) => {
            setServerError((error.response?.data as { message?: string })?.message || "Invalid credential!")
        }
    })

    const onSubmit = async (data: FormData) => {
        loginMutation.mutate(data);
    }

    return (
        <div className="w-full bg-[#F5F4F0] flex items-center justify-center px-4 py-8"
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

                {/* Social buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 h-11 rounded-xl border border-black/10 bg-white hover:bg-[#F5F4F0] transition-colors text-sm font-medium text-black"
                    >
                        {/* Google icon */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button
                        type="button"
                        className="flex items-center justify-center gap-2 h-11 rounded-xl border border-black/10 bg-white hover:bg-[#F5F4F0] transition-colors text-sm font-medium text-black"
                    >
                        {/* GitHub icon */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        GitHub
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-black/[0.08]" />
                    <span className="text-xs text-[#aaa]">or continue with email</span>
                    <div className="flex-1 h-px bg-black/[0.08]" />
                </div>

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