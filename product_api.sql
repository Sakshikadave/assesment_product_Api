-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 26, 2025 at 04:51 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `product_api`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `category_uid` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `user_id`, `name`, `category_uid`, `created_at`) VALUES
(3, NULL, 'Boat Headphones Dior Lipstic Vellantino Purse Gucci Shoes Prada Jacket1', '2a99287b-3662-4d1f-a96d-5be40db389d9', '2025-04-23 18:46:15');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `productname` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `category_uid` varchar(50) DEFAULT NULL,
  `images` varchar(250) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `user_id`, `productname`, `quantity`, `price`, `description`, `category`, `category_uid`, `images`, `created_at`) VALUES
(2, NULL, 'Smartphone', 20, 500.00, 'Latest model smartphone', 'Electronics', 'CAT001', '', '2025-04-24 17:33:00'),
(3, NULL, 'Headphones', 30, 150.00, 'Noise cancelling headphones', 'Accessories', 'CAT002', '', '2025-04-24 17:33:00'),
(4, NULL, 'Tablet', 15, 300.00, 'Lightweight tablet', 'Electronics', 'CAT001', '', '2025-04-24 17:33:00'),
(5, NULL, 'Monitor', 12, 200.00, '4K display monitor', 'Electronics', 'CAT001', '', '2025-04-24 17:33:00'),
(6, NULL, 'Keyboard', 50, 30.00, 'Mechanical keyboard', 'Accessories', 'CAT002', '', '2025-04-24 17:33:00'),
(7, NULL, 'Mouse', 40, 25.00, 'Wireless mouse', 'Accessories', 'CAT002', '', '2025-04-24 17:33:00'),
(8, NULL, 'Webcam', 25, 60.00, 'HD webcam', 'Accessories', 'CAT002', '', '2025-04-24 17:33:00'),
(9, NULL, 'Printer', 8, 120.00, 'All-in-one printer', 'Office Equipment', 'CAT003', '', '2025-04-24 17:33:00'),
(10, NULL, 'Router', 18, 90.00, 'Dual-band router', 'Networking', 'CAT004', '', '2025-04-24 17:33:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `mobile`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Sakshi Kadavbe', 'kadavesakshi77@gmal.com', '8007335455', '$2b$10$S.xGNoT7.c0PRP5vqjQZR.siITy3l9Yu4I6dtAPTVIeznu1M/TtDa', '2025-04-23 18:34:22', '2025-04-23 18:34:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `category_uid` (`category_uid`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
