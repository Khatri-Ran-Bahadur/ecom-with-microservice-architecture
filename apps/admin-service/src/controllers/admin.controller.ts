import { NextFunction, Request, Response } from "express";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs";
import { ValidationError, AuthError } from "@packages/error-handler";

export const updateAdminProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) {
      throw new AuthError("Unauthorized");
    }

    const { name, avatar } = req.body;
    if (!name) {
      throw new ValidationError("Name is required");
    }

    const updateData: any = { name };

    if (avatar && avatar.url) {
      updateData.avatar = {
        upsert: {
          create: {
            file_id: avatar.file_id || "admin-avatar",
            url: avatar.url
          },
          update: {
            file_id: avatar.file_id || "admin-avatar",
            url: avatar.url
          }
        }
      };
    }

    const updatedAdmin = await prisma.users.update({
      where: { id: adminId },
      data: updateData,
      include: { avatar: true }
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      admin: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        avatar: updatedAdmin.avatar
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAdminPassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) {
      throw new AuthError("Unauthorized");
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new ValidationError("Current and new passwords are required");
    }

    const admin = await prisma.users.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new ValidationError("Admin not found");
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      throw new ValidationError("Invalid current password");
    }

    const isSamePassword = await bcrypt.compare(newPassword, admin.password);
    if (isSamePassword) {
      throw new ValidationError("New password cannot be the same as the old password!");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { id: adminId },
      data: { password: hashedPassword }
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    return next(error);
  }
};

export const getSellersList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q ?? "");
    const page = Math.max(1, Number(req.query.page ?? "1"));
    const limit = Math.max(1, Number(req.query.limit ?? "10"));
    const skip = (page - 1) * limit;

    const whereClause: any = {
      isDeleted: { not: true }
    };

    if (q) {
      whereClause.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { shop: { name: { contains: q, mode: "insensitive" } } }
      ];
    }

    const [total, sellers] = await prisma.$transaction([
      prisma.sellers.count({ where: whereClause }),
      prisma.sellers.findMany({
        where: whereClause,
        include: {
          shop: {
            select: {
              name: true,
              ratings: true,
              category: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      sellers,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const getUsersList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q ?? "");
    const page = Math.max(1, Number(req.query.page ?? "1"));
    const limit = Math.max(1, Number(req.query.limit ?? "10"));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } }
      ];
    }

    const [total, users] = await prisma.$transaction([
      prisma.users.count({ where: whereClause }),
      prisma.users.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          avatar: true,
          _count: {
            select: { addresses: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const getPaymentsList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q ?? "");
    const page = Math.max(1, Number(req.query.page ?? "1"));
    const limit = Math.max(1, Number(req.query.limit ?? "10"));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { id: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } }
      ];
    }

    const [total, orders] = await prisma.$transaction([
      prisma.orders.count({ where: whereClause }),
      prisma.orders.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          shop: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    return next(error);
  }
};
