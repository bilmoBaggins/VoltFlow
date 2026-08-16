-- AlterTable
ALTER TABLE `reimbursements`
    ADD COLUMN `plate` VARCHAR(16) NULL,
    ADD COLUMN `tariff` VARCHAR(64) NULL,
    ADD COLUMN `source` VARCHAR(64) NULL,
    ADD COLUMN `notes` TEXT NULL;
