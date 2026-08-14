-- AlterTable
ALTER TABLE `users`
  ADD COLUMN `email_verified` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `otp_code_hash` VARCHAR(255) NULL,
  ADD COLUMN `otp_expires_at` TIMESTAMP(0) NULL;
