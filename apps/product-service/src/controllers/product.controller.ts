import { NextFunction, Request, Response } from "express";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import { imageKit } from "@packages/libs/imagekit";
import { Prisma } from "@prisma/client";




// Helper to build recursive category tree
const buildCategoryTree = (categoriesList: any[], parentId: string | null = null): any[] => {
    return categoriesList
        .filter(c => c.parentId === parentId)
        .map(c => {
            const children = buildCategoryTree(categoriesList, c.id);
            return {
                id: c.id,
                name: c.name,
                title: c.name,
                slug: c.slug,
                icon: c.icon,
                parentId: c.parentId,
                children: children,
                subCategories: children
            };
        });
};

// get our product category (dynamic tree with legacy fallbacks)
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const allCats = await prisma.categories.findMany({
            orderBy: { name: "asc" }
        });

        // 1. Build tree structure for modern frontends
        const tree = buildCategoryTree(allCats, null);

        // 2. Build legacy structures for backward compatibility
        const legacyCategories = allCats.filter(c => !c.parentId).map(c => c.name);
        const legacySubCategories: Record<string, string[]> = {};
        
        allCats.filter(c => !c.parentId).forEach(root => {
            const directChildren = allCats.filter(c => c.parentId === root.id).map(c => c.name);
            legacySubCategories[root.name] = directChildren.length > 0 ? directChildren : [root.name];
        });

        // If no categories in DB yet, fallback to site config or default initialization list
        if (allCats.length === 0) {
            const config = await prisma.site_config.findFirst();
            if (config) {
                return res.status(200).json({
                    categories: config.categories,
                    subCategories: config.subCategories,
                    tree: []
                });
            }
            return res.status(200).json({
                categories: ["Electronics", "Clothing", "Home & Kitchen", "Beauty", "Other"],
                subCategories: {
                    "Electronics": ["Mobile", "Laptop", "Tablet", "Headphone", "Speaker", "Smart Watch", "Camera", "Other"],
                    "Clothing": ["Men", "Women", "Kids", "Other"],
                    "Home & Kitchen": ["Furniture", "Decor", "Kitchen", "Other"],
                    "Beauty": ["Skincare", "Makeup", "Haircare", "Other"],
                    "Other": ["Other"]
                },
                tree: []
            });
        }

        res.status(200).json({
            categories: legacyCategories,
            subCategories: legacySubCategories,
            tree: tree
        });
    } catch (error) {
        next(error);
    }
};

// Create dynamic category (Admin only)
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, parentId, icon } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        // Generate URL-friendly slug
        let slug = name.toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
            
        let existing = await prisma.categories.findFirst({ where: { slug } });
        let attempt = 1;
        while (existing) {
            slug = `${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${attempt}`;
            existing = await prisma.categories.findFirst({ where: { slug } });
            attempt++;
        }

        const category = await prisma.categories.create({
            data: {
                name,
                slug,
                parentId: parentId || null,
                icon: icon || null
            }
        });

        res.status(201).json({ success: true, message: "Category created successfully", category });
    } catch (error) {
        next(error);
    }
};

// Update dynamic category (Admin only)
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, parentId, icon } = req.body;

        const categoryExists = await prisma.categories.findUnique({ where: { id } });
        if (!categoryExists) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        let slug = categoryExists.slug;
        if (name && name !== categoryExists.name) {
            slug = name.toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
                
            let existing = await prisma.categories.findFirst({ where: { slug, id: { not: id } } });
            let attempt = 1;
            while (existing) {
                slug = `${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${attempt}`;
                existing = await prisma.categories.findFirst({ where: { slug, id: { not: id } } });
                attempt++;
            }
        }

        if (parentId && parentId === id) {
            return res.status(400).json({ success: false, message: "A category cannot be its own parent" });
        }

        const updated = await prisma.categories.update({
            where: { id },
            data: {
                name: name || undefined,
                slug,
                parentId: parentId === "" ? null : (parentId || undefined),
                icon: icon !== undefined ? icon : undefined
            }
        });

        res.status(200).json({ success: true, message: "Category updated successfully", category: updated });
    } catch (error) {
        next(error);
    }
};

