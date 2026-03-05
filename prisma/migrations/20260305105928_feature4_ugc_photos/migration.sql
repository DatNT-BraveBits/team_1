-- CreateTable
CREATE TABLE "Feature4_UgcPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "customerName" TEXT NOT NULL DEFAULT 'Anonymous',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feature4_UgcPhoto_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Feature4_Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Feature4_TryOnSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "resultUrl" TEXT,
    "height" REAL,
    "weight" REAL,
    "sizeAdvice" TEXT,
    "savedAsUgc" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feature4_TryOnSession_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Feature4_Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Feature4_TryOnSession" ("createdAt", "height", "id", "photoUrl", "productId", "resultUrl", "sizeAdvice", "weight") SELECT "createdAt", "height", "id", "photoUrl", "productId", "resultUrl", "sizeAdvice", "weight" FROM "Feature4_TryOnSession";
DROP TABLE "Feature4_TryOnSession";
ALTER TABLE "new_Feature4_TryOnSession" RENAME TO "Feature4_TryOnSession";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
