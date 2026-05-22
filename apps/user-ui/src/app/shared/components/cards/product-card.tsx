import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Ratings from '../../ratings/ratings'
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import ProductDetailsCard from './product-detail-card';
import useStore from 'apps/user-ui/src/store';
import { useUser } from 'apps/user-ui/src/hooks/useUser';
import useLocationTraking from 'apps/user-ui/src/hooks/useLocationTracking';
import useDeviceTraking from 'apps/user-ui/src/hooks/useDeviceTrackiong';

const ProductCard = ({ product, isEvent }: { product: any, isEvent?: boolean }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [open, setOpen] = useState(false);
    const { user } = useUser();
    const location = useLocationTraking();
    const deviceInfo = useDeviceTraking();
    const addToWishlist = useStore((state: any) => state.addToWishlist);
    const isWishlist = useStore((state: any) => state.isWishlist(product));

    // cart
    const addTocart = useStore((state: any) => state.addToCart);
    const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
    const removeFromCart = useStore((state: any) => state.removeFromCart);
    const isCart = useStore((state: any) => state.isCart(product));

    useEffect(() => {
        if (!isEvent || !product?.ending_date) {
            return;
        }
        const countDownDate = new Date(product.ending_date).getTime();
        const updateTimer = (): void => {
            const now = new Date().getTime();
            const distance = countDownDate - now;

            if (distance < 0) {
                setTimeLeft("Expired");
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };
        let interval: ReturnType<typeof setInterval> | undefined;
        if (new Date(product.ending_date) > new Date()) {
            updateTimer();
            interval = setInterval(updateTimer, 1000);
        } else {
            setTimeLeft("Expired");
        }
        return () => {
            if (interval !== undefined) {
                clearInterval(interval);
            }
        };
    }, [isEvent, product?.ending_date]);
    return (
        <div className='w-full min-h-[350px] h-max bg-white rounded-lg shadow-md relative'>
            {isEvent && (
                <div className='absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full'>
                    OFFER
                </div>
            )}
            {/* stock */}
            {product?.stock <= 5 && (
                <div className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full'>
                    Low Stock
                </div>
            )}

            <Link href={`/product/${product?.slug}`} className='block group'>
                <div className="relative overflow-hidden">
                    <img
                        src={product?.images[0]?.url || "https://bunchobagels.com/product/simple-placeholder-product-2/"}
                        alt={product?.title}
                        className='w-full h-[220px] object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300'
                    />
                </div>
            </Link>
            <Link href={`/shop/${product?.shop?.id}`} className='block text-blue-500 text-sm font-medium my-2 px-2'>
                {product?.shop?.name}
            </Link>
            <Link href={`/product/${product?.slug}`}>
                <h3 className='text-base font-semibold px-2 text-gray-800 line-clamp-2 hover:text-primary transition-colors duration-200'>{product?.title}</h3>
            </Link>
            <div className='mt-2 px-2'>
                <Ratings rating={product?.ratings} />
            </div>
            <div className='mt-3 flex justify-between items-center px-2'>
                <div className='flex items-center gap-2'>
                    <span className='text-lg font-bold text-gray-900'>
                        ${product?.sale_price}
                    </span>
                    <span className='text-sm text-gray-500 line-through'>
                        ${product?.regular_price}
                    </span>
                </div>
                <span className='text-green-500 text-sm font-medum'>
                    {product?.totalSales} sold
                </span>
            </div>
            {isEvent && timeLeft && (
                <div className='mt-2'>
                    <span className='inline-block text-xs bg-orange-100 text-orange-500 px-2 py-1 rounded-full'>
                        {timeLeft}
                    </span>
                </div>
            )}
            <div className='absolute z-10 flex flex-col gap-3 right-3 top-10'>
                <div className='bg-white rounded-full p-[6px] shadow-md'>
                    <Heart className={`${isWishlist ? "fill-red-500" : "fill-transparent"} cursor-pointer hover:scale-110 transition`} size={22} fill={"red"} stroke='red'
                        onClick={() => isWishlist
                            ? removeFromWishlist(product.id, user, location, deviceInfo)
                            : addToWishlist({ ...product }, user, location, deviceInfo)} />
                </div>
                <div className='bg-white rounded-full p-[6px] shadow-md'>
                    <Eye className='cursor-pointer text-[#4b5563] hover:scale-110 transition' size={22} onClick={() => setOpen(!open)} />
                </div>
                <div className='bg-white rounded-full p-[6px] shadow-md'>
                    <ShoppingBag className='cursor-pointer text-[#4b5563] hover:scale-110 transition' size={22}
                        onClick={() => isCart
                            ? removeFromCart(product.id, user, location, deviceInfo)
                            : addTocart({ ...product }, user, location, deviceInfo)} />
                </div>
            </div>
            {open && (
                <ProductDetailsCard data={product} setOpen={setOpen} />
            )}
        </div>
    )
}

export default ProductCard