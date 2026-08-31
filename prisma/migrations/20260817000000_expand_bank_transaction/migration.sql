-- AlterTable
ALTER TABLE "bank_transaction" RENAME COLUMN "refno" TO "tranId";
ALTER TABLE "bank_transaction" RENAME COLUMN "trandate" TO "tranDate";
ALTER TABLE "bank_transaction" ADD COLUMN "tranPostedDate" VARCHAR(50);
ALTER TABLE "bank_transaction" ADD COLUMN "currency" VARCHAR(10);
ALTER TABLE "bank_transaction" ADD COLUMN "balance" DECIMAL(20,2);
ALTER TABLE "bank_transaction" ADD COLUMN "accName" VARCHAR(255);
ALTER TABLE "bank_transaction" ADD COLUMN "branchId" VARCHAR(50);
ALTER TABLE "bank_transaction" ADD COLUMN "tellerId" VARCHAR(50);
ALTER TABLE "bank_transaction" ADD COLUMN "journalNo" VARCHAR(100);
ALTER TABLE "bank_transaction" ADD COLUMN "exchRate" DECIMAL(20,6);
