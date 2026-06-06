-- ═══════════════════════════════════════════════════════
--  PARKING LOT MANAGEMENT SYSTEM — DATABASE SETUP
--  Run this entire script in MySQL Workbench
-- ═══════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS parking_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE parking_db;

-- ── PARKING SLOTS TABLE ─────────────────────────────────
DROP TABLE IF EXISTS parking_slots;

CREATE TABLE parking_slots (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slot_number   VARCHAR(10)  NOT NULL UNIQUE,
  status        ENUM('empty','occupied') NOT NULL DEFAULT 'empty',
  car_number    VARCHAR(20)  NULL,
  car_owner     VARCHAR(100) NULL,
  car_type      VARCHAR(50)  NULL,
  check_in_time DATETIME     NULL,
  qr_code       LONGTEXT     NULL,   -- base64 encoded PNG
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── SEED 20 SLOTS (A1–A5, B1–B5, C1–C5, D1–D5) ────────
INSERT INTO parking_slots (slot_number) VALUES
  ('A-01'),('A-02'),('A-03'),('A-04'),('A-05'),
  ('B-01'),('B-02'),('B-03'),('B-04'),('B-05'),
  ('C-01'),('C-02'),('C-03'),('C-04'),('C-05'),
  ('D-01'),('D-02'),('D-03'),('D-04'),('D-05');

-- ── VERIFY ──────────────────────────────────────────────
SELECT * FROM parking_slots;
