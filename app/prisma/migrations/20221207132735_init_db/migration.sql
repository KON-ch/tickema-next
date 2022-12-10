-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppearanceUser` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NULL,
    `email` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,

    UNIQUE INDEX `AppearanceUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supporter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `appearanceUserId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppearanceStage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `appearanceUserId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PerformanceSchedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `startedAt` DATETIME(3) NOT NULL,
    `appearanceStageId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReservationReception` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `receiveType` INTEGER NOT NULL,
    `receptionAt` DATETIME(3) NOT NULL,
    `performanceScheduleId` INTEGER NOT NULL,
    `supporterId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SaleTicket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appearanceStageId` INTEGER NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `price` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReservationTicket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saleTicketId` INTEGER NOT NULL,
    `count` INTEGER NOT NULL,
    `reservationReceptionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CancelReservationTicket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `canceledAt` DATETIME(3) NOT NULL,
    `reservationTicketId` INTEGER NOT NULL,

    UNIQUE INDEX `CancelReservationTicket_reservationTicketId_key`(`reservationTicketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AppearanceUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AppearanceUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supporter` ADD CONSTRAINT `Supporter_appearanceUserId_fkey` FOREIGN KEY (`appearanceUserId`) REFERENCES `AppearanceUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppearanceStage` ADD CONSTRAINT `AppearanceStage_appearanceUserId_fkey` FOREIGN KEY (`appearanceUserId`) REFERENCES `AppearanceUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PerformanceSchedule` ADD CONSTRAINT `PerformanceSchedule_appearanceStageId_fkey` FOREIGN KEY (`appearanceStageId`) REFERENCES `AppearanceStage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReservationReception` ADD CONSTRAINT `ReservationReception_performanceScheduleId_fkey` FOREIGN KEY (`performanceScheduleId`) REFERENCES `PerformanceSchedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReservationReception` ADD CONSTRAINT `ReservationReception_supporterId_fkey` FOREIGN KEY (`supporterId`) REFERENCES `Supporter`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleTicket` ADD CONSTRAINT `SaleTicket_appearanceStageId_fkey` FOREIGN KEY (`appearanceStageId`) REFERENCES `AppearanceStage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReservationTicket` ADD CONSTRAINT `ReservationTicket_reservationReceptionId_fkey` FOREIGN KEY (`reservationReceptionId`) REFERENCES `ReservationReception`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReservationTicket` ADD CONSTRAINT `ReservationTicket_saleTicketId_fkey` FOREIGN KEY (`saleTicketId`) REFERENCES `SaleTicket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CancelReservationTicket` ADD CONSTRAINT `CancelReservationTicket_reservationTicketId_fkey` FOREIGN KEY (`reservationTicketId`) REFERENCES `ReservationTicket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