// Helper recursively finding all descendants of category ids
const getAllChildIds = async (categoryIds: string[]): Promise<string[]> => {
    const children = await prisma.categories.findMany({
        where: { parentId: { in: categoryIds } },
        select: { id: true }
    });
    if (children.length === 0) return [];
    const childIds = children.map(c => c.id);
    const subChildIds = await getAllChildIds(childIds);
    return [...childIds, ...subChildIds];
};

// Delete category and all its children recursively (Admin only)
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const categoryExists = await prisma.categories.findUnique({ where: { id } });
        if (!categoryExists) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        const allDeleteIds = [id, ...(await getAllChildIds([id]))];

        // Disassociate products belonging to deleted categories
        await prisma.products.updateMany({
            where: { categoryId: { in: allDeleteIds } },
            data: { categoryId: null }
        });

        // Delete all of these categories
        await prisma.categories.deleteMany({
            where: { id: { in: allDeleteIds } }
        });

        res.status(200).json({ success: true, message: "Category and all its subcategories deleted successfully" });
    } catch (error) {
        next(error);
    }
};


export const adminGetProducts = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10, q = "", status = "", category = "", shopId = "" } = req.query;

        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        const where: Prisma.productsWhereInput = {
            ...(status && status !== "all" ? { status: String(status) as any } : {}),
            ...(shopId ? { shopId: String(shopId) } : {}),
            ...(category
                ? {
                    OR: [
                        { category: String(category) },
                        { subCategory: String(category) },
                    ],
                }
                : {}),
            ...(q
                ? {
                    OR: [
                        { title: { contains: String(q), mode: "insensitive" } },
                        { short_description: { contains: String(q), mode: "insensitive" } },
                        { slug: { contains: String(q), mode: "insensitive" } },
                        { tags: { has: String(q) } },
                    ],
                }
                : {}),
        };

        const [total, products] = await prisma.$transaction([
            prisma.products.count({ where }),
            prisma.products.findMany({
                where,
                include: {
                    shop: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limitNum,
            }),
        ]);

        return res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        return next(error);
    }
};

// create discount code
export const createDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { public_name, discountType, discountValue, discountCode, usageLimit, isActive, expiryDate } = req.body;
        // validate
        if (!public_name || !discountType || !discountValue || !discountCode || !usageLimit || !isActive || !expiryDate) {
            return next(new ValidationError("All fields are required"));
        }
        // is this discount code exists
        const existDiscountCode = await prisma.discount_codes.findFirst({
            where: {
                discountCode,
            },
        });
        if (existDiscountCode) {
            return next(new ValidationError("Discount code already exists"));
        }

        const discount_code = await prisma.discount_codes.create({
            data: {
                public_name,
                discountType,
                discountValue: parseFloat(discountValue),
                discountCode,
                sellerId: req.seller.id,
                usageLimit: parseInt(usageLimit),
                isActive: isActive,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            }
        })
        res.status(200).json({ success: true, discount_code: discount_code });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

// get discount code
export const getDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    try {
        const whereClause: any = {};
        if (req.role === "seller") {
            if (!req.seller || !req.seller.id) {
                return res.status(401).json({ message: "Unauthorized! Seller profile not loaded." });
            }
            whereClause.sellerId = req.seller.id;
        } else if (req.role !== "admin") {
            return res.status(403).json({ message: "Access denied! Only sellers or admins can view discount codes." });
        }

        const discount_codes = await prisma.discount_codes.findMany({
            where: whereClause
        })
        res.status(200).json({ success: true, discount_codes: discount_codes });
    } catch (error) {
        next(error);
    }
}

// delete discount code
export const deleteDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sellerId = req.seller.id;

        const discountCode = await prisma.discount_codes.findFirst({
            where: {
                id,
            },
            select: { id: true, sellerId: true }
        })

        if (!discountCode) {
            return next(new ValidationError("Discount code not found"));
        }

        if (discountCode.sellerId != sellerId) {
            return next(new ValidationError("You are not authorized to delete this discount code"));
        }

        await prisma.discount_codes.delete({
            where: {
                id
            }
        })
        res.status(200).json({ success: true, message: "Discount code deleted successfully" });
    } catch (error) {
        next(error);
    }
}

