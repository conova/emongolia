-- CreateEnum
CREATE TYPE "STATUS_WITHDRAW" AS ENUM ('PENDING', 'TRANSFERRED', 'TRANSFER_FAILED', 'CONFIRMED', 'CONFIRM_FAILED');

-- CreateTable
CREATE TABLE "withdraw" (
    "id" SERIAL NOT NULL,
    "custid" VARCHAR(255),
    "registerNumber" VARCHAR(50),
    "acctName" VARCHAR(255) NOT NULL,
    "acctNo" VARCHAR(100) NOT NULL,
    "bank" VARCHAR(10) NOT NULL,
    "amount" DECIMAL(20,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT E'MNT',
    "description" VARCHAR(255),
    "clientId" VARCHAR(255),
    "state" VARCHAR(255),
    "scope" VARCHAR(255),
    "transferRes" JSONB,
    "confirmRes" JSONB,
    "error" TEXT,
    "status" "STATUS_WITHDRAW" NOT NULL DEFAULT E'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "withdraw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_transaction" (
    "id" SERIAL NOT NULL,
    "accountId" VARCHAR(100) NOT NULL,
    "hash" VARCHAR(64) NOT NULL,
    "refno" VARCHAR(100),
    "trandate" VARCHAR(50),
    "amount" DECIMAL(20,2),
    "drOrCr" VARCHAR(10),
    "description" TEXT,
    "record" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_transaction_hash_key" ON "bank_transaction"("hash");
