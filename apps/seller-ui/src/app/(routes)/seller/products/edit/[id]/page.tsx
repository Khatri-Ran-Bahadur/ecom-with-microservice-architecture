"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { ChevronRight, AlertCircle, Package, Save, X } from "lucide-react";
import ImagePlaceholder from "../../../../../shared/components/image-placeholder";
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
import { Spinner } from "apps/seller-ui/src/app/shared/confirmation";

// Reuse the same UI components as Create
const Section = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode; }) => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="p-6 space-y-5">{children}</div>
    </div>
);

const Field = ({ children, error }: { children: React.ReactNode; error?: string }) => (
    <div>
        {children}
        {error && <p className="flex items-center gap-1 text-xs text-red-500 mt-2 font-bold italic tracking-tight"><AlertCircle size={11} /> {error}</p>}
    </div>
);

const SelectField = ({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
        <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all appearance-none cursor-pointer" {...props}>
            {children}
        </select>
    </div>
);

interface UploadedImage {
    fieldId: string;
    file_url: string;
}

const EditProductPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [openImageModal, setOpenImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [serverError, setServerError] = useState<string | null>(null);
    const [isChanged, setIsChanged] = useState(false);
    const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
    const [activeEffect, setActiveEffect] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);

    const { register, control, watch, setValue, handleSubmit, reset, formState: { errors } } = useForm();

    // Fetch product data
    const { data: product, isLoading: productLoading } = useQuery({
        queryKey: ["product", id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/products/api/get-product/${id}`);
            return res.data?.product;
        },
    });

    // Populate form
    useEffect(() => {
        if (product) {
            reset({
                ...product,
                tags: Array.isArray(product.tags) ? product.tags.join(", ") : product.tags,
                cash_on_delivery: product.cash_on_delivery ? "yes" : "no",
                status: product.status || "Active",
                discount_codes: product.discount_codes || [],
                detailed_description: product.detailed_description || "",
                custom_properties: product.custom_properties || [],
                custom_specifications: product.custom_specifications || [],
            });
            
            const prodImages = (product.images || []).map((img: any) => ({
                fieldId: img.fileId,
                file_url: img.url
            }));
            
            if (prodImages.length < 8) {
                setImages([...prodImages, null]);
            } else {
                setImages(prodImages);
            }
            setValue("images", prodImages);
        }
    }, [product, reset, setValue]);

    const { data: categoriesData } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await axiosInstance.get("/products/api/get-categories");
            return res.data;
        },
    });

    const categories = categoriesData?.categories || [];
    const subCategoriesData = categoriesData?.subCategories || {};
    const selectedCategory = watch("category");

    const subcategories = useMemo(
        () => (selectedCategory ? subCategoriesData[selectedCategory] || [] : []),
        [selectedCategory, subCategoriesData]
    );

    const { data: discount_codes_list = [] } = useQuery({
        queryKey: ["discount-codes"],
        queryFn: async () => {
            const res = await axiosInstance.get("products/api/get-discount-codes");
            return res?.data?.discount_codes || [];
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await axiosInstance.put(`/products/api/update-product/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            router.push("/seller/products");
        },
        onError: (error: AxiosError) => {
            setServerError((error.response?.data as { message?: string })?.message || "Something went wrong.");
        },
    });

    const onSubmit = (data: any) => {
        updateMutation.mutate(data);
    };

    const handleImageChange = async (file: File | null, index: number) => {
        if (!file) return;
        setPictureUploadingLoader(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const response = await axiosInstance.post("products/api/upload-product-image", { fileName: reader.result });
                const updatedImages = [...images];
                updatedImages[index] = { fieldId: response.data.fileId, file_url: response.data.file_url };
                if (index === images.length - 1 && updatedImages.length < 8) updatedImages.push(null);
                setImages(updatedImages);
                setValue("images", updatedImages.filter(img => img !== null));
                setIsChanged(true);
            };
        } finally {
            setPictureUploadingLoader(false);
        }
    };

    const handleRemoveImage = async (index: number) => {
        const updatedImages = [...images];
        const imageToDelete = updatedImages[index];
        if (imageToDelete?.fieldId) {
            await axiosInstance.delete("products/api/delete-product-image", { data: { fileId: imageToDelete.fieldId } });
        }
        updatedImages.splice(index, 1);
        if (!updatedImages.includes(null) && updatedImages.length < 8) updatedImages.push(null);
        setImages(updatedImages);
        setValue("images", updatedImages.filter(img => img !== null));
        setIsChanged(true);
    };

    const applyTransformation = async () => {
        if (!selectedImage || !activeEffect || processing) return;
        setProcessing(true);
        try {
            const url = new URL(selectedImage);
            const tr = url.searchParams.get("tr");
            url.searchParams.set("tr", tr ? `${tr}:${activeEffect}` : activeEffect);
            setSelectedImage(url.toString());
        } finally {
            setProcessing(false);
        }
    };

    if (productLoading) return <div className="h-screen w-full flex items-center justify-center bg-[#F5F4F0]"><Spinner color="#8B5CF6" /></div>;

    return (
        <div className="min-h-screen bg-[#F5F4F0] mb-20" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <form onSubmit={handleSubmit(onSubmit)} onChange={() => setIsChanged(true)} className="max-w-7xl mx-auto px-6 py-10 space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
                                <Package size={18} className="text-white" />
                            </div>
                            <nav className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest overflow-x-auto whitespace-nowrap scrollbar-hide max-w-[250px] md:max-w-none">
                                <button type="button" onClick={() => router.push("/seller/products")} className="hover:text-violet-600 transition-colors flex-shrink-0">Inventory</button>
                                <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                                <span className="text-slate-800 flex-shrink-0">Edit Product</span>
                            </nav>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight line-clamp-1">Edit: {product?.title}</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">Update your product details and availability.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button type="submit" disabled={updateMutation.isPending} className="flex-1 md:flex-none flex items-center justify-center gap-2.5 h-12 px-8 rounded-2xl bg-violet-600 text-white text-sm font-black hover:bg-violet-700 transition-all shadow-xl shadow-violet-200 active:scale-[0.98]">
                            {updateMutation.isPending ? <Spinner size="sm" color="white" /> : <Save size={16} />}
                            Update Product
                        </button>
                    </div>
                </div>

                {serverError && <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-3xl px-6 py-4 text-sm text-red-600 font-bold"><AlertCircle size={18} />{serverError}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
                    <div className="space-y-4 sticky top-10">
                        <Section title="Product Media" subtitle="Manage Visual Assets">
                            <ImagePlaceholder size="765 × 850" small={false} setOpenImageModal={setOpenImageModal} index={0} images={images} onImageChange={handleImageChange} setSelectedImage={setSelectedImage} pictureUploadingLoader={pictureUploadingLoader} onRemove={handleRemoveImage} />
                            <div className="grid grid-cols-2 gap-3">
                                {images.slice(1).map((_, index) => (
                                    <ImagePlaceholder key={index + 1} size="765 × 850" small setOpenImageModal={setOpenImageModal} index={index + 1} images={images} onImageChange={handleImageChange} setSelectedImage={setSelectedImage} pictureUploadingLoader={pictureUploadingLoader} onRemove={handleRemoveImage} />
                                ))}
                            </div>
                        </Section>
                    </div>

                    <div className="space-y-6">
                        <Section title="Core Information">
                            <Field error={errors.title?.message as string}><Input label="Product Title *" placeholder="Name your product" {...register("title", { required: "Title is required" })} /></Field>
                            <Field error={errors.short_description?.message as string}><Input type="textarea" rows={4} label="Brief Description *" className="resize-none" {...register("short_description", { required: "Required" })} /></Field>
                            <div className="grid grid-cols-2 gap-6">
                                <Field error={errors.brand?.message as string}><Input label="Brand / Manufacturer *" {...register("brand", { required: "Required" })} /></Field>
                                <Field error={errors.warranty?.message as string}><Input label="Warranty Policy *" {...register("warranty", { required: "Required" })} /></Field>
                            </div>
                            <Field error={errors.tags?.message as string}><Input label="Search Tags *" placeholder="Comma separated" {...register("tags", { required: "Required" })} /></Field>
                            <Field error={errors.slug?.message as string}><Input label="Custom Slug *" {...register("slug", { required: "Required" })} /></Field>
                        </Section>

                        <Section title="Classification">
                            <div className="grid grid-cols-2 gap-6">
                                <Field error={errors.category?.message as string}>
                                    <Controller name="category" control={control} rules={{ required: "Required" }} render={({ field }) => (
                                        <SelectField label="Category *" {...field}>
                                            <option value="">Select Main Category</option>
                                            {categories.map((item: any) => <option key={item} value={item}>{item}</option>)}
                                        </SelectField>
                                    )} />
                                </Field>
                                <Field error={errors.subCategory?.message as string}>
                                    <Controller name="subCategory" control={control} rules={{ required: "Required" }} render={({ field }) => (
                                        <SelectField label="Sub Category *" {...field}>
                                            <option value="">Select Sub Category</option>
                                            {subcategories.map((item: any) => <option key={item} value={item}>{item}</option>)}
                                        </SelectField>
                                    )} />
                                </Field>
                            </div>
                        </Section>

                        <Section title="Pricing & Availability">
                            <div className="grid grid-cols-3 gap-6">
                                <Field error={errors.regular_price?.message as string}><Input label="List Price *" {...register("regular_price", { required: "Required" })} /></Field>
                                <Field error={errors.sale_price?.message as string}><Input label="Promo Price" {...register("sale_price")} /></Field>
                                <Field error={errors.stock?.message as string}><Input type="number" label="Available Stock *" {...register("stock", { required: "Required" })} /></Field>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <Field error={errors.cash_on_delivery?.message as string}>
                                    <SelectField label="Cash on Delivery *" {...register("cash_on_delivery")}>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </SelectField>
                                </Field>
                                <Field error={errors.status?.message as string}>
                                    <SelectField label="Status *" {...register("status")}>
                                        <option value="Active">Active</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Draft">Draft</option>
                                    </SelectField>
                                </Field>
                            </div>
                        </Section>

                        <Section title="Attributes & Variants">
                            <ColorSelector control={control} errors={errors} />
                            <div className="pt-6 border-t border-slate-100">
                                <SizeSelector control={control} errors={errors} />
                            </div>
                        </Section>

                        <Section title="Detailed Narrative">
                            <Field error={errors.detailed_description?.message as string}>
                                <Controller name="detailed_description" control={control} rules={{ required: "Required" }} render={({ field: { onChange, value } }) => (
                                    <RichTextEditor value={value} onChange={onChange} />
                                )} />
                            </Field>
                        </Section>

                        <Section title="Technical Data">
                            <CustomSpecifications control={control} errors={errors} />
                            <div className="pt-6 border-t border-slate-100">
                                <CustomProperties control={control} errors={errors} />
                            </div>
                        </Section>

                         <Section title="Promotional Codes" subtitle="Active Offers">
                            <div className="flex flex-wrap gap-2.5">
                                {discount_codes_list.map((dc: any) => {
                                    const isSelected = (watch("discount_codes") || []).includes(dc.id);
                                    return (
                                        <button key={dc.id} type="button" onClick={() => {
                                            const current = watch("discount_codes") || [];
                                            setValue("discount_codes", isSelected ? current.filter((id: string) => id !== dc.id) : [...current, dc.id], { shouldDirty: true });
                                        }} className={`text-xs font-black px-4 py-2 rounded-2xl border uppercase tracking-wider transition-all shadow-sm ${isSelected ? "bg-violet-600 text-white border-violet-600 shadow-violet-200" : "bg-white text-slate-500 border-slate-200 hover:border-violet-300"}`}>
                                            {dc.public_name}
                                        </button>
                                    );
                                })}
                            </div>
                        </Section>
                    </div>
                </div>
            </form>

            {openImageModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-opacity animate-in fade-in" onClick={() => setOpenImageModal(false)} />
                    <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20 animate-in zoom-in-95">
                        <div className="flex-1 bg-slate-50 relative flex items-center justify-center p-12">
                            <div className="relative w-full h-full max-h-[500px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                                <Image src={selectedImage} alt="Preview" fill unoptimized className="object-contain" />
                            </div>
                        </div>
                        <div className="w-full md:w-[360px] bg-white border-l border-slate-100 flex flex-col">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h2 className="text-xl font-black tracking-tight">AI Vision Enhance</h2>
                                <button onClick={() => setOpenImageModal(false)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors"><X size={24} className="text-slate-400" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {enhancement.map((tool) => (
                                    <button key={tool.effect} onClick={() => setActiveEffect(tool.effect)} className={`w-full flex items-center gap-4 p-4 rounded-3xl border transition-all ${tool.effect === activeEffect ? "bg-violet-50 border-violet-200 shadow-sm" : "border-slate-100 hover:border-violet-100 hover:bg-slate-50/50"}`}>
                                        <div className={`w-12 h-12 rounded-2xl ${tool.bg} flex items-center justify-center ${tool.color} shadow-sm`}><tool.icon size={20} /></div>
                                        <span className="text-sm font-black text-slate-800 tracking-tight">{tool.label}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                                <button disabled={processing} className="w-full h-14 bg-violet-600 text-white rounded-3xl text-sm font-black shadow-xl shadow-violet-200 hover:bg-violet-700 transition-all active:scale-[0.985] disabled:opacity-50" onClick={applyTransformation}>Apply Transformation</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditProductPage;
