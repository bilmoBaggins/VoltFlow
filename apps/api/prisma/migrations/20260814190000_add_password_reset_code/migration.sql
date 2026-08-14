-- AlterTable
ALTER TABLE `users`
  ADD COLUMN `reset_code_hash` VARCHAR(255) NULL,
  ADD COLUMN `reset_expires_at` TIMESTAMP(0) NULL;
