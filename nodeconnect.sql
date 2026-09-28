-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 28, 2026 at 02:20 AM
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
-- Database: `nodeconnect`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_activity`
--

CREATE TABLE `admin_activity` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_type` varchar(50) NOT NULL,
  `country` varchar(100) DEFAULT NULL,
  `country_code` varchar(10) DEFAULT NULL,
  `region` varchar(150) DEFAULT NULL,
  `city` varchar(150) DEFAULT NULL,
  `timezone` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `device_type` varchar(30) DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `operating_system` varchar(100) DEFAULT NULL,
  `page_path` varchar(255) DEFAULT NULL,
  `referrer` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_activity`
--

INSERT INTO `admin_activity` (`id`, `event_type`, `country`, `country_code`, `region`, `city`, `timezone`, `ip_address`, `user_agent`, `device_type`, `browser`, `operating_system`, `page_path`, `referrer`, `metadata`, `created_at`) VALUES
(1, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.2 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-24 23:13:28'),
(2, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-24 23:14:55'),
(3, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444', 'Desktop', 'Unknown', 'Windows', '/telegram-diagnostic-20260925', 'diagnostic', '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-25 13:49:26'),
(4, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-25 14:56:32'),
(5, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-25 15:00:08'),
(6, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 00:45:09'),
(7, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.2 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 00:46:21'),
(8, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 01:02:40'),
(9, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 01:04:48'),
(10, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', 'http://127.0.0.1:5174/', '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 01:06:57'),
(11, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 01:07:43'),
(12, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 01:09:28'),
(13, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 01:13:54'),
(14, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 01:16:58'),
(15, 'telegram_click', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 01:17:52'),
(16, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 01:19:00'),
(17, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 01:20:36'),
(18, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 01:23:47'),
(19, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 17:20:27'),
(20, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-26 17:36:08'),
(21, 'site_visit', NULL, NULL, NULL, NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.2 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'Desktop', 'Chrome', 'Windows', '/', NULL, '{\"geo_provider\":\"https://ipwho.is\"}', '2026-09-27 21:38:36');

-- --------------------------------------------------------

--
-- Table structure for table `auth_activity`
--

CREATE TABLE `auth_activity` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `event_type` varchar(50) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_activity`
--

