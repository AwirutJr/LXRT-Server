/*
  Warnings:

  - You are about to alter the column `duration` on the `video` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `video` ADD COLUMN `asset_id` VARCHAR(191) NULL,
    ADD COLUMN `public_id` VARCHAR(191) NULL,
    ADD COLUMN `secure_url` VARCHAR(191) NULL,
    ADD COLUMN `url` VARCHAR(191) NULL,
    MODIFY `duration` DOUBLE NULL;
