/*
  Warnings:

  - You are about to alter the column `expirationDate` on the `Token` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `Token` ADD COLUMN `type` ENUM('JWT', 'REFRESH_TOKEN') NOT NULL DEFAULT 'JWT',
    MODIFY `expirationDate` TIMESTAMP NOT NULL;
