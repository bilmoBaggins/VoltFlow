-- CreateTable
CREATE TABLE `vehicles` (
    `id` VARCHAR(32) NOT NULL,
    `name` VARCHAR(64) NOT NULL,
    `battery_percent` TINYINT UNSIGNED NOT NULL,
    `charge_rate_kw` DECIMAL(5, 1) NOT NULL DEFAULT 0,
    `status` ENUM('idle', 'charging', 'driving') NOT NULL DEFAULT 'idle',
    `temperature_c` TINYINT NOT NULL,
    `site_type` ENUM('depot', 'home', 'public') NOT NULL DEFAULT 'depot',
    `battery_capacity_kwh` DECIMAL(6, 1) NOT NULL,
    `lat` DECIMAL(9, 5) NOT NULL,
    `lng` DECIMAL(9, 5) NOT NULL,
    `location_label` VARCHAR(128) NOT NULL,
    `postcode` VARCHAR(16) NOT NULL,
    `grid_region` CHAR(1) NOT NULL,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `charging_sessions` (
    `id` VARCHAR(32) NOT NULL,
    `vehicle_id` VARCHAR(32) NOT NULL,
    `site_type` ENUM('depot', 'home', 'public') NOT NULL,
    `started_at` TIMESTAMP(0) NOT NULL,
    `stopped_at` TIMESTAMP(0) NULL,
    `kwh` DECIMAL(8, 2) NULL,
    `price_pence_per_kwh` DECIMAL(8, 3) NULL,
    `cost_gbp` DECIMAL(10, 2) NULL,
    `status` ENUM('active', 'completed') NOT NULL DEFAULT 'active',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reimbursements` (
    `id` VARCHAR(32) NOT NULL,
    `session_id` VARCHAR(32) NOT NULL,
    `driver_id` VARCHAR(32) NOT NULL,
    `amount_gbp` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('pending', 'approved', 'paid', 'rejected') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `charging_sessions` ADD CONSTRAINT `charging_sessions_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reimbursements` ADD CONSTRAINT `reimbursements_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `charging_sessions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
