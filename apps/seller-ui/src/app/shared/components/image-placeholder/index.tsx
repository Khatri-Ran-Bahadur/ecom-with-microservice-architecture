"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Upload, X, Wand2, Pencil } from "lucide-react";

interface IImagePlaceholder {
    size?: string;
    small?: boolean;
    onImageChange: (file: File, index: number) => void;
    onRemove?: (index: number) => void;
    defaultImage?: string | null;
    index?: number | null;
    images?: any;
    setOpenImageModal: (open: boolean) => void;
    setSelectedImage?: (e: string) => void;
    pictureUploadingLoader: boolean;
}

const ImagePlaceholder = ({
    size,
    small,
    onImageChange,
    onRemove,
    defaultImage = null,
    index = null,
    setOpenImageModal,
    setSelectedImage,
    images,
    pictureUploadingLoader,
}: IImagePlaceholder) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    React.useEffect(() => {
        if (images && index !== null && images[index]?.file_url) {
            setImagePreview(images[index].file_url);
        } else if (defaultImage) {
            setImagePreview(defaultImage);
        }
    }, [images, index, defaultImage]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files![0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            onImageChange(file, index || 0);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setImagePreview(URL.createObjectURL(file));
            onImageChange(file, index || 0);
        }
    };

    return (
        <div
            className={`relative group rounded-2xl overflow-hidden border-2 transition-all duration-300
        ${isDragging ? "border-violet-500 bg-violet-50 scale-[1.01]" : "border-dashed border-slate-200 bg-slate-50/50"}
        ${small ? "h-[130px]" : "h-[320px]"}
      `}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <input
                type="file"
                className="hidden"
                id={`image-upload-${index}`}
                onChange={handleImageChange}
                accept="image/*"
            />

            {imagePreview ? (
                <>
                    <Image
                        src={imagePreview}
                        alt="preview"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                        <button
                            type="button"
                            disabled={pictureUploadingLoader}
                            onClick={() => {
                                if (setSelectedImage && images && images[index]) {
                                    setOpenImageModal(true);
                                    setSelectedImage(images[index]?.file_url);
                                }
                            }}

                            className="bg-white/90 backdrop-blur-sm text-violet-600 rounded-xl p-2.5 hover:bg-white transition-colors shadow-lg"
                            title="AI Enhance"
                        >
                            <Wand2 size={16} />
                        </button>
                        <label
                            htmlFor={`image-upload-${index}`}
                            className="bg-white/90 backdrop-blur-sm text-slate-700 rounded-xl p-2.5 hover:bg-white transition-colors shadow-lg cursor-pointer"
                            title="Replace"
                        >
                            <Pencil size={16} />
                        </label>
                        <button
                            type="button"
                            disabled={pictureUploadingLoader}
                            onClick={() => { setImagePreview(null); onRemove?.(index ?? -1); }}
                            className="bg-white/90 backdrop-blur-sm text-red-500 rounded-xl p-2.5 hover:bg-white transition-colors shadow-lg"
                            title="Remove"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </>
            ) : (
                <label
                    htmlFor={`image-upload-${index}`}
                    className="flex flex-col items-center justify-center h-full cursor-pointer gap-3 p-4 select-none"
                >
                    <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center">
                        <Upload size={18} className="text-violet-500" />
                    </div>
                    {!small && (
                        <>
                            <p className="text-sm font-medium text-slate-600">Drop image here or <span className="text-violet-600">browse</span></p>
                            <p className="text-xs text-slate-400">{size} · Max 2MB</p>
                        </>
                    )}
                </label>
            )}
        </div>
    );
};

export default ImagePlaceholder;