INSERT INTO `auth_activity` (`id`, `user_id`, `event_type`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, NULL, 'logout', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9168', '2026-09-05 16:03:46'),
(2, NULL, 'logout', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9168', '2026-09-05 16:04:32'),
(3, NULL, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9168', '2026-09-05 16:04:32'),
(4, NULL, 'logout', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.135.0 Chrome/148.0.7778.280 Electron/42.8.1 Safari/537.36', '2026-09-05 16:06:05'),
(5, 4, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-05 16:40:40'),
(6, 4, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-06 03:21:23'),
(7, 5, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-07 14:06:21'),
(8, 6, 'logout', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-25 19:57:42'),
(9, 6, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-25 20:02:06'),
(10, 6, 'logout', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-25 20:03:40'),
(11, 6, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-25 20:05:36'),
(12, 6, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-25 20:08:24'),
(13, 6, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-25 20:14:59'),
(14, 6, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-25 20:26:35'),
(15, 6, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.2 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', '2026-09-25 20:49:42'),
(16, 6, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-26 12:19:02'),
(17, 6, 'login_success', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', '2026-09-26 12:21:12');

-- --------------------------------------------------------

--
-- Table structure for table `auth_login_challenges`
--

CREATE TABLE `auth_login_challenges` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `challenge_token_hash` char(64) NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_sessions`
--

CREATE TABLE `auth_sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `session_token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `last_activity_at` datetime NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `device_type` varchar(30) DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `operating_system` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_sessions`
--

INSERT INTO `auth_sessions` (`id`, `user_id`, `session_token_hash`, `expires_at`, `created_at`, `last_activity_at`, `ip_address`, `user_agent`, `device_type`, `browser`, `operating_system`) VALUES
(5, 4, 'ff6e0d018f81a776fab433108eee00f62d32ac69aae8e374a8e7f69b708e6cf5', '2026-09-12 23:39:09', '2026-09-05 16:39:09', '2026-09-05 16:39:09', NULL, NULL, NULL, NULL, NULL),
(6, 4, '40d0c3c85f4a401006044a213148515f6a6e930e241241d8766f425ccd74a021', '2026-09-12 23:40:40', '2026-09-05 16:40:40', '2026-09-06 02:50:39', NULL, NULL, NULL, NULL, NULL),
(7, 4, '8c6ce86c9120691528d0fc89402a436b97b6dfa953168f81635167e5b4df918e', '2026-09-13 10:21:23', '2026-09-06 03:21:23', '2026-09-06 03:21:23', NULL, NULL, NULL, NULL, NULL),
(8, 5, 'fa14266ae0e9672a7b793b41fa4c3c2104554057dfe3291259578dd077278ff6', '2026-09-14 20:40:15', '2026-09-07 13:40:15', '2026-09-07 13:41:12', NULL, NULL, NULL, NULL, NULL),
(9, 5, 'd28046492b3354a2dd347c03489d031030ef1fcf4021378c4f2d91ce751701fb', '2026-09-14 21:06:21', '2026-09-07 14:06:21', '2026-09-07 14:06:21', NULL, NULL, NULL, NULL, NULL),
(12, 6, '3c813142b8db2e3c06af3c9c808a3d26478cb4ecf33a8f892e38122f56206c64', '2026-10-03 03:05:36', '2026-09-25 20:05:36', '2026-09-26 12:35:29', NULL, NULL, NULL, NULL, NULL),
(13, 6, '68f892b112efaf1d3b5960020f1b81b83ed88afa439dfb9d9443bb6a3bbf033e', '2026-10-03 03:08:24', '2026-09-25 20:08:24', '2026-09-26 12:20:27', NULL, NULL, NULL, NULL, NULL),
(14, 6, 'e1e63d89180cc2b57e95b84635944ebd77ae5816b0cbdacba607fcbbaf360a86', '2026-10-03 03:14:59', '2026-09-25 20:14:59', '2026-09-26 12:21:44', NULL, NULL, NULL, NULL, NULL),
(15, 6, '9ab444a8cec19a22804193eb16851de03f9a68177e13ec8b8407e4b1e50580f5', '2026-10-03 03:26:35', '2026-09-25 20:26:35', '2026-09-25 20:39:34', NULL, NULL, NULL, NULL, NULL),
(16, 6, '7dcb036d779822da7f8640ce27d0a6cf34585ff56181b505b49a5d8d5b6ff3d9', '2026-10-03 03:49:42', '2026-09-25 20:49:42', '2026-09-27 17:48:26', NULL, NULL, NULL, NULL, NULL),
(17, 6, '19d3747c468dc3e562f2ac92f48c1049dae2b0ad24474c3babf1e1e6e61bae7b', '2026-10-03 19:19:02', '2026-09-26 12:19:02', '2026-09-26 16:30:44', NULL, NULL, NULL, NULL, NULL),
(18, 6, 'c49d75e61b114b8a0ac12702ef2c27705aec6d38db6ad03f4885b91dedb13bba', '2026-10-03 19:21:12', '2026-09-26 12:21:12', '2026-09-26 12:21:12', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `email_change_requests`
--

CREATE TABLE `email_change_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `new_email` varchar(255) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_verification_tokens`
--

CREATE TABLE `email_verification_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `security_events`
--

CREATE TABLE `security_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `event_type` varchar(60) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `security_events`
--

INSERT INTO `security_events` (`id`, `user_id`, `event_type`, `ip_address`, `user_agent`, `metadata`, `created_at`) VALUES
(1, 6, 'preferences_updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.2 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', '{\"fields\":[\"language\"]}', '2026-09-27 21:31:42'),
(2, 6, 'preferences_updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.2 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', '{\"fields\":[\"language\"]}', '2026-09-27 21:31:50'),
(3, 6, 'preferences_updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.2 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', '{\"fields\":[\"language\"]}', '2026-09-27 21:31:50'),
(4, 6, 'preferences_updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.2 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', '{\"fields\":[\"language\"]}', '2026-09-27 21:31:51'),
(5, 6, 'preferences_updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.2 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', '{\"fields\":[\"language\"]}', '2026-09-27 21:31:51'),
(6, 6, 'preferences_updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.2 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', '{\"fields\":[\"language\"]}', '2026-09-27 21:31:52'),
(7, 6, 'preferences_updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.2 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', '{\"fields\":[\"language\"]}', '2026-09-27 21:31:53'),
(8, 6, 'preferences_updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.2 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', '{\"fields\":[\"language\"]}', '2026-09-27 21:31:55'),
(9, 6, 'referral_id_issued', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.2 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', NULL, '2026-09-27 22:48:25');

-- --------------------------------------------------------

--
-- Table structure for table `security_rate_limits`
--

CREATE TABLE `security_rate_limits` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(40) NOT NULL,
  `scope_hash` char(64) NOT NULL,
  `attempts` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `window_started_at` datetime NOT NULL,
  `blocked_until` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `status` enum('active','suspended','disabled') NOT NULL DEFAULT 'active',
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deactivated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `email_verified_at`, `status`, `role`, `last_login_at`, `created_at`, `updated_at`, `deactivated_at`) VALUES
(4, 'Adams Johnson', 'adamskjohnson@gmail.com', '$2y$10$GuG5.z7zJkGBlxzK5ZRlluf/G/JXSLyyi4/SjUd5vI81TxzAm4XLW', NULL, 'active', 'user', '2026-09-06 03:21:23', '2026-09-05 16:39:09', '2026-09-06 03:21:23', NULL),
(5, 'baby', 'baby@gmail.com', '$2y$10$XRArv5SdNt8sNJvx1SutqO/v0Q53sHuKUx0kh6CbDhvqgLoxmMtMi', NULL, 'active', 'user', '2026-09-07 14:06:21', '2026-09-07 13:40:15', '2026-09-07 14:06:21', NULL),
(6, 'just jb', 'justjb3649@gmail.com', '$2y$10$IMzcBH1VFnK7LM2NiA68YOxSc3vHvgopgVAbBwE5Al.OKenKSg17.', NULL, 'active', 'admin', '2026-09-26 12:21:12', '2026-09-25 19:57:24', '2026-09-26 12:21:12', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `theme` enum('dark','light','system') NOT NULL DEFAULT 'dark',
  `sound_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `sound_volume` tinyint(3) UNSIGNED NOT NULL DEFAULT 70,
  `activity_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `staking_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `reward_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `referral_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `language` varchar(10) NOT NULL DEFAULT 'en',
  `currency` char(3) NOT NULL DEFAULT 'USD',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`id`, `user_id`, `theme`, `sound_enabled`, `sound_volume`, `activity_notifications`, `staking_notifications`, `reward_notifications`, `referral_notifications`, `language`, `currency`, `created_at`, `updated_at`) VALUES
(1, 6, 'dark', 1, 70, 1, 1, 1, 1, 'en', 'USD', '2026-09-27 21:31:29', '2026-09-27 21:31:55');

-- --------------------------------------------------------

--
-- Table structure for table `user_profile_images`
--

CREATE TABLE `user_profile_images` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `mime_type` enum('image/jpeg','image/png','image/webp') NOT NULL,
  `image_data` mediumblob NOT NULL,
  `byte_size` int(10) UNSIGNED NOT NULL,
  `width` smallint(5) UNSIGNED NOT NULL,
  `height` smallint(5) UNSIGNED NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_recovery_codes`
--

CREATE TABLE `user_recovery_codes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `code_hash` char(64) NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_referrals`
--

CREATE TABLE `user_referrals` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `referral_id` varchar(24) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_referrals`
--

INSERT INTO `user_referrals` (`user_id`, `referral_id`, `created_at`) VALUES
(6, 'NC-45E84873F5C0AE575805', '2026-09-27 22:48:25');

-- --------------------------------------------------------

--
-- Table structure for table `user_two_factor`
--

CREATE TABLE `user_two_factor` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `secret_encrypted` text NOT NULL,
  `enabled_at` datetime DEFAULT NULL,
  `last_used_at` datetime DEFAULT NULL,
  `last_totp_timestamp` bigint(20) UNSIGNED DEFAULT NULL,
  `setup_expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_activity`
--
ALTER TABLE `admin_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_activity_event_type` (`event_type`),
  ADD KEY `idx_admin_activity_created_at` (`created_at`),
  ADD KEY `idx_admin_activity_country_code` (`country_code`),
  ADD KEY `idx_admin_activity_dedup` (`event_type`,`ip_address`,`created_at`);

--
-- Indexes for table `auth_activity`
--
ALTER TABLE `auth_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_auth_activity_user_id` (`user_id`),
  ADD KEY `idx_auth_activity_event_type` (`event_type`),
  ADD KEY `idx_auth_activity_created_at` (`created_at`);

--
-- Indexes for table `auth_login_challenges`
--
ALTER TABLE `auth_login_challenges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_auth_login_challenge_hash` (`challenge_token_hash`),
  ADD KEY `idx_auth_login_challenge_user` (`user_id`),
  ADD KEY `idx_auth_login_challenge_expiry` (`expires_at`);

--
-- Indexes for table `auth_sessions`
--
ALTER TABLE `auth_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_auth_sessions_token_hash` (`session_token_hash`),
  ADD KEY `idx_auth_sessions_user_id` (`user_id`),
  ADD KEY `idx_auth_sessions_expires_at` (`expires_at`);

--
-- Indexes for table `email_change_requests`
--
ALTER TABLE `email_change_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_email_change_user` (`user_id`),
  ADD UNIQUE KEY `uq_email_change_token_hash` (`token_hash`),
  ADD KEY `idx_email_change_new_email` (`new_email`),
  ADD KEY `idx_email_change_expiry` (`expires_at`);

--
-- Indexes for table `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_email_verification_token_hash` (`token_hash`),
  ADD KEY `idx_email_verification_user` (`user_id`),
  ADD KEY `idx_email_verification_expiry` (`expires_at`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_password_reset_token_hash` (`token_hash`),
  ADD KEY `idx_password_reset_user_id` (`user_id`),
  ADD KEY `idx_password_reset_expires_at` (`expires_at`);

--
-- Indexes for table `security_events`
--
ALTER TABLE `security_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_security_events_user_created` (`user_id`,`created_at`),
  ADD KEY `idx_security_events_type_created` (`event_type`,`created_at`);

--
-- Indexes for table `security_rate_limits`
--
ALTER TABLE `security_rate_limits`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_security_rate_limit_scope` (`action`,`scope_hash`),
  ADD KEY `idx_security_rate_limit_blocked` (`blocked_until`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD KEY `idx_users_status` (`status`),
  ADD KEY `idx_users_created_at` (`created_at`),
  ADD KEY `idx_users_role` (`role`);

--
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_preferences_user_id` (`user_id`);

--
-- Indexes for table `user_profile_images`
--
ALTER TABLE `user_profile_images`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_recovery_codes`
--
ALTER TABLE `user_recovery_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_recovery_code_hash` (`code_hash`),
  ADD KEY `idx_user_recovery_codes_user` (`user_id`);

--
-- Indexes for table `user_referrals`
--
ALTER TABLE `user_referrals`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `uq_user_referrals_referral_id` (`referral_id`);

--
-- Indexes for table `user_two_factor`
--
ALTER TABLE `user_two_factor`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_two_factor_user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_activity`
--
ALTER TABLE `admin_activity`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `auth_activity`
--
ALTER TABLE `auth_activity`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `auth_login_challenges`
--
ALTER TABLE `auth_login_challenges`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_sessions`
--
ALTER TABLE `auth_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `email_change_requests`
--
ALTER TABLE `email_change_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `security_events`
--
ALTER TABLE `security_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `security_rate_limits`
--
ALTER TABLE `security_rate_limits`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `user_recovery_codes`
--
ALTER TABLE `user_recovery_codes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_two_factor`
--
ALTER TABLE `user_two_factor`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auth_activity`
--
ALTER TABLE `auth_activity`
  ADD CONSTRAINT `fk_auth_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `auth_login_challenges`
--
ALTER TABLE `auth_login_challenges`
  ADD CONSTRAINT `fk_auth_login_challenge_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `auth_sessions`
--
ALTER TABLE `auth_sessions`
  ADD CONSTRAINT `fk_auth_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `email_change_requests`
--
ALTER TABLE `email_change_requests`
  ADD CONSTRAINT `fk_email_change_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  ADD CONSTRAINT `fk_email_verification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `security_events`
--
ALTER TABLE `security_events`
  ADD CONSTRAINT `fk_security_events_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `fk_user_preferences_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_profile_images`
--
ALTER TABLE `user_profile_images`
  ADD CONSTRAINT `fk_user_profile_images_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_recovery_codes`
--
ALTER TABLE `user_recovery_codes`
  ADD CONSTRAINT `fk_user_recovery_codes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_referrals`
--
ALTER TABLE `user_referrals`
  ADD CONSTRAINT `fk_user_referrals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_two_factor`
--
ALTER TABLE `user_two_factor`
  ADD CONSTRAINT `fk_user_two_factor_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