// update discount code
export const updateDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sellerId = req.seller.id;
        const { public_name, discountType, discountValue, discountCode, usageLimit, isActive, expiryDate } = req.body;
        const existDiscountCode = await prisma.discount_codes.findFirst({
            where: {
                id,
            },
            select: { id: true, sellerId: true }
        })
        if (!existDiscountCode) {
            return next(new ValidationError("Discount code not found"));
        }
        if (existDiscountCode.sellerId != sellerId) {
            return next(new ValidationError("You are not authorized to update this discount code"));
        }
        const updatedDiscountCode = await prisma.discount_codes.update({
            where: {
                id
            },
            data: {
                public_name,
                discountType,
                discountValue: parseFloat(discountValue),
                discountCode,
                usageLimit: parseInt(usageLimit),
                isActive: isActive,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            }
        })
        res.status(200).json({ success: true, discount_code: updatedDiscountCode });
    } catch (error) {
        next(error);
    }
}


// upload product image
export const uploadProductImage = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { fileName } = req.body;
        if (!fileName) {
            return next(new ValidationError("File is required"));
        }

        const response = await imageKit.upload({
            file: fileName,
            fileName: `product-${Date.now()}.jpg`,
            folder: "/products",
        });
        res.status(200).json({ success: true, file_url: response.url, fileId: response.fileId });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

// delete product image
export const deleteProductImage = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.body;
        if (!fileId) {
            return next(new ValidationError("File name is required"));
        }
        await imageKit.deleteFile(fileId);
        res.status(200).json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
        next(error);
    }
}



// create product
export const createProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {
            title,
            short_description,
            detailed_description,
            warranty,
            custom_specifications = {},
            slug,
            tags = [],
            cash_on_delivery,
            brand,
            video_url = "",
            category,
            subCategory,
            categoryId,
            colors = [],
            sizes = [],
            discount_codes = [],
            stock,
            sale_price = 0,
            regular_price,
            custom_properties = {},
            images = []
        } = req.body;

        // Validate required fields
        const requiredFields = [
            'title', 'short_description', 'detailed_description', 'slug',
            'stock', 'regular_price'
        ];

        const missingFields = requiredFields.filter(field => {
            const val = req.body[field];
            return val === undefined || val === null || val === '';
        });

        if (!categoryId && (!category || !subCategory)) {
            missingFields.push('category / subCategory / categoryId');
        }

        const validImages = Array.isArray(images) ? images.filter(img => img !== null) : [];

        if (missingFields.length > 0 || validImages.length === 0) {
            return next(new ValidationError(`Missing required fields: ${missingFields.join(', ')}${validImages.length === 0 ? ', images' : ''}`));
        }

        if (!req.seller?.id || !req.seller?.shop?.id) {
            return next(new AuthError("You must have an active shop to create products"));
        }

        // Resolve legacy category/subCategory names if dynamic categoryId is supplied
        let resolvedCategoryName = category;
        let resolvedSubCategoryName = subCategory;
        if (categoryId) {
            const selectedCat = await prisma.categories.findUnique({
                where: { id: categoryId }
            });
            if (selectedCat) {
                // Find root category for 'category' name
                let rootCat = selectedCat;
                while (rootCat.parentId) {
                    const parent = await prisma.categories.findUnique({ where: { id: rootCat.parentId } });
                    if (!parent) break;
                    rootCat = parent;
                }
                resolvedCategoryName = rootCat.name;
                resolvedSubCategoryName = selectedCat.name;
            }
        }

        const product = await prisma.products.create({
            data: {
                title,
                short_description,
                detailed_description,
                warranty,
                slug,
                shopId: req.seller.shop.id,
                tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(",").map(t => t.trim()) : []),
                cash_on_delivery: cash_on_delivery === 'yes' || cash_on_delivery === true,
                brand,
                video_url,
                category: resolvedCategoryName || "Other",
                subCategory: resolvedSubCategoryName || "Other",
                categoryId: categoryId || null,
                colors,
                sizes,
                discount_codes: Array.isArray(discount_codes) ? discount_codes.map((id: string) => id.trim()) : [],
                stock: parseInt(stock),
                sale_price: parseFloat(sale_price.toString()),
                regular_price: parseFloat(regular_price.toString()),
                images: validImages.map((image: any) => ({
                    fileId: image.fieldId || image.fileId,
                    url: image.file_url || image.url
                })),
                custom_properties: custom_properties || {},
                custom_specifications: custom_specifications || {},
            }
        });

        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error("Create Product Error:", error);
        next(error);
    }
};

