import express, { Router } from "express";
import {
    createPaymentIntent,
    createPaymentSession,
    verifyPaymentSession,
    getShopOrders,
    getSellerOrders,
    getSellerOrderById,
    updateOrderStatus,
    verifyCoupon,
    getUserOrders,
    getUserOrderById,
    adminGetOrders,
    adminGetOrderById
} from "../controllers/order.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isAdmin, isSeller, isUser } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.post("/create-payment-intent", isAuthenticated, createPaymentIntent);
router.post("/create-payment-session", isAuthenticated, createPaymentSession);
router.get("/verifying-payment-session", isAuthenticated, verifyPaymentSession);
router.get("/get-seller-orders", isAuthenticated, isSeller, getSellerOrders);
router.get("/get-seller-order/:id", isAuthenticated, isSeller, getSellerOrderById);
router.put("/update-order-status/:id", isAuthenticated, isSeller, updateOrderStatus);
router.put('/verify-coupon', isAuthenticated, verifyCoupon);

router.get("/user-orders", isAuthenticated, isUser, getUserOrders);
router.get("/user-order/:id", isAuthenticated, isUser, getUserOrderById);
router.get("/shop-orders/:shopId", isAuthenticated, getShopOrders);

// admin
router.get("/admin/orders", isAuthenticated, isAdmin, adminGetOrders);
router.get("/admin/orders/:id", isAuthenticated, isAdmin, adminGetOrderById);

export default router;