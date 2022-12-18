-- CreateTable
CREATE TABLE `DeleteAppearanceStage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `deletedAt` DATETIME(3) NOT NULL,
    `appearanceStageId` INTEGER NOT NULL,

    UNIQUE INDEX `DeleteAppearanceStage_appearanceStageId_key`(`appearanceStageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DeleteAppearanceStage` ADD CONSTRAINT `DeleteAppearanceStage_appearanceStageId_fkey` FOREIGN KEY (`appearanceStageId`) REFERENCES `AppearanceStage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
