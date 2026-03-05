import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import Feature4Page from "../features/feature-4";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const products = await prisma.feature4_Product.findMany({
    include: { sizeCharts: true },
    orderBy: { createdAt: "desc" },
  });
  const ugcPhotos = await prisma.feature4_UgcPhoto.findMany({
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  // Analytics stats
  const totalTryOns = await prisma.feature4_TryOnSession.count();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tryOnsToday = await prisma.feature4_TryOnSession.count({
    where: { createdAt: { gte: today } },
  });
  const totalUgc = await prisma.feature4_UgcPhoto.count();
  const pendingUgc = await prisma.feature4_UgcPhoto.count({ where: { approved: false } });

  const totalPurchases = await prisma.feature4_PurchaseHistory.count();
  const returnedPurchases = await prisma.feature4_PurchaseHistory.count({ where: { returned: true } });
  const returnRate = totalPurchases > 0 ? Math.round((returnedPurchases / totalPurchases) * 100) : 0;

  // Product stats
  const productStats = await Promise.all(
    products.map(async (p) => ({
      name: p.name,
      tryOnCount: await prisma.feature4_TryOnSession.count({ where: { productId: p.id } }),
    }))
  );
  productStats.sort((a, b) => b.tryOnCount - a.tryOnCount);

  const analyticsStats = {
    totalTryOns,
    tryOnsToday,
    totalUgc,
    pendingUgc,
    avgConfidence: null,
    returnRate,
    productStats,
  };

  return { products, ugcPhotos, analyticsStats };
};

export default function () {
  return <Feature4Page />;
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
