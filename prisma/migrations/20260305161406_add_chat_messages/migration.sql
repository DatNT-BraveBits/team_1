-- CreateTable
CREATE TABLE "Feature5_ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feature5_ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Feature5_LiveSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Feature5_LiveSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "muxStreamId" TEXT,
    "muxPlaybackId" TEXT,
    "muxStreamKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "productIds" TEXT NOT NULL DEFAULT '[]',
    "productData" TEXT NOT NULL DEFAULT '[]',
    "pinnedProductId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Feature5_LiveSession" ("createdAt", "id", "muxPlaybackId", "muxStreamId", "muxStreamKey", "pinnedProductId", "productIds", "shop", "status", "title", "updatedAt") SELECT "createdAt", "id", "muxPlaybackId", "muxStreamId", "muxStreamKey", "pinnedProductId", "productIds", "shop", "status", "title", "updatedAt" FROM "Feature5_LiveSession";
DROP TABLE "Feature5_LiveSession";
ALTER TABLE "new_Feature5_LiveSession" RENAME TO "Feature5_LiveSession";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
