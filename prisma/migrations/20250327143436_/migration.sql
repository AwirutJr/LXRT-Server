/*
  Warnings:

  - You are about to drop the column `courseId` on the `image` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `image` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `video` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `video` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `image` DROP FOREIGN KEY `Image_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `video` DROP FOREIGN KEY `Video_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `video` DROP FOREIGN KEY `Video_imageId_fkey`;

-- DropIndex
DROP INDEX `Image_courseId_fkey` ON `image`;

-- DropIndex
DROP INDEX `Video_courseId_fkey` ON `video`;

-- DropIndex
DROP INDEX `Video_imageId_key` ON `video`;

-- AlterTable
ALTER TABLE `course` ADD COLUMN `picture` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `image` DROP COLUMN `courseId`,
    DROP COLUMN `type`;

-- AlterTable
ALTER TABLE `video` DROP COLUMN `courseId`,
    DROP COLUMN `imageId`;

-- CreateTable
CREATE TABLE `Episode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `courseId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `episodeNo` INTEGER NOT NULL DEFAULT 1,
    `videoId` INTEGER NULL,
    `imageId` INTEGER NULL,

    UNIQUE INDEX `Episode_videoId_key`(`videoId`),
    UNIQUE INDEX `Episode_imageId_key`(`imageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Episode` ADD CONSTRAINT `Episode_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Episode` ADD CONSTRAINT `Episode_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `Video`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Episode` ADD CONSTRAINT `Episode_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Image`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
