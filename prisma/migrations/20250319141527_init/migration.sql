/*
  Warnings:

  - You are about to drop the column `email` on the `profile` table. All the data in the column will be lost.
  - Added the required column `type` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Made the column `password` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Profile_email_key` ON `profile`;

-- AlterTable
ALTER TABLE `image` ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `orderitem` ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `profile` DROP COLUMN `email`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `provider` VARCHAR(191) NOT NULL DEFAULT 'email',
    ADD COLUMN `providerId` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NOT NULL;
