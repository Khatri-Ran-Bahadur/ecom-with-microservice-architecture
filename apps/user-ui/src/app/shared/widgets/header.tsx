"use client"
import Link from 'next/link'
import React from 'react'
import { Search, Heart, ShoppingCart } from 'lucide-react'
import ProfileIcon from '../../../assets/svgs/profile-icon'
import HeaderBottom from './header-bottom'
import useUser from 'apps/user-ui/src/hooks/useUser';

const Header = () => {
    const { user, isLoading } = useUser();
    return (
        <div className='w-full bg-white'>
            <div className='w-[80%] py-5 m-auto flex items-center justify-between'>
                <div>
                    <Link href="/"><span className="text-3xl font-[500] text-green-500 ">E</span><span className="text-gray-500 text-3xl font-semibold ">Shop</span></Link>
                </div>
                <div className='w-[50%] relative'>
                    <input type='text' placeholder='Search Products....' className='w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none p-2 rounded-lg text-gray-600 h-[55px]' />
                    <button className='w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#3489FF] absolute top-0 right-0 rounded-r-lg'>
                        <Search size={25} color="white" />
                    </button>
                </div>
                <div className='flex items-center gap-8'>
                    <div className='flex items-center gap-2 cursor-pointer'>
                        {!isLoading && user ? (
                            <>
                                <Link href="/profile" className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]">
                                    {user.name?.charAt(0).toUpperCase()}
                                </Link>
                                <Link href="/profile">
                                    <span className='block font-medium text-gray-700 text-md'>Hello,</span>
                                    <span className="font-semibold text-lg">{user.name?.split(' ')[0]}</span>
                                </Link>
                            </>
                        ) : (<>
                            <Link href="/login" className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]">
                                <ProfileIcon />
                            </Link>
                            <Link href="/login">
                                <span className='block font-medium text-gray-700 text-md'>Hello,</span>
                                <span className="font-semibold text-lg">{isLoading ? "..." : "Sign in"}</span>
                            </Link>
                        </>

                        )}


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
                </div>
            </div>
            <div className='border-b border-b-[rgba(153,153,153,0.22)]' />
            <HeaderBottom />
        </div>
    )
}

export default Header