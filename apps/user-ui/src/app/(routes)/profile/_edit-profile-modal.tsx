"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    X, Camera, User, Mail, Phone, MapPin,
    Globe, Calendar, Save, Loader2, CheckCircle2,
    AlertCircle, Upload, Trash2, Lock,
} from "lucide-react";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
    name: string;
    email: string;
    phone?: string;
    bio?: string;
    address?: string;
    country?: string;
    dateOfBirth?: string;
    website?: string;
    avatar?: string;
}

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile;
    onSuccess?: (updated: UserProfile) => void;
}

type FieldStatus = "idle" | "loading" | "success" | "error";

// ─── API Function ───────────────────────────────────────────────────────────────

export async function updateUserProfile(
    data: Partial<UserProfile> & { avatarFile?: File }
): Promise<UserProfile> {
    // If there's an avatar to upload, use FormData
    if (data.avatarFile) {
        const formData = new FormData();
        formData.append("avatar", data.avatarFile);
        Object.entries(data).forEach(([key, val]) => {
            if (key !== "avatarFile" && val !== undefined) {
                formData.append(key, val as string);
            }
        });
        const res = await axiosInstance.put("/user/api/update-profile", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data?.user ?? res.data;
    }

    // JSON update (no file)
    const { avatarFile: _, ...payload } = data;
    const res = await axiosInstance.put("/user/api/update-profile", payload);
    return res.data?.user ?? res.data;
}

// ─── Field component ───────────────────────────────────────────────────────────

const Field = ({
    label,
    icon: Icon,
    error,
    children,
    required,
}: {
    label: string;
    icon: any;
    error?: string;
    children: React.ReactNode;
    required?: boolean;
}) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
            <Icon size={10} className="text-slate-400" />
            {label}
            {required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
        {children}
        {error && (
            <p className="flex items-center gap-1 text-[11px] text-rose-500 font-semibold">
                <AlertCircle size={10} /> {error}
            </p>
        )}
    </div>
);

const inputClass = (hasError?: boolean) =>
    `w-full px-3.5 py-2.5 text-[13px] font-medium text-slate-800 bg-slate-50 border rounded-xl outline-none transition-all duration-150 placeholder:text-slate-300
    ${hasError
        ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        : "border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-100 hover:border-slate-300"
    }`;

// ─── Modal ─────────────────────────────────────────────────────────────────────

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    isOpen,
    onClose,
    user,
    onSuccess,
}) => {
    const [form, setForm] = useState<UserProfile>({ ...user });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({});
    const [status, setStatus] = useState<FieldStatus>("idle");
    const [activeTab, setActiveTab] = useState<"personal" | "contact" | "account">("personal");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    // 


    // Reset state when modal opens with fresh user data
    useEffect(() => {
        if (isOpen) {
            setForm({ ...user });
            setAvatarPreview(user.avatar ?? null);
            setAvatarFile(null);
            setErrors({});
            setStatus("idle");
            setActiveTab("personal");
        }
    }, [isOpen, user]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    // Field setter
    const set = useCallback(<K extends keyof UserProfile>(key: K, val: string) => {
        setForm((f) => ({ ...f, [key]: val }));
        setErrors((e) => ({ ...e, [key]: undefined }));
    }, []);

    // Avatar handling
    const handleAvatarFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setErrors((e) => ({ ...e, avatar: "Please upload an image file." } as any));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors((e) => ({ ...e, avatar: "Image must be under 5 MB." } as any));
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleAvatarFile(file);
    };

    // Validation
    const validate = (): boolean => {
        const errs: typeof errors = {};
        if (!form.name?.trim()) errs.name = "Name is required.";
        else if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters.";
        if (!form.email?.trim()) errs.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address.";
        if (form.phone && !/^\+?[\d\s\-().]{7,20}$/.test(form.phone)) errs.phone = "Enter a valid phone number.";
        if (form.website && !/^https?:\/\/.+/.test(form.website)) errs.website = "URL must start with http:// or https://";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Submit
    const handleSubmit = async () => {
        if (!validate()) return;
        setStatus("loading");
        try {
            const updated = await updateUserProfile({
                ...form,
                ...(avatarFile ? { avatarFile } : {}),
            });
            setStatus("success");
            onSuccess?.(updated);
            setTimeout(() => {
                onClose();
                setStatus("idle");
            }, 1200);
        } catch (err: any) {
            setStatus("error");
            const msg = err?.response?.data?.message ?? "Something went wrong. Please try again.";
            setErrors((e) => ({ ...e, _form: msg } as any));
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    const initials = form.name
        ? form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    if (!isOpen) return null;

    const tabs = [
        { key: "personal" as const, label: "Personal", icon: User },
        { key: "contact" as const, label: "Contact", icon: Phone },
        { key: "account" as const, label: "Account", icon: Lock },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal panel */}
            <div
                ref={modalRef}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col max-h-[90vh]"
                style={{ animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both" }}
            >
                <style>{`
                    @keyframes modalIn {
                        from { opacity: 0; transform: scale(0.94) translateY(12px); }
                        to   { opacity: 1; transform: scale(1)    translateY(0); }
                    }
                `}</style>

                {/* ── Header ── */}
                <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-[18px] font-black text-slate-900 tracking-tight">Edit Profile</h2>
                            <p className="text-[12px] text-slate-400 font-medium mt-0.5">Update your personal information</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    {/* Tab bar */}
                    <div className="flex gap-1 mt-4 bg-slate-100 p-1 rounded-xl">
                        {tabs.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200
                                    ${activeTab === key
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <Icon size={11} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* ── PERSONAL tab ── */}
                    {activeTab === "personal" && (
                        <>
                            {/* Avatar upload */}
                            <div className="flex flex-col items-center gap-3">
                                <div
                                    className={`relative w-24 h-24 rounded-2xl border-2 border-dashed overflow-hidden cursor-pointer transition-all group
                                        ${isDragging ? "border-slate-900 bg-slate-50 scale-105" : "border-slate-200 hover:border-slate-400"}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                >
                                    {avatarPreview ? (
                                        <>
                                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera size={20} className="text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-violet-600 flex flex-col items-center justify-center gap-1">
                                            <span className="text-2xl font-black text-white">{initials}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        <Upload size={11} />
                                        Upload Photo
                                    </button>
                                    {avatarPreview && avatarPreview !== user.avatar && (
                                        <button
                                            type="button"
                                            onClick={() => { setAvatarPreview(user.avatar ?? null); setAvatarFile(null); }}
                                            className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500 hover:text-rose-700 border border-rose-200 hover:border-rose-300 px-3 py-1.5 rounded-lg transition-all"
                                        >
                                            <Trash2 size={11} />
                                            Discard
                                        </button>
                                    )}
                                </div>

                                <p className="text-[10px] text-slate-400 font-medium">JPG, PNG or WebP · Max 5 MB</p>
                                {(errors as any).avatar && (
                                    <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                                        <AlertCircle size={10} /> {(errors as any).avatar}
                                    </p>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f); }}
                                />
                            </div>

                            <div className="border-t border-slate-100" />

                            <Field label="Full Name" icon={User} error={errors.name} required>
                                <input
                                    type="text"
                                    value={form.name ?? ""}
                                    onChange={(e) => set("name", e.target.value)}
                                    placeholder="Jane Doe"
                                    className={inputClass(!!errors.name)}
                                />
                            </Field>

                            <Field label="Bio" icon={User} error={errors.bio}>
                                <textarea
                                    value={form.bio ?? ""}
                                    onChange={(e) => set("bio", e.target.value)}
                                    placeholder="Tell us a little about yourself…"
                                    rows={3}
                                    maxLength={200}
                                    className={`${inputClass(!!errors.bio)} resize-none`}
                                />
                                <p className="text-[10px] text-slate-400 text-right font-medium mt-0.5">
                                    {(form.bio ?? "").length}/200
                                </p>
                            </Field>

                            <Field label="Date of Birth" icon={Calendar} error={errors.dateOfBirth}>
                                <input
                                    type="date"
                                    value={form.dateOfBirth ?? ""}
                                    onChange={(e) => set("dateOfBirth", e.target.value)}
                                    className={inputClass(!!errors.dateOfBirth)}
                                />
                            </Field>
                        </>
                    )}

                    {/* ── CONTACT tab ── */}
                    {activeTab === "contact" && (
                        <>
                            <Field label="Email Address" icon={Mail} error={errors.email} required>
                                <input
                                    type="email"
                                    value={form.email ?? ""}
                                    onChange={(e) => set("email", e.target.value)}
                                    placeholder="jane@example.com"
                                    className={inputClass(!!errors.email)}
                                />
                            </Field>

                            <Field label="Phone Number" icon={Phone} error={errors.phone}>
                                <input
                                    type="tel"
                                    value={form.phone ?? ""}
                                    onChange={(e) => set("phone", e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className={inputClass(!!errors.phone)}
                                />
                            </Field>

                            <Field label="Address" icon={MapPin} error={errors.address}>
                                <input
                                    type="text"
                                    value={form.address ?? ""}
                                    onChange={(e) => set("address", e.target.value)}
                                    placeholder="123 Main St, City"
                                    className={inputClass(!!errors.address)}
                                />
                            </Field>

                            <Field label="Country" icon={Globe} error={errors.country}>
                                <select
                                    value={form.country ?? ""}
                                    onChange={(e) => set("country", e.target.value)}
                                    className={inputClass(!!errors.country)}
                                >
                                    <option value="">Select country…</option>
                                    {[
                                        "Nepal", "India", "United States", "United Kingdom",
                                        "Canada", "Australia", "Germany", "France",
                                        "Japan", "Singapore", "UAE", "Bangladesh",
                                    ].map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Website" icon={Globe} error={errors.website}>
                                <input
                                    type="url"
                                    value={form.website ?? ""}
                                    onChange={(e) => set("website", e.target.value)}
                                    placeholder="https://yourwebsite.com"
                                    className={inputClass(!!errors.website)}
                                />
                            </Field>
                        </>
                    )}

                    {/* ── ACCOUNT tab ── */}
                    {activeTab === "account" && (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                                <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[12px] font-bold text-amber-800">Password changes</p>
                                    <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                                        For security, password updates are handled separately. Use the "Security" section in your profile settings.
                                    </p>
                                </div>
                            </div>

                            <Field label="Current Email" icon={Mail} error={errors.email} required>
                                <input
                                    type="email"
                                    value={form.email ?? ""}
                                    onChange={(e) => set("email", e.target.value)}
                                    placeholder="jane@example.com"
                                    className={inputClass(!!errors.email)}
                                />
                                <p className="text-[10px] text-slate-400 font-medium">
                                    Changing your email will require re-verification.
                                </p>
                            </Field>

                            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Danger Zone</p>
                                <button
                                    type="button"
                                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-rose-200 text-[12px] font-bold text-rose-500 hover:bg-rose-50 hover:border-rose-300 transition-colors"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Global form error */}
                    {(errors as any)._form && (
                        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-[12px] font-semibold px-4 py-3 rounded-xl">
                            <AlertCircle size={14} className="shrink-0" />
                            {(errors as any)._form}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={status === "loading"}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={status === "loading" || status === "success"}
                            className={`flex-1 py-2.5 rounded-xl text-[13px] font-black flex items-center justify-center gap-2 transition-all shadow-sm
                                ${status === "success"
                                    ? "bg-emerald-500 text-white shadow-emerald-200"
                                    : status === "error"
                                        ? "bg-rose-500 text-white shadow-rose-200"
                                        : "bg-slate-900 text-white hover:bg-slate-700 shadow-slate-200 active:scale-[0.98]"
                                } disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                            {status === "loading" ? (
                                <><Loader2 size={14} className="animate-spin" /> Saving…</>
                            ) : status === "success" ? (
                                <><CheckCircle2 size={14} /> Saved!</>
                            ) : status === "error" ? (
                                <><AlertCircle size={14} /> Try Again</>
                            ) : (
                                <><Save size={14} /> Save Changes</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;