import express, { Router } from "express";
import { userRegistration, verifyUser, loginUser, userForgotPassword, resetUserPassword, verifyForgotPasswordOtp, refreshToken, getUser, createShop, registerSeller, verifySeller, createStripeAccountLink, loginSeller, getSeller } from "../controller/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller, isUser } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token", refreshToken);
router.get("/logged-in-user", isAuthenticated, isUser, getUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/verify-forgot-password-user", verifyForgotPasswordOtp);
router.post("/reset-password-user", resetUserPassword);


//seller
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/connect-stripe", createStripeAccountLink);
router.post("/login-seller", loginSeller);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);

export default router;