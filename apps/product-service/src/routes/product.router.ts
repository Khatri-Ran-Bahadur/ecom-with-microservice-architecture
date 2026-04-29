import express, { Router } from "express";
import {
    getCategories, createDiscountCode, updateDiscountCode, getDiscountCodes, deleteDiscountCode, uploadProductImage, deleteProductImage, createProduct, getProducts, getProductById, deleteProduct, updateProduct
} from "../controllers/product.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller, isUser } from "@packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCode);
router.put("/update-discount-code/:id", isAuthenticated, updateDiscountCode);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);
router.post("/upload-product-image", isAuthenticated, isSeller, uploadProductImage);
router.delete("/delete-product-image", isAuthenticated, isSeller, deleteProductImage);
router.post("/create", isAuthenticated, isSeller, createProduct);
router.get("/get-products", isAuthenticated, isSeller, getProducts);
router.get("/get-product/:id", isAuthenticated, isSeller, getProductById);
router.delete("/delete-product/:id", isAuthenticated, isSeller, deleteProduct);
router.put("/update-product/:id", isAuthenticated, isSeller, updateProduct);

export default router;