// get products for seller
export const getProducts = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10, search = "", category = "", status = "" } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        if (!req.seller?.shop?.id) {
            return next(new AuthError("You must have an active shop to view products"));
        }

        const where: any = {
            shopId: req.seller.shop.id,
            isDeleted: { not: true }, // Filter out deleted products
        };

        if (search) {
            where.title = { contains: search as string, mode: "insensitive" };
        }
        if (category) {
            where.OR = [
                { category: category as string },
                { subCategory: category as string }
            ];
        }
        if (status) {
            // Convert status string to enum case if necessary
            where.status = status as any;
        }

        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where,
                skip,
                take: parseInt(limit as string),
                orderBy: { createdAt: "desc" },
            }),
            prisma.products.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                totalPages: Math.ceil(total / parseInt(limit as string)),
            },
        });
    } catch (error) {
        console.error("Get Products Error:", error);
        next(error);
    }
};

// get single product
export const getProductById = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!req.seller?.shop?.id) {
            return next(new AuthError("You must have an active shop to view products"));
        }

        const product = await prisma.products.findFirst({
            where: {
                id,
                shopId: req.seller.shop.id,
                isDeleted: { not: true },
            },
        });

        if (!product) {
            return next(new ValidationError("Product not found"));
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

// delete product (soft delete)
export const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!req.seller?.shop?.id) {
            return next(new AuthError("You must have an active shop to delete products"));
        }

        const product = await prisma.products.findFirst({
            where: { id, shopId: req.seller.shop.id },
        });

        if (!product) {
            return next(new ValidationError("Product not found"));
        }


        await Promise.all(deleteImages);

        await prisma.products.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            },
        });

        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete Product Error:", error);
        next(error);
    }
};


