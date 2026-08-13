-- VoltFlow MySQL bootstrap (runs once on first container start)
-- Connected as MYSQL_USER into MYSQL_DATABASE

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS vehicles (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  battery_percent TINYINT UNSIGNED NOT NULL,
  charge_rate_kw DECIMAL(5, 1) NOT NULL DEFAULT 0,
  status ENUM('idle', 'charging', 'driving') NOT NULL DEFAULT 'idle',
  temperature_c TINYINT NOT NULL,
  site_type ENUM('depot', 'home', 'public') NOT NULL DEFAULT 'depot',
  battery_capacity_kwh DECIMAL(6, 1) NOT NULL,
  lat DECIMAL(9, 5) NOT NULL,
  lng DECIMAL(9, 5) NOT NULL,
  location_label VARCHAR(128) NOT NULL,
  postcode VARCHAR(16) NOT NULL,
  grid_region CHAR(1) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS charging_sessions (
  id VARCHAR(32) PRIMARY KEY,
  vehicle_id VARCHAR(32) NOT NULL,
  site_type ENUM('depot', 'home', 'public') NOT NULL,
  started_at TIMESTAMP NOT NULL,
  stopped_at TIMESTAMP NULL,
  kwh DECIMAL(8, 2) NULL,
  price_pence_per_kwh DECIMAL(8, 3) NULL,
  cost_gbp DECIMAL(10, 2) NULL,
  status ENUM('active', 'completed') NOT NULL DEFAULT 'active',
  CONSTRAINT fk_session_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reimbursements (
  id VARCHAR(32) PRIMARY KEY,
  session_id VARCHAR(32) NOT NULL,
  driver_id VARCHAR(32) NOT NULL,
  amount_gbp DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'approved', 'paid', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reimb_session
    FOREIGN KEY (session_id) REFERENCES charging_sessions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO vehicles (
  id, name, battery_percent, charge_rate_kw, status, temperature_c,
  site_type, battery_capacity_kwh, lat, lng, location_label, postcode, grid_region
) VALUES
  ('ev-01', 'Van A', 62, 0.0, 'idle', 31, 'depot', 60.0, 51.50740, -0.12780, 'London Depot', 'SW1A 1AA', 'C'),
  ('ev-02', 'Van B', 41, 7.2, 'charging', 29, 'home', 60.0, 51.52000, -0.10000, 'Driver home', 'E1 6AN', 'C'),
  ('ev-03', 'Van C', 22, 0.0, 'idle', 28, 'depot', 75.0, 53.48080, -2.24260, 'Manchester Depot', 'M1 1AE', 'G'),
  ('ev-04', 'Van D', 88, 0.0, 'driving', 33, 'public', 60.0, 55.86420, -4.25180, 'Glasgow route', 'G1 1XQ', 'N'),
  ('ev-05', 'Van E', 55, 0.0, 'idle', 30, 'depot', 60.0, 51.45450, -2.58790, 'Bristol Depot', 'BS1 4DJ', 'L')
ON DUPLICATE KEY UPDATE name = VALUES(name);
