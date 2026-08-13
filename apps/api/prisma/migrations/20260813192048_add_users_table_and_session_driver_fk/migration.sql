-- CreateTable
CREATE TABLE `users` (
  `id` VARCHAR(32) NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `email` VARCHAR(191) NOT NULL,

  UNIQUE INDEX `users_email_key`(`email`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- AddForeignKey
ALTER TABLE `charging_sessions`
  ADD CONSTRAINT `charging_sessions_driver_id_fkey`
  FOREIGN KEY (`driver_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
