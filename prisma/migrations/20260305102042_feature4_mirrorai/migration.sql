-- CreateTable
CREATE TABLE "Feature4_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'clothing',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Feature4_SizeChart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "chest" REAL NOT NULL,
    "waist" REAL NOT NULL,
    "hips" REAL NOT NULL,
    "shoulder" REAL NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Feature4_SizeChart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Feature4_Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feature4_TryOnSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "resultUrl" TEXT,
    "height" REAL,
    "weight" REAL,
    "sizeAdvice" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feature4_TryOnSession_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Feature4_Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
