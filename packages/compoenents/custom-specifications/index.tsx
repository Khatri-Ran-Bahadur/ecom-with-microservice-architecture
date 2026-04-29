"use client";
import React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { PlusCircle, Trash2, Zap } from "lucide-react";
import Input from "packages/compoenents/input";

const CustomSpecifications = ({ control, errors }: any) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "custom_specifications",
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Zap size={14} className="text-amber-600" />
                    </div>
                    <label className="text-sm font-semibold text-slate-700 tracking-wide">
                        Custom Specifications
                    </label>
                </div>
                <button
                    type="button"
                    onClick={() => append({ name: "", value: "" })}
                    className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <PlusCircle size={14} />
                    Add Spec
                </button>
            </div>

            {fields.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-sm text-slate-400">No specifications yet. Click "Add Spec" to begin.</p>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {fields.map((field, index) => (
                    <div
                        key={field.id}
                        className="flex gap-3 items-start group animate-in slide-in-from-top-2"
                    >
                        <div className="flex-1 grid grid-cols-2 gap-3">
                            <Controller
                                name={`custom_specifications.${index}.name`}
                                control={control}
                                rules={{ required: "Name required" }}
                                render={({ field }) => (
                                    <Input {...field} label="Spec Name" placeholder="e.g. Battery Life" />
                                )}
                            />
                            <Controller
                                name={`custom_specifications.${index}.value`}
                                control={control}
                                rules={{ required: "Value required" }}
                                render={({ field }) => (
                                    <Input {...field} label="Value" placeholder="e.g. 10 hours" />
                                )}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="mt-6 p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomSpecifications;