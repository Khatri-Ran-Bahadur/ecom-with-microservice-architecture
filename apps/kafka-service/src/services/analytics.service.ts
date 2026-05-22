import prisma from "@packages/libs/prisma";

export const updateUserAnalytics = async (event: any) => {
    try {
        const existingData = await prisma.userAnalytics.findUnique({
            where: {
                userId: event.userId
            },
            select: { actions: true }
        })

        let updateActions: any = existingData?.actions || []

        const actionExisting = updateActions.some((entry: any) => entry.productId === event.productId && entry.action === event.action)

        //Always store product_view for recommendations
        if (event.action === 'product_view') {
            updateActions.push({ productId: event?.productId, shopId: event?.shopId, action: "product_view", timestamp: new Date() })
        } else if (["add_to_cart", "add_to_wishlist"].includes(event.action) && !actionExisting) {
            updateActions.push({ productId: event?.productId, shopId: event?.shopId, action: event?.action, timestamp: new Date() })
        } else if (event.action === "remove_from_cart") {
            updateActions = updateActions.filter((entry: any) => !(entry.productId === event.productId && entry.action === "add_to_cart"))
        }

        //keep only the last 100 actions (prevent storage overload)
        if (updateActions.length > 100) {
            updateActions.shift()
        }

        //update or create
        const extraFields: Record<string, any> = {}

        if (event.country) {
            extraFields.country = event.country
        }

        if (event.city) {
            extraFields.city = event.city
        }

        if (event.device) {
            extraFields.device = event.device
        }

        if (event.browser) {
            extraFields.browser = event.browser
        }

        console.log(`[Analytics] Updating user analytics for: ${event.userId}`);
        await prisma.userAnalytics.upsert({
            where: { userId: event.userId },
            update: {
                lastVisited: new Date(),
                actions: updateActions,
                ...extraFields
            },
            create: {
                userId: event.userId,
                actions: updateActions,
                lastVisited: new Date(),
                ...extraFields
            }
        })

        // add product analytics
        await updateProductAnalytics(event)
    } catch (error) {
        console.error("[Analytics] Error updating user analytics:", error);
    }
}

export const updateProductAnalytics = async (event: any) => {
    try {
        if (!event.productId) return;
        const updateFields: any = {};
        if (event.action === 'product_view') updateFields.views = { increment: 1 };
        if (event.action === 'add_to_cart') updateFields.cartAdds = { increment: 1 };
        if (event.action === 'remove_from_cart') updateFields.cartAdds = { decrement: 1 };
        if (event.action === 'add_to_wishlist') updateFields.wishlistAdds = { increment: 1 };
        if (event.action === 'remove_from_wishlist') updateFields.wishlistAdds = { decrement: 1 };
        if (event.action === 'product_purchase') updateFields.purchases = { increment: 1 };

        console.log(`[Analytics] Updating product: ${event.productId}, action: ${event.action}`);

        await prisma.productAnalytics.upsert({
            where: { productId: event.productId },
            update: {
                lastViewedAt: new Date(),
                ...updateFields
            },
            create: {
                productId: event.productId,
                shopId: event?.shopId || null,
                views: event.action === 'product_view' ? 1 : 0,
                cartAdds: event.action === 'add_to_cart' ? 1 : 0,
                wishlistAdds: event.action === 'add_to_wishlist' ? 1 : 0,
                purchases: event.action === 'product_purchase' ? 1 : 0,
                lastViewedAt: new Date(),
            }
        })
        console.log(`[Analytics] Successfully saved analytics for product: ${event.productId}`);
    } catch (error) {
        console.error("[Analytics] Error updating product analytics:", error);
    }
}