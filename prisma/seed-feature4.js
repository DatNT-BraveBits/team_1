import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.feature4_TryOnSession.deleteMany();
  await prisma.feature4_SizeChart.deleteMany();
  await prisma.feature4_UgcPhoto.deleteMany();
  await prisma.feature4_Product.deleteMany();

  const products = [
    {
      name: "Classic Fit Cotton T-Shirt",
      description: "Soft 100% cotton crew neck tee. Relaxed fit, perfect for everyday wear.",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop&crop=center",
      category: "clothing",
      sizes: [
        { size: "S", chest: 89, waist: 74, hips: 94, shoulder: 42, notes: "Slim fit" },
        { size: "M", chest: 94, waist: 79, hips: 99, shoulder: 44, notes: "Regular fit" },
        { size: "L", chest: 99, waist: 84, hips: 104, shoulder: 46, notes: "Relaxed fit" },
        { size: "XL", chest: 104, waist: 89, hips: 109, shoulder: 48, notes: "Loose fit" },
      ],
    },
    {
      name: "Floral Summer Dress",
      description: "Light and breezy floral print dress. A-line silhouette with adjustable straps.",
      imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop&crop=center",
      category: "clothing",
      sizes: [
        { size: "S", chest: 84, waist: 66, hips: 90, shoulder: 36, notes: "Fitted bodice" },
        { size: "M", chest: 88, waist: 70, hips: 94, shoulder: 38, notes: "Regular fit" },
        { size: "L", chest: 92, waist: 74, hips: 98, shoulder: 40, notes: "Comfortable fit" },
        { size: "XL", chest: 96, waist: 78, hips: 102, shoulder: 42, notes: "Relaxed fit" },
      ],
    },
    {
      name: "Denim Trucker Jacket",
      description: "Classic denim jacket with button front. Structured shoulders, two chest pockets.",
      imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=600&fit=crop&crop=center",
      category: "clothing",
      sizes: [
        { size: "S", chest: 92, waist: 82, hips: 92, shoulder: 43, notes: "Snug fit" },
        { size: "M", chest: 97, waist: 87, hips: 97, shoulder: 45, notes: "Regular fit" },
        { size: "L", chest: 102, waist: 92, hips: 102, shoulder: 47, notes: "Room for layers" },
        { size: "XL", chest: 107, waist: 97, hips: 107, shoulder: 49, notes: "Oversized feel" },
      ],
    },
    {
      name: "Slim Fit Chino Pants",
      description: "Stretch cotton chinos with slim tapered leg. Versatile for casual or smart-casual.",
      imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop&crop=center",
      category: "clothing",
      sizes: [
        { size: "S", chest: 0, waist: 74, hips: 94, shoulder: 0, notes: "Waist 29-30" },
        { size: "M", chest: 0, waist: 79, hips: 99, shoulder: 0, notes: "Waist 31-32" },
        { size: "L", chest: 0, waist: 84, hips: 104, shoulder: 0, notes: "Waist 33-34" },
        { size: "XL", chest: 0, waist: 89, hips: 109, shoulder: 0, notes: "Waist 35-36" },
      ],
    },
    {
      name: "Oversized Hoodie",
      description: "Cozy fleece-lined hoodie with kangaroo pocket. Dropped shoulders, oversized fit.",
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop&crop=center",
      category: "clothing",
      sizes: [
        { size: "S", chest: 104, waist: 94, hips: 100, shoulder: 52, notes: "Relaxed oversized" },
        { size: "M", chest: 109, waist: 99, hips: 105, shoulder: 54, notes: "True oversized" },
        { size: "L", chest: 114, waist: 104, hips: 110, shoulder: 56, notes: "Extra roomy" },
        { size: "XL", chest: 119, waist: 109, hips: 115, shoulder: 58, notes: "Maximum comfort" },
      ],
    },
    {
      name: "Linen Button-Up Shirt",
      description: "Breathable 100% linen shirt with a relaxed collar. Perfect for summer days.",
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop&crop=center",
      category: "clothing",
      sizes: [
        { size: "S", chest: 92, waist: 82, hips: 92, shoulder: 43, notes: "Fitted cut" },
        { size: "M", chest: 97, waist: 87, hips: 97, shoulder: 45, notes: "Regular fit" },
        { size: "L", chest: 102, waist: 92, hips: 102, shoulder: 47, notes: "Relaxed fit" },
        { size: "XL", chest: 107, waist: 97, hips: 107, shoulder: 49, notes: "Loose fit" },
      ],
    },
  ];

  for (const p of products) {
    const created = await prisma.feature4_Product.create({
      data: {
        name: p.name,
        description: p.description,
        imageUrl: p.imageUrl,
        category: p.category,
        sizeCharts: {
          create: p.sizes,
        },
      },
    });
    console.log("Seeded:", created.name, created.id);
  }

  console.log(`Done! ${products.length} products seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
