"use client";
import React from "react";
import { Controller } from "react-hook-form";

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const SizeSelector = ({ control, errors }: any) => {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                Available Sizes
            </label>
            <Controller
                name="sizes"
                control={control}
                render={({ field }) => (
                    <div className="flex gap-2 flex-wrap">
                        {sizes.map((size) => {
                            const isSelected = (field.value || []).includes(size);
                            return (
                                <button
                                    type="button"
                                    key={size}
                                    onClick={() =>
                                        field.onChange(
                                            isSelected
                                                ? field.value.filter((s: string) => s !== size)
                                                : [...(field.value || []), size]
                                        )
                                    }
                                    className={`min-w-[48px] h-10 px-3 rounded-xl text-sm font-semibold transition-all duration-200
                    ${isSelected
                                            ? "bg-violet-600 text-white shadow-md shadow-violet-200 scale-105"
                                            : "bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-600"
                                        }`}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                )}
            />
        </div>
    );
};

export default SizeSelector;