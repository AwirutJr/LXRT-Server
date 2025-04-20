-- CreateTable
CREATE TABLE `EpisodeBenefit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `episodeId` INTEGER NOT NULL,
    `benefit` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EpisodeBenefit` ADD CONSTRAINT `EpisodeBenefit_episodeId_fkey` FOREIGN KEY (`episodeId`) REFERENCES `Episode`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
