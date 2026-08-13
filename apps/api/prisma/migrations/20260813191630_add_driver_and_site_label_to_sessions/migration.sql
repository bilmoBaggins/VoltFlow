-- AlterTable
ALTER TABLE `charging_sessions`
  ADD COLUMN `driver_id` VARCHAR(32) NOT NULL,
  ADD COLUMN `site_label` VARCHAR(128) NULL;
