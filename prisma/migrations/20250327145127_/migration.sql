-- AlterTable
ALTER TABLE `course` MODIFY `title` VARCHAR(191) NULL,
    MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `episode` ADD COLUMN `description` VARCHAR(191) NULL,
    MODIFY `title` VARCHAR(191) NULL;
