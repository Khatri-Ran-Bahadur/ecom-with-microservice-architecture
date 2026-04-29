"use client";
import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { ChevronRight, AlertCircle, Package, Save, Sparkles, X, Wand2 } from "lucide-react";
import ImagePlaceholder from "../../../../shared/components/image-placeholder";
import Input from "packages/compoenents/input";
import ColorSelector from "packages/compoenents/color-selector";
import CustomSpecifications from "packages/compoenents/custom-specifications";
import CustomProperties from "packages/compoenents/custom-properties";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("packages/compoenents/rich-text-editor"), { ssr: false });
import SizeSelector from "packages/compoenents/size-selector";
import Image from "next/image";
import { enhancement } from "apps/seller-ui/src/utils/AI.enhancements";

// ─── Section Wrapper ───────────────────────────────────────────────────────────
const Section = ({
    title,
    subtitle,
    children,
}: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="p-6 space-y-5">{children}</div>
    </div>
);

// ─── Field Wrapper ─────────────────────────────────────────────────────────────
const Field = ({ children, error }: { children: React.ReactNode; error?: string }) => (
    <div>
        {children}
        {error && (
            <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5 font-medium">
                <AlertCircle size={11} /> {error}
            </p>
        )}
    </div>
);

interface UploadedImage {
    fieldId: string;
    file_url: string;
}

