"use client";
import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Plus, Check } from "lucide-react";

export const defaultColors = [
    "#0F172A", "#FFFFFF", "#EF4444", "#22C55E",
    "#3B82F6", "#EAB308", "#A855F7", "#06B6D4",
    "#F97316", "#EC4899", "#64748B", "#10B981",
];

const ColorSelector = ({ control, errors }: { control: any; errors: any }) => {
    const [customColors, setCustomColors] = useState<string[]>([]);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [newColor, setNewColor] = useState("#6366f1");

    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 tracking-wide">
                Available Colors
            </label>

            <Controller
                name="colors"
                control={control}
                render={({ field }) => (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                        <div className="flex flex-wrap gap-2.5">
                            {[...defaultColors, ...customColors].map((color) => {
                                const isSelected = (field.value || []).includes(color);
                                const isLight = ["#FFFFFF", "#EAB308", "#FEF9C3"].includes(color);

                                return (
                                    <button
                                        type="button"
                                        key={color}
                                        title={color}
                                        onClick={() =>
                                            field.onChange(
                                                isSelected
                                                    ? field.value.filter((c: string) => c !== color)
                                                    : [...(field.value || []), color]
                                            )
                                        }
                                        className={`relative w-9 h-9 rounded-xl transition-all duration-200 flex items-center justify-center
                      ${isSelected ? "ring-2 ring-offset-2 ring-violet-500 scale-110" : "hover:scale-105 hover:shadow-md"}
                      ${isLight ? "border border-slate-300" : "border border-transparent"}
                    `}
                                        style={{ backgroundColor: color }}
                                    >
                                        {isSelected && (
                                            <Check
                                                size={14}
                                                className={isLight ? "text-slate-800" : "text-white"}
                                                strokeWidth={3}
                                            />
                                        )}
                                    </button>
                                );
                            })}

                            {/* Add custom color */}
                            <button
                                type="button"
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className="w-9 h-9 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-violet-400 hover:text-violet-500 transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Custom color picker panel */}
                        {showColorPicker && (
                            <div className="mt-4 flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="relative">
                                    <input
                                        type="color"
                                        value={newColor}
                                        onChange={(e) => setNewColor(e.target.value)}
                                        className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                                    />
                                </div>
                                <span className="font-mono text-sm text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                    {newColor}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCustomColors([...customColors, newColor]);
                                        setShowColorPicker(false);
                                    }}
                                    className="ml-auto bg-violet-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-violet-700 transition-colors font-medium"
                                >
                                    Add Color
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowColorPicker(false)}
                                    className="text-slate-400 hover:text-slate-600 text-sm px-2 py-1.5 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            />
        </div>
    );
};

export default ColorSelector;