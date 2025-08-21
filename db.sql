-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: localhost    Database: db_school
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `facultyId` bigint NOT NULL,
  `code` varchar(15) NOT NULL,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_91fddbe23e927e1e525c152baa` (`code`),
  KEY `FK_8eb1debd52cf31a5efa81f9b87a` (`facultyId`),
  CONSTRAINT `FK_8eb1debd52cf31a5efa81f9b87a` FOREIGN KEY (`facultyId`) REFERENCES `faculties` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,1,'IT1','Bộ môn Khoa học máy tính','2025-08-21 07:44:50.372014','2025-08-21 07:44:50.372014','Bộ môn Khoa học máy tính');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculties`
--

DROP TABLE IF EXISTS `faculties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculties` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(15) NOT NULL,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f1b2cd43a96c6fb75c8ad44de8` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculties`
--

LOCK TABLES `faculties` WRITE;
/*!40000 ALTER TABLE `faculties` DISABLE KEYS */;
INSERT INTO `faculties` VALUES (1,'IT','Khoa CNTT-TT','2025-08-21 07:44:22.173085','2025-08-21 07:44:22.173085','Khoa công nghệ thông tin và truyền thông');
/*!40000 ALTER TABLE `faculties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `majors`
--

DROP TABLE IF EXISTS `majors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `majors` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `departmentId` bigint NOT NULL,
  `code` varchar(15) NOT NULL,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_8b287db61b00b45e58c854f19d` (`code`),
  KEY `FK_3ca4d9c3efa1ee017b89e904608` (`departmentId`),
  CONSTRAINT `FK_3ca4d9c3efa1ee017b89e904608` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `majors`
--

LOCK TABLES `majors` WRITE;
/*!40000 ALTER TABLE `majors` DISABLE KEYS */;
INSERT INTO `majors` VALUES (1,1,'IT1','Khoa học máy tính','2025-08-21 07:45:31.719365','2025-08-21 07:45:31.719365','Ngành học: Khoa học máy tính | Computer Science');
/*!40000 ALTER TABLE `majors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `milestone_submissions`
--

DROP TABLE IF EXISTS `milestone_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `milestone_submissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `milestoneId` bigint NOT NULL,
  `submittedBy` bigint NOT NULL,
  `submittedAt` datetime NOT NULL,
  `note` text,
  `fileUrl` varchar(1024) DEFAULT NULL,
  `version` int NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_da3bda55ed7562f6e400f8cec8f` (`milestoneId`),
  KEY `FK_61b99debd406ae86eeeede41c0d` (`submittedBy`),
  CONSTRAINT `FK_61b99debd406ae86eeeede41c0d` FOREIGN KEY (`submittedBy`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_da3bda55ed7562f6e400f8cec8f` FOREIGN KEY (`milestoneId`) REFERENCES `project_milestones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `milestone_submissions`
--

LOCK TABLES `milestone_submissions` WRITE;
/*!40000 ALTER TABLE `milestone_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `milestone_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `userId` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `seen` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_692a909ee0fa9383e7859f9b406` (`userId`),
  CONSTRAINT `FK_692a909ee0fa9383e7859f9b406` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_members`
--

DROP TABLE IF EXISTS `project_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_members` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `projectId` bigint NOT NULL,
  `studentId` bigint NOT NULL,
  `roleInTeam` varchar(100) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_d19892d8f03928e5bfc7313780c` (`projectId`),
  KEY `FK_e76b652548ae50e9cbf8df05552` (`studentId`),
  CONSTRAINT `FK_d19892d8f03928e5bfc7313780c` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_e76b652548ae50e9cbf8df05552` FOREIGN KEY (`studentId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_members`
--

LOCK TABLES `project_members` WRITE;
/*!40000 ALTER TABLE `project_members` DISABLE KEYS */;
INSERT INTO `project_members` VALUES (27,1,2,'Member','2025-08-21 10:38:24.101460','2025-08-21 10:38:24.101460'),(28,1,3,'Tester','2025-08-21 10:38:24.104634','2025-08-21 10:38:24.104634'),(29,1,6,'Developer','2025-08-21 10:38:24.107114','2025-08-21 10:38:24.107114'),(30,4,6,'Member','2025-08-21 10:38:40.399309','2025-08-21 10:38:40.399309'),(31,4,3,'PM','2025-08-21 10:38:40.401034','2025-08-21 10:38:40.401034');
/*!40000 ALTER TABLE `project_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_milestones`
--

DROP TABLE IF EXISTS `project_milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_milestones` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `projectId` bigint NOT NULL,
  `dueDate` date NOT NULL,
  `description` text,
  `orderIndex` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_9fb847267f120c4cdbbb28b408b` (`projectId`),
  CONSTRAINT `FK_9fb847267f120c4cdbbb28b408b` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_milestones`
--

LOCK TABLES `project_milestones` WRITE;
/*!40000 ALTER TABLE `project_milestones` DISABLE KEYS */;
INSERT INTO `project_milestones` VALUES (1,1,'2025-01-02','Chọn đề tài: quá trình lựa chọn một chủ đề cụ thể để làm bài nghiên cứu, luận văn, đồ án, bài thuyết trình hoặc dự án khoa học.',1,'inactive','2025-08-21 10:38:24.113680','2025-08-21 10:38:24.113680','Chọn đề tài,  lựa chọn một chủ đề cụ thể'),(2,1,'2025-12-02','Báo cáo sơ bộ lần 1',2,'active','2025-08-21 10:38:24.117878','2025-08-21 10:38:24.117878','Báo cáo sơ bộ lần 1'),(3,1,'2025-03-01','Báo cáo sơ bộ lần 2',3,'active','2025-08-21 10:38:24.121812','2025-08-21 10:38:24.121812','Báo cáo sơ bộ lần 2');
/*!40000 ALTER TABLE `project_milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `title` varchar(500) NOT NULL,
  `abstract` text NOT NULL,
  `objectives` text NOT NULL,
  `scope` text NOT NULL,
  `method` text NOT NULL,
  `expectedOutputs` text NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `status` enum('draft','pending','approved','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
  `level` enum('undergraduate','graduate','research') NOT NULL DEFAULT 'undergraduate',
  `budget` decimal(15,2) NOT NULL DEFAULT '0.00',
  `facultyId` bigint NOT NULL,
  `departmentId` bigint NOT NULL,
  `majorId` bigint NOT NULL,
  `createdBy` bigint NOT NULL,
  `supervisorId` bigint NOT NULL,
  `termId` bigint NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_d95a87318392465ab663a32cc4` (`code`),
  KEY `FK_d2b9b805ae58fd8d02476fc72d4` (`facultyId`),
  KEY `FK_a63577f1af41220752b20fb58c6` (`departmentId`),
  KEY `FK_3dfad9b362208721481e6b3722a` (`majorId`),
  KEY `FK_4fcfae511b4f6aaa67a8d325968` (`createdBy`),
  KEY `FK_f46741201d12b28be566211ce57` (`supervisorId`),
  KEY `FK_a511e5dca516be10b1be0ca16dc` (`termId`),
  CONSTRAINT `FK_3dfad9b362208721481e6b3722a` FOREIGN KEY (`majorId`) REFERENCES `majors` (`id`),
  CONSTRAINT `FK_4fcfae511b4f6aaa67a8d325968` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_a511e5dca516be10b1be0ca16dc` FOREIGN KEY (`termId`) REFERENCES `terms` (`id`),
  CONSTRAINT `FK_a63577f1af41220752b20fb58c6` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `FK_d2b9b805ae58fd8d02476fc72d4` FOREIGN KEY (`facultyId`) REFERENCES `faculties` (`id`),
  CONSTRAINT `FK_f46741201d12b28be566211ce57` FOREIGN KEY (`supervisorId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'P0000001','Hệ thống quản lý bãi đố xe thông minh','vvv','bbbb','ccc','ddd','vvvv','2025-01-01','2025-01-09','approved','undergraduate',0.00,1,1,1,1,4,1,'2025-08-21 08:24:38.562871','2025-08-21 10:38:24.000000'),(4,'P0000002','Hệ thống quản lý bãi đố xe thông minh','Hệ thống quản lý bãi đố xe thông minh','Hệ thống quản lý bãi đố xe thông minh','Hệ thống quản lý bãi đố xe thông minh','Hệ thống quản lý bãi đố xe thông minh','Hệ thống quản lý bãi đố xe thông minh','2025-01-01','2025-01-09','pending','graduate',0.00,1,1,1,1,5,2,'2025-08-21 09:10:57.100312','2025-08-21 10:38:40.000000');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` enum('Student','Lecturer','DepartmentHead','FacultyDean','Council','Admin') NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_648e3f5447f725579d7d4ffdfb` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Student','2025-08-20 10:24:08.158121','2025-08-20 10:24:08.158121'),(2,'Lecturer','2025-08-20 10:24:08.163030','2025-08-20 10:24:08.163030'),(3,'DepartmentHead','2025-08-20 10:24:08.166262','2025-08-20 10:24:08.166262'),(4,'FacultyDean','2025-08-20 10:24:08.168164','2025-08-20 10:24:08.168164'),(5,'Council','2025-08-20 10:24:08.170163','2025-08-20 10:24:08.170163'),(6,'Admin','2025-08-20 10:24:08.171589','2025-08-20 10:24:08.171589');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `term_milestones`
--

DROP TABLE IF EXISTS `term_milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `term_milestones` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `termId` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `dueDate` date NOT NULL,
  `description` text,
  `orderIndex` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `isRequired` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_41f96042c27a26e3c196503bd87` (`termId`),
  CONSTRAINT `FK_41f96042c27a26e3c196503bd87` FOREIGN KEY (`termId`) REFERENCES `terms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `term_milestones`
--

LOCK TABLES `term_milestones` WRITE;
/*!40000 ALTER TABLE `term_milestones` DISABLE KEYS */;
INSERT INTO `term_milestones` VALUES (1,1,'Chọn đề tài,  lựa chọn một chủ đề cụ thể','2025-01-02','Chọn đề tài: quá trình lựa chọn một chủ đề cụ thể để làm bài nghiên cứu, luận văn, đồ án, bài thuyết trình hoặc dự án khoa học.',1,'inactive','2025-08-21 05:02:45.120531','2025-08-21 07:32:28.000000',1),(2,1,'Báo cáo sơ bộ lần 1','2025-12-02','Báo cáo sơ bộ lần 1',2,'active','2025-08-21 07:08:53.297417','2025-08-21 07:29:36.000000',1),(3,1,'Báo cáo sơ bộ lần 2','2025-03-01','Báo cáo sơ bộ lần 2',3,'active','2025-08-21 07:29:25.386423','2025-08-21 07:29:25.386423',1);
/*!40000 ALTER TABLE `term_milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `terms`
--

DROP TABLE IF EXISTS `terms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `terms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `description` text,
  `status` enum('open','closed','archived') NOT NULL DEFAULT 'open',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_7e399562d3db75d5a0b6a3f25e` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `terms`
--

LOCK TABLES `terms` WRITE;
/*!40000 ALTER TABLE `terms` DISABLE KEYS */;
INSERT INTO `terms` VALUES (1,'2025A','Bảo vệ đồ án tốt nghiệp 2025A','2025-01-01','2025-02-07','Bảo vệ đồ án tốt nghiệp 2025A','open','2025-08-21 04:57:02.166630','2025-08-21 07:36:17.000000'),(2,'2025-NCKH-A','Nghiên cứu khoa học 2025A','2025-01-01','2025-01-09','Nghiên cứu khoa học cấp trường','open','2025-08-21 07:34:49.057494','2025-08-21 09:20:57.000000');
/*!40000 ALTER TABLE `terms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `userId` bigint NOT NULL,
  `roleId` bigint NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_472b25323af01488f1f66a06b67` (`userId`),
  KEY `FK_86033897c009fcca8b6505d6be2` (`roleId`),
  CONSTRAINT `FK_472b25323af01488f1f66a06b67` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_86033897c009fcca8b6505d6be2` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1,2,'2025-08-21 04:48:48.462381','2025-08-21 04:48:48.462381'),(2,1,4,'2025-08-21 04:48:48.464570','2025-08-21 04:48:48.464570'),(3,1,6,'2025-08-21 04:48:48.464570','2025-08-21 04:48:48.464570'),(4,1,1,'2025-08-21 08:12:26.645999','2025-08-21 08:12:26.645999'),(5,1,3,'2025-08-21 08:12:26.653259','2025-08-21 08:12:26.653259'),(6,1,5,'2025-08-21 08:12:26.655184','2025-08-21 08:12:26.655184'),(7,2,1,'2025-08-21 08:12:55.217587','2025-08-21 08:12:55.217587'),(8,3,1,'2025-08-21 08:13:18.250052','2025-08-21 08:13:18.250052'),(9,4,2,'2025-08-21 08:15:40.457889','2025-08-21 08:15:40.457889'),(11,5,2,'2025-08-21 08:16:49.266512','2025-08-21 08:16:49.266512'),(12,6,1,'2025-08-21 08:17:14.314373','2025-08-21 08:17:14.314373');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(15) NOT NULL,
  `name` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `phone` varchar(15) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_1f7a2b11e29b1422a2622beab3` (`code`),
  UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'00000001','Quản trị viên','https://static.vecteezy.com/system/resources/previews/001/912/631/non_2x/beautiful-woman-in-frame-circular-avatar-character-free-vector.jpg','0123456789','administrator@example.com','$2b$10$AryVeBDzUxIVM3vnsd4HXOr52kDr3uUsgvfqZloWV6qzD5vzWLdTi','2025-08-21 04:48:48.456977','2025-08-21 10:06:06.656811'),(2,'00000011','Sinh viên A','https://static.vecteezy.com/system/resources/previews/001/912/631/non_2x/beautiful-woman-in-frame-circular-avatar-character-free-vector.jpg','0123456780','sinhviena@gmail.com','$2b$10$SawYYnmIY67NqB1kb2z9V.XygZCNjJi6GhEpWaOwAjA/gVMya.Y5e','2025-08-21 08:12:55.213515','2025-08-21 10:06:06.658536'),(3,'00000021','Sinh viên B','https://static.vecteezy.com/system/resources/previews/001/912/631/non_2x/beautiful-woman-in-frame-circular-avatar-character-free-vector.jpg','0123456780','sinhvienb@gmail.com','$2b$10$iOw4/tr4PdNFEIZoo91FTuIlksrxDBj58W4Rt0Q0Nvk8ehQxnPHfK','2025-08-21 08:13:18.248065','2025-08-21 10:06:06.661503'),(4,'00000031','Giảng viên 1','https://static.vecteezy.com/system/resources/previews/001/912/631/non_2x/beautiful-woman-in-frame-circular-avatar-character-free-vector.jpg','0123456780','giangvien1@gmail.com','$2b$10$xUrLZAcyMbs879ioPdnMaeecb35t99G5d8xZVy/6UFnRu2Uo406Q2','2025-08-21 08:15:40.455747','2025-08-21 10:06:06.663172'),(5,'00000041','Giảng viên 2','https://static.vecteezy.com/system/resources/previews/001/912/631/non_2x/beautiful-woman-in-frame-circular-avatar-character-free-vector.jpg','0981248922','giangvien2@gmail.com','$2b$10$fZ2IguFNpSNYhlu88/yIjuSEl1vXmX.wcDuiSviQbde4xdMeOcI0K','2025-08-21 08:16:42.538906','2025-08-21 10:06:06.665010'),(6,'00000051','Sinh viên C','https://static.vecteezy.com/system/resources/previews/001/912/631/non_2x/beautiful-woman-in-frame-circular-avatar-character-free-vector.jpg','0123456780','sinhvienc@gmail.com','$2b$10$AHptzmSvTGmVDpJNuNkwv.7Kq2ofz/5UBbf/3Z7AxbA5B/stwZ7mS','2025-08-21 08:17:14.311720','2025-08-21 10:06:06.666733');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-21 17:50:24
