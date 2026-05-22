import express, { Router } from "express";
import { userRegistration, verifyUser, loginUser, userForgotPassword, resetUserPassword, updateAvatar, verifyForgotPasswordOtp, refreshToken, getUser, createShop, registerSeller, verifySeller, createStripeAccountLink, loginSeller, getSeller, addUserAddress, getUserAddress, updateUserAddress, deleteUserAddress, setDefaultAddress, getUserStats, updatePassword, getUserNotifications, getUserReviews, updateProfile, loginAdmin, getAdmin } from "../controller/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller, isUser, isAdmin } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token", refreshToken);
router.get("/logged-in-user", isAuthenticated, isUser, getUser);
router.post("/update-avatar", isAuthenticated, isUser, updateAvatar)
router.post("/forgot-password-user", userForgotPassword);
router.post("/verify-forgot-password-user", verifyForgotPasswordOtp);
router.post("/reset-password-user", resetUserPassword);
router.post("/add-address", isAuthenticated, isUser, addUserAddress);
router.get("/get-address", isAuthenticated, isUser, getUserAddress);
router.post("/update-address", isAuthenticated, isUser, updateUserAddress);
router.post("/delete-address", isAuthenticated, isUser, deleteUserAddress);
router.post("/set-default-address", isAuthenticated, isUser, setDefaultAddress);

// new dynamic profile endpoints
router.get("/user-stats", isAuthenticated, isUser, getUserStats);
router.put("/update-password", isAuthenticated, isUser, updatePassword);
router.get("/user-notifications", isAuthenticated, isUser, getUserNotifications);
router.get("/user-reviews", isAuthenticated, isUser, getUserReviews);
router.put("/update-profile", isAuthenticated, isUser, updateProfile);



//seller
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/connect-stripe", createStripeAccountLink);
router.post("/login-seller", loginSeller);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);

//admin
router.post("/admin-login", loginAdmin)
router.get("/logged-in-admin", isAuthenticated, isAdmin, getAdmin);

export default router;