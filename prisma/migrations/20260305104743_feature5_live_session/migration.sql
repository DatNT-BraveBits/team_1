-- CreateTable
CREATE TABLE "Feature5_LiveSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "muxStreamId" TEXT,
    "muxPlaybackId" TEXT,
    "muxStreamKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "productIds" TEXT NOT NULL DEFAULT '[]',
    "pinnedProductId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
