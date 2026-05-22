"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { Plus, MapPin, CheckCircle2, X, Edit, Trash2, Star, ChevronDown } from "lucide-react";
import { countries } from "@packages/libs/countries";
import { ConfirmModal } from "@packages/components/ConfirmModal";


const AddressType = {
    Home: "Home",
    Work: "Work",
    Other: "Other",
}

/**
 * Interface representing the structure of a User Address
 */
interface Address {
    id?: string;
    label: keyof typeof AddressType;
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
}

/**
 * Shared Modal Component: Centered, backdrop-blur, and animated feel
 */
const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            {/* Modal Content */}
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
                <div className="p-8">{children}</div>
            </div>
        </div>
    );
};

const Addresses = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

    /**
     * React Hook Form initialization
     * Handles validation and default state
     */
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Address>({
        defaultValues: {
            label: AddressType.Home as keyof typeof AddressType,
            country: "Nepal",
            isDefault: false,
        },
    });

    /**
     * Fetch Query: Gets the list of addresses from the API
     */
    const { data: addresses = [], isLoading, isError } = useQuery({
        queryKey: ["addresses"],
        queryFn: async () => {
            const res = await axiosInstance.get("/auth/api/get-address");
            return res.data.address || [];
        },
    });

    /**
     * Mutation: Handles adding a new address
     */
    const { mutate: addAddress, isPending: isAdding } = useMutation({
        mutationFn: async (data: Address) => {
            const res = await axiosInstance.post("/auth/api/add-address", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            toast.success("Address added successfully");
            reset();
            setShowModal(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to add address");
        },
    });

    /**
     * Mutation: Handles updating an existing address
     */
    const { mutate: updateAddress, isPending: isUpdating } = useMutation({
        mutationFn: async (data: Address) => {
            const res = await axiosInstance.post("/auth/api/update-address", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            toast.success("Address updated successfully");
            reset();
            setShowModal(false);
            setEditingAddress(null);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update address");
        },
    });

    /**
     * Mutation: Handles deleting an address
     */
    const { mutate: deleteAddress, isPending: isDeleting } = useMutation({
        mutationFn: async (id: string) => {
            const res = await axiosInstance.post("/auth/api/delete-address", { id });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            toast.success("Address deleted successfully");
            setIsDeleteModalOpen(false);
            setDeletingAddressId(null);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to delete address");
        },
    });

    /**
     * Mutation: Handles setting an address as default
     */
    const { mutate: setDefaultAddress } = useMutation({
        mutationFn: async (id: string) => {
            const res = await axiosInstance.post("/auth/api/set-default-address", { id });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            toast.success("Default address updated");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to set default address");
        },
    });

    const onSubmit = (data: Address) => {
        if (editingAddress) {
            updateAddress({ ...data, id: editingAddress.id });
        } else {
            addAddress(data);
        }
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        reset(address);
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingAddress(null);
        reset({
            label: "Home",
            name: "",
            street: "",
            city: "",
            state: "",
            zip: "",
            country: "Nepal",
            isDefault: false,
        });
        setShowModal(true);
    };

    const handleDelete = (id: string) => {
        setIsDeleteModalOpen(true);
        setDeletingAddressId(id);
    }

    const isPending = isAdding || isUpdating;

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-10">
            <div className="mx-auto max-w-5xl">

                {/* --- HEADER SECTION --- */}
                <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Shipping Addresses</h1>
                        <p className="text-slate-500 mt-1">Manage your delivery locations and default shipping info.</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-800 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Add New Address
                    </button>
                </header>

                {/* --- CONTENT STATES --- */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                        {[1, 2].map(i => <div key={i} className="h-48 bg-gray-200 rounded-3xl" />)}
                    </div>
                )}

                {isError && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-600 text-center">
                        Unable to load addresses. Please try again later.
                    </div>
                )}

                {!isLoading && addresses.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-3xl">
                        <MapPin className="text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 font-medium">No addresses saved yet</p>
                    </div>
                )}

                {/* --- ADDRESS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.isArray(addresses) && addresses.map((address: Address) => (
                        <div
                            key={address.id}
                            className={`group relative overflow-hidden rounded-3xl border-2 p-6 transition-all duration-300 
                                ${address.isDefault
                                    ? "border-gray-600 bg-white shadow-xl shadow-gray-100"
                                    : "border-transparent bg-white shadow-sm hover:shadow-md hover:border-gray-200"
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full 
                                        ${address.isDefault ? "bg-green-700 text-white" : "bg-gray-100 text-gray-500"}`}>
                                        {address.label}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 pt-2">{address.name}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {address.isDefault && <CheckCircle2 className="text-violet-900" size={20} />}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(address)}
                                            className="p-2 text-violet-400 hover:text-violet-900 hover:bg-violet-50 rounded-full transition-all"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.id!)}
                                            className="p-2 text-violet-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 space-y-1 text-sm leading-relaxed text-gray-600">
                                <p className="font-medium text-black-300">{address.street}</p>
                                <p>{address.city}, {address.state} {address.zip}</p>
                                <p className="text-gray-600">{address.country}</p>
                            </div>

                            {!address.isDefault && (
                                <button
                                    onClick={() => setDefaultAddress(address.id!)}
                                    className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    <Star size={14} />
                                    Set as default
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* --- ADD/EDIT ADDRESS MODAL --- */}
                {showModal && (
                    <Modal onClose={() => { setShowModal(false); setEditingAddress(null); }}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {editingAddress ? "Edit Address" : "Add Address"}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    {editingAddress ? "Update your delivery location details." : "Enter the details for your new delivery location."}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 ml-1">Full Name</label>
                                        <input
                                            {...register("name", { required: "Name is required" })}
                                            placeholder="John Doe"
                                            className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all outline-none"
                                        />
                                        {errors.name && <p className="text-[10px] text-red-500 ml-1">{errors.name.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 ml-1">Label</label>
                                        <div className="relative">
                                            <select
                                                {...register("label", { required: "Label is required" })}
                                                className="w-full appearance-none rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all outline-none"
                                            >
                                                {Object.values(AddressType).map((type) => (
                                                    <option key={type} value={type}>
                                                        {type}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                                <ChevronDown className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 ml-1">Street Address</label>
                                    <input
                                        {...register("street", { required: "Street is required" })}
                                        placeholder="123 Main St"
                                        className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 ml-1">City</label>
                                        <input
                                            {...register("city", { required: "City is required" })}
                                            placeholder="City"
                                            className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 ml-1">State</label>
                                        <input
                                            {...register("state", { required: "State is required" })}
                                            placeholder="State"
                                            className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 ml-1">ZIP Code</label>
                                        <input
                                            {...register("zip", { required: "ZIP is required" })}
                                            placeholder="ZIP Code"
                                            className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-slate-900 focus:bg-white focus:ring-0 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 ml-1">Country</label>
                                        <select
                                            {...register("country")}
                                            className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-900 focus:bg-white focus:ring-0 transition-all outline-none appearance-none"
                                            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                                        >
                                            {countries.map((c) => (
                                                <option key={c.code} value={c.name}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer group pt-2">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            {...register("isDefault")}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-300 checked:bg-slate-900 checked:border-slate-900 transition-all"
                                        />
                                        <svg className="absolute left-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                                        Set as default shipping address
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full rounded-2xl bg-blue-500 py-4 text-sm font-bold text-white shadow-xl shadow-blue-200 hover:bg-blue-600 disabled:opacity-50 transition-all active:scale-[0.98]"
                            >
                                {isPending ? "Saving..." : (editingAddress ? "Update Address" : "Save Address")}
                            </button>
                        </form>
                    </Modal>
                )}

                {/* deleete modal  */}
                <ConfirmModal
                    open={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setDeletingAddressId(null);
                    }}
                    onConfirm={() => {
                        if (deletingAddressId) {
                            deleteAddress(deletingAddressId);
                        }
                    }}
                    title="Delete Address"
                    description="Are you sure you want to delete this address? This action cannot be undone."
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    isPending={isDeleting}
                />
            </div>
        </div>
    );
};

export default Addresses;