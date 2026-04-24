import express, { Router } from "express";
import { userRegistration, verifyUser, loginUser, userForgotPassword, resetUserPassword, verifyForgotPasswordOtp } from "../controller/auth.controller";

const router: Router = express.Router();

router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/verify-forgot-password-user", verifyForgotPasswordOtp);
router.post("/reset-password-user", resetUserPassword);

export default router;