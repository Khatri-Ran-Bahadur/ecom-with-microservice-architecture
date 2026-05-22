import express, { Router } from "express";
import { getSiteConfig, updateSiteConfig } from "../controllers/settings.controller";
import { getDashboardSummary } from "../controllers/dashboard.controller";
import {
  updateAdminProfile,
  updateAdminPassword,
  getSellersList,
  getUsersList,
  getPaymentsList
} from "../controllers/admin.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isAdmin } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();


router.get("/settings/site-config", isAuthenticated, isAdmin, getSiteConfig);
router.put("/settings/site-config", isAuthenticated, isAdmin, updateSiteConfig);

router.put("/settings/profile", isAuthenticated, isAdmin, updateAdminProfile);
router.put("/settings/password", isAuthenticated, isAdmin, updateAdminPassword);

router.get("/sellers", isAuthenticated, isAdmin, getSellersList);
router.get("/users", isAuthenticated, isAdmin, getUsersList);
router.get("/payments", isAuthenticated, isAdmin, getPaymentsList);

router.get("/dashboard/summary", isAuthenticated, isAdmin, getDashboardSummary);

export default router;
