/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId]` on the table `UserActivity` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `course` ADD COLUMN `time` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `useractivity` MODIFY `viewCount` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX `UserActivity_userId_courseId_key` ON `UserActivity`(`userId`, `courseId`);
