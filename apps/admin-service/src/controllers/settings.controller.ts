import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { ValidationError } from "@packages/error-handler";

export const getSiteConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await prisma.site_config.findFirst();

    return res.status(200).json({
      success: true,
      config,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSiteConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body ?? {};

    const existing = await prisma.site_config.findFirst();
    if (!existing) {
      throw new ValidationError("Site config not initialized");
    }

    const updated = await prisma.site_config.update({
      where: { id: existing.id },
      data: {
        storeName: payload.storeName,
        storeUrl: payload.storeUrl,
        supportEmail: payload.supportEmail,
        supportPhone: payload.supportPhone,
        description: payload.description,

        timezone: payload.timezone,
        currency: payload.currency,
        language: payload.language,
        dateFormat: payload.dateFormat,

        themeMode: payload.themeMode,
        accentColor: payload.accentColor,
        adminNotifications: payload.adminNotifications,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Site config updated successfully",
      config: updated,
    });
  } catch (error) {
    return next(error);
  }
};

