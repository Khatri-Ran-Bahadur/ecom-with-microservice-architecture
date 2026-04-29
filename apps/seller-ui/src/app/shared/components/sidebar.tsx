"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAtom } from 'jotai'
import { activeSideBarItem } from 'apps/seller-ui/src/configs/constants'
import useSeller from 'apps/seller-ui/src/hooks/useSeller'
import {
    LayoutDashboard, Package, ShoppingBag, Star,
    Settings, LogOut, ChevronDown, Store,
    BarChart3, Wallet, Tag, X, Plus,
    List, PercentCircle, Clock, TrendingUp,
    CreditCard, BadgeDollarSign, FileText,
    Image, Link2, MessageSquare
} from 'lucide-react'

// ── Nav tree: items can have children ──
type NavChild = {
    href: string
    label: string
    icon?: React.ElementType
    badge?: string
}

type NavItem = {
    href?: string
    label: string
    icon: React.ElementType
    children?: NavChild[]
    badge?: string
}

type NavGroup = {
    label: string
    items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            {
                href: '/seller/dashboard',
                label: 'Dashboard',
                icon: LayoutDashboard,
            },
            {
                label: 'Analytics',
                icon: BarChart3,
                children: [
                    { href: '/seller/analytics/overview', label: 'Overview', icon: TrendingUp },
                    { href: '/seller/analytics/traffic', label: 'Traffic', icon: BarChart3 },
                    { href: '/seller/analytics/conversions', label: 'Conversions', icon: PercentCircle },
                ]
            },
            {
                label: 'Earnings',
                icon: Wallet,
                children: [
                    { href: '/seller/earnings', label: 'Summary', icon: BadgeDollarSign },
                    { href: '/seller/earnings/payouts', label: 'Payouts', icon: CreditCard },
                    { href: '/seller/earnings/transactions', label: 'Transactions', icon: FileText },
                ]
            },
        ]
    },
    {
        label: 'Catalogue',
        items: [
            {
                label: 'Products',
                icon: Package,
                children: [
                    { href: '/seller/products', label: 'All Products', icon: List },
                    { href: '/seller/products/create', label: 'Add Product', icon: Plus },
                    { href: '/seller/products/inventory', label: 'Inventory', icon: Package },
                ]
            },
            {
                label: 'Orders',
                icon: ShoppingBag,
                badge: '12',
                children: [
                    { href: '/seller/orders', label: 'All Orders', icon: List },
                    { href: '/seller/orders/pending', label: 'Pending', icon: Clock, badge: '12' },
                    { href: '/seller/orders/completed', label: 'Completed', icon: ShoppingBag },
                ]
            },
            {
                label: 'Coupons',
                icon: Tag,
                href: "/seller/discount-codes"
            },
        ]
    },
    {
        label: 'Store',
        items: [
            {
                label: 'My Shop',
                icon: Store,
                children: [
                    { href: '/seller/shop', label: 'Shop Profile', icon: Store },
                    { href: '/seller/shop/banner', label: 'Banner & Media', icon: Image },
                    { href: '/seller/shop/social', label: 'Social Links', icon: Link2 },
                ]
            },
            {
                href: '/seller/reviews',
                label: 'Reviews',
                icon: Star,
            },
        ]
    },
]

