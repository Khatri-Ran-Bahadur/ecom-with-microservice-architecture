'use client'
import HeroSection from './shared/modules/hero'
import React from 'react'
import SectionTitle from './shared/components/section/section-title'
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import ProductCard from './shared/components/cards/product-card';
import ShopCard from './shared/components/cards/shop.card';

const Page = () => {

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosInstance.get("/products/api/get-all-products?page=1&limit=8");
      return res.data.products;
    },
    staleTime: 1000 * 10 * 2
  })

  const { data: latestProducts, isLoading: isLatestLoading, isError: isLatestError } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      const res = await axiosInstance.get("/products/api/get-all-products?page=1&limit=8&type=latest");
      return res.data.products;
    },
    staleTime: 1000 * 10 * 2
  })


  const { data: topShops, isLoading: isTopShopLoading, isError: isTopShopError } = useQuery({
    queryKey: ["top-shops"],
    queryFn: async () => {
      const res = await axiosInstance.get("/products/api/top-shops");
      return res.data.shops;
    },
    staleTime: 1000 * 10 * 2
  })

  const { data: offerProducts, isLoading: isOfferProductsLoading, isError: isOfferProductsError } = useQuery({
    queryKey: ["offer-products"],
    queryFn: async () => {
      const res = await axiosInstance.get("/products/api/get-all-events?page=1&limit=8");
      return res.data.events;
    },
    staleTime: 1000 * 10 * 2
  })

  return (
    <div className='bg-[#f5f5f5]'>
      <HeroSection />
      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        <div className="mb-8">
          <SectionTitle
            title="Our Products"
          // description="Check out our latest collection of premium watches."
          />
        </div>

        {isLoading && (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4'>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className='h-[250px] bg-gray-300 animate-pulse rounded-lg shadow-sm' />
            ))}
          </div>
        )}
        {!isLoading && !isError && (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4'>
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mb-8 mt-8">
          <SectionTitle
            title="Latest Products"
          // description="Check out our latest collection of premium watches."
          />
        </div>

        {isLatestLoading && (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4'>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className='h-[250px] bg-gray-300 animate-pulse rounded-lg shadow-sm' />
            ))}
          </div>
        )}
        {!isLatestLoading && !isLatestError && (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4'>
            {latestProducts?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}


        <div className="mb-8 mt-4">
          <SectionTitle
            title="Top Shops"
          // description="Check out our latest collection of premium watches."
          />
        </div>

        {isTopShopLoading && (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4'>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className='h-[250px] bg-gray-300 animate-pulse rounded-lg shadow-sm' />
            ))}
          </div>
        )}
        {!isTopShopLoading && !isTopShopError && (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4'>
            {topShops?.map((shop: any) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}


        <div className="mb-8 mt-4">
          <SectionTitle
            title="Top Offeres"
          // description="Check out our latest collection of premium watches."
          />
        </div>

        {isOfferProductsLoading && (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4'>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className='h-[250px] bg-gray-300 animate-pulse rounded-lg shadow-sm' />
            ))}
          </div>
        )}
        {!isOfferProductsLoading && !isOfferProductsError && (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4'>
            {offerProducts?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}


      </div>
    </div>
  )
}

export default Page