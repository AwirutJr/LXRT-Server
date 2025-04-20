-- DropForeignKey
ALTER TABLE `episode` DROP FOREIGN KEY `Episode_imageId_fkey`;

-- DropForeignKey
ALTER TABLE `episode` DROP FOREIGN KEY `Episode_videoId_fkey`;

-- AddForeignKey
ALTER TABLE `Episode` ADD CONSTRAINT `Episode_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `Video`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Episode` ADD CONSTRAINT `Episode_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Image`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
