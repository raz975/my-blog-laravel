-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Окт 31 2026 г., 15:45
-- Версия сервера: 8.0.30
-- Версия PHP: 8.1.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `react_php_blog`
--

-- --------------------------------------------------------

--
-- Структура таблицы `comments`
--

CREATE TABLE `comments` (
  `id` int NOT NULL,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `comments`
--

INSERT INTO `comments` (`id`, `post_id`, `user_id`, `content`, `created_at`, `updated_at`) VALUES
(6, 20, 7, '??? ???????? ???????????!', '2026-10-29 13:40:56', '2026-10-29 13:40:56');

-- --------------------------------------------------------

--
-- Структура таблицы `comment_likes`
--

CREATE TABLE `comment_likes` (
  `id` int NOT NULL,
  `comment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `languages`
--

CREATE TABLE `languages` (
  `id` int NOT NULL,
  `code` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `languages`
--

INSERT INTO `languages` (`id`, `code`, `name`, `is_active`, `created_at`) VALUES
(1, 'ru', 'Русский', 0, '2026-10-07 17:18:32'),
(2, 'en', 'English', 1, '2026-10-07 17:18:32'),
(3, 'hy', 'Հայերեն', 0, '2026-10-07 17:18:32');

-- --------------------------------------------------------

--
-- Структура таблицы `menu_items`
--

CREATE TABLE `menu_items` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `parent_id` int DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `user_id` int NOT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `menu_items`
--

INSERT INTO `menu_items` (`id`, `name`, `parent_id`, `url`, `user_id`, `sort_order`, `is_active`) VALUES
(4, 'aaa1', NULL, 'aaa1', 1, 0, 1),
(5, 'bbb1', 4, 'bbb1', 1, 0, 1),
(6, 'ccc1', 5, 'ccc1', 1, 0, 1),
(14, 'bbb2', 4, 'bbb2', 1, 1, 1),
(15, 'ccc4', 14, 'ccc4', 1, 1, 1),
(16, 'ccc2', 5, 'ccc2', 1, 1, 1),
(17, 'ccc3', 14, 'ccc3', 1, 0, 1);

-- --------------------------------------------------------

--
-- Структура таблицы `menu_item_translations`
--

CREATE TABLE `menu_item_translations` (
  `id` int NOT NULL,
  `menu_item_id` int NOT NULL,
  `language_id` int NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `menu_item_translations`
--

INSERT INTO `menu_item_translations` (`id`, `menu_item_id`, `language_id`, `name`) VALUES
(3, 4, 1, 'aaa'),
(4, 4, 2, 'aaa1'),
(5, 4, 3, 'aaa (HY)'),
(6, 5, 1, 'bbb'),
(7, 5, 2, 'bbb1'),
(8, 5, 3, 'bbb (HY)'),
(9, 6, 1, 'ccc'),
(10, 6, 2, 'ccc1'),
(11, 6, 3, 'ccc (HY)'),
(26, 14, 2, 'bbb2'),
(28, 15, 2, 'ccc4'),
(30, 16, 2, 'ccc2'),
(31, 17, 2, 'ccc3');

-- --------------------------------------------------------

--
-- Структура таблицы `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2019_12_14_000001_create_personal_access_tokens_table', 1);

-- --------------------------------------------------------

--
-- Структура таблицы `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 7, 'auth-token', '15c50715b8b4d2940fbb2fa339fee5ea3de5a66210b954c6089a0d1dace7f00e', '[\"*\"]', NULL, NULL, '2026-10-29 09:58:00', '2026-10-29 09:58:00'),
(2, 'App\\Models\\User', 7, 'auth-token', 'a2b562c8230b5da3fb338b8d7a67ab60e12b1750b8cd33598738b077523b7507', '[\"*\"]', '2026-10-29 13:37:29', NULL, '2026-10-29 09:58:07', '2026-10-29 13:37:29'),
(3, 'App\\Models\\User', 7, 'auth-token', '0891ef6535e78906f28ad39076a215cc511a0fe4824393e631b8ec6c18d54dac', '[\"*\"]', NULL, NULL, '2026-10-29 13:36:33', '2026-10-29 13:36:33'),
(4, 'App\\Models\\User', 7, 'auth-token', 'd870a9f49b0406a3fbdfd3c6ad837e96cf98462d2c0c7682401ef1a6d4b0beba', '[\"*\"]', NULL, NULL, '2026-10-29 13:36:59', '2026-10-29 13:36:59'),
(5, 'App\\Models\\User', 7, 'auth-token', '57c66d5e77e92c8f878604755cc4db2628df4145fe524415d7fe66ebd135b3b0', '[\"*\"]', '2026-10-29 13:37:36', NULL, '2026-10-29 13:37:36', '2026-10-29 13:37:36'),
(6, 'App\\Models\\User', 7, 'auth-token', '9938757eda29cc805a0e4a7e8abb0b35d2836115fe286f3add20a9551da042ba', '[\"*\"]', '2026-10-29 13:37:46', NULL, '2026-10-29 13:37:46', '2026-10-29 13:37:46'),
(7, 'App\\Models\\User', 7, 'auth-token', '96f63c1e15dd58f8145184fe3d6119225a5655ff8098da6cbad6ec6e48a17af8', '[\"*\"]', '2026-10-29 13:41:04', NULL, '2026-10-29 13:40:52', '2026-10-29 13:41:04'),
(8, 'App\\Models\\User', 1, 'auth-token', '22587061d9698e0685606f6188a68131523e5fd40422f9ddf2a7cd0d47dc4dd1', '[\"*\"]', NULL, NULL, '2026-10-29 13:45:53', '2026-10-29 13:45:53'),
(9, 'App\\Models\\User', 1, 'auth-token', '212d9448527f78e5035c70619523ccac528a321c9e65832290d820730ab188d1', '[\"*\"]', NULL, NULL, '2026-10-29 13:47:15', '2026-10-29 13:47:15'),
(10, 'App\\Models\\User', 1, 'auth-token', '4af8df99d2a3556b700cc2e27eaa05b9797df0bab42d3ce75b2ec79b90f20f2a', '[\"*\"]', '2026-10-29 13:50:12', NULL, '2026-10-29 13:50:12', '2026-10-29 13:50:12'),
(11, 'App\\Models\\User', 1, 'auth-token', 'c7aac0b41614b1d933792dd5a43fbbfad84ec29246b5884cb84dea5e9a951a7b', '[\"*\"]', '2026-10-29 13:53:03', NULL, '2026-10-29 13:52:50', '2026-10-29 13:53:03'),
(12, 'App\\Models\\User', 1, 'auth-token', 'fa337a390aebe2c0d52e06916fcdaa0b9e6f0f4817603cb207aa12f8c2d6024d', '[\"*\"]', '2026-10-29 14:01:15', NULL, '2026-10-29 13:56:18', '2026-10-29 14:01:15'),
(13, 'App\\Models\\User', 1, 'auth-token', 'a09cdb4a909da040d0582e614d65b3efe172535bebc2cb4fe3796c24ca122858', '[\"*\"]', NULL, NULL, '2026-10-29 14:00:19', '2026-10-29 14:00:19'),
(14, 'App\\Models\\User', 1, 'auth-token', '8f3aa32dc8d8f2ea3ee02b7501e9adb8c4e9257dfce054bc102279b8c19fb43a', '[\"*\"]', '2026-10-29 14:01:41', NULL, '2026-10-29 14:01:22', '2026-10-29 14:01:41'),
(15, 'App\\Models\\User', 1, 'auth-token', '002e8585859746e168ecbc1af1941a05118c0dd1a8d2573edef5aec850e0a1bc', '[\"*\"]', '2026-10-29 14:01:46', NULL, '2026-10-29 14:01:45', '2026-10-29 14:01:46'),
(16, 'App\\Models\\User', 1, 'auth-token', '44599ecf4bb34ddcfced4fa16c985327d75005a637142360cc7a9de14126a6ff', '[\"*\"]', '2026-10-29 14:04:55', NULL, '2026-10-29 14:04:29', '2026-10-29 14:04:55'),
(17, 'App\\Models\\User', 1, 'auth-token', 'e68b9f9390e5cd2ab7e182c914b40594cc35bdf8ada66a4a93872b8840a5ea80', '[\"*\"]', '2026-10-29 14:05:47', NULL, '2026-10-29 14:05:47', '2026-10-29 14:05:47'),
(18, 'App\\Models\\User', 7, 'auth-token', 'd9abec896cc4deccf5cb0eee3191968f1a7d1dd52d64bccacb13d7c39abc46e3', '[\"*\"]', '2026-10-29 14:09:37', NULL, '2026-10-29 14:09:36', '2026-10-29 14:09:37'),
(19, 'App\\Models\\User', 1, 'auth-token', 'b9d0bb2595a81fff7c742bb1d27e37350ada8a3cd5854ae3010f8d8d24e51867', '[\"*\"]', '2026-10-29 14:09:50', NULL, '2026-10-29 14:09:41', '2026-10-29 14:09:50'),
(20, 'App\\Models\\User', 1, 'auth-token', '31936ac0896661e716b2effcd1c5c96027683607e596828ca3de802c06fc7e9b', '[\"*\"]', '2026-10-29 14:10:42', NULL, '2026-10-29 14:10:28', '2026-10-29 14:10:42'),
(21, 'App\\Models\\User', 1, 'auth-token', '9daff7c1d2442fe7487e4480c3883c4a60f81c27bf1a0a0e7f682ce390492a8b', '[\"*\"]', '2026-10-29 14:12:45', NULL, '2026-10-29 14:11:06', '2026-10-29 14:12:45'),
(22, 'App\\Models\\User', 7, 'auth-token', 'b345ed5b2f2fbf90efa9c66b48847662e2a9c1b4792fce2a63ceaf43ecc6d448', '[\"*\"]', '2026-10-29 14:11:15', NULL, '2026-10-29 14:11:15', '2026-10-29 14:11:15'),
(23, 'App\\Models\\User', 1, 'auth-token', '5f185186403606255efd095ba1e21f8f25815ea1750e0e38e5c1dbd6ce14bccd', '[\"*\"]', NULL, NULL, '2026-10-29 14:12:41', '2026-10-29 14:12:41'),
(24, 'App\\Models\\User', 1, 'auth-token', '69a1ec8f44e42d9c90540ff5a50a266b5e2f546deba7214cfd7be312c3836c03', '[\"*\"]', '2026-10-29 14:13:27', NULL, '2026-10-29 14:12:49', '2026-10-29 14:13:27'),
(25, 'App\\Models\\User', 7, 'auth-token', 'd55021e617a6f72714ce1d781d3e4f0bc1d8619d38573d08cea165665f8199b7', '[\"*\"]', '2026-10-29 14:13:57', NULL, '2026-10-29 14:12:57', '2026-10-29 14:13:57'),
(26, 'App\\Models\\User', 7, 'auth-token', '7f5214879339d97e79531836cc4999e67f5fa68fb8a4ac3eb1dbcc81347b502f', '[\"*\"]', '2026-10-29 14:15:58', NULL, '2026-10-29 14:15:54', '2026-10-29 14:15:58'),
(27, 'App\\Models\\User', 7, 'auth-token', 'f2a0b461c02404fab684781602de64989e735922ea6468dd311d805548999162', '[\"*\"]', '2026-10-29 14:16:20', NULL, '2026-10-29 14:16:20', '2026-10-29 14:16:20'),
(28, 'App\\Models\\User', 7, 'auth-token', '76f758d3791fbce170543847d4fe2c20bba31a3c270602442a4a64a2e8364bf0', '[\"*\"]', '2026-10-29 14:16:23', NULL, '2026-10-29 14:16:23', '2026-10-29 14:16:23'),
(29, 'App\\Models\\User', 7, 'auth-token', '0f8ca02c052f667889805f908577e186308d78d7295a3e9660666eb2676271b6', '[\"*\"]', '2026-10-29 14:18:08', NULL, '2026-10-29 14:18:08', '2026-10-29 14:18:08');

-- --------------------------------------------------------

--
-- Структура таблицы `posts`
--

CREATE TABLE `posts` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `posts`
--

INSERT INTO `posts` (`id`, `title`, `content`, `user_id`, `created_at`) VALUES
(11, 'user1', 'user1', 2, '2026-10-08 12:01:08'),
(12, 'user1', 'user1', 2, '2026-10-08 12:02:14'),
(13, 'user2', 'user2', 3, '2026-10-08 12:04:15'),
(14, 'user2', 'user2', 3, '2026-10-08 12:06:23'),
(15, 'user3', 'user3', 4, '2026-10-08 12:08:36'),
(16, 'user3', 'user3', 4, '2026-10-08 12:09:01'),
(17, 'user4', 'user4', 5, '2026-10-08 12:10:18'),
(18, 'user4', 'user4', 5, '2026-10-08 12:10:40'),
(19, 'user5', 'user5', 6, '2026-10-08 12:12:30'),
(20, 'user5', 'user5', 6, '2026-10-08 12:12:44');

-- --------------------------------------------------------

--
-- Структура таблицы `post_images`
--

CREATE TABLE `post_images` (
  `id` int NOT NULL,
  `post_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `post_images`
--

INSERT INTO `post_images` (`id`, `post_id`, `file_name`, `original_name`, `mime_type`, `file_size`, `created_at`) VALUES
(14, 11, 'post_11_1792058753_11033e27.jpg', 'post_11_1792058753_11033e27.jpg', 'image/jpeg', 51357, '2026-10-15 10:05:53'),
(15, 12, 'post_12_1792058769_223dd285.jpg', 'post_12_1792058769_223dd285.jpg', 'image/jpeg', 27604, '2026-10-15 10:06:09'),
(16, 13, 'post_13_1792058785_3a56f561.jpg', 'post_13_1792058785_3a56f561.jpg', 'image/jpeg', 17772, '2026-10-15 10:06:25'),
(17, 14, 'post_14_1792058792_867a93a9.jpg', 'post_14_1792058792_867a93a9.jpg', 'image/jpeg', 37962, '2026-10-15 10:06:32'),
(18, 15, 'post_15_1792058806_f8f51698.jpg', 'post_15_1792058806_f8f51698.jpg', 'image/jpeg', 24495, '2026-10-15 10:06:46'),
(19, 16, 'post_16_1792058813_9b7b2bf7.jpg', 'post_16_1792058813_9b7b2bf7.jpg', 'image/jpeg', 60103, '2026-10-15 10:06:53'),
(20, 17, 'post_17_1792058832_b8d8dc6f.jpg', 'post_17_1792058832_b8d8dc6f.jpg', 'image/jpeg', 16883, '2026-10-15 10:07:12'),
(21, 18, 'post_18_1792058841_b023b9e3.jpg', 'post_18_1792058841_b023b9e3.jpg', 'image/jpeg', 55523, '2026-10-15 10:07:21'),
(22, 19, 'post_19_1792058853_5a2e49ca.jpg', 'post_19_1792058853_5a2e49ca.jpg', 'image/jpeg', 54382, '2026-10-15 10:07:33'),
(23, 20, 'post_20_1792058881_c3bfdba8.jpg', 'post_20_1792058881_c3bfdba8.jpg', 'image/jpeg', 32407, '2026-10-15 10:08:01');

-- --------------------------------------------------------

--
-- Структура таблицы `post_likes`
--

CREATE TABLE `post_likes` (
  `id` int NOT NULL,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `post_translations`
--

CREATE TABLE `post_translations` (
  `id` int NOT NULL,
  `post_id` int NOT NULL,
  `language_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `post_translations`
--

INSERT INTO `post_translations` (`id`, `post_id`, `language_id`, `title`, `content`) VALUES
(24, 11, 2, 'user1', 'user1'),
(25, 12, 2, 'user1', 'user1'),
(29, 13, 2, 'user2', 'user2'),
(30, 14, 2, 'user2', 'user2'),
(31, 15, 2, 'user3', 'user3'),
(32, 16, 2, 'user3', 'user3'),
(33, 17, 2, 'user4', 'user4'),
(34, 18, 1, 'user4', 'user4'),
(35, 19, 2, 'user5', 'user5'),
(36, 20, 2, 'user5', 'user5'),
(37, 11, 1, 'user1', 'user1'),
(38, 12, 1, 'user1', 'user1'),
(39, 13, 1, 'user2', 'user2'),
(40, 14, 1, 'user2', 'user2'),
(41, 15, 1, 'user3', 'user3'),
(42, 16, 1, 'user3', 'user3'),
(43, 17, 1, 'user4', 'user4'),
(45, 19, 1, 'user5', 'user5'),
(46, 20, 1, 'user5', 'user5');

-- --------------------------------------------------------

--
-- Структура таблицы `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int NOT NULL,
  `follower_id` int NOT NULL,
  `following_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  `is_blocked` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `is_blocked`, `created_at`) VALUES
(1, 'admin', 'admin@gmail.com', '$2y$10$WaDYayrsgzd9I18x9Qpr..EmU3TgbXCe.5m/y3cELfW3Spl9eTKRu', 'admin', 0, '2026-10-07 17:44:10'),
(2, 'user1', 'user1@gmail.com', '$2y$10$RAg75k75hMLJc3pyTY2uFeaJjaOqGXovGYsj0rLwA6hKYzM/OdCpu', 'user', 0, '2026-10-08 11:59:04'),
(3, 'user2', 'user2@gmail.com', '$2y$10$YNvZTSXI59nr6dZi6qyQsOG01TYXapBSqdY2i4Hp7HFyrxoO7bHMy', 'user', 0, '2026-10-08 12:03:37'),
(4, 'user3', 'user3@gmail.com', '$2y$10$RGwixtP/EP9jfU3krLrTeeug5oTZjoRG3pvCA/EbQHcDW4Rbs65Ya', 'user', 0, '2026-10-08 12:07:12'),
(5, 'user4', 'user4@gmail.com', '$2y$10$WYpVBdcDNHDQP.aWfW66wOa5JU923xNhwCWcIthHPI3mqJcT4nLaC', 'user', 0, '2026-10-08 12:09:30'),
(6, 'user5', 'user5@gmail.com', '$2y$10$GuFV6ciZfouLaO19hc6cq.LVdpvMyi7WF6XetrVzmPZCcz7NS74/S', 'user', 0, '2026-10-08 12:11:54'),
(7, 'Laravel Test', 'laravel@test.com', '$2y$10$7SW2Efnxx2jGmF5yiEur2eHflknsogU04ZT1GYAGYwouRxwdMYXSS', 'user', 0, '2026-10-29 12:58:00');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_comment_like` (`comment_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `languages`
--
ALTER TABLE `languages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Индексы таблицы `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `menu_item_translations`
--
ALTER TABLE `menu_item_translations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `menu_lang` (`menu_item_id`,`language_id`),
  ADD KEY `language_id` (`language_id`);

--
-- Индексы таблицы `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Индексы таблицы `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `post_images`
--
ALTER TABLE `post_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_post_id` (`post_id`);

--
-- Индексы таблицы `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`post_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `post_translations`
--
ALTER TABLE `post_translations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `post_lang` (`post_id`,`language_id`),
  ADD KEY `language_id` (`language_id`);

--
-- Индексы таблицы `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_subscription` (`follower_id`,`following_id`),
  ADD KEY `following_id` (`following_id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_is_blocked` (`is_blocked`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT для таблицы `comment_likes`
--
ALTER TABLE `comment_likes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `languages`
--
ALTER TABLE `languages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT для таблицы `menu_item_translations`
--
ALTER TABLE `menu_item_translations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT для таблицы `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT для таблицы `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT для таблицы `post_images`
--
ALTER TABLE `post_images`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT для таблицы `post_likes`
--
ALTER TABLE `post_likes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT для таблицы `post_translations`
--
ALTER TABLE `post_translations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT для таблицы `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_post_fk` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD CONSTRAINT `comment_likes_comment_fk` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comment_likes_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_parent_fk` FOREIGN KEY (`parent_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `menu_item_translations`
--
ALTER TABLE `menu_item_translations`
  ADD CONSTRAINT `menu_trans_item_fk` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `menu_trans_lang_fk` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `post_images`
--
ALTER TABLE `post_images`
  ADD CONSTRAINT `post_images_post_fk` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `post_likes`
--
ALTER TABLE `post_likes`
  ADD CONSTRAINT `post_likes_post_fk` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_likes_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `post_translations`
--
ALTER TABLE `post_translations`
  ADD CONSTRAINT `post_trans_lang_fk` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_trans_post_fk` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subs_follower_fk` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subs_following_fk` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