// update product
export const updateProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const {
            title,
            short_description,
            detailed_description,
            warranty,
            custom_specifications = {},
            slug,
            tags = [],
            cash_on_delivery,
            brand,
            video_url = "",
            category,
            subCategory,
            categoryId,
            colors = [],
            sizes = [],
            discount_codes = [],
            stock,
            sale_price = 0,
            regular_price,
            custom_properties = {},
            images = []
        } = req.body;

        if (!req.seller?.shop?.id) {
            return next(new AuthError("You must have an active shop to update products"));
        }

        const existingProduct = await prisma.products.findFirst({
            where: { id, shopId: req.seller.shop.id },
        });

        if (!existingProduct) {
            return next(new ValidationError("Product not found or unauthorized"));
        }

        //check seller is owner

        if (existingProduct.shopId !== req.seller.shop.id) {
            return next(new AuthError("You are not authorized to update this product"));
        }

        // Validate required fields
        const requiredFields = [
            'title', 'short_description', 'detailed_description', 'slug',
            'stock', 'regular_price'
        ];

        const missingFields = requiredFields.filter(field => {
            const val = req.body[field];
            return val === undefined || val === null || val === '';
        });

        if (!categoryId && (!category || !subCategory)) {
            missingFields.push('category / subCategory / categoryId');
        }

        const validImages = Array.isArray(images) ? images.filter(img => img !== null) : [];

        if (missingFields.length > 0 || validImages.length === 0) {
            return next(new ValidationError(`Missing required fields: ${missingFields.join(', ')}${validImages.length === 0 ? ', images' : ''}`));
        }

        // Resolve legacy category/subCategory names if dynamic categoryId is supplied
        let resolvedCategoryName = category;
        let resolvedSubCategoryName = subCategory;
        if (categoryId) {
            const selectedCat = await prisma.categories.findUnique({
                where: { id: categoryId }
            });
            if (selectedCat) {
                // Find root category for 'category' name
                let rootCat = selectedCat;
                while (rootCat.parentId) {
                    const parent = await prisma.categories.findUnique({ where: { id: rootCat.parentId } });
                    if (!parent) break;
                    rootCat = parent;
                }
                resolvedCategoryName = rootCat.name;
                resolvedSubCategoryName = selectedCat.name;
            }
        }

        const product = await prisma.products.update({
            where: { id },
            data: {
                title,
                short_description,
                detailed_description,
                warranty,
                slug,
                tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(",").map(t => t.trim()) : []),
                cash_on_delivery: cash_on_delivery === 'yes' || cash_on_delivery === true,
                brand,
                video_url,
                category: resolvedCategoryName || "Other",
                subCategory: resolvedSubCategoryName || "Other",
                categoryId: categoryId || null,
                colors,
                sizes,
                discount_codes: Array.isArray(discount_codes) ? discount_codes.map((id: string) => id.trim()) : [],
                stock: parseInt(stock),
                sale_price: parseFloat(sale_price.toString()),
                regular_price: parseFloat(regular_price.toString()),
                images: validImages.map((image: any) => ({
                    fileId: image.fieldId || image.fileId,
                    url: image.file_url || image.url
                })),
                custom_properties: custom_properties || {},
                custom_specifications: custom_specifications || {},
            }
        });

        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error("Update Product Error:", error);
        next(error);
    }
};
export const getAllProducts = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10, type } = req.query;

        const pageNumber = Math.max(parseInt(page as string) || 1, 1);
        const limitNumber = Math.max(parseInt(limit as string) || 10, 1);
        const skip = (pageNumber - 1) * limitNumber;

        // ✅ validate type safely
        const validTypes = ["latest", "topSales"];
        const sortType = validTypes.includes(type as string) ? type : "topSales";

        const orderBy: Prisma.productsOrderByInput =
            sortType === "latest"
                ? { createdAt: "desc" }
                : { totalSales: "desc" };

        const baseFilter = {
            isDeleted: { not: true },
            AND: [
                {
                    OR: [
                        { starting_date: null },
                        { starting_date: { lte: new Date() } },
                        { starting_date: { isSet: false } }
                    ]
                },
                {
                    OR: [
                        { ending_date: null },
                        { ending_date: { gte: new Date() } },
                        { ending_date: { isSet: false } }
                    ]
                }
            ]
        };

        const [products, total, top10Products] = await Promise.all([
            prisma.products.findMany({
                skip,
                take: limitNumber,
                include: { shop: true },
                where: baseFilter,
                orderBy,
            }),

            prisma.products.count({
                where: baseFilter,
            }),

            prisma.products.findMany({
                take: 10,
                include: { shop: true },
                where: baseFilter,
                orderBy,
            }),
        ]);

        return res.status(200).json({
            success: true,
            products,
            top10By: sortType,
            top10Products,
            total,
            currentPage: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
        });

    } catch (error) {
        console.error("Get Products Error:", error);
        next(error);
    }
};

// get product by slug
export const getProductBySlug = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const product = await prisma.products.findFirst({
            where: { slug },
            include: { shop: true },
        });
        if (!product) {
            return next(new ValidationError("Product not found"));
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error("Error in getProductBySlug:", error);
        next(error);
    }
}

// get stripe account
export const getStripeAccount = async (req: any, res: Response, next: NextFunction) => {
    try {
        const seller = await prisma.sellers.findFirst({
            where: {
                id: req.seller.id,
            },
            select: { stripeId: true },
        });
        if (!seller) {
            return next(new ValidationError("Seller not found"));
        }
        res.status(200).json({ success: true, stripeId: seller.stripeId });
    } catch (error) {
        next(error);
    }
}

