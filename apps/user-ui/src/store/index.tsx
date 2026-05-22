import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sendKafkaEvent } from "../actions/track-user";

type Product = {
    id: string;
    title: string;
    price: number;
    sale_price: number;
    image: string;
    images?: any[];
    quantity?: number;
    shopId: string
}

interface Store {
    cart: Product[];
    wishlist: Product[];
    addToCart: (product: Product, user: any, location: any, deviceInfo: any) => void;
    removeFromCart: (id: string, user: any, location: any, deviceInfo: any) => void;
    addToWishlist: (product: Product, user: any, location: any, deviceInfo: any) => void;
    removeFromWishlist: (id: string, user: any, location: any, deviceInfo: any) => void;
    updateCartQuantity: (id: string, quantity: number, user: any, location: any, deviceInfo: any) => void;
    isCart: (product: Product) => boolean;
    isWishlist: (product: Product) => boolean;
    clearCart: () => void;
    clearWishlist: () => void;
    storeCoupon: (coupon: any) => void;
    coupon: any;
}

const useStore = create<Store>()(
    persist(
        (set, get) => ({
            cart: [],
            wishlist: [],
            coupon: null,
            addToCart: (product: Product, user: any, location: any, deviceInfo: any) => {
                set((state) => {
                    const existingItem = state.cart?.find((item) => item.id === product.id);
                    if (existingItem) {
                        return {
                            cart: state.cart?.map((item: any) => item.id === product.id ? { ...item, quantity: (item?.quantity || 1 + 1) } : item)
                        }
                    } else {
                        return {
                            cart: [...state.cart, { ...product, quantity: 1 }]
                        }
                    }
                });
                if (user?.id && location && deviceInfo) {
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: product?.id,
                        shopId: product?.shopId,
                        action: "add_to_cart",
                        device: deviceInfo?.device || "unknown",
                        country: location?.country || "unknown",
                        city: location?.city || "unknown",
                    });
                }
            },
            updateCartQuantity: (id: string, quantity: number, user: any, location: any, deviceInfo: any) => {
                set((state) => ({
                    cart: state.cart?.map((item: any) => item.id === id ? { ...item, quantity } : item)
                }));
            },
            removeFromCart: (id: string, user: any, location: any, deviceInfo: any) => {
                const { cart } = get();
                const removeProduct = cart.find((item: any) => item.id === id);
                set((state: any) => ({
                    cart: state.cart?.filter((item: any) => item.id !== id)
                }));
                if (user?.id && location && deviceInfo && removeProduct) {
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: removeProduct?.id,
                        shopId: removeProduct?.shopId,
                        action: "remove_from_cart",
                        device: deviceInfo?.device,
                        country: location?.country,
                        city: location.city,
                    });
                }
            },
            addToWishlist: (product: Product, user: any, location: any, deviceInfo: any) => {
                set((state) => {
                    const existingItem = state.wishlist?.find((item) => item.id === product.id);
                    if (existingItem) {
                        return state;
                    } else {
                        return {
                            wishlist: [...state.wishlist, product]
                        }
                    }
                });
                if (user?.id && location && deviceInfo && product) {
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: product?.id,
                        shopId: product?.shopId,
                        action: "add_to_wishlist",
                        device: deviceInfo?.device || "unknown",
                        country: location?.country || "unknown",
                        city: location?.city || "unknown",
                    });
                }
            },
            removeFromWishlist: (id: string, user: any, location: any, deviceInfo: any) => {
                const { wishlist } = get();
                const exist = wishlist.find((item: any) => item.id === id);
                if (exist) {
                    set((state: any) => ({
                        wishlist: state.wishlist?.filter((item: any) => item.id !== id)
                    }))
                }
                if (user?.id && location && deviceInfo && exist) {
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: exist?.id,
                        shopId: exist?.shopId,
                        action: "remove_from_wishlist",
                        device: deviceInfo?.device || "unknown",
                        country: location?.country || "unknown",
                        city: location?.city || "unknown",
                    });
                }
            },
            isCart: (product: Product) => {
                const { cart } = get();
                return cart?.some((item: any) => item.id === product.id);
            },
            isWishlist: (product: Product) => {
                const { wishlist } = get();
                return wishlist?.some((item: any) => item.id === product.id);
            },
            clearCart: () => {
                set({ cart: [] });
            },
            clearWishlist: () => {
                set({ wishlist: [] });
            },
            storeCoupon: (coupon: any) => {
                set({ coupon });
            },

        }),
        { name: "store-storage" }
    )
);
export default useStore