type SidebarProps = {
    isOpen?: boolean
    onClose?: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const pathname = usePathname()
    const { seller, isLoading } = useSeller()
    const [activeItem, setActiveItem] = useAtom(activeSideBarItem)

    // Track which parent items are expanded
    // Auto-expand parent if a child is active
    const getInitialOpen = () => {
        const open: Record<string, boolean> = {}
        const currentPath = pathname || ""
        NAV_GROUPS.forEach(group => {
            group.items.forEach(item => {
                if (item.children) {
                    const hasActive = item.children.some(
                        child => currentPath === child.href || (child.href !== '/seller/products' && currentPath.startsWith(child.href + '/')) || (child.href === '/seller/products' && (currentPath.startsWith('/seller/products/edit') || currentPath.startsWith('/seller/products/')) && !currentPath.startsWith('/seller/products/create'))
                    )
                    if (hasActive) open[item.label] = true
                }
            })
        })
        return open
    }

    const [openItems, setOpenItems] = useState<Record<string, boolean>>(getInitialOpen)

    // Re-run when activeItem or pathname changes
    useEffect(() => {
        if (pathname && activeItem !== pathname) {
            setActiveItem(pathname);
        }
        setOpenItems(prev => {
            const next = { ...prev }
            const currentActive = pathname || ""
            NAV_GROUPS.forEach(group => {
                group.items.forEach(item => {
                    if (item.children) {
                        const hasActive = item.children.some(
                            child => currentActive === child.href || (child.href !== '/seller/products' && currentActive.startsWith(child.href + '/')) || (child.href === '/seller/products' && (currentActive.startsWith('/seller/products/edit') || currentActive.startsWith('/seller/products/')) && !currentActive.startsWith('/seller/products/create'))
                        )
                        if (hasActive) next[item.label] = true
                    }
                })
            })
            return next
        })
    }, [activeItem, pathname, setActiveItem])

    const toggleItem = (label: string) => {
        setOpenItems(prev => ({ ...prev, [label]: !prev[label] }))
    }

    const isChildActive = (item: NavItem) => {
        const currentActive = activeItem || ""
        return item.children?.some(child => {
            if (child.href === '/seller/products') {
                return currentActive === child.href || currentActive.startsWith('/seller/products/edit') || (currentActive.startsWith('/seller/products/') && !currentActive.startsWith('/seller/products/create') && !currentActive.startsWith('/seller/products/inventory'))
            }
            return currentActive === child.href || currentActive.startsWith(child.href + '/')
        })
    }

    const content = (
        <div className="flex flex-col h-full" >

            {/* ── Brand ── */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
                <Link href="/seller/dashboard" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#378ADD] flex items-center justify-center shadow-lg shadow-[#378ADD]/30">
                        <Store size={15} color="white" strokeWidth={2.25} />
                    </div>
                    <span className="text-white font-semibold text-[15px] tracking-tight">
                        E<span className="text-[#378ADD]">Shop</span>
                        <span className="text-white/30 text-[11px] font-normal ml-1.5">Seller</span>
                    </span>
                </Link>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/[0.07] transition-colors">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* ── Seller card ── */}
            <div className="px-3 pt-4">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.05] border border-white/[0.07]">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#378ADD] to-[#185FA5] flex items-center justify-center text-white text-[13px] font-semibold flex-shrink-0 shadow-md uppercase">
                        {isLoading ? "..." : seller?.shop?.name ? seller.shop.name.substring(0, 2) : "S"}
                    </div>
                    <div className="min-w-0">
                        <p className="text-white text-[13px] font-medium truncate leading-tight">
                            {isLoading ? "Loading..." : seller?.shop?.name || "Shop"}
                        </p>
                        <p className="text-white/35 text-[11px] truncate mt-0.5">
                            {isLoading ? "..." : seller?.email}
                        </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[10px] text-emerald-400/80">Live</span>
                    </div>
                </div>
            </div>

            {/* ── Nav ── */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-hide">
                {NAV_GROUPS.map((group) => (
                    <div key={group.label}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/20 px-3 mb-1.5">
                            {group.label}
                        </p>
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const isExpanded = !!openItems[item.label]
                                const hasActive = isChildActive(item)
                                const isDirectActive = item.href && (activeItem === item.href || activeItem?.startsWith(item.href + '/'))

                                // ── Leaf item (no children) ──
                                if (!item.children && item.href) {
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={onClose}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group
                                                ${isDirectActive
                                                    ? 'bg-[#378ADD] text-white shadow-lg shadow-[#378ADD]/20'
                                                    : 'text-white/50 hover:text-white hover:bg-white/[0.06]'}`}
                                        >
                                            <item.icon
                                                size={15}
                                                strokeWidth={isDirectActive ? 2.25 : 1.75}
                                                className={isDirectActive ? 'text-white' : 'text-white/35 group-hover:text-white/60 transition-colors'}
                                            />
                                            <span className="flex-1">{item.label}</span>
                                            {item.badge && (
                                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                                                    ${isDirectActive ? 'bg-white/20 text-white' : 'bg-[#378ADD]/20 text-[#378ADD]'}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    )
                                }

                                // ── Parent item (has children) ──
                                return (
                                    <div key={item.label}>
                                        <button
                                            onClick={() => toggleItem(item.label)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group
                                                ${hasActive && !isExpanded
                                                    ? 'bg-[#378ADD]/10 text-[#378ADD]'
                                                    : isExpanded
                                                        ? 'text-white bg-white/[0.06]'
                                                        : 'text-white/50 hover:text-white hover:bg-white/[0.06]'}`}
                                        >
                                            <item.icon
                                                size={15}
                                                strokeWidth={hasActive ? 2.25 : 1.75}
                                                className={
                                                    hasActive ? 'text-[#378ADD]' :
                                                        isExpanded ? 'text-white/70' :
                                                            'text-white/35 group-hover:text-white/60 transition-colors'
                                                }
                                            />
                                            <span className="flex-1 text-left">{item.label}</span>
                                            {item.badge && !isExpanded && (
                                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#378ADD]/20 text-[#378ADD] mr-1">
                                                    {item.badge}
                                                </span>
                                            )}
                                            <ChevronDown
                                                size={13}
                                                className={`flex-shrink-0 transition-transform duration-200 text-white/25
                                                    ${isExpanded ? 'rotate-180 text-white/50' : ''}`}
                                            />
                                        </button>

                                        {/* ── Children ── */}
                                        {isExpanded && (
                                            <div className="mt-0.5 ml-3 pl-3.5 border-l border-white/[0.07] space-y-0.5 animate-slide-down">
                                                {item.children!.map((child) => {
                                                    const currentActive = activeItem || ""
                                                    let childActive = false
                                                    if (child.href === '/seller/products') {
                                                        childActive = currentActive === child.href || currentActive.startsWith('/seller/products/edit') || (currentActive.startsWith('/seller/products/') && !currentActive.startsWith('/seller/products/create') && !currentActive.startsWith('/seller/products/inventory'))
                                                    } else {
                                                        childActive = currentActive === child.href || currentActive.startsWith(child.href + '/')
                                                    }
                                                    const ChildIcon = child.icon
                                                    return (
                                                        <Link
                                                            key={child.href}
                                                            href={child.href}
                                                            onClick={onClose}
                                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-medium transition-all group
                                                                ${childActive
                                                                    ? 'bg-[#378ADD] text-white shadow-md shadow-[#378ADD]/20'
                                                                    : 'text-white/40 hover:text-white hover:bg-white/[0.06]'}`}
                                                        >
                                                            {ChildIcon && (
                                                                <ChildIcon
                                                                    size={13}
                                                                    strokeWidth={childActive ? 2.25 : 1.75}
                                                                    className={childActive ? 'text-white' : 'text-white/30 group-hover:text-white/50 transition-colors'}
                                                                />
                                                            )}
                                                            <span className="flex-1">{child.label}</span>
                                                            {child.badge && (
                                                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                                                                    ${childActive ? 'bg-white/20 text-white' : 'bg-orange-500/20 text-orange-400'}`}>
                                                                    {child.badge}
                                                                </span>
                                                            )}
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* ── Bottom ── */}
            <div className="px-3 pb-5 pt-3 border-t border-white/[0.06] space-y-0.5">
                <Link href="/seller/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/45 hover:text-white hover:bg-white/[0.06] transition-all">
                    <Settings size={15} strokeWidth={1.75} className="text-white/30" />
                    Settings
                </Link>
                <Link href="/seller/support"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/45 hover:text-white hover:bg-white/[0.06] transition-all">
                    <MessageSquare size={15} strokeWidth={1.75} className="text-white/30" />
                    Support
                </Link>
                <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
                    onClick={() => { /* logout logic */ }}
                >
                    <LogOut size={15} strokeWidth={1.75} />
                    Sign out
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop */}
            <aside className="hidden lg:flex flex-col w-[260px] min-h-screen bg-[#0D1117] border-r border-white/[0.06]">
                {content}
            </aside>

            {/* Mobile drawer */}
            {isOpen !== undefined && (
                <>
                    <div
                        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden
                            ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                        onClick={onClose}
                    />
                    <aside
                        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0D1117] border-r border-white/[0.06] transition-transform duration-300 ease-out lg:hidden
                            ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    >
                        {content}
                    </aside>
                </>
            )}
        </>
    )
}

export default Sidebar