-- AlterTable (users already created earlier — add auth columns)
ALTER TABLE `users`
  ADD COLUMN `password_hash` VARCHAR(255) NOT NULL,
  ADD COLUMN `role` ENUM('admin', 'driver') NOT NULL DEFAULT 'driver',
  ADD COLUMN `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  ADD COLUMN `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

ALTER TABLE `users` MODIFY `email` VARCHAR(255) NOT NULL;
