"use client"
import { useRouter } from 'next/navigation'
import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'

type EmailForm = { email: string }
type ResetForm = { password: string; confirmPassword: string }

const ForgotPassword = () => {
    const router = useRouter()

    const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email')
    const [userEmail, setUserEmail] = useState<string>('')
    const [otp, setOtp] = useState(['', '', '', ''])
    const [canResend, setCanResend] = useState<boolean>(false)
    const [timer, setTimer] = useState<number>(60)
    const [serverError, setServerError] = useState<string | null>(null)
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [confirmVisible, setConfirmVisible] = useState(false)

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // ── Forms ──
    const emailForm = useForm<EmailForm>()
    const resetForm = useForm<ResetForm>()
    const newPassword = resetForm.watch('password')

    // ── Countdown ──
    const startResendTimer = () => {
        setCanResend(false)
        setTimer(60)
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!)
                    setCanResend(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    // ── Step 1: Request OTP ──
    const requestOtpMutation = useMutation({
        mutationFn: async ({ email }: { email: string }) => {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/forgot-password-user`,
                { email },
                { withCredentials: true }
            )
            return res.data
        },
        onSuccess: (_, { email }) => {
            setUserEmail(email)
            setServerError(null)
            setOtp(['', '', '', ''])
            startResendTimer()
            setStep('otp')
        },
        onError: (error: AxiosError) => {
            setServerError(
                (error.response?.data as { message?: string })?.message ||
                'User not found. Please check your email.'
            )
        }
    })

    // ── Step 2: Verify OTP ──
    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-forgot-password-user`,
                { email: userEmail, otp: otp.join('') },
                { withCredentials: true }
            )
            return res.data
        },
        onSuccess: () => {
            setServerError(null)
            setStep('reset')
        },
        onError: (error: AxiosError) => {
            setServerError(
                (error.response?.data as { message?: string })?.message ||
                'Invalid OTP. Please try again.'
            )
        }
    })

    // ── Step 3: Reset Password ──
    const resetPasswordMutation = useMutation({
        mutationFn: async ({ password }: { password: string }) => {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reset-password-user`,
                { email: userEmail, newPassword: password },
                { withCredentials: true }
            )
            return res.data
        },
        onSuccess: () => {
            setServerError(null)
            toast.success('Password reset successfully! Please sign in.')
            router.push('/login')
        },
        onError: (error: AxiosError) => {
            setServerError(
                (error.response?.data as { message?: string })?.message ||
                'Failed to reset password. Please try again.'
            )
        }
    })

    // ── OTP input handlers ──
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        if (value && index < 3) inputRefs.current[index + 1]?.focus()
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            e.preventDefault()
            const newOtp = [...otp]
            if (otp[index]) {
                newOtp[index] = ''
                setOtp(newOtp)
            } else if (index > 0) {
                newOtp[index - 1] = ''
                setOtp(newOtp)
                inputRefs.current[index - 1]?.focus()
            }
        }
    }

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
        if (!pasted) return
        const newOtp = ['', '', '', '']
        pasted.split('').forEach((char, i) => { newOtp[i] = char })
        setOtp(newOtp)
        const lastFilled = Math.min(pasted.length, 3)
        inputRefs.current[lastFilled]?.focus()
    }

    // ── Step labels ──
    const stepLabel = { email: 'Password recovery', otp: 'Verification', reset: 'New password' }
    const stepTitle = {
        email: 'Forgot your password?',
        otp: 'Check your email',
        reset: 'Set a new password'
    }
    const stepSubtitle = {
        email: "Enter your email address and we'll send you a code to reset your password.",
        otp: `We sent a 4-digit code to ${userEmail}. Enter it below.`,
        reset: 'Choose a strong new password for your account.'
    }

    return (
        <div
            className="w-full min-h-screen bg-[#F5F4F0] flex items-center justify-center px-4 py-10"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap');`}</style>

            <div className="w-full max-w-[440px] bg-white rounded-2xl border border-black/[0.07] p-10 shadow-sm">

                {/* Progress dots */}
                <div className="flex items-center gap-1.5 mb-6">
                    {(['email', 'otp', 'reset'] as const).map((s, i) => (
                        <div
                            key={s}
                            className={`h-1 rounded-full transition-all duration-300 ${step === s
                                ? 'w-6 bg-[#378ADD]'
                                : ['email', 'otp', 'reset'].indexOf(step) > i
                                    ? 'w-4 bg-[#378ADD]/40'
                                    : 'w-4 bg-black/10'
                                }`}
                        />
                    ))}
                    <span className="ml-auto text-xs font-medium text-[#888] tracking-widest uppercase">
                        {stepLabel[step]}
                    </span>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-[#EBF4FF] flex items-center justify-center mb-5">
                    {step === 'email' && (
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                    )}
                    {step === 'otp' && (
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    )}
                    {step === 'reset' && (
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    )}
                </div>

                {/* Heading */}
                <h1 className="text-[26px] text-black leading-tight mb-1"
                    style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
                    {stepTitle[step]}
                </h1>
                <p className="text-sm text-[#888] mb-7 leading-relaxed">{stepSubtitle[step]}</p>

                {/* Server error */}
                {serverError && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                            <circle cx="6" cy="6" r="5.5" stroke="#ef4444" />
                            <path d="M6 3.5v3M6 8v.5" stroke="#ef4444" strokeLinecap="round" />
                        </svg>
                        {serverError}
                    </div>
                )}

                {/* ── STEP 1: Email ── */}
                {step === 'email' && (
                    <form onSubmit={emailForm.handleSubmit((data) => requestOtpMutation.mutate(data))} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">
                                Email address
                            </label>
                            <input
                                type="text"
                                id="email"
                                placeholder="you@example.com"
                                {...emailForm.register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Enter a valid email address'
                                    }
                                })}
                                className={`w-full h-11 px-4 rounded-xl border text-sm text-black placeholder:text-[#bbb] bg-[#FAFAFA] outline-none transition-all
                                    focus:border-[#378ADD] focus:ring-2 focus:ring-[#378ADD]/10 focus:bg-white
                                    ${emailForm.formState.errors.email ? 'border-red-400 bg-red-50/30' : 'border-black/10'}`}
                            />
                            {emailForm.formState.errors.email && (
                                <ErrorMsg message={emailForm.formState.errors.email.message!} />
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={requestOtpMutation.isPending}
                            className="w-full h-11 mt-1 rounded-xl bg-[#378ADD] hover:bg-[#185FA5] active:scale-[0.985] text-white text-sm font-medium tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {requestOtpMutation.isPending ? <Spinner label="Sending code..." /> : 'Send reset code'}
                        </button>
                    </form>
                )}

                {/* ── STEP 2: OTP ── */}
                {step === 'otp' && (
                    <div className="flex flex-col items-center">

                        {/* OTP boxes */}
                        <div className="flex items-center justify-center gap-3 mb-7 w-full" onPaste={handleOtpPaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    ref={(el) => { if (el) inputRefs.current[index] = el }}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className={`w-14 h-14 text-center text-2xl font-semibold text-black rounded-xl border-2 bg-[#FAFAFA] outline-none transition-all
                                        focus:border-[#378ADD] focus:ring-2 focus:ring-[#378ADD]/10 focus:bg-white
                                        ${digit ? 'border-[#378ADD] bg-white' : 'border-black/10'}`}
                                />
                            ))}
                        </div>

                        {/* Verify button */}
                        <button
                            type="button"
                            onClick={() => verifyOtpMutation.mutate()}
                            disabled={otp.some(d => d === '') || verifyOtpMutation.isPending}
                            className="w-full h-11 rounded-xl bg-[#378ADD] hover:bg-[#185FA5] active:scale-[0.985] text-white text-sm font-medium tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-6"
                        >
                            {verifyOtpMutation.isPending ? <Spinner label="Verifying..." /> : 'Verify code'}
                        </button>

                        {/* Resend row */}
                        <div className="flex items-center justify-center gap-1.5 text-sm">
                            <span className="text-[#999]">Didn&apos;t receive a code?</span>
                            {canResend ? (
                                <button
                                    type="button"
                                    onClick={() => requestOtpMutation.mutate({ email: userEmail })}
                                    disabled={requestOtpMutation.isPending}
                                    className="text-[#378ADD] hover:text-[#185FA5] font-medium transition-colors disabled:opacity-50"
                                >
                                    {requestOtpMutation.isPending ? 'Sending...' : 'Resend code'}
                                </button>
                            ) : (
                                <div className="flex items-center gap-1.5 text-[#bbb]">
                                    <span>Resend in</span>
                                    <span className="inline-flex items-center justify-center min-w-[34px] h-5 px-1.5 rounded-md bg-[#EBF4FF] text-xs font-semibold text-[#378ADD] tabular-nums">
                                        {String(timer).padStart(2, '0')}s
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Back */}
                        <button
                            type="button"
                            onClick={() => { setStep('email'); setServerError(null) }}
                            className="mt-5 flex items-center gap-1.5 text-xs text-[#bbb] hover:text-[#666] transition-colors"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Use a different email
                        </button>
                    </div>
                )}

                {/* ── STEP 3: Reset Password ── */}
                {step === 'reset' && (
                    <form
                        onSubmit={resetForm.handleSubmit((data) => resetPasswordMutation.mutate(data))}
                        className="space-y-4"
                    >
                        {/* New Password */}
                        <div>
                            <label htmlFor="password" className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">
                                New password
                            </label>
                            <div className="relative">
                                <input
                                    type={passwordVisible ? 'text' : 'password'}
                                    id="password"
                                    placeholder="Create a new password"
                                    {...resetForm.register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                    })}
                                    className={`w-full h-11 pl-4 pr-11 rounded-xl border text-sm text-black placeholder:text-[#bbb] bg-[#FAFAFA] outline-none transition-all
                                        focus:border-[#378ADD] focus:ring-2 focus:ring-[#378ADD]/10 focus:bg-white
                                        ${resetForm.formState.errors.password ? 'border-red-400 bg-red-50/30' : 'border-black/10'}`}
                                />
                                <button type="button" onClick={() => setPasswordVisible(!passwordVisible)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555] transition-colors p-0.5"
                                    aria-label="Toggle password visibility">
                                    {passwordVisible ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
                                </button>
                            </div>
                            {resetForm.formState.errors.password && (
                                <ErrorMsg message={resetForm.formState.errors.password.message!} />
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">
                                Confirm new password
                            </label>
                            <div className="relative">
                                <input
                                    type={confirmVisible ? 'text' : 'password'}
                                    id="confirmPassword"
                                    placeholder="Re-enter your password"
                                    {...resetForm.register('confirmPassword', {
                                        required: 'Please confirm your password',
                                        validate: (value) => value === newPassword || 'Passwords do not match'
                                    })}
                                    className={`w-full h-11 pl-4 pr-11 rounded-xl border text-sm text-black placeholder:text-[#bbb] bg-[#FAFAFA] outline-none transition-all
                                        focus:border-[#378ADD] focus:ring-2 focus:ring-[#378ADD]/10 focus:bg-white
                                        ${resetForm.formState.errors.confirmPassword ? 'border-red-400 bg-red-50/30' : 'border-black/10'}`}
                                />
                                <button type="button" onClick={() => setConfirmVisible(!confirmVisible)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555] transition-colors p-0.5"
                                    aria-label="Toggle confirm password visibility">
                                    {confirmVisible ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
                                </button>
                            </div>
                            {resetForm.formState.errors.confirmPassword && (
                                <ErrorMsg message={resetForm.formState.errors.confirmPassword.message!} />
                            )}
                        </div>

                        {/* Password strength hint */}
                        <p className="text-xs text-[#aaa] leading-relaxed">
                            Use at least 6 characters including letters and numbers for a strong password.
                        </p>

                        <button
                            type="submit"
                            disabled={resetPasswordMutation.isPending}
                            className="w-full h-11 mt-1 rounded-xl bg-[#378ADD] hover:bg-[#185FA5] active:scale-[0.985] text-white text-sm font-medium tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {resetPasswordMutation.isPending ? <Spinner label="Resetting password..." /> : 'Reset password'}
                        </button>
                    </form>
                )}

                {/* Back to login */}
                <p className="text-center text-sm text-[#999] mt-7">
                    Remember your password?{' '}
                    <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="text-[#378ADD] hover:text-[#185FA5] font-medium transition-colors"
                    >
                        Sign in
                    </button>
                </p>

            </div>
        </div>
    )
}

// ── Shared helpers ──

const ErrorMsg = ({ message }: { message: string }) => (
    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5.5" stroke="#ef4444" />
            <path d="M6 3.5v3M6 8v.5" stroke="#ef4444" strokeLinecap="round" />
        </svg>
        {message}
    </p>
)

const Spinner = ({ label }: { label: string }) => (
    <span className="flex items-center justify-center gap-2">
        <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
        {label}
    </span>
)

export default ForgotPassword