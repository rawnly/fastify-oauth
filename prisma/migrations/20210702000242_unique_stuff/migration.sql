/*
  Warnings:

  - A unique constraint covering the columns `[client_id]` on the table `App` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[client_secret]` on the table `App` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `client_id` to the `App` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_secret` to the `App` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `App` ADD COLUMN `client_id` VARCHAR(255) NOT NULL,
    ADD COLUMN `client_secret` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `App.client_id_unique` ON `App`(`client_id`);

-- CreateIndex
CREATE UNIQUE INDEX `App.client_secret_unique` ON `App`(`client_secret`);

-- CreateIndex
CREATE UNIQUE INDEX `User.email_unique` ON `User`(`email`);
