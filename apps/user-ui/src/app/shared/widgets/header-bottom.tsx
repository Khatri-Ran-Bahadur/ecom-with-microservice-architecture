"use client"
import React, { useState, useEffect } from 'react'
import { AlignLeft, ChevronDown } from 'lucide-react'
import { navItems } from '../../configs/constants';
import Link from 'next/link';
import ProfileIcon from '../../../assets/svgs/profile-icon';
import { Heart, ShoppingCart } from 'lucide-react';

const HeaderBottom = () => {
    const [show, setShow] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    // track scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsSticky(true)
            } else {
                setIsSticky(false)
            }
        }
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <div className={`w-full transition-all duration-300 ${isSticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg" : "relative"} `}>
            <div className={`w-[80%] relative m-auto flex items-center justify-between ${isSticky ? "pt-3" : "py-0"}`}>
                {/* All Dropdowns */}
                <div className={`w-[260px] ${isSticky && '-mb-2'} cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`} onClick={() => setShow(prev => !prev)}>
                    <div className="flex items-center gap-2">
                        <AlignLeft size={22} color="white" />
                        <span className='font-medium text-white'>All Departments</span>
                    </div>
                    <ChevronDown size={22} color="white" />
                </div>
                {/* Dropdwon Menu */}
                {show && (
                    <div className={`absolute left-0 ${isSticky ? "top-[70px]" : "top-[50px]"} w-[260px] h-[400px] bg-[#f5f5f5] transition-all duration-300 ease-in-out `}>

                    </div>
                )}

                {/* Nav Links */}
                <div className="flex items-center">
                    {navItems.map((item: NavItemsTypes, index: number) => (
                        <Link className='px-5 font-medium text-lg' key={index} href={item.href}>
                            {item.title}
                        </Link>
                    ))}
                </div>

                <div>
                    {isSticky && (<div className='flex items-center gap-8'>
                        <div className='flex items-center gap-2 cursor-pointer'>
                            <Link href="/login" className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]">
                                <ProfileIcon />
                            </Link>

                            <Link href="/login">
                                <span className='block font-medium text-gray-700 text-md'>Hello,</span>
                                <span className='font-semibold text-lg'>Sign in</span>
                            </Link>
                        </div>
                        <div className='flex items-center gap-5'>
                            <Link href="/wishlist" className="relative">
                                <Heart size={38} color="black" className='font-semibold' />
                                <span className='absolute top-0 right-0 w-[22px] h-[22px] rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-semibold'>0</span>
                            </Link>
                            <Link href="/cart" className="relative">
                                <ShoppingCart size={38} color="black" />
                                <span className='absolute top-0 right-0 w-[22px] h-[22px] rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-semibold'>0</span>
                            </Link>
                        </div>
                    </div>)}
                </div>
            </div>
        </div>
    )
}

export default HeaderBottom