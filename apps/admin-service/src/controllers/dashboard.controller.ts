import { NextFunction, Request, Response } from "express";
import prisma from "@packages/libs/prisma";

const parseRange = (range?: string) => {
  if (range === "365d") return 365;
  if (range === "30d") return 30;
  return 7;
};

const dayKey = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const range = String(req.query.range ?? "7d");
    const days = parseRange(range);

    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const [totalUsers, totalProducts, totalOrdersAll, ordersInRange] = await prisma.$transaction([
      prisma.users.count(),
      prisma.products.count({ where: { isDeleted: { not: true } } }),
      prisma.orders.count(),
      prisma.orders.findMany({
        where: { createdAt: { gte: start } },
        select: { id: true, total: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const totalRevenue = ordersInRange.reduce((sum, o) => sum + Number(o.total ?? 0), 0);

    const seriesMap = new Map<string, { date: string; revenue: number; orders: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const k = dayKey(d);
      seriesMap.set(k, { date: k, revenue: 0, orders: 0 });
    }
    for (const o of ordersInRange) {
      const k = dayKey(new Date(o.createdAt));
      const bucket = seriesMap.get(k);
      if (!bucket) continue;
      bucket.revenue += Number(o.total ?? 0);
      bucket.orders += 1;
    }

    const recentOrders = await prisma.orders.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        shop: { select: { name: true } },
      },
    });

    return res.status(200).json({
      success: true,
      range: `${days}d`,
      kpis: {
        totalRevenue,
        totalUsers,
        totalOrders: totalOrdersAll,
        totalProducts,
      },
      series: Array.from(seriesMap.values()),
      recentOrders,
    });
  } catch (error) {
    return next(error);
  }
};

