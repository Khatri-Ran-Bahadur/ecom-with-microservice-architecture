"use client"
import { useRouter } from 'next/navigation'
import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Check } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { countries } from '../../../utils/countries'
import { shopcategories } from '../../../utils/shopcategories'
import StripeLogo from 'apps/seller-ui/src/assets/svgs/stripelogo'

// ── Types (from Prisma schema) ──
type SellerAccountData = {
    name: string
    email: string
    phone_number: string
    country: string
    password: string
    confirmPassword: string
}

type ShopData = {
    shopName: string
    shopBio: string
    shopCategory: string
    shopAddress: string
    shopOpeningHours: string
    shopWebsite: string
}

type BankData = {
    accountHolderName: string
    accountNumber: string
    routingNumber: string
    bankName: string
}



const STEPS = [
    { id: 1, label: 'Account Details', icon: 'user' },
    { id: 2, label: 'Setup Shop', icon: 'shop' },
    { id: 3, label: 'Connect Bank', icon: 'bank' },
]

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

const inputBase = `w-full h-11 px-4 rounded-xl border text-sm text-black placeholder:text-[#bbb] bg-[#FAFAFA] outline-none transition-all focus:border-[#378ADD] focus:ring-2 focus:ring-[#378ADD]/10 focus:bg-white`
const inputError = `border-red-400 bg-red-50/30`
const inputNormal = `border-black/10`

