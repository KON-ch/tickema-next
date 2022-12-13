/*
  Warnings:

  - Made the column `email` on table `AppearanceUser` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `AppearanceUser` MODIFY `email` VARCHAR(191) NOT NULL;
