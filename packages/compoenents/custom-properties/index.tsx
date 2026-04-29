"use client";
import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { PlusCircle, X, Tag } from "lucide-react";

const CustomProperties = ({ control }: any) => {
    const [properties, setProperties] = useState<
        { label: string; values: string[]; input: string }[]
    >([]);
    const [newLabel, setNewLabel] = useState("");

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Tag size={14} className="text-emerald-600" />
                </div>
                <label className="text-sm font-semibold text-slate-700 tracking-wide">
                    Custom Properties
                </label>
            </div>

            <Controller
                name="custom_properties"
                control={control}
                render={({ field }) => {
                    const isInitialized = React.useRef(false);

                    useEffect(() => {
                        if (!isInitialized.current && field.value && Array.isArray(field.value) && field.value.length > 0) {
                            setProperties(field.value.map((p: any) => ({ ...p, input: "" })));
                            isInitialized.current = true;
                        }
                    }, [field.value]);

                    const syncForm = (newProps: any[]) => {
                        field.onChange(newProps.map(({ input, ...rest }) => rest));
                    };

                    const addProperty = () => {
                        if (!newLabel.trim()) return;
                        const updated = [...properties, { label: newLabel, values: [], input: "" }];
                        setProperties(updated);
                        syncForm(updated);
                        setNewLabel("");
                    };

                    const addValue = (index: number) => {
                        if (!properties[index].input.trim()) return;
                        const updated = [...properties];
                        updated[index] = {
                            ...updated[index],
                            values: [...updated[index].values, updated[index].input],
                            input: "",
                        };
                        setProperties(updated);
                        syncForm(updated);
                    };

                    const removeProperty = (index: number) => {
                        const updated = properties.filter((_, i) => i !== index);
                        setProperties(updated);
                        syncForm(updated);
                    };

                    const removeValue = (pIndex: number, vIndex: number) => {
                        const updated = [...properties];
                        updated[pIndex] = {
                            ...updated[pIndex],
                            values: updated[pIndex].values.filter((_, i) => i !== vIndex),
                        };
                        setProperties(updated);
                        syncForm(updated);
                    };

                    return (
                        <div className="space-y-3">
                            {/* Existing properties */}
                            {properties.map((item, index) => (
                                <div
                                    key={index}
                                    className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeProperty(index)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    {/* Value tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {item.values.map((val, i) => (
                                            <span
                                                key={i}
                                                className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full"
                                            >
                                                {val}
                                                <button
                                                    type="button"
                                                    onClick={() => removeValue(index, i)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={11} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    {/* Add value input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add a value..."
                                            value={item.input}
                                            onChange={(e) => {
                                                const updated = [...properties];
                                                updated[index] = { ...updated[index], input: e.target.value };
                                                setProperties(updated);
                                            }}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addValue(index))}
                                            className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addValue(index)}
                                            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Add new property */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="New property label (e.g. Material, Finish)"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addProperty())}
                                    className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={addProperty}
                                    className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                                >
                                    <PlusCircle size={15} />
                                    Add
                                </button>
                            </div>
                        </div>
                    );
                }}
            />
        </div>
    );
};

export default CustomProperties;