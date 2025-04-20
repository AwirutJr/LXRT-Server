/*
  Warnings:

  - Added the required column `public_id` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `course` ADD COLUMN `public_id` VARCHAR(191) NOT NULL;
