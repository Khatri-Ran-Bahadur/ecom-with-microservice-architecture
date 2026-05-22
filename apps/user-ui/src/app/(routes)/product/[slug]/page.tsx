import { Metadata } from 'next';
import React from 'react';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import ProductDetails from 'apps/user-ui/src/app/shared/modules/product/product-details';

async function fetchProductDetail(slug: string) {
    try {
        console.log(slug)
        const res = await axiosInstance.get(`/products/api/get-product-by-slug/${slug}`);
        return res.data.product;
    } catch (error) {
        console.error("Error fetching product detail:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const productDetails = await fetchProductDetail(slug);

    return {
        title: `${productDetails?.title || 'Product'} | Becodemy Marketplace`,
        description: productDetails?.short_description || "Buy best quality products from Becodemy Marketplace",
        openGraph: {
            title: `${productDetails?.title || 'Product'} | Becodemy Marketplace`,
            description: productDetails?.short_description || "Buy best quality products from Becodemy Marketplace",
            images: [productDetails?.images?.[0]?.url || "/default-product.png"],
            type: "website"
        },
        twitter: {
            card: "summary_large_image",
            title: `${productDetails?.title || 'Product'} | Becodemy Marketplace`,
            description: productDetails?.short_description || "Buy best quality products from Becodemy Marketplace",
            images: [productDetails?.images?.[0]?.url || "/default-product.png"],
        }
    };
}

const ProductPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const productDetails = await fetchProductDetail(slug);

    return <ProductDetails productDetails={productDetails} />
};

export default ProductPage;