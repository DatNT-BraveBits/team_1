-- CreateTable
CREATE TABLE "Feature4_PurchaseHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "fitFeedback" TEXT,
    "returned" BOOLEAN NOT NULL DEFAULT false,
    "returnReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feature4_PurchaseHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Feature4_Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Feature4_UgcPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "customerName" TEXT NOT NULL DEFAULT 'Anonymous',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feature4_UgcPhoto_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Feature4_Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Feature4_UgcPhoto" ("approved", "createdAt", "customerName", "id", "imageUrl", "productId") SELECT "approved", "createdAt", "customerName", "id", "imageUrl", "productId" FROM "Feature4_UgcPhoto";
DROP TABLE "Feature4_UgcPhoto";
ALTER TABLE "new_Feature4_UgcPhoto" RENAME TO "Feature4_UgcPhoto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