// get filtered products
export const getFilteredProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            priceRange,
            categories,
            subCategories,
            colors,
            sizes,
            search,
            rating,
            inStockOnly,
            sortBy = 'featured',
            page = 1,
            limit = 12
        } = req.query;

        const parsedPage = Number(page);
        const parsedLimit = Number(limit);
        const skip = (parsedPage - 1) * parsedLimit;

        const filters: Record<string, any> = {
            isDeleted: false
        };

        // Price Range
        if (priceRange) {
            const [min, max] = String(priceRange).split(",").map(Number);
            filters.sale_price = { gte: min || 0, lte: max || 1000000 };
        }

        // Search
        if (search) {
            filters.OR = [
                { title: { contains: String(search), mode: 'insensitive' } },
                { short_description: { contains: String(search), mode: 'insensitive' } },
                { tags: { has: String(search) } }
            ];
        }

        // Categories & SubCategories (Real E-commerce Logic + Dynamic Tree support)
        const catList = String(categories || "").split(",").filter(Boolean);
        const subList = String(subCategories || "").split(",").filter(Boolean);

        if (catList.length > 0 || subList.length > 0) {
            // Find all matching category IDs in DB for these slugs
            const dbCategories = await prisma.categories.findMany({
                where: {
                    slug: { in: [...catList, ...subList] }
                }
            });
            const dbCategoryIds = dbCategories.map(c => c.id);
            
            // Also recursively find all children of these categories so that checking a parent category returns all products in children
            const allMatchIds = [...dbCategoryIds];
            if (dbCategoryIds.length > 0) {
                const childIds = await getAllChildIds(dbCategoryIds);
                allMatchIds.push(...childIds);
            }

            const categoryFilters: any[] = [];
            
            if (allMatchIds.length > 0) {
                categoryFilters.push({ categoryId: { in: allMatchIds } });
            }

            // Fetch site config to understand parent-child relationships (fallback for legacy products)
            const config = await prisma.site_config.findFirst();
            const subMap: Record<string, string[]> = (config?.subCategories as any) || {};

            // 1. Handle Categories that might have selected sub-categories
            for (const cat of catList) {
                const possibleSubs = subMap[cat] || [];
                const selectedSubsForThisCat = subList.filter(s => possibleSubs.includes(s));

                if (selectedSubsForThisCat.length > 0) {
                    // If parent AND subs are selected, narrow to those subs within the parent (AND logic)
                    categoryFilters.push({
                        category: cat,
                        subCategory: { in: selectedSubsForThisCat }
                    });
                } else {
                    // If only parent is selected, show everything in parent
                    categoryFilters.push({ category: cat });
                }
            }

            // 2. Handle Sub-categories whose parents were NOT selected
            for (const sub of subList) {
                const parent = Object.keys(subMap).find(k => subMap[k].includes(sub));
                if (!parent || !catList.includes(parent)) {
                    // Check if this sub was already handled by its parent
                    const alreadyHandled = categoryFilters.some(f => f.subCategory?.in?.includes(sub));
                    if (!alreadyHandled) {
                        categoryFilters.push({ subCategory: sub });
                    }
                }
            }

            if (categoryFilters.length > 0) {
                filters.OR = [
                    ...(filters.OR || []),
                    ...categoryFilters
                ];
            }
        }

        // Colors & Sizes
        if (colors) {
            const colorList = String(colors).split(",").filter(Boolean);
            if (colorList.length > 0) filters.colors = { hasSome: colorList };
        }
        if (sizes) {
            const sizeList = String(sizes).split(",").filter(Boolean);
            if (sizeList.length > 0) filters.sizes = { hasSome: sizeList };
        }

        // Rating
        if (rating) {
            filters.ratings = { gte: Number(rating) };
        }

        // Availability
        if (inStockOnly === 'true') {
            filters.stock = { gt: 0 };
        }

        // Sorting
        let orderBy: any = { createdAt: 'desc' };
        if (sortBy === 'price_asc') orderBy = { sale_price: 'asc' };
        else if (sortBy === 'price_desc') orderBy = { sale_price: 'desc' };
        else if (sortBy === 'rating') orderBy = { ratings: 'desc' };
        else if (sortBy === 'sales') orderBy = { totalSales: 'desc' };
        else if (sortBy === 'newest') orderBy = { createdAt: 'desc' };
        else if (sortBy === 'featured') orderBy = { is_featured: 'desc' };

        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where: filters,
                include: { shop: true },
                skip,
                take: parsedLimit,
                orderBy
            }),
            prisma.products.count({ where: filters }),
        ]);

        const totalPages = Math.ceil(total / parsedLimit);

        return res.status(200).json({
            success: true,
            products,
            total,
            totalPages,
            page: parsedPage,
            limit: parsedLimit,
            hasNext: totalPages > parsedPage,
            hasPrev: parsedPage > 1,
        });

    } catch (error) {
        console.error("Get Products Error:", error);
        next(error);
    }
};

