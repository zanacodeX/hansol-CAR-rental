-- Hansol Car Rental - Full Schema + Seed Data
-- Run this in phpMyAdmin SQL tab

-- Schema
CREATE TABLE IF NOT EXISTS `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `whatsappKakaotalkId` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Vehicle` (
    `id` VARCHAR(191) NOT NULL,
    `modelName` VARCHAR(191) NOT NULL,
    `type` ENUM('Sedan', 'SUV', 'Van') NOT NULL,
    `transmission` VARCHAR(191) NOT NULL,
    `status` ENUM('AVAILABLE', 'ON_REQUEST', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    `dailyRate` DOUBLE NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `photos` TEXT NULL,
    `seatCount` INTEGER NOT NULL DEFAULT 5,
    `description` VARCHAR(191) NULL,
    `features` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Package` (
    `id` VARCHAR(30) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `durationDays` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `VehiclePackageRate` (
    `id` VARCHAR(30) NOT NULL,
    `vehicleId` VARCHAR(30) NOT NULL,
    `packageId` VARCHAR(30) NOT NULL,
    `price` DOUBLE NOT NULL,
    UNIQUE INDEX `VehiclePackageRate_vehicleId_packageId_key`(`vehicleId`, `packageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Booking` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `vehicleId` VARCHAR(191) NOT NULL,
    `rentalType` ENUM('SELF_DRIVE', 'WITH_DRIVER') NOT NULL,
    `pickupType` ENUM('GARAGE', 'SERVICE') NOT NULL,
    `pickupLocation` VARCHAR(191) NULL,
    `dropoffLocation` VARCHAR(191) NULL,
    `pickupDatetime` DATETIME(3) NOT NULL,
    `dropoffDatetime` DATETIME(3) NOT NULL,
    `flightNumber` VARCHAR(191) NULL,
    `guestName` VARCHAR(191) NULL,
    `guestEmail` VARCHAR(191) NULL,
    `guestPhone` VARCHAR(191) NULL,
    `guestWhatsappId` VARCHAR(191) NULL,
    `hasIdp` BOOLEAN NOT NULL DEFAULT false,
    `selectedPackageId` VARCHAR(30) NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `totalEstimatedPrice` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Accessory` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `VehiclePackageRate` ADD CONSTRAINT `VehiclePackageRate_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `VehiclePackageRate` ADD CONSTRAINT `VehiclePackageRate_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_selectedPackageId_fkey` FOREIGN KEY (`selectedPackageId`) REFERENCES `Package`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Accessory` ADD CONSTRAINT `Accessory_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed Data
-- Admin password: admin123, User password: user123
INSERT INTO `User` (`id`, `name`, `email`, `password`, `phone`, `role`) VALUES
('admin001', 'Admin', 'admin@hansol.com', '$2b$12$Cdp983nC9vQ.J6VR/fL6Q.ab/UKkUCbSoITJBmplqMkd6tHvoZnCy', '+82 10-0000-0000', 'ADMIN'),
('user001', 'Demo User', 'user@hansol.com', '$2b$12$kwnBPYxK1ykubH6l/R6UOecKTqzqhtJNbTLghjqS82Y1jZ.rcfk5u', '+82 10-1111-1111', 'USER');

INSERT INTO `Vehicle` (`id`, `modelName`, `type`, `transmission`, `status`, `dailyRate`, `seatCount`, `description`, `features`) VALUES
('veh001', 'Hyundai Avante CN7', 'Sedan', 'Automatic', 'AVAILABLE', 55000, 5, 'Compact and fuel-efficient sedan, perfect for city driving and short trips.', 'Bluetooth,USB-C,LED Headlights,Cruise Control'),
('veh002', 'Kia K5 (Optima)', 'Sedan', 'Automatic', 'AVAILABLE', 65000, 5, 'Stylish mid-size sedan with premium interior and smooth ride quality.', 'Leather Seats,Panoramic Sunroof,Harman Kardon,Wireless Charging'),
('veh003', 'Hyundai Sonata DN8', 'Sedan', 'Automatic', 'AVAILABLE', 70000, 5, 'Elegant and spacious sedan with advanced safety features and comfortable ride.', 'Smart Park,Blind Spot Monitor,Heated Seats,Head-Up Display'),
('veh004', 'Hyundai Tucson NX4', 'SUV', 'Automatic', 'AVAILABLE', 90000, 5, 'Popular compact SUV ideal for families and road trips across Korea.', 'AWD,360 Camera,Heated Steering Wheel,Smart Tailgate'),
('veh005', 'Kia Sportage NQ5', 'SUV', 'Automatic', 'ON_REQUEST', 85000, 5, 'Bold design with cutting-edge tech and spacious cargo area.', 'Dual Curved Display,BOSS Audio,Remote Start,Ventilated Seats'),
('veh006', 'SsangYong Rexton', 'SUV', 'Automatic', 'AVAILABLE', 110000, 7, 'Full-size SUV with 7 seats, powerful engine for mountain and highway driving.', '4WD,Leather Interior,Towing Package,7 Seats,Off-Road Mode'),
('veh007', 'Hyundai Staria Lounge', 'Van', 'Automatic', 'AVAILABLE', 150000, 9, 'Premium multi-purpose van for group travel with VIP-level comfort.', '9 Seats,Swivel Captain Chairs,Mini Bar,Privacy Curtains,USB Ports'),
('veh008', 'Kia Carnival Hi Limousine', 'Van', 'Automatic', 'ON_REQUEST', 180000, 7, 'Luxury limousine van with first-class seating and entertainment system.', '7 Seats,Luxury Seats,Smart TV,Ambient Lighting,Refrigerator'),
('veh009', 'Genesis G80', 'Sedan', 'Automatic', 'MAINTENANCE', 120000, 5, 'Luxury sedan with world-class refinement and cutting-edge technology.', 'Nappa Leather,21-Speaker Audio,Semantic ADAS,Massage Seats,Genesis Digital Key');

INSERT INTO `Package` (`id`, `name`, `durationDays`, `isActive`) VALUES
('pkg001', '3-Day Package', 3, true),
('pkg002', '7-Day Package', 7, true);

INSERT INTO `VehiclePackageRate` (`id`, `vehicleId`, `packageId`, `price`) VALUES
('vpr001', 'veh001', 'pkg001', 140000),
('vpr002', 'veh002', 'pkg001', 165000),
('vpr003', 'veh003', 'pkg001', 180000),
('vpr004', 'veh004', 'pkg001', 230000),
('vpr005', 'veh005', 'pkg001', 220000),
('vpr006', 'veh006', 'pkg001', 280000),
('vpr007', 'veh007', 'pkg001', 380000),
('vpr008', 'veh008', 'pkg001', 460000),
('vpr009', 'veh009', 'pkg001', 300000),
('vpr010', 'veh001', 'pkg002', 280000),
('vpr011', 'veh002', 'pkg002', 330000),
('vpr012', 'veh003', 'pkg002', 360000),
('vpr013', 'veh004', 'pkg002', 460000),
('vpr014', 'veh005', 'pkg002', 430000),
('vpr015', 'veh006', 'pkg002', 560000),
('vpr016', 'veh007', 'pkg002', 750000),
('vpr017', 'veh008', 'pkg002', 900000),
('vpr018', 'veh009', 'pkg002', 600000);