// ── Main Component ──
const SellerSignup = () => {
    const router = useRouter()
    const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1)
    const [sellerId, setSellerId] = useState<string | null>(null)
    const [serverError, setServerError] = useState<string | null>(null)

    // Step 1 — Account
    const [showOtp, setShowOtp] = useState(false)
    const [otp, setOtp] = useState(['', '', '', ''])
    const [sellerData, setSellerData] = useState<SellerAccountData | null>(null)
    const [canResend, setCanResend] = useState(false)
    const [timer, setTimer] = useState(60)
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [confirmVisible, setConfirmVisible] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const accountForm = useForm<SellerAccountData>()
    const shopForm = useForm<ShopData>()
    const bankForm = useForm<BankData>()

    const accountPassword = accountForm.watch('password')

    // ── Timer ──
    const startResendTimer = () => {
        setCanResend(false)
        setTimer(60)
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) { clearInterval(timerRef.current!); setCanResend(true); return 0 }
                return prev - 1
            })
        }, 1000)
    }

    // ── Step 1: Register seller & send OTP ──
    const signupMutation = useMutation({
        mutationFn: async (data: SellerAccountData) => {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-registration`, data)
            return res.data
        },
        onSuccess: (_, formData) => {
            setSellerData(formData)
            setServerError(null)
            setOtp(['', '', '', ''])
            setShowOtp(true)
            startResendTimer()
        },
        onError: (error: AxiosError) => {
            setServerError((error.response?.data as { message?: string })?.message || 'Registration failed. Please try again.')
        }
    })

    // ── Step 1: Verify OTP ──
    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!sellerData) return
            const res = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-seller`, {
                ...sellerData,
                otp: otp.join('')
            })
            return res.data
        },
        onSuccess: (data) => {
            setSellerId(data?.seller?.id)
            setServerError(null)
            setActiveStep(2)
            setShowOtp(false)
        },
        onError: (error: AxiosError) => {
            setServerError((error.response?.data as { message?: string })?.message || 'Invalid OTP. Please try again.')
        }
    })

    // ── Step 2: Create shop (sellers.shop — name, bio, category, address, opening_hours, website) ──
    const shopMutation = useMutation({
        mutationFn: async (data: ShopData) => {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-shop`, {
                name: data.shopName,
                bio: data.shopBio,
                category: data.shopCategory,
                address: data.shopAddress,
                opening_hours: data.shopOpeningHours,
                website: data.shopWebsite,
                sellerId
            })
            return res.data
        },
        onSuccess: () => {
            setServerError(null)
            setActiveStep(3)
        },
        onError: (error: AxiosError) => {
            setServerError((error.response?.data as { message?: string })?.message || 'Failed to create shop. Please try again.')
        }
    })

    // ── Step 3: Connect Stripe ──
    const connectStripe = async () => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/connect-stripe`, {
                sellerId
            })
            if (response.data.url) {
                window.location.href = response.data.url
            }
        } catch (error: any) {
            setServerError(error.response?.data?.message || 'Failed to connect Stripe. Please try again.')
        }
    }



    // ── OTP handlers ──
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return
        const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp)
        if (value && index < 3) inputRefs.current[index + 1]?.focus()
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            e.preventDefault()
            const newOtp = [...otp]
            if (otp[index]) { newOtp[index] = ''; setOtp(newOtp) }
            else if (index > 0) { newOtp[index - 1] = ''; setOtp(newOtp); inputRefs.current[index - 1]?.focus() }
        }
    }

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
        if (!pasted) return
        const newOtp = ['', '', '', '']; pasted.split('').forEach((c, i) => { newOtp[i] = c }); setOtp(newOtp)
        inputRefs.current[Math.min(pasted.length, 3)]?.focus()
    }

    return (
        <div className="w-full min-h-screen bg-[#F5F4F0] flex flex-col items-center px-4 py-10"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>

            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500&display=swap');`}</style>

            {/* ── Top brand ── */}
            <div className="mb-8 text-center">
                <span className="text-2xl font-bold">
                    <span className="text-[#378ADD]">E</span>
                    <span className="text-gray-800">Shop</span>
                </span>
                <p className="text-sm text-[#888] mt-1">Seller Registration</p>
            </div>

            {/* ── Stepper ── */}
            <div className="w-full max-w-[560px] mb-8">
                <div className="flex items-center justify-between relative">
                    {/* connector line */}
                    <div className="absolute top-5 left-0 right-0 h-px bg-black/10 z-0" />
                    <div
                        className="absolute top-5 left-0 h-px bg-[#378ADD] z-0 transition-all duration-500"
                        style={{ width: activeStep === 1 ? '0%' : activeStep === 2 ? '50%' : '100%' }}
                    />
                    {STEPS.map((step) => {
                        const done = activeStep > step.id
                        const active = activeStep === step.id
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold text-sm
                                    ${done ? 'bg-[#378ADD] border-[#378ADD] text-white'
                                        : active ? 'bg-white border-[#378ADD] text-[#378ADD]'
                                            : 'bg-white border-black/15 text-[#aaa]'}`}>
                                    {done ? <Check size={16} strokeWidth={2.5} /> : step.id}
                                </div>
                                <span className={`text-xs font-medium whitespace-nowrap transition-colors
                                    ${active ? 'text-[#378ADD]' : done ? 'text-[#378ADD]/60' : 'text-[#aaa]'}`}>
                                    {step.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Card ── */}
            <div className="w-full max-w-[520px] bg-white rounded-2xl border border-black/[0.07] p-10 shadow-sm">

                {/* Server error */}
                {serverError && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                            <circle cx="6" cy="6" r="5.5" stroke="#ef4444" />
                            <path d="M6 3.5v3M6 8v.5" stroke="#ef4444" strokeLinecap="round" />
                        </svg>
                        {serverError}
                    </div>
                )}

                {/* ════════════════════════════════
                    STEP 1 — Account Details
                ════════════════════════════════ */}
                {activeStep === 1 && !showOtp && (
                    <>
                        <div className="mb-6">
                            <h2 className="text-[24px] text-black leading-tight"
                                style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
                                Create your seller account
                            </h2>
                            <p className="text-sm text-[#888] mt-1">Fill in your details to get started as a seller.</p>
                        </div>

                        <form onSubmit={accountForm.handleSubmit((data) => signupMutation.mutate(data))} className="space-y-4">

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">Full name</label>
                                <input type="text" placeholder="John Doe"
                                    {...accountForm.register('name', {
                                        required: 'Full name is required',
                                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                    })}
                                    className={`${inputBase} ${accountForm.formState.errors.name ? inputError : inputNormal}`}
                                />
                                {accountForm.formState.errors.name && <ErrorMsg message={accountForm.formState.errors.name.message!} />}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">Email address</label>
                                <input type="text" placeholder="you@example.com"
                                    {...accountForm.register('email', {
                                        required: 'Email is required',
                                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Enter a valid email address' }
                                    })}
                                    className={`${inputBase} ${accountForm.formState.errors.email ? inputError : inputNormal}`}
                                />
                                {accountForm.formState.errors.email && <ErrorMsg message={accountForm.formState.errors.email.message!} />}
                            </div>

                            {/* Phone number */}
                            <div>
                                <label className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">Phone number</label>
                                <input type="tel" placeholder="+1 234 567 8900"
                                    {...accountForm.register('phone_number', {
                                        required: 'Phone number is required',
                                        minLength: { value: 10, message: 'Phone number must be at least 10 digits' },
                                        maxLength: { value: 15, message: 'Phone number cannot exceed 15 digits' }
                                    })}
                                    className={`${inputBase} ${accountForm.formState.errors.phone_number ? inputError : inputNormal}`}
                                />
                                {accountForm.formState.errors.phone_number && <ErrorMsg message={accountForm.formState.errors.phone_number.message!} />}
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">Country</label>
                                <select
                                    {...accountForm.register('country', { required: 'Country is required' })}
                                    className={`${inputBase} ${accountForm.formState.errors.country ? inputError : inputNormal}`}
                                >
                                    <option value="" disabled>Select your country</option>
                                    {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                </select>
                                {accountForm.formState.errors.country && <ErrorMsg message={accountForm.formState.errors.country.message!} />}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">Password</label>
                                <div className="relative">
                                    <input type={passwordVisible ? 'text' : 'password'} placeholder="Create a password"
                                        {...accountForm.register('password', {
                                            required: 'Password is required',
                                            minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                        })}
                                        className={`${inputBase} pl-4 pr-11 ${accountForm.formState.errors.password ? inputError : inputNormal}`}
                                    />
                                    <button type="button" onClick={() => setPasswordVisible(!passwordVisible)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555] transition-colors p-0.5">
                                        {passwordVisible ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
                                    </button>
                                </div>
                                {accountForm.formState.errors.password && <ErrorMsg message={accountForm.formState.errors.password.message!} />}
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">Confirm password</label>
                                <div className="relative">
                                    <input type={confirmVisible ? 'text' : 'password'} placeholder="Re-enter your password"
                                        {...accountForm.register('confirmPassword', {
                                            required: 'Please confirm your password',
                                            validate: v => v === accountPassword || 'Passwords do not match'
                                        })}
                                        className={`${inputBase} pl-4 pr-11 ${accountForm.formState.errors.confirmPassword ? inputError : inputNormal}`}
                                    />
                                    <button type="button" onClick={() => setConfirmVisible(!confirmVisible)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555] transition-colors p-0.5">
                                        {confirmVisible ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
                                    </button>
                                </div>
                                {accountForm.formState.errors.confirmPassword && <ErrorMsg message={accountForm.formState.errors.confirmPassword.message!} />}
                            </div>

                            <p className="text-xs text-[#aaa] leading-relaxed pt-0.5">
                                By creating an account you agree to our{' '}
                                <a href="#" className="text-[#378ADD] hover:underline">Terms of Service</a> and{' '}
                                <a href="#" className="text-[#378ADD] hover:underline">Privacy Policy</a>.
                            </p>

                            <button type="submit" disabled={signupMutation.isPending}
                                className="w-full h-11 mt-1 rounded-xl bg-[#378ADD] hover:bg-[#185FA5] active:scale-[0.985] text-white text-sm font-medium tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {signupMutation.isPending ? <Spinner label="Creating account..." /> : 'Continue'}
                            </button>
                        </form>
                    </>
                )}

                {/* ── OTP verification (Step 1 sub-screen) ── */}
                {activeStep === 1 && showOtp && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#EBF4FF] flex items-center justify-center mb-5">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                        <h2 className="text-[22px] text-black mb-1 text-center"
                            style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
                            Check your email
                        </h2>
                        <p className="text-sm text-[#888] text-center mb-8 leading-relaxed">
                            We sent a 4-digit verification code to<br />
                            <span className="font-medium text-black">{sellerData?.email ?? 'your email'}</span>
                        </p>

                        <div className="flex items-center justify-center gap-3 mb-7 w-full" onPaste={handleOtpPaste}>
                            {otp.map((digit, index) => (
                                <input key={index} type="text" inputMode="numeric" maxLength={1} value={digit}
                                    ref={el => { if (el) inputRefs.current[index] = el }}
                                    onChange={e => handleOtpChange(index, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(index, e)}
                                    className={`w-14 h-14 text-center text-2xl font-semibold text-black rounded-xl border-2 bg-[#FAFAFA] outline-none transition-all
                                        focus:border-[#378ADD] focus:ring-2 focus:ring-[#378ADD]/10 focus:bg-white
                                        ${digit ? 'border-[#378ADD] bg-white' : 'border-black/10'}`}
                                />
                            ))}
                        </div>

                        <button type="button" onClick={() => verifyOtpMutation.mutate()}
                            disabled={otp.some(d => d === '') || verifyOtpMutation.isPending}
                            className="w-full h-11 rounded-xl bg-[#378ADD] hover:bg-[#185FA5] active:scale-[0.985] text-white text-sm font-medium tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-6">
                            {verifyOtpMutation.isPending ? <Spinner label="Verifying..." /> : 'Verify & continue'}
                        </button>

                        <div className="flex items-center justify-center gap-1.5 text-sm">
                            <span className="text-[#999]">Didn&apos;t receive a code?</span>
                            {canResend ? (
                                <button type="button" disabled={signupMutation.isPending}
                                    onClick={() => sellerData && signupMutation.mutate(sellerData)}
                                    className="text-[#378ADD] hover:text-[#185FA5] font-medium transition-colors disabled:opacity-50">
                                    {signupMutation.isPending ? 'Sending...' : 'Resend code'}
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

                        <button type="button" onClick={() => { setShowOtp(false); setServerError(null) }}
                            className="mt-5 flex items-center gap-1.5 text-xs text-[#bbb] hover:text-[#666] transition-colors">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Back to account details
                        </button>
                    </div>
                )}

                {/* ════════════════════════════════
                    STEP 2 — Setup Shop
                    Fields: name, bio, category, address, opening_hours, website
                ════════════════════════════════ */}
                {activeStep === 2 && (
                    <>
                        <div className="mb-6">
                            <h2 className="text-[24px] text-black leading-tight"
                                style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
                                Set up your shop
                            </h2>
                            <p className="text-sm text-[#888] mt-1">Tell customers about your shop — you can edit this later.</p>
                        </div>

                        <form onSubmit={shopForm.handleSubmit(data => shopMutation.mutate(data))} className="space-y-4">

                            {/* Shop Name → shops.name */}
                            <div>
                                <label className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">Shop name <span className="text-red-400">*</span></label>
                                <input type="text" placeholder="My Awesome Store"
                                    {...shopForm.register('shopName', { required: 'Shop name is required', minLength: { value: 2, message: 'Shop name must be at least 2 characters' } })}
                                    className={`${inputBase} ${shopForm.formState.errors.shopName ? inputError : inputNormal}`}
                                />
                                {shopForm.formState.errors.shopName && <ErrorMsg message={shopForm.formState.errors.shopName.message!} />}
                            </div>

                            {/* Category → shops.category */}
                            <div>
                                <label className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">Category <span className="text-red-400">*</span></label>
                                <select {...shopForm.register('shopCategory', { required: 'Category is required' })}
                                    className={`${inputBase} ${shopForm.formState.errors.shopCategory ? inputError : inputNormal}`}>
                                    <option value="" disabled>Select a category</option>
                                    {shopcategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                                {shopForm.formState.errors.shopCategory && <ErrorMsg message={shopForm.formState.errors.shopCategory.message!} />}
                            </div>

                            {/* Address → shops.address */}
                            <div>
                                <label className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">Shop address <span className="text-red-400">*</span></label>
                                <input type="text" placeholder="123 Market St, New York, NY"
                                    {...shopForm.register('shopAddress', { required: 'Shop address is required' })}
                                    className={`${inputBase} ${shopForm.formState.errors.shopAddress ? inputError : inputNormal}`}
                                />
                                {shopForm.formState.errors.shopAddress && <ErrorMsg message={shopForm.formState.errors.shopAddress.message!} />}
                            </div>

                            {/* Bio → shops.bio (optional) */}
                            <div>
                                <label className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">
                                    Shop bio <span className="text-[#bbb] font-normal">(optional)</span>
                                </label>
                                <textarea placeholder="Tell customers what your shop is about..."
                                    rows={3}
                                    {...shopForm.register('shopBio')}
                                    className={`w-full px-4 py-3 rounded-xl border text-sm text-black placeholder:text-[#bbb] bg-[#FAFAFA] outline-none transition-all resize-none
                                        focus:border-[#378ADD] focus:ring-2 focus:ring-[#378ADD]/10 focus:bg-white border-black/10`}
                                />
                            </div>

                            {/* Opening hours → shops.opening_hours (optional) */}
                            <div>
                                <label className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">
                                    Opening hours <span className="text-[#bbb] font-normal">(optional)</span>
                                </label>
                                <input type="text" placeholder="e.g. Mon–Fri 9am–6pm"
                                    {...shopForm.register('shopOpeningHours')}
                                    className={`${inputBase} ${inputNormal}`}
                                />
                            </div>

                            {/* Website → shops.website (optional) */}
                            <div>
                                <label className="block text-xs font-medium text-[#666] mb-1.5 tracking-wide">
                                    Website <span className="text-[#bbb] font-normal">(optional)</span>
                                </label>
                                <input type="url" placeholder="https://yourshop.com"
                                    {...shopForm.register('shopWebsite', {
                                        pattern: { value: /^https?:\/\/.+/, message: 'Enter a valid URL starting with http(s)://' }
                                    })}
                                    className={`${inputBase} ${shopForm.formState.errors.shopWebsite ? inputError : inputNormal}`}
                                />
                                {shopForm.formState.errors.shopWebsite && <ErrorMsg message={shopForm.formState.errors.shopWebsite.message!} />}
                            </div>

                            <button type="submit" disabled={shopMutation.isPending}
                                className="w-full h-11 mt-1 rounded-xl bg-[#378ADD] hover:bg-[#185FA5] active:scale-[0.985] text-white text-sm font-medium tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                {shopMutation.isPending ? <Spinner label="Setting up shop..." /> : 'Continue'}
                            </button>
                        </form>
                    </>
                )}

                {/* ════════════════════════════════
                    STEP 3 — Connect Bank (Stripe)
                    sellers.stripeId will be set server-side
                ════════════════════════════════ */}
                {activeStep === 3 && (
                    <>
                        <div className="mb-6">
                            <h2 className="text-[24px] text-black leading-tight"
                                style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
                                Withdraw Method
                            </h2>
                            <p className="text-sm text-[#888] mt-1">You can withdraw your earnings from your shop.</p>
                        </div>

                        {/* connect stripe button */}
                        <button
                            onClick={connectStripe}
                            type="button"
                            className="w-full h-12 mt-2 flex items-center justify-center gap-2 rounded-xl 
             bg-[#635BFF] hover:bg-[#5247e5] active:scale-[0.98] 
             text-white text-sm font-semibold tracking-wide transition-all 
             disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <StripeLogo className="w-10 h-5 text-white" />
                            <span>Connect with Stripe</span>
                        </button>
                    </>
                )}


                {/* Already have account */}
                <p className="text-center text-sm text-[#999] mt-7">
                    Already have an account?{' '}
                    <button type="button" onClick={() => router.push('/login')}
                        className="text-[#378ADD] hover:text-[#185FA5] font-medium transition-colors">
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    )
}


export default SellerSignup