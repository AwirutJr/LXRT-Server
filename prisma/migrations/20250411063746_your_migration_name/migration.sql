/*
  Warnings:

  - You are about to drop the column `total` on the `order` table. All the data in the column will be lost.
  - You are about to drop the `cartitem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cartTotal` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cartTotal` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cartitem` DROP FOREIGN KEY `CartItem_cartId_fkey`;

-- DropForeignKey
ALTER TABLE `cartitem` DROP FOREIGN KEY `CartItem_courseId_fkey`;

-- AlterTable
ALTER TABLE `cart` ADD COLUMN `cartTotal` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `total`,
    ADD COLUMN `cartTotal` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `purchasedcourse` ADD COLUMN `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'unpaid';

-- DropTable
DROP TABLE `cartitem`;

-- CreateTable
CREATE TABLE `EpisodeProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `episodeId` INTEGER NOT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `lastWatchedAt` DATETIME(3) NULL,
    `isAccessible` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `EpisodeProgress_userId_episodeId_key`(`userId`, `episodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CousreOnCart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cartId` INTEGER NOT NULL,
    `courseId` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EpisodeProgress` ADD CONSTRAINT `EpisodeProgress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EpisodeProgress` ADD CONSTRAINT `EpisodeProgress_episodeId_fkey` FOREIGN KEY (`episodeId`) REFERENCES `Episode`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CousreOnCart` ADD CONSTRAINT `CousreOnCart_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CousreOnCart` ADD CONSTRAINT `CousreOnCart_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
