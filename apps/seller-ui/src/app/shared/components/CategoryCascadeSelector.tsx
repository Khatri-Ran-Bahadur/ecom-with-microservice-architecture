"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronRight,
  Search,
  Folder,
  X,
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
  HeartPulse
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

interface CategoryCascadeSelectorProps {
  value: string | null;
  onChange: (categoryId: string, resolvedCategory: string, resolvedSubCategory: string) => void;
  tree: Category[];
  error?: string;
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

export default function CategoryCascadeSelector({ value, onChange, tree, error }: CategoryCascadeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Columns state: stores the selected category at each hierarchy level
  const [selectedPath, setSelectedPath] = useState<Category[]>([]);

  // Initialize selected path if value is provided
  useEffect(() => {
    if (value && tree.length > 0 && selectedPath.length === 0) {
      const path: Category[] = [];
      const findPath = (nodes: Category[], targetId: string): boolean => {
        for (const node of nodes) {
          path.push(node);
          if (node.id === targetId) return true;
          if (node.children && node.children.length > 0) {
            if (findPath(node.children, targetId)) return true;
          }
          path.pop();
        }
        return false;
      };
      findPath(tree, value);
      setSelectedPath(path);
    }
  }, [value, tree]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Columns for the cascade: Level 1 (roots), Level 2 (children of L1), Level 3 (children of L2), etc.
  const columns = useMemo(() => {
    const cols: Category[][] = [tree];
    for (let i = 0; i < selectedPath.length; i++) {
      const children = selectedPath[i].children;
      if (children && children.length > 0) {
        cols.push(children);
      } else {
        break;
      }
    }
    return cols;
  }, [tree, selectedPath]);

  const handleSelectCategory = (level: number, category: Category) => {
    // Truncate path after current level and add selection
    const newPath = [...selectedPath.slice(0, level), category];
    setSelectedPath(newPath);

    // If it is a leaf category (no children), complete the selection
    const hasChildren = category.children && category.children.length > 0;
    if (!hasChildren) {
      // Find root category name (for legacy category field) and immediate leaf name (for legacy subCategory field)
      const resolvedCategory = newPath[0].name;
      const resolvedSubCategory = category.name;
      
      onChange(category.id, resolvedCategory, resolvedSubCategory);
      setIsOpen(false);
    }
  };

  // Flat search categories list
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    interface FlatResult {
      category: Category;
      pathString: string;
      rootName: string;
    }
    const results: FlatResult[] = [];

    const traverse = (node: Category, currentPath: string[], rootName: string) => {
      const fullPath = [...currentPath, node.name];
      const isLeaf = !node.children || node.children.length === 0;
      
      if (node.name.toLowerCase().includes(searchQuery.toLowerCase()) && isLeaf) {
        results.push({
          category: node,
          pathString: fullPath.join(" > "),
          rootName
        });
      }

      node.children?.forEach(child => traverse(child, fullPath, rootName));
    };

    tree.forEach(root => traverse(root, [], root.name));
    return results;
  }, [searchQuery, tree]);

  // Selected Breadcrumb String
  const selectedLabel = useMemo(() => {
    if (selectedPath.length === 0) return "Select Category";
    return selectedPath.map(c => c.name).join(" > ");
  }, [selectedPath]);

  // Helper to render icon
  const renderIcon = (iconName: string | null, size = 16, className = "") => {
    const match = AVAILABLE_ICONS.find(i => i.name === iconName);
    const IconComp = match ? match.icon : Folder;
    return <IconComp size={size} className={className} />;
  };

  return (
    <div className="space-y-1.5 relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-slate-700">Category *</label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-all duration-200 bg-white flex items-center justify-between
          ${error 
            ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100" 
            : "border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          }
          ${selectedPath.length > 0 ? "text-slate-800 font-medium" : "text-slate-400"}
        `}
      >
        <span className="truncate flex items-center gap-2">
          {selectedPath.length > 0 && renderIcon(selectedPath[selectedPath.length - 1].icon, 16, "text-violet-500")}
          {selectedLabel}
        </span>
        <ChevronRight size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
      </button>

      {/* Cascading Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col h-[340px] animate-in fade-in slide-in-from-top-2 duration-200 min-w-[500px]">
          {/* Header & Search */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search categories (e.g. mobile, dress, table...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {selectedPath.length > 0 && !searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSelectedPath([]);
                  onChange("", "", "");
                }}
                className="text-xs text-rose-500 font-semibold hover:underline shrink-0"
              >
                Clear Selected
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="flex-1 flex overflow-hidden bg-slate-50/50">
            {searchQuery ? (
              /* Search Results View */
              <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white">
                {searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <button
                      key={result.category.id}
                      type="button"
                      onClick={() => {
                        // Reconstruct full path for tree display
                        const path: Category[] = [];
                        const findPath = (nodes: Category[], targetId: string): boolean => {
                          for (const node of nodes) {
                            path.push(node);
                            if (node.id === targetId) return true;
                            if (node.children && node.children.length > 0) {
                              if (findPath(node.children, targetId)) return true;
                            }
                            path.pop();
                          }
                          return false;
                        };
                        findPath(tree, result.category.id);
                        setSelectedPath(path);
                        
                        onChange(result.category.id, result.rootName, result.category.name);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-violet-50/60 dark:hover:bg-violet-900/10 border border-transparent hover:border-violet-100 flex items-center justify-between text-sm transition-all"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {renderIcon(result.category.icon, 16, "text-violet-500 shrink-0")}
                        <span className="font-medium text-slate-800 truncate">{result.pathString}</span>
                      </div>
                      <ChevronRight size={14} className="text-violet-500 shrink-0" />
                    </button>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <Search size={28} className="text-slate-300 mb-2" />
                    <span className="text-sm font-medium">No leaf categories match &quot;{searchQuery}&quot;</span>
                  </div>
                )}
              </div>
            ) : (
              /* Columns Cascade Selector View */
              columns.map((columnNodes, level) => {
                const activeNode = selectedPath[level];
                
                return (
                  <div
                    key={level}
                    className="w-1/3 border-r border-slate-100 last:border-r-0 flex flex-col bg-white"
                  >
                    <div className="p-2 border-b border-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-bold shrink-0">
                      Level {level + 1}
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                      {columnNodes.map(node => {
                        const isNodeSelected = activeNode?.id === node.id;
                        const hasChildren = node.children && node.children.length > 0;
                        
                        return (
                          <button
                            key={node.id}
                            type="button"
                            onClick={() => handleSelectCategory(level, node)}
                            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all duration-200
                              ${isNodeSelected 
                                ? "bg-violet-50 border border-violet-100 text-violet-700 font-bold" 
                                : "hover:bg-slate-50 border border-transparent text-slate-600"
                              }
                            `}
                          >
                            <span className="truncate flex items-center gap-1.5">
                              {renderIcon(node.icon, 14, isNodeSelected ? "text-violet-600 shrink-0" : "text-slate-400 shrink-0")}
                              {node.name}
                            </span>
                            {hasChildren && <ChevronRight size={12} className={isNodeSelected ? "text-violet-600 shrink-0" : "text-slate-400 shrink-0"} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
