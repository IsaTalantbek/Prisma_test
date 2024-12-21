/*
  Warnings:

  - A unique constraint covering the columns `[infoId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `infoId` INTEGER NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `gender` VARCHAR(191) NOT NULL DEFAULT 'undefined',
    `age` INTEGER NOT NULL DEFAULT 0,
    `info` VARCHAR(191) NOT NULL DEFAULT 'undefined',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_infoId_key` ON `User`(`infoId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_infoId_fkey` FOREIGN KEY (`infoId`) REFERENCES `Info`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
