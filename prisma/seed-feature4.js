import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.feature4_TryOnSession.deleteMany();
  await prisma.feature4_SizeChart.deleteMany();
  await prisma.feature4_Product.deleteMany();

  const tshirt = await prisma.feature4_Product.create({
    data: {
      name: "Classic Fit Cotton T-Shirt",
      description: "Soft 100% cotton crew neck tee. Relaxed fit, perfect for everyday wear.",
      imageUrl: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-tshirt.png",
      category: "clothing",
      sizeCharts: {
        create: [
          { size: "S", chest: 89, waist: 74, hips: 94, shoulder: 42, notes: "Slim fit" },
          { size: "M", chest: 94, waist: 79, hips: 99, shoulder: 44, notes: "Regular fit" },
          { size: "L", chest: 99, waist: 84, hips: 104, shoulder: 46, notes: "Relaxed fit" },
          { size: "XL", chest: 104, waist: 89, hips: 109, shoulder: 48, notes: "Loose fit" },
        ],
      },
    },
  });

  const dress = await prisma.feature4_Product.create({
    data: {
      name: "Floral Summer Dress",
      description: "Light and breezy floral print dress. A-line silhouette with adjustable straps.",
      imageUrl: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-dress.png",
      category: "clothing",
      sizeCharts: {
        create: [
          { size: "S", chest: 84, waist: 66, hips: 90, shoulder: 36, notes: "Fitted bodice" },
          { size: "M", chest: 88, waist: 70, hips: 94, shoulder: 38, notes: "Regular fit" },
          { size: "L", chest: 92, waist: 74, hips: 98, shoulder: 40, notes: "Comfortable fit" },
          { size: "XL", chest: 96, waist: 78, hips: 102, shoulder: 42, notes: "Relaxed fit" },
        ],
      },
    },
  });

  const jacket = await prisma.feature4_Product.create({
    data: {
      name: "Denim Trucker Jacket",
      description: "Classic denim jacket with button front. Structured shoulders, two chest pockets.",
      imageUrl: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-jacket.png",
      category: "clothing",
      sizeCharts: {
        create: [
          { size: "S", chest: 92, waist: 82, hips: 92, shoulder: 43, notes: "Snug fit" },
          { size: "M", chest: 97, waist: 87, hips: 97, shoulder: 45, notes: "Regular fit" },
          { size: "L", chest: 102, waist: 92, hips: 102, shoulder: 47, notes: "Room for layers" },
          { size: "XL", chest: 107, waist: 97, hips: 107, shoulder: 49, notes: "Oversized feel" },
        ],
      },
    },
  });

  console.log("Seeded:", { tshirt: tshirt.id, dress: dress.id, jacket: jacket.id });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
