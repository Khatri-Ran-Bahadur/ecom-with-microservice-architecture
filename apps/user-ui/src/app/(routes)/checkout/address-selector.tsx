"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { MapPin, CheckCircle2, Plus } from "lucide-react";
import Link from "next/link";

interface Address {
    id: string;
    label: string;
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
}

interface AddressSelectorProps {
    selectedAddressId: string | null;
    onSelect: (id: string) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ selectedAddressId, onSelect }) => {
    const { data: addresses = [], isLoading } = useQuery({
        queryKey: ["addresses"],
        queryFn: async () => {
            const res = await axiosInstance.get("/auth/api/get-address");
            return res.data.address || [];
        },
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                {[1, 2].map((i) => (
                    <div key={i} className="h-32 bg-slate-100 rounded-2xl" />
                ))}
            </div>
        );
    }

    if (addresses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                <MapPin className="text-slate-300 mb-2" size={32} />
                <p className="text-slate-500 font-medium text-sm">No addresses saved</p>
                <Link 
                    href="/profile?tab=addresses"
                    className="mt-3 text-xs font-bold text-violet-600 hover:underline flex items-center gap-1"
                >
                    <Plus size={14} /> Add new address in profile
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address: Address) => (
                <div
                    key={address.id}
                    onClick={() => onSelect(address.id)}
                    className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 
                        ${selectedAddressId === address.id
                            ? "border-violet-600 bg-violet-50/30"
                            : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                        }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full 
                            ${selectedAddressId === address.id ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                            {address.label}
                        </span>
                        {selectedAddressId === address.id && (
                            <CheckCircle2 className="text-violet-600" size={16} />
                        )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{address.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{address.street}</p>
                    <p className="text-[11px] text-slate-400">
                        {address.city}, {address.state} {address.zip}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default AddressSelector;
