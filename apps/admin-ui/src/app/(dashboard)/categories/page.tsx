"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import toast from "react-hot-toast";
import {
  Folder,
  FolderPlus,
  Edit2,
  Trash2,
  Plus,
  ChevronRight,
  ChevronDown,
  PlusCircle,
  LayoutGrid,
  Smartphone,
  Laptop,
  Shirt,
  Home,
  Heart,
  Sparkles,
  Cpu,
  Gamepad,
  Tv,
  Activity,
  Grid,
  Tag,
  Footprints,
  ShoppingBag,
  Store,
  Wrench,
  Gift,
  Compass,
  BookOpen,
  HeartPulse,
  AlertTriangle,
  Loader2,
  X
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  children: Category[];
  subCategories: Category[];
}

const AVAILABLE_ICONS = [
  { name: "Smartphone", icon: Smartphone },
  { name: "Laptop", icon: Laptop },
  { name: "Shirt", icon: Shirt },
  { name: "Home", icon: Home },
  { name: "Heart", icon: Heart },
  { name: "Sparkles", icon: Sparkles },
  { name: "Cpu", icon: Cpu },
  { name: "Gamepad", icon: Gamepad },
  { name: "Tv", icon: Tv },
  { name: "Activity", icon: Activity },
  { name: "Grid", icon: Grid },
  { name: "Tag", icon: Tag },
  { name: "Footprints", icon: Footprints },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Store", icon: Store },
  { name: "Wrench", icon: Wrench },
  { name: "Gift", icon: Gift },
  { name: "Compass", icon: Compass },
  { name: "BookOpen", icon: BookOpen },
  { name: "HeartPulse", icon: HeartPulse }
];

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  
  // Selected category for viewing/editing or parent for creation
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [action, setAction] = useState<"view" | "create" | "edit" | null>("view");
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fetch all categories
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/products/api/get-categories");
      return res.data as { categories: string[]; subCategories: Record<string, string[]>; tree: Category[] };
    }
  });

  // Create Category Mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; parentId: string | null; icon: string | null }) => {
      return axiosInstance.post("/products/api/categories/create", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create category");
    }
  });

  // Update Category Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; parentId: string | null; icon: string | null }) => {
      return axiosInstance.put(`/products/api/categories/update/${data.id}`, {
        name: data.name,
        parentId: data.parentId,
        icon: data.icon
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update category");
    }
  });

  // Delete Category Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axiosInstance.delete(`/products/api/categories/delete/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category and subcategories deleted");
      setIsDeleting(null);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete category");
      setIsDeleting(null);
    }
  });

  const resetForm = () => {
    setName("");
    setIcon("");
    setParentId("");
    setCreateParentId(null);
    setSelectedCategory(null);
    setAction("view");
  };

  const handleSelectIcon = (iconName: string) => {
    setIcon(iconName);
  };

  const handleStartCreate = (parentId: string | null = null) => {
    setAction("create");
    setCreateParentId(parentId);
    setName("");
    setIcon("");
    setParentId(parentId || "");
    setSelectedCategory(null);
  };

  const handleStartEdit = (category: Category) => {
    setAction("edit");
    setSelectedCategory(category);
    setName(category.name);
    setIcon(category.icon || "");
    setParentId(category.parentId || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (action === "create") {
      createMutation.mutate({
        name,
        parentId: parentId === "" ? null : parentId,
        icon: icon === "" ? null : icon
      });
    } else if (action === "edit" && selectedCategory) {
      updateMutation.mutate({
        id: selectedCategory.id,
        name,
        parentId: parentId === "" ? null : parentId,
        icon: icon === "" ? null : icon
      });
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper to flat map all categories for selection dropdown (excluding current node and its descendants to avoid cycles)
  const getFlatEligibleParents = (nodes: Category[], excludeId?: string): { id: string; name: string }[] => {
    let list: { id: string; name: string }[] = [];
    
    const traverse = (node: Category) => {
      if (excludeId && node.id === excludeId) return;
      list.push({ id: node.id, name: node.name });
      node.children?.forEach(traverse);
    };

    nodes.forEach(traverse);
    return list;
  };

  const eligibleParents = data?.tree ? getFlatEligibleParents(data.tree, selectedCategory?.id) : [];

  // Recursive Category Item Component
  const renderCategoryNode = (node: Category, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expandedNodes[node.id];
    const isSelected = selectedCategory?.id === node.id;
    
    // Dynamically retrieve Lucide Icon component
    const IconObj = AVAILABLE_ICONS.find(i => i.name === node.icon);
    const NodeIcon = IconObj ? IconObj.icon : Folder;

    return (
      <div key={node.id} className="space-y-1">
        <div 
          onClick={() => {
            setSelectedCategory(node);
            setAction("view");
          }}
          style={{ paddingLeft: `${level * 16}px` }}
          className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 border
            ${isSelected 
              ? "bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-semibold"
              : "hover:bg-slate-100/70 dark:hover:bg-slate-800/40 border-transparent text-slate-700 dark:text-slate-300"
            }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {hasChildren ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="w-6 shrink-0" />
            )}
            
            <NodeIcon size={16} className={`shrink-0 ${isSelected ? "text-blue-500" : "text-slate-400 dark:text-slate-500"}`} />
            <span className="truncate text-sm">{node.name}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded uppercase tracking-wider font-medium shrink-0">
              {node.slug}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartCreate(node.id);
              }}
              title="Add subcategory"
              className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-600 rounded"
            >
              <FolderPlus size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartEdit(node);
              }}
              title="Edit category"
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-950/40 text-blue-600 rounded"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleting(node.id);
              }}
              title="Delete category"
              className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l-2 border-slate-100 dark:border-slate-800/60 ml-3">
            {node.children.map(child => renderCategoryNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getParentName = (catId: string | null) => {
    if (!catId || !data?.tree) return "Root";
    
    let name = "Root";
    const find = (nodes: Category[]) => {
      for (const node of nodes) {
        if (node.id === catId) {
          name = node.name;
          return;
        }
        if (node.children) find(node.children);
      }
    };
    find(data.tree);
    return name;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            Categories Management
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Build and organize multi-level categories dynamically with instant frontend syncing.
          </p>
        </div>
        <button
          onClick={() => handleStartCreate(null)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all font-semibold hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} />
          <span>Add Root Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Tree View */}
        <div className="lg:col-span-7 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 shadow-sm flex flex-col h-[650px]">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/50 pb-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <LayoutGrid size={18} className="text-blue-500" />
              Category Tree Hierarchy
            </h3>
            {data?.tree && (
              <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-medium">
                {eligibleParents.length} Total Categories
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <span className="text-sm">Loading category tree...</span>
              </div>
            ) : data?.tree && data.tree.length > 0 ? (
              data.tree.map(node => renderCategoryNode(node, 0))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-full text-slate-300">
                  <LayoutGrid size={48} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300">No categories found</h4>
                  <p className="text-sm mt-1 max-w-sm">Create your first root category to start building your hierarchical catalog structure.</p>
                </div>
                <button
                  onClick={() => handleStartCreate(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Create Root Category
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detail Form / Action Editor */}
        <div className="lg:col-span-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 shadow-sm flex flex-col min-h-[650px] relative overflow-hidden">
          {action === "view" && selectedCategory ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Category Details</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(selectedCategory)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 rounded-lg transition-colors border border-blue-100/50 dark:border-blue-900/50"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => setIsDeleting(selectedCategory.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 dark:text-rose-400 rounded-lg transition-colors border border-rose-100/50 dark:border-rose-900/50"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
                    {(() => {
                      const IconObj = AVAILABLE_ICONS.find(i => i.name === selectedCategory.icon);
                      const SelectedIcon = IconObj ? IconObj.icon : Folder;
                      return <SelectedIcon size={24} />;
                    })()}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedCategory.name}</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Slug: {selectedCategory.slug}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2 text-sm">
                    <span className="text-slate-400">Parent Category</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{getParentName(selectedCategory.parentId)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2 text-sm">
                    <span className="text-slate-400">Direct Subcategories</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedCategory.children?.length || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2 text-sm">
                    <span className="text-slate-400">Total Products Connected</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Dynamic</span>
                  </div>
                </div>

                {selectedCategory.children && selectedCategory.children.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400">Immediate Children:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedCategory.children.map(child => (
                        <div key={child.id} className="p-2 border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 rounded-lg flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Folder size={14} className="text-slate-400" />
                          <span className="truncate">{child.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleStartCreate(selectedCategory.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-all font-semibold"
                >
                  <PlusCircle size={16} /> Add subcategory under {selectedCategory.name}
                </button>
              </div>
            </div>
          ) : action === "create" || action === "edit" ? (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
              <div className="space-y-4 overflow-y-auto flex-1 max-h-[500px] pr-1">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <FolderPlus size={18} className="text-blue-500" />
                    {action === "create" ? "New Category" : "Edit Category"}
                  </h3>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                  >
                    <X size={16} />
                  </button>
                </div>

                {createParentId && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm">
                    <PlusCircle size={16} />
                    <span>Adding subcategory under <strong>{getParentName(createParentId)}</strong></span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Category Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Smartphones, Men's Clothing"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/40 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm"
                  />
                </div>

                {/* Parent Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Parent Category</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  >
                    <option value="">None (Root Category)</option>
                    {eligibleParents.map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Icon Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Lucide Icon (Optional)</label>
                  <div className="grid grid-cols-5 gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    {AVAILABLE_ICONS.map(i => {
                      const IconComp = i.icon;
                      const isSelectedIcon = icon === i.name;
                      return (
                        <button
                          key={i.name}
                          type="button"
                          onClick={() => handleSelectIcon(i.name)}
                          title={i.name}
                          className={`p-2.5 rounded-lg flex items-center justify-center transition-all duration-200 border
                            ${isSelectedIcon 
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10 scale-105" 
                              : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/50 dark:border-slate-800/80"
                            }`}
                        >
                          <IconComp size={18} />
                        </button>
                      );
                    })}
                  </div>
                  {icon && (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1.5">
                      <span>Selected Icon:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {(() => {
                          const Obj = AVAILABLE_ICONS.find(i => i.name === icon);
                          const Comp = Obj ? Obj.icon : Folder;
                          return <Comp size={12} />;
                        })()}
                        {icon}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setIcon("")} 
                        className="text-rose-500 hover:underline ml-auto"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6 border-t border-slate-100 dark:border-slate-800/60 pt-4 bg-white/70 dark:bg-slate-900/60 z-10 shrink-0">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  <span>{action === "create" ? "Create Category" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-full text-slate-300 mb-3">
                <LayoutGrid size={32} />
              </div>
              <h4 className="font-semibold text-slate-700 dark:text-slate-300">Select a category</h4>
              <p className="text-sm mt-1 max-w-xs">Click on any category in the tree list to view details, create nested subcategories, or edit attributes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Category?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to delete this category? This action is <strong className="text-rose-600">irreversible</strong> and will:
                </p>
                <ul className="text-xs text-slate-500 dark:text-slate-400 list-disc pl-4 space-y-1">
                  <li>Recursively delete <strong>all children and subcategories</strong>.</li>
                  <li>Set the category connection to <strong>null</strong> for all connected products.</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6 border-t border-slate-100 dark:border-slate-800/60 pt-4">
              <button
                type="button"
                onClick={() => setIsDeleting(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(isDeleting)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 disabled:opacity-50"
              >
                {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                <span>Delete Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
