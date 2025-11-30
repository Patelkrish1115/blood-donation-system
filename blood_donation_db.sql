-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 01, 2025 at 05:40 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `blood_donation_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `donors`
--

CREATE TABLE `donors` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `blood_group` varchar(5) NOT NULL,
  `gender` varchar(10) NOT NULL,
  `age` int(11) NOT NULL,
  `city` varchar(50) NOT NULL,
  `state` varchar(50) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `address` text NOT NULL,
  `availability` varchar(20) DEFAULT 'Available',
  `last_donation_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `donors`
--

INSERT INTO `donors` (`id`, `full_name`, `email`, `phone`, `blood_group`, `gender`, `age`, `city`, `state`, `pincode`, `address`, `availability`, `last_donation_date`, `created_at`) VALUES
(5, 'Hassan Khan', 'hassan@example.com', '9876543211', 'B+', '', 0, '', '', '', '', 'Available', '2025-11-01', '2025-11-01 05:24:05'),
(6, 'Fatima Ali', 'fatima@example.com', '9876543212', 'AB-', '', 0, '', '', '', '', 'Available', '2025-11-01', '2025-11-01 05:24:05'),
(7, 'Ahmed Malik', 'ahmed@example.com', '9876543213', 'A+', '', 0, '', '', '', '', 'Available', '2025-11-01', '2025-11-01 05:24:05'),
(14, 'Hassan Khan', 'hassankhan@example.com', '9876543211', 'B+', 'Male', 30, 'Karachi', 'Sindh', '75000', 'DHA Phase 5', 'Available', '2025-10-01', '2025-11-01 05:27:02'),
(15, 'Fatima Ali', 'fatimaali@example.com', '9876543212', 'AB-', 'Female', 28, 'Lahore', 'Punjab', '54000', 'Defence Housing Authority', 'Available', '2025-09-15', '2025-11-01 05:27:02'),
(16, 'Ahmed Malik', 'ahmedmalik@example.com', '9876543213', 'A+', 'Male', 35, 'Islamabad', 'ICT', '44000', 'F-7 Markaz', 'Available', '2025-08-20', '2025-11-01 05:27:02'),
(17, 'patel', 'kr3213@gmail.com', '1234567890', 'AB-', 'Male', 23, 'bharuch', 'Gujarat', '392001', 'Karsan kaka ni khadaki lalubhai chakala bharuch house no. B-985\nPincode-392001', 'Available', '2025-11-05', '2025-11-01 14:49:13');

-- --------------------------------------------------------

--
-- Table structure for table `requests`
--

CREATE TABLE `requests` (
  `id` int(11) NOT NULL,
  `patient_name` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `email` varchar(100) NOT NULL,
  `blood_group` varchar(5) NOT NULL,
  `units_required` int(11) NOT NULL,
  `required_date` date NOT NULL,
  `hospital_name` varchar(150) NOT NULL,
  `city` varchar(50) NOT NULL,
  `state` varchar(50) NOT NULL,
  `urgency` varchar(20) NOT NULL,
  `message` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `requests`
--

INSERT INTO `requests` (`id`, `patient_name`, `phone`, `email`, `blood_group`, `units_required`, `required_date`, `hospital_name`, `city`, `state`, `urgency`, `message`, `status`, `created_at`) VALUES
(1, 'patel karish', '9016819456', 'krishpatel3@gmail.com', 'O-', 1, '2025-11-01', 'heelo', 'Chennai', 'Chhattisgarh', 'Normal', 'kese ho', 'Fulfilled', '2025-11-01 14:38:23');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `donors`
--
ALTER TABLE `donors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `donors`
--
ALTER TABLE `donors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `requests`
--
ALTER TABLE `requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
