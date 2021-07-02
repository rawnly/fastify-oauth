/*
  Warnings:

  - You are about to alter the column `expirationDate` on the `Token` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `Token` ADD COLUMN `valid` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `expirationDate` TIMESTAMP NOT NULL;