// get filtered events
export const getFilteredEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            priceRange = [0, 10000],
            categories = "",
            subCategories = "",
            colors = "",
            sizes = "",
            page = 1,
            limit = 12
        } = req.query;

        const parsedPriceRange = typeof priceRange === "string" ? priceRange.split(",").map(Number) : [0, 10000];
        const parsedPage = Number(page);
        const parsedLimit = Number(limit);

        const skip = (parsedPage - 1) * parsedLimit;

        const filters: Record<string, any> = {
            sale_price: {
                gte: parsedPriceRange[0],
                lte: parsedPriceRange[1],
            },
            NOT: {
                starting_date: null
            }
        }

        // Categories & SubCategories (Precise Hierarchical Logic)
        const catList = String(categories || "").split(",").filter(Boolean);
        const subList = String(subCategories || "").split(",").filter(Boolean);

        if (catList.length > 0 || subList.length > 0) {
            const config = await prisma.site_config.findFirst();
            const subMap: Record<string, string[]> = (config?.subCategories as any) || {};
            const categoryFilters: any[] = [];

            for (const cat of catList) {
                const possibleSubs = subMap[cat] || [];
                const selectedSubsForThisCat = subList.filter(s => possibleSubs.includes(s));
                if (selectedSubsForThisCat.length > 0) {
                    categoryFilters.push({ category: cat, subCategory: { in: selectedSubsForThisCat } });
                } else {
                    categoryFilters.push({ category: cat });
                }
            }

            for (const sub of subList) {
                const parent = Object.keys(subMap).find(k => subMap[k].includes(sub));
                if (!parent || !catList.includes(parent)) {
                    const alreadyHandled = categoryFilters.some(f => f.subCategory?.in?.includes(sub));
                    if (!alreadyHandled) {
                        categoryFilters.push({ subCategory: sub });
                    }
                }
            }

            if (categoryFilters.length > 0) {
                filters.OR = [...(filters.OR || []), ...categoryFilters];
            }
        }

        if (colors && (colors as string[]).length > 0) {
            filters.colors = { hasSome: Array.isArray(colors) ? colors : String(colors).split(","), }
        }

        if (sizes && (sizes as string[]).length > 0) {
            filters.sizes = { hasSome: Array.isArray(sizes) ? sizes : String(sizes).split(","), }
        }

        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where: filters,
                include: { shop: true },
                skip,
                take: parsedLimit,
            }),
            prisma.products.count({ where: filters }),
        ])

        const totalPages = Math.ceil(total / parsedLimit);
        const hasNext = totalPages > parsedPage;
        const hasPrev = parsedPage > 1;

        return res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page: parsedPage,
                limit: parsedLimit,
                totalPages,
                hasNext,
                hasPrev,
            },
        })

    } catch (error) {
        console.error("Get Products Error:", error);
        next(error);
    }
};

// get filtered shops
export const getFilteredShops = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            categories = [],
            countries = [],
            page = 1,
            limit = 12
        } = req.query;

        const parsedPage = Number(page);
        const parsedLimit = Number(limit);

        const skip = (parsedPage - 1) * parsedLimit;

        const filters: Record<string, any> = {}

        // Filter by categories (unified parameter)
        if (categories) {
            const catList = String(categories).split(",").filter(Boolean);
            if (catList.length > 0) {
                filters.category = { in: catList };
            }
        }

        if (countries && String(countries).length > 0) {
            filters.country = { in: Array.isArray(countries) ? countries : String(countries).split(","), }
        }


        const [shops, total] = await Promise.all([
            prisma.shops.findMany({
                where: filters,
                skip,
                take: parsedLimit,
                include: {
                    avatar: true
                }
            }),
            prisma.shops.count({ where: filters }),
        ])

        const totalPages = Math.ceil(total / parsedLimit);
        const hasNext = totalPages > parsedPage;
        const hasPrev = parsedPage > 1;

        return res.status(200).json({
            success: true,
            shops,
            pagination: {
                total,
                page: parsedPage,
                limit: parsedLimit,
                totalPages,
                hasNext,
                hasPrev,
            },
        })

    } catch (error) {
        console.error("Get Products Error:", error);
        next(error);
    }
};

