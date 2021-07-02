/*
  Warnings:

  - You are about to alter the column `expirationDate` on the `Token` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - A unique constraint covering the columns `[value]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Token` MODIFY `expirationDate` TIMESTAMP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Token.value_unique` ON `Token`(`value`);
