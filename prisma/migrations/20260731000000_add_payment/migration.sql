-- CreateEnum
CREATE TYPE "TXN_TYPE" AS ENUM ('FEE', 'CHARGE');

-- CreateEnum
CREATE TYPE "PAYMENT_ACTION" AS ENUM ('QR', 'CARD');

-- CreateTable
CREATE TABLE "payment" (
    "id" SERIAL NOT NULL,
    "custid" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(20,2) NOT NULL,
    "txntype" "TXN_TYPE" NOT NULL,
    "action" "PAYMENT_ACTION" NOT NULL,
    "ordernum" VARCHAR(255),
    "tranid" VARCHAR(255),
    "checkid" VARCHAR(255),
    "status" VARCHAR(100),
    "negdiurl" VARCHAR(500),
    "ordersign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);