// search products
export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { q: query, categories = "", subCategories = "" } = req.query as any;
        if (!query || query.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            })
        }

        const filters: any = {
            OR: [
                { title: { contains: query, mode: "insensitive" } },
                { short_description: { contains: query, mode: "insensitive" } },
            ]
        };

        // Categories & SubCategories (Precise Hierarchical Logic)
        const catList = String(categories || "").split(",").filter(Boolean);
        const subList = String(subCategories || "").split(",").filter(Boolean);

        if (catList.length > 0 || subList.length > 0) {
            const config = await prisma.site_config.findFirst();
            const subMap: Record<string, string[]> = (config?.subCategories as any) || {};
            const categoryFilters: any[] = [];

            for (const cat of catList) {
                const possibleSubs = subMap[cat] || [];
                const selectedSubsForThisCat = subList.filter(s => possibleSubs.includes(s));
                if (selectedSubsForThisCat.length > 0) {
                    categoryFilters.push({ category: cat, subCategory: { in: selectedSubsForThisCat } });
                } else {
                    categoryFilters.push({ category: cat });
                }
            }

            for (const sub of subList) {
                const parent = Object.keys(subMap).find(k => subMap[k].includes(sub));
                if (!parent || !catList.includes(parent)) {
                    const alreadyHandled = categoryFilters.some(f => f.subCategory?.in?.includes(sub));
                    if (!alreadyHandled) {
                        categoryFilters.push({ subCategory: sub });
                    }
                }
            }

            if (categoryFilters.length > 0) {
                // Wrap existing OR and add category filters
                const textSearch = filters.OR;
                delete filters.OR;
                filters.AND = [
                    { OR: textSearch },
                    { OR: categoryFilters }
                ];
            }
        }

        const products = await prisma.products.findMany({
            where: filters,
            select: {
                id: true,
                title: true,
                slug: true,
            },
            take: 10,
            orderBy: {
                createdAt: "desc",
            }
        });

        return res.status(200).json({
            success: true,
            products,
        })

    } catch (error) {
        console.error("Get Products Error:", error);
        next(error);
    }
}

//get top shops

export const topShops = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const topShopsData = await prisma.orders.groupBy({
            by: ["shopId"],
            _sum: {
                total: true
            },
            orderBy: {
                _sum: {
                    total: "desc"
                }
            },
            take: 10,
        });

        //fetch the corresponding shop details
        const shopIds = topShopsData.map(shop => shop.shopId);
        const shops = await prisma.shops.findMany({
            where: {
                id: {
                    in: shopIds
                }
            },
            select: {
                id: true,
                name: true,
                avatar: true,
                coverBanner: true,
                address: true,
                ratings: true,
                category: true,
            }
        });

        //Merge sales with shop data
        const enrichedShops = shops.map(shop => {
            const salesData = topShopsData.find(s => s.shopId === shop.id);
            return {
                ...shop,
                totalSales: salesData?._sum.total || 0,
            }
        });

        const top10Shops = enrichedShops.sort((a, b) => b.totalSales - a.totalSales).slice(0, 10);

        return res.status(200).json({
            success: true,
            shops: top10Shops,
        });

    } catch (error) {
        console.error("Get Top Shops Error:", error);
        next(error);
    }
}

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);
        const skip = (page - 1) * limit;
        const baseFilter = { AND: [{ starting_date: { not: null } }, { ending_date: { not: null } }] };

        const [events, total, top10BySales] = await Promise.all([
            prisma.products.findMany({
                where: baseFilter,
                skip,
                take: limit,
                include: {
                    shop: true,
                },
                orderBy: {
                    totalSales: "desc"
                }
            }),
            prisma.products.count({
                where: baseFilter,
            }),
            prisma.products.findMany({
                where: baseFilter,
                take: 10,
                orderBy: {
                    totalSales: "desc"
                }
            })
        ]);


        return res.status(200).json({
            success: true,
            events,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
            top10BySales,
        })

    } catch (error) {
        console.error("Get All Events Error:", error);
        next(error);
    }
}

//get shop by id
export const getShopById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const shop = await prisma.shops.findUnique({
            where: { id },
            include: {
                seller: {
                    select: {
                        stripeId: true
                    }
                }
            }
        });

        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }

        res.status(200).json({ success: true, shop });
    } catch (error) {
        next(error);
    }
};