// ─── Select Field ──────────────────────────────────────────────────────────────
const SelectField = ({
    label,
    children,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
        <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700
        focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all appearance-none"
            {...props}
        >
            {children}
        </select>
    </div>
);

// ─── Create Page ───────────────────────────────────────────────────────────────
const Create = () => {
    const router = useRouter();
    const [openImageModal, setOpenImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [serverError, setServerError] = useState<string | null>(null);
    const [isChanged, setIsChanged] = useState(false);
    const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
    const [activeEffect, setActiveEffect] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);

    const {
        register,
        control,
        watch,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await axiosInstance.get("/products/api/get-categories");
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });

    const categories = data?.categories || [];
    const subCategoriesData = data?.subCategories || {};
    const selectedCategory = watch("category");

    const subcategories = useMemo(
        () => (selectedCategory ? subCategoriesData[selectedCategory] || [] : []),
        [selectedCategory, subCategoriesData]
    );

    const { data: discount_codes = [], isLoading: discountLoading } = useQuery({
        queryKey: ["discount-codes"],
        queryFn: async () => {
            const res = await axiosInstance.get("products/api/get-discount-codes");
            return res?.data?.discount_codes || [];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await axiosInstance.post(
                `/products/api/create`,
                data
            );
            return res.data;
        },
        onSuccess: () => {
            setServerError(null);
            router.push("/seller/products");
        },
        onError: (error: AxiosError) => {
            setServerError(
                (error.response?.data as { message?: string })?.message || "Something went wrong."
            );
        },
    });

    const onSubmit = (data: any) => {
        createMutation.mutate(data)
    };
    const handleSaveDraft = () => console.log("draft");

    const convertFiletoBase64 = (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleImageChange = async (file: File | null, index: number) => {
        if (!file) return;

        setPictureUploadingLoader(true);
        try {
            const fileName: any = await convertFiletoBase64(file);
            const response = await axiosInstance.post("products/api/upload-product-image",
                { fileName: fileName },
                { withCredentials: true }
            );

            const updatedImages = [...images];
            const uploadedImage = {
                fieldId: response.data.fileId,
                file_url: response.data.file_url
            }
            updatedImages[index] = uploadedImage;

            if (index === images.length - 1 && updatedImages.length < 8) updatedImages.push(null);
            setImages(updatedImages);
            setValue("images", updatedImages);
            setIsChanged(true);
        } catch (error) {
            console.log(error);
        } finally {
            setPictureUploadingLoader(false);
        }
    };

    const handleRemoveImage = async (index: number) => {
        try {
            const updatedImages = [...images];
            const imageToDelete = updatedImages[index]

            if (imageToDelete?.fieldId) {
                await axiosInstance.delete("products/api/delete-product-image", {
                    data: { fileId: imageToDelete.fieldId },
                });
            }
            updatedImages.splice(index, 1);

            // add null if not exist
            if (!updatedImages.includes(null) && updatedImages.length < 8) updatedImages.push(null);
            setImages(updatedImages);
            setValue("images", updatedImages);
            setIsChanged(true);
        } catch (error) {
            console.log(error);
        }
    };


    const applyTransformation = async () => {
        if (!selectedImage || !activeEffect || processing) return;
        setProcessing(true);
        try {
            const url = new URL(selectedImage);
            const tr = url.searchParams.get("tr");

            if (tr) {
                // If the effect is already in the transformations, don't duplicate it
                const effects = tr.split(":");
                if (!effects.includes(activeEffect)) {
                    url.searchParams.set("tr", `${tr}:${activeEffect}`);
                }
            } else {
                url.searchParams.set("tr", activeEffect);
            }

            setSelectedImage(url.toString());
        } catch (error) {
            console.error("Error applying transformation:", error);
            // Fallback for non-URL strings if any
            if (!selectedImage.includes("?")) {
                setSelectedImage(`${selectedImage}?tr=${activeEffect}`);
            } else if (!selectedImage.includes("tr=")) {
                setSelectedImage(`${selectedImage}&tr=${activeEffect}`);
            }
        } finally {
            setProcessing(false);
        }
    };



    return (
        <div className="min-h-screen bg-slate-50/80">
            <form
                onSubmit={handleSubmit(onSubmit)}
                onChange={() => setIsChanged(true)}
                className="max-w-7xl mx-auto px-6 py-8 space-y-6"
            >
                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
                                <Package size={16} className="text-white" />
                            </div>
                            <nav className="flex items-center gap-1 text-sm text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-hide max-w-[280px] md:max-w-none">
                                <button
                                    type="button"
                                    onClick={() => router.push("/seller/dashboard")}
                                    className="hover:text-violet-600 transition-colors"
                                >
                                    Dashboard
                                </button>
                                <ChevronRight size={14} className="flex-shrink-0" />
                                <span>Products</span>
                                <ChevronRight size={14} className="flex-shrink-0" />
                                <span className="text-slate-800 font-semibold">Create</span>
                            </nav>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Create New Product
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Fill in the details below to list your product.
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {isChanged && (
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Save size={15} />
                                Draft
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-all shadow-md shadow-violet-200"
                        >
                            <Sparkles size={15} />
                            Publish
                        </button>
                    </div>
                </div>

                {/* ── Server Error ── */}
                {serverError && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
                        <AlertCircle size={16} />
                        {serverError}
                    </div>
                )}

                {/* ── Main Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
                    {/* Left: Images */}
                    <div className="space-y-3 sticky top-6">
                        <Section title="Product Images" subtitle="Upload up to 8 images">
                            <ImagePlaceholder
                                size="765 × 850"
                                small={false}
                                setOpenImageModal={setOpenImageModal}
                                index={0}
                                images={images}
                                onImageChange={handleImageChange}
                                setSelectedImage={setSelectedImage}
                                pictureUploadingLoader={pictureUploadingLoader}
                                onRemove={handleRemoveImage}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                {images.slice(1).map((_, index) => (
                                    <ImagePlaceholder
                                        key={index + 1}
                                        size="765 × 850"
                                        small
                                        setOpenImageModal={setOpenImageModal}
                                        index={index + 1}
                                        images={images}
                                        onImageChange={handleImageChange}
                                        setSelectedImage={setSelectedImage}
                                        pictureUploadingLoader={pictureUploadingLoader}
                                        onRemove={handleRemoveImage}
                                    />
                                ))}
                            </div>
                        </Section>
                    </div>

                    {/* Right: Form */}
                    <div className="space-y-5">

                        {/* Basic Info */}
                        <Section title="Basic Information">
                            <Field error={errors.title?.message as string}>
                                <Input
                                    label="Product Title *"
                                    placeholder="Enter a descriptive product title"
                                    {...register("title", { required: "Title is required" })}
                                />
                            </Field>

                            <Field error={errors.short_description?.message as string}>
                                <Input
                                    type="textarea"
                                    rows={4}
                                    label="Short Description * (Max 150 words)"
                                    className="resize-none"
                                    placeholder="A brief summary shown in product cards and search results"
                                    {...register("short_description", {
                                        required: "Short description is required",
                                        validate: (v) =>
                                            v.trim().split(/\s+/).length <= 150 || "Max 150 words",
                                    })}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-4">
                                <Field error={errors.brand?.message as string}>
                                    <Input
                                        label="Brand *"
                                        placeholder="e.g. Nike, Samsung"
                                        {...register("brand", { required: "Brand is required" })}
                                    />
                                </Field>
                                <Field error={errors.warranty?.message as string}>
                                    <Input
                                        label="Warranty *"
                                        placeholder="e.g. 1 year"
                                        {...register("warranty", { required: "Warranty is required" })}
                                    />
                                </Field>
                            </div>

                            <Field error={errors.tags?.message as string}>
                                <Input
                                    label="Tags *"
                                    placeholder="Comma-separated: summer, cotton, t-shirt"
                                    {...register("tags", { required: "Tags are required" })}
                                />
                            </Field>

                            <Field error={errors.slug?.message as string}>
                                <Input
                                    label="URL Slug *"
                                    placeholder="my-product-name"
                                    {...register("slug", {
                                        required: "Slug is required",
                                        pattern: {
                                            value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                            message: "Lowercase letters, numbers, and hyphens only",
                                        },
                                        minLength: { value: 3, message: "Min 3 characters" },
                                        maxLength: { value: 50, message: "Max 50 characters" },
                                    })}
                                />
                            </Field>
                        </Section>

                        {/* Categorization */}
                        <Section title="Categorization">
                            <div className="grid grid-cols-2 gap-4">
                                <Field error={errors.category?.message as string}>
                                    {isLoading ? (
                                        <p className="text-sm text-slate-500">Loading...</p>
                                    ) : (
                                        <Controller
                                            name="category"
                                            control={control}
                                            rules={{ required: "Category is required" }}
                                            render={({ field }) => (
                                                <SelectField label="Category *" {...field}>
                                                    <option value="">Select category</option>
                                                    {categories.map((item: any) => (
                                                        <option key={item} value={item}>{item}</option>
                                                    ))}
                                                </SelectField>
                                            )}
                                        />
                                    )}
                                </Field>

                                <Field error={errors.subCategory?.message as string}>
                                    {isLoading ? (
                                        <p className="text-sm text-slate-500">Loading...</p>
                                    ) : (
                                        <Controller
                                            name="subCategory"
                                            control={control}
                                            rules={{ required: "Sub-category is required" }}
                                            render={({ field }) => (
                                                <SelectField label="Sub Category *" {...field}>
                                                    <option value="">Select sub-category</option>
                                                    {subcategories.map((item: any) => (
                                                        <option key={item} value={item}>{item}</option>
                                                    ))}
                                                </SelectField>
                                            )}
                                        />
                                    )}
                                </Field>
                            </div>
                        </Section>

                        {/* Pricing & Stock */}
                        <Section title="Pricing & Inventory">
                            <div className="grid grid-cols-3 gap-4">
                                <Field error={errors.regular_price?.message as string}>
                                    <Input
                                        label="Regular Price *"
                                        placeholder="0.00"
                                        {...register("regular_price", {
                                            valueAsNumber: true,
                                            required: "Required",
                                            min: { value: 1, message: "Must be > 0" },
                                            validate: (v) => {
                                                if (isNaN(v)) return "Must be a number";
                                                const sp = watch("sale_price");
                                                if (sp && v <= sp) return "Must be higher than sale price";
                                                return true;
                                            },
                                        })}
                                    />
                                </Field>
                                <Field error={errors.sale_price?.message as string}>
                                    <Input
                                        type="number"
                                        label="Sale Price"
                                        placeholder="0.00"
                                        {...register("sale_price", {
                                            valueAsNumber: true,
                                            validate: (v) => {
                                                if (!v || isNaN(v)) return true;
                                                const rp = watch("regular_price");
                                                if (rp && v >= rp) return "Must be less than regular price";
                                                return true;
                                            },
                                        })}
                                    />
                                </Field>
                                <Field error={errors.stock?.message as string}>
                                    <Input
                                        type="number"
                                        label="Stock Quantity *"
                                        placeholder="0"
                                        {...register("stock", {
                                            valueAsNumber: true,
                                            required: "Required",
                                            min: { value: 0, message: "Must be ≥ 0" },
                                        })}
                                    />
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Field error={errors.cash_on_delivery?.message as string}>
                                    <SelectField
                                        label="Cash on Delivery *"
                                        {...register("cash_on_delivery", { required: "Required" })}
                                    >
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </SelectField>
                                </Field>
                                <Field error={errors.status?.message as string}>
                                    <SelectField
                                        label="Status *"
                                        {...register("status", { required: "Required" })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </SelectField>
                                </Field>
                            </div>
                        </Section>

                        {/* Variants */}
                        <Section title="Variants" subtitle="Select available colors and sizes">
                            <ColorSelector control={control} errors={errors} />
                            <SizeSelector control={control} errors={errors} />
                        </Section>

                        {/* Full Description */}
                        <Section title="Full Description" subtitle="Enter a detailed description">
                            <Field error={errors.detailed_description?.message as string}>
                                <Controller
                                    name="detailed_description"
                                    control={control}
                                    rules={{
                                        required: "Description is required",
                                        validate: (v) => {
                                            const text = v?.replace(/<[^>]*>/g, "") || "";
                                            return text.trim().length > 0 || "Description is required";
                                        },
                                    }}
                                    render={({ field: { onChange, value } }) => (
                                        <RichTextEditor value={value} onChange={onChange} />
                                    )}
                                />
                            </Field>
                        </Section>

                        {/* Additional Details */}
                        <Section title="Specifications & Properties">
                            <CustomSpecifications control={control} errors={errors} />
                            <div className="border-t border-slate-100 pt-5">
                                <CustomProperties control={control} errors={errors} />
                            </div>
                        </Section>

                        {/* Media */}
                        <Section title="Media">
                            <Field error={errors.video_url?.message as string}>
                                <Input
                                    label="YouTube Embed URL"
                                    placeholder="https://www.youtube.com/embed/..."
                                    {...register("video_url", {
                                        pattern: {
                                            value: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/[^\s&]+$/,
                                            message: "Invalid YouTube embed URL",
                                        },
                                    })}
                                />
                            </Field>
                        </Section>

                        {/* Discount Codes */}
                        <Section title="Discount Codes" subtitle="Select applicable discount codes">
                            {discountLoading ? (
                                <p className="text-sm text-slate-500">Loading discount codes...</p>
                            ) : discount_codes.length === 0 ? (
                                <p className="text-sm text-slate-400">No discount codes available.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {discount_codes.map((dc: any) => {
                                        const isSelected = (watch("discount_codes") || []).includes(dc.id);
                                        return (
                                            <button
                                                key={dc.id}
                                                type="button"
                                                onClick={() => {
                                                    const current = watch("discount_codes") || [];
                                                    setValue(
                                                        "discount_codes",
                                                        isSelected
                                                            ? current.filter((id: string) => id !== dc.id)
                                                            : [...current, dc.id],
                                                        { shouldDirty: true }
                                                    );
                                                }}
                                                className={`text-sm font-medium px-3 py-1.5 rounded-xl border transition-all
                                                    ${isSelected
                                                        ? "bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-200"
                                                        : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
                                                    }`}
                                            >
                                                {dc.public_name}{" "}
                                                <span className="opacity-75">
                                                    ({dc.discountType === "percentage" ? `${dc.discountValue}%` : `Rs.${dc.discountValue}`})
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </Section>

                        {/* Bottom submit */}
                        <div className="flex gap-3 justify-end pt-2">
                            {isChanged && (
                                <button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    <Save size={15} />
                                    Save Draft
                                </button>
                            )}
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-all shadow-md shadow-violet-200"
                            >
                                <Sparkles size={15} />
                                Publish Product
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Enhancement Modal */}
                {openImageModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                            onClick={() => setOpenImageModal(false)}
                        />

                        {/* Modal Content */}
                        <div className="relative w-full max-w-5xl bg-white rounded-[28px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">

                            {/* Main Preview Area */}
                            <div className="flex-1 bg-slate-50 relative min-h-[300px] md:min-h-[500px] flex items-center justify-center p-6">
                                <div className="absolute top-6 left-6 z-10">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur shadow-sm border border-slate-100">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Preview Mode</span>
                                    </div>
                                </div>

                                <div className="relative w-full h-full max-h-[450px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                    <Image
                                        src={selectedImage}
                                        alt="AI Enhancement Preview"
                                        fill
                                        unoptimized
                                        className="object-contain"
                                    />
                                </div>
                            </div>

                            {/* Sidebar - AI Tools */}
                            <div className="w-full md:w-[320px] bg-white border-l border-slate-100 flex flex-col">
                                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">AI Enhance</h2>
                                        <p className="text-xs text-slate-400 mt-0.5">Powered by eShop Vision AI</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setOpenImageModal(false)}
                                        className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {/* Tool Groups */}
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Enhancements</h3>
                                        <div className="grid gap-3">
                                            {enhancement.map((tool) => {
                                                const Icon = tool.icon;
                                                return <button
                                                    key={tool.effect}
                                                    type="button"
                                                    onClick={() => setActiveEffect(tool.effect)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all group text-left ${tool.effect === activeEffect ? "bg-violet-50 border-violet-200" : ""}`}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl ${tool.bg} flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform`}>
                                                        <Icon size={16} />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-700">{tool.label}</span>
                                                </button>
                                            }

                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Settings */}
                                    {/* <div className="space-y-4">
                                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Settings</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                                    <span>Intensity</span>
                                                    <span>80%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full w-[80%] bg-violet-500 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}
                                </div>

                                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                                    <button
                                        type="button"
                                        disabled={processing}
                                        className="w-full h-12 bg-violet-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all active:scale-[0.98]"
                                        onClick={applyTransformation}
                                    >
                                        Apply Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default Create;