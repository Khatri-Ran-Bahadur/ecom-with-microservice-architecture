import express, { Router } from "express";
import {
    getCategories, createDiscountCode, updateDiscountCode, getDiscountCodes, deleteDiscountCode, uploadProductImage, deleteProductImage, createProduct, getProducts, getProductById, deleteProduct, updateProduct,
    getAllProducts, getProductBySlug, getStripeAccount, getFilteredProducts,
    getFilteredEvents, getAllEvents, getFilteredShops,
    searchProducts, topShops, getShopById,
    adminGetProducts, createCategory, updateCategory, deleteCategory
} from "../controllers/product.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isAdmin, isSeller } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/categories/create", isAuthenticated, isAdmin, createCategory);
router.put("/categories/update/:id", isAuthenticated, isAdmin, updateCategory);
router.delete("/categories/delete/:id", isAuthenticated, isAdmin, deleteCategory);
router.post("/create-discount-code", isAuthenticated, isSeller, createDiscountCode);
router.put("/update-discount-code/:id", isAuthenticated, isSeller, updateDiscountCode);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, isSeller, deleteDiscountCode);
router.post("/upload-product-image", isAuthenticated, isSeller, uploadProductImage);
router.delete("/delete-product-image", isAuthenticated, isSeller, deleteProductImage);
router.post("/create", isAuthenticated, isSeller, createProduct);
router.get("/get-products", isAuthenticated, isSeller, getProducts);
router.get("/get-product/:id", getProductById);
router.get("/get-product-by-slug/:slug", getProductBySlug);
router.delete("/delete-product/:id", isAuthenticated, isSeller, deleteProduct);
router.put("/update-product/:id", isAuthenticated, isSeller, updateProduct);
router.get("/get-all-products", getAllProducts);
router.get("/get-stripe-account", getStripeAccount);
router.get("/get-filtered-products", getFilteredProducts);
router.get("/get-filtered-offeres", getFilteredEvents);
router.get("/get-all-events", getAllEvents);
router.get("/get-filtered-shops", getFilteredShops);
router.get("/search-products", searchProducts);
router.get("/top-shops", topShops);
router.get("/get-shop/:id", getShopById);

// admin
router.get("/admin/products", isAuthenticated, isAdmin, adminGetProducts);




export default router;