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
  return { products, ugcPhotos };
};

export default function () {
  return <Feature4Page />;
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
