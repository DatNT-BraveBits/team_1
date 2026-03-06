-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature4_Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'clothing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feature4_Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature4_SizeChart" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "chest" DOUBLE PRECISION NOT NULL,
    "waist" DOUBLE PRECISION NOT NULL,
    "hips" DOUBLE PRECISION NOT NULL,
    "shoulder" DOUBLE PRECISION NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Feature4_SizeChart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature4_TryOnSession" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "resultUrl" TEXT,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "sizeAdvice" TEXT,
    "savedAsUgc" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feature4_TryOnSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature4_UgcPhoto" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "customerName" TEXT NOT NULL DEFAULT 'Anonymous',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feature4_UgcPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature4_PurchaseHistory" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "fitFeedback" TEXT,
    "returned" BOOLEAN NOT NULL DEFAULT false,
    "returnReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feature4_PurchaseHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature5_LiveSession" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "muxStreamId" TEXT,
    "muxPlaybackId" TEXT,
    "muxStreamKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "productIds" TEXT NOT NULL DEFAULT '[]',
    "productData" TEXT NOT NULL DEFAULT '[]',
    "pinnedProductId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature5_LiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature5_ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feature5_ChatMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Feature4_SizeChart" ADD CONSTRAINT "Feature4_SizeChart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Feature4_Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature4_TryOnSession" ADD CONSTRAINT "Feature4_TryOnSession_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Feature4_Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature4_UgcPhoto" ADD CONSTRAINT "Feature4_UgcPhoto_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Feature4_Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature4_PurchaseHistory" ADD CONSTRAINT "Feature4_PurchaseHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Feature4_Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature5_ChatMessage" ADD CONSTRAINT "Feature5_ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Feature5_LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
