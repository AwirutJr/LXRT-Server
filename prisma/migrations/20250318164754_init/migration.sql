/*
  Warnings:

  - You are about to drop the column `fileSize` on the `image` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `image` table. All the data in the column will be lost.
  - Added the required column `asset_id` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `public_id` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secure_url` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `image` DROP FOREIGN KEY `Image_courseId_fkey`;

-- DropIndex
DROP INDEX `Image_courseId_fkey` ON `image`;

-- AlterTable
ALTER TABLE `image` DROP COLUMN `fileSize`,
    DROP COLUMN `fileType`,
    ADD COLUMN `asset_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `public_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `secure_url` VARCHAR(191) NOT NULL,
    MODIFY `courseId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Video` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `courseId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `videoData` VARCHAR(191) NOT NULL,
    `duration` INTEGER NULL,
    `fileSize` INTEGER NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `imageId` INTEGER NOT NULL,

    UNIQUE INDEX `Video_imageId_key`(`imageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `Video_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `Video_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Image`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
