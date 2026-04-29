import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
    const existingConfig = await prisma.site_config.findFirst();
    if (!existingConfig) {
        await prisma.site_config.create({
            data: {
                categories: ["Electronics", "Clothing", "Home & Kitchen", "Beauty", "Other"],
                subCategories: {
                    "Electronics": ["Mobile", "Laptop", "Tablet", "Headphone", "Speaker", "Smart Watch", "Camera", "Other"],
                    "Clothing": ["Men", "Women", "Kids", "Other"],
                    "Home & Kitchen": ["Furniture", "Decor", "Kitchen", "Other"],
                    "Beauty": ["Skincare", "Makeup", "Haircare", "Other"],
                    "Other": ["Other"]
                }
            }
        });
    }
};

export default initializeSiteConfig;