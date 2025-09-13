-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: db_school
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.20.04.1

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
-- Table structure for table `academic_years`
--

DROP TABLE IF EXISTS `academic_years`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `academic_years` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_2f17d0b752d4cd40d58a2cf543` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_years`
--

LOCK TABLES `academic_years` WRITE;
/*!40000 ALTER TABLE `academic_years` DISABLE KEYS */;
INSERT INTO `academic_years` VALUES (1,'AY-2024-2025','Năm học 2024 - 2025','Năm học 2024-2025 với nhiều cải tiến trong chương trình đào tạo','2024-09-01','2025-06-30','2025-09-04 23:10:19.478199','2025-09-04 23:10:19.478199'),(2,'AY-2023-2024','Năm học 2023 - 2024','Năm học 2023-2024 với nhiều hoạt động ngoại khóa và hợp tác quốc tế','2023-09-01','2024-06-30','2025-09-04 23:11:06.790236','2025-09-04 23:11:06.790236');
/*!40000 ALTER TABLE `academic_years` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `council_grades`
--

DROP TABLE IF EXISTS `council_grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `council_grades` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `projectId` bigint NOT NULL,
  `councilId` bigint NOT NULL,
  `lecturerId` bigint NOT NULL,
  `score` decimal(4,2) NOT NULL,
  `comment` text,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_1f730cb51c99490197ed221a98` (`projectId`,`lecturerId`),
  KEY `FK_51fa9656d022a38da986287b16e` (`councilId`),
  KEY `FK_411eaf6ab8c6e751c73adb45142` (`lecturerId`),
  CONSTRAINT `FK_411eaf6ab8c6e751c73adb45142` FOREIGN KEY (`lecturerId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_43829d780c9a312d3ff5b74c61f` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_51fa9656d022a38da986287b16e` FOREIGN KEY (`councilId`) REFERENCES `councils` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `council_grades`
--

LOCK TABLES `council_grades` WRITE;
/*!40000 ALTER TABLE `council_grades` DISABLE KEYS */;
INSERT INTO `council_grades` VALUES (1,7,1,8,9.50,'Rất tốt','2025-08-26 22:07:16.650780','2025-08-26 22:07:16.650780'),(2,9,2,11,9.50,'Làm cũng rất tốt','2025-08-26 22:37:06.352863','2025-08-26 22:37:28.000000'),(3,9,2,8,8.00,'Tạm','2025-08-26 22:37:59.686654','2025-08-26 22:37:59.686654');
/*!40000 ALTER TABLE `council_grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `council_members`
--

DROP TABLE IF EXISTS `council_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `council_members` (
  `councilId` bigint NOT NULL,
  `userId` bigint NOT NULL,
  `joinedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`councilId`,`userId`),
  KEY `FK_804c8f7fa2ad023770994b2bdf7` (`userId`),
  CONSTRAINT `FK_0eca54a92ae1c9ae17be09088d6` FOREIGN KEY (`councilId`) REFERENCES `councils` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_804c8f7fa2ad023770994b2bdf7` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `council_members`
--

LOCK TABLES `council_members` WRITE;
/*!40000 ALTER TABLE `council_members` DISABLE KEYS */;
INSERT INTO `council_members` VALUES (1,4,'2025-08-26 22:18:59.843069'),(1,5,'2025-08-26 22:18:59.846188'),(1,8,'2025-08-26 22:18:59.848949'),(2,8,'2025-08-26 22:30:15.720617'),(2,11,'2025-08-26 22:30:15.724829');
/*!40000 ALTER TABLE `council_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `council_projects`
--

DROP TABLE IF EXISTS `council_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `council_projects` (
  `councilId` bigint NOT NULL,
  `projectId` bigint NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`councilId`,`projectId`),
  KEY `FK_7716fecd9f0146eecfc89b8eded` (`projectId`),
  CONSTRAINT `FK_1a4c69f7a10148f089b02797988` FOREIGN KEY (`councilId`) REFERENCES `councils` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_7716fecd9f0146eecfc89b8eded` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `council_projects`
--

LOCK TABLES `council_projects` WRITE;
/*!40000 ALTER TABLE `council_projects` DISABLE KEYS */;
INSERT INTO `council_projects` VALUES (1,5,'2025-08-26 22:02:07.444441'),(1,7,'2025-08-26 22:06:02.379790'),(1,8,'2025-08-26 22:02:07.449134'),(2,9,'2025-08-26 22:36:06.433607'),(8,9,'2025-09-01 22:21:32.361219');
/*!40000 ALTER TABLE `council_projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `councils`
--

DROP TABLE IF EXISTS `councils`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `councils` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `facultyId` bigint DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_3c55e040682492388be3ab5ac61` (`facultyId`),
  CONSTRAINT `FK_3c55e040682492388be3ab5ac61` FOREIGN KEY (`facultyId`) REFERENCES `faculties` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `councils`
--

LOCK TABLES `councils` WRITE;
/*!40000 ALTER TABLE `councils` DISABLE KEYS */;
INSERT INTO `councils` VALUES (1,'Hội đồng 1 - CNTT 2025A','Đồ án tốt nghiệp','active',1,'2025-08-26 22:01:46.893777','2025-08-26 22:18:59.000000'),(2,'Hội đồng 1 - Điện tử & Tự động hóa','Đồ án tốt nghiệp 2025 A ','active',2,'2025-08-26 22:30:15.694537','2025-08-26 22:30:15.694537'),(3,'Hội đồng 1 - CNTT 2025A','Đồ án tốt nghiệp','active',1,'2025-08-26 22:01:46.893777','2025-08-26 22:18:59.000000'),(4,'Hội đồng 1 - Điện tử & Tự động hóa','Đồ án tốt nghiệp 2025 A ','active',2,'2025-08-26 22:30:15.694537','2025-08-26 22:30:15.694537'),(5,'Hội đồng 1 - CNTT 2025A','Đồ án tốt nghiệp','active',1,'2025-08-26 22:01:46.893777','2025-08-26 22:18:59.000000'),(6,'Hội đồng 1 - Điện tử & Tự động hóa','Đồ án tốt nghiệp 2025 A ','active',2,'2025-08-26 22:30:15.694537','2025-08-26 22:30:15.694537'),(7,'Hội đồng 1 - CNTT 2025A','Đồ án tốt nghiệp','active',1,'2025-08-26 22:01:46.893777','2025-08-26 22:18:59.000000'),(8,'Hội đồng 1 - Điện tử & Tự động hóa','Đồ án tốt nghiệp 2025 A ','active',2,'2025-08-26 22:30:15.694537','2025-08-26 22:30:15.694537'),(9,'Hội đồng 1 - CNTT 2025A','Đồ án tốt nghiệp','active',1,'2025-08-26 22:01:46.893777','2025-08-26 22:18:59.000000'),(10,'Hội đồng 1 - Điện tử & Tự động hóa','Đồ án tốt nghiệp 2025 A ','active',2,'2025-08-26 22:30:15.694537','2025-08-26 22:30:15.694537'),(11,'Hội đồng 1 - CNTT 2025A','Đồ án tốt nghiệp','active',1,'2025-08-26 22:01:46.893777','2025-08-26 22:18:59.000000'),(12,'Hội đồng 1 - Điện tử & Tự động hóa','Đồ án tốt nghiệp 2025 A ','active',2,'2025-08-26 22:30:15.694537','2025-08-26 22:30:15.694537');
/*!40000 ALTER TABLE `councils` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `facultyId` bigint NOT NULL,
  `schoolId` bigint NOT NULL,
  `code` varchar(15) NOT NULL,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_91fddbe23e927e1e525c152baa` (`code`),
  KEY `FK_8eb1debd52cf31a5efa81f9b87a` (`facultyId`),
  KEY `FK_a84f54ed79e0a301622069efd92` (`schoolId`),
  CONSTRAINT `FK_8eb1debd52cf31a5efa81f9b87a` FOREIGN KEY (`facultyId`) REFERENCES `faculties` (`id`),
  CONSTRAINT `FK_a84f54ed79e0a301622069efd92` FOREIGN KEY (`schoolId`) REFERENCES `schools` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,1,1,'IT1','Bộ môn Khoa học máy tính','2025-08-21 07:44:50.372014','2025-09-05 00:23:35.139875','Bộ môn Khoa học máy tính'),(2,2,1,'ME1','Bộ môn Điện tử','2025-08-23 22:39:18.885562','2025-09-05 00:23:35.139875','ME1 Bộ môn Điện tử'),(3,10,1,'BMT','Bộ môn Toán','2025-09-01 21:06:48.648307','2025-09-05 00:23:35.139875',''),(4,11,1,'BMT2','Bộ môn Toán 2','2025-09-01 21:07:00.142210','2025-09-05 00:23:35.139875',''),(5,10,1,'BMT3','Bộ môn Toán 3','2025-09-01 21:07:10.494913','2025-09-05 00:23:35.139875',''),(6,11,1,'BMT4','Bộ môn Toán 4','2025-09-01 21:07:21.141438','2025-09-05 00:23:35.139875',''),(7,11,1,'BMT5','Bộ môn Toán 5','2025-09-01 21:07:32.428873','2025-09-05 00:23:35.139875',''),(8,11,1,'BMT6','Bộ môn Toán 6','2025-09-01 21:07:49.408329','2025-09-05 00:23:35.139875',''),(9,11,1,'BMT7','Bộ môn Toán 7','2025-09-01 21:08:03.295603','2025-09-05 00:23:35.139875',''),(10,11,1,'BMT9','Bộ môn Toán 9','2025-09-01 21:08:14.800206','2025-09-05 00:23:35.139875',''),(11,9,1,'BMT10','Bộ môn Toán 10','2025-09-01 21:08:26.257343','2025-09-05 00:51:16.000000','');
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
  `schoolId` bigint NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f1b2cd43a96c6fb75c8ad44de8` (`code`),
  KEY `FK_3f2b38470514a2ce41426524deb` (`schoolId`),
  CONSTRAINT `FK_3f2b38470514a2ce41426524deb` FOREIGN KEY (`schoolId`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculties`
--

LOCK TABLES `faculties` WRITE;
/*!40000 ALTER TABLE `faculties` DISABLE KEYS */;
INSERT INTO `faculties` VALUES (1,'IT','Khoa CNTT-TT',1,'2025-08-21 07:44:22.173085','2025-09-04 23:48:11.086747','Khoa công nghệ thông tin và truyền thông'),(2,'ME','Khoa Điện tử & Tự động hóa',1,'2025-08-23 22:38:54.804726','2025-09-05 00:22:59.699805','Khoa Điện tử & Tự động hóa'),(3,'KT','Khoa Kinh tế',1,'2025-08-31 17:54:05.841239','2025-09-05 00:22:59.699805','Khoa Kinh tế Khoa Kinh tế'),(4,'Khoa Dệt may','Khoa Dệt may',1,'2025-09-01 21:01:57.130035','2025-09-05 00:22:59.699805',''),(5,'Khoa Dệt may 2','Khoa Dệt may 2',1,'2025-09-01 21:02:16.902368','2025-09-05 00:22:59.699805',''),(6,'Khoa Dệt may 3','Khoa Dệt may 3',1,'2025-09-01 21:02:33.263068','2025-09-05 00:22:59.699805',''),(7,'Khoa Dệt may 4','Khoa Dệt may 4',3,'2025-09-01 21:02:47.837992','2025-09-05 00:37:01.655366',''),(8,'Khoa Toán','Khoa Toán',1,'2025-09-01 21:03:00.309079','2025-09-05 00:22:59.699805',''),(9,'Khoa Tin','Khoa Tin',1,'2025-09-01 21:03:19.057378','2025-09-05 00:22:59.699805',''),(10,'Khoa Toán - Tin','Khoa Toán - Tin',1,'2025-09-01 21:03:31.651137','2025-09-05 00:22:59.699805',''),(11,'ET','Khoa Toán - Tin - Anh',3,'2025-09-01 21:04:39.079475','2025-09-05 00:47:52.000000','');
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
  `facultyId` bigint NOT NULL,
  `schoolId` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_8b287db61b00b45e58c854f19d` (`code`),
  KEY `FK_3ca4d9c3efa1ee017b89e904608` (`departmentId`),
  KEY `FK_2764e2b151ee7ca3c11c97c3d98` (`schoolId`),
  KEY `FK_44a7497ed50d3ca85136225bfaa` (`facultyId`),
  CONSTRAINT `FK_2764e2b151ee7ca3c11c97c3d98` FOREIGN KEY (`schoolId`) REFERENCES `schools` (`id`),
  CONSTRAINT `FK_3ca4d9c3efa1ee017b89e904608` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `FK_44a7497ed50d3ca85136225bfaa` FOREIGN KEY (`facultyId`) REFERENCES `faculties` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `majors`
--

LOCK TABLES `majors` WRITE;
/*!40000 ALTER TABLE `majors` DISABLE KEYS */;
INSERT INTO `majors` VALUES (1,1,'IT1','Khoa học máy tính','2025-08-21 07:45:31.719365','2025-09-05 01:00:09.866574','Ngành học: Khoa học máy tính | Computer Science',1,1),(2,1,'IT2','Công nghê phần mềm','2025-08-23 21:29:41.664092','2025-09-05 01:00:09.866574','Công nghê phần mềm',1,1),(3,2,'ME1','Điện tử số','2025-08-23 22:39:40.378461','2025-09-05 01:00:09.866574','Điện tử số',1,1),(4,2,'ME2','Tự động hóa','2025-08-23 22:39:59.046418','2025-09-05 01:00:09.866574','Tự động hóa',1,1),(5,2,'IT6','Mạng máy tính','2025-09-01 14:51:46.559280','2025-09-05 01:00:09.866574','Mạng máy tính',1,1),(6,5,'AI','Trí tuệ nhân tạo','2025-09-01 21:14:20.589525','2025-09-05 01:00:09.866574','',1,1),(7,3,'AI1','Trí tuệ nhân tạo 1','2025-09-01 21:49:57.352049','2025-09-05 01:00:09.866574','',1,1),(8,2,'ME8','Tự động hóa','2025-08-23 22:39:59.046418','2025-09-05 01:00:09.866574','Tự động hóa',1,1),(9,2,'IT9','Mạng máy tính','2025-09-01 14:51:46.559280','2025-09-05 01:00:09.866574','Mạng máy tính',1,1),(10,5,'AI10','Trí tuệ nhân tạo','2025-09-01 21:14:20.589525','2025-09-05 01:00:09.866574','',1,1),(11,3,'AI11','Trí tuệ nhân tạo 1','2025-09-01 21:49:57.352049','2025-09-05 01:00:09.866574','',1,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `milestone_submissions`
--

LOCK TABLES `milestone_submissions` WRITE;
/*!40000 ALTER TABLE `milestone_submissions` DISABLE KEYS */;
INSERT INTO `milestone_submissions` VALUES (1,2,2,'2025-08-22 17:08:02','Yêu cầu share tài liệu cho các mail của các thành viên trong dự án, giảng viên hướng dẫn: giangvien1@gmail.com, sinhviena@gmail.com','https://enelifeconsole.miichisoft.net/login',1,'2025-08-22 10:08:01.727416','2025-08-22 10:31:18.957407'),(2,2,2,'2025-08-22 17:31:11','Yêu cầu share tài liệu cho các mail của các thành viên trong dự án, giảng viên hướng dẫn: giangvien1@gmail.com, sinhviena@gmail.com','https://enelifeconsole.miichisoft.net/login',2,'2025-08-22 10:31:10.778330','2025-08-22 10:31:10.778330'),(3,2,3,'2025-08-22 17:43:44','Yêu cầu share tài liệu cho các mail của các thành viên trong dự án, giảng viên hướng dẫn: giangvien1@gmail.com, sinhvienb@gmail.com','https://enelifeconsole.miichisoft.net/login',3,'2025-08-22 10:43:44.028206','2025-08-22 10:44:52.791649'),(4,2,3,'2025-08-22 17:45:08','Yêu cầu share tài liệu cho các mail của các thành viên trong dự án, giảng viên hướng dẫn: giangvien1@gmail.com, sinhvienb@gmail.com','https://enelifeconsole.miichisoft.net/login',4,'2025-08-22 10:45:08.017212','2025-08-22 10:45:08.017212'),(5,5,7,'2025-08-22 21:58:48','alo lao','https://vnexpress.net/',1,'2025-08-22 21:58:48.349193','2025-08-22 21:58:48.349193'),(6,5,3,'2025-08-22 22:01:02','Ghi chu','https://vnexpress.net/diem-chuan-hon-200-dai-hoc-nam-2025-cap-nhat-nhanh-chi-tiet-chinh-xac-nhat-4929038.html',2,'2025-08-22 22:01:02.133375','2025-08-22 22:01:02.133375'),(7,8,7,'2025-08-23 22:29:58','Link driver 01','Link driver 01',1,'2025-08-23 22:29:57.913444','2025-08-23 22:29:57.913444'),(8,8,9,'2025-08-23 22:30:48','Link driver 02 Link driver 02Link driver 02Link driver 02Link driver 02','Link driver 02',2,'2025-08-23 22:30:47.709243','2025-08-23 22:30:47.709243'),(9,2,2,'2025-08-26 22:04:39','drvier ','sasasasas',5,'2025-08-26 22:04:39.017174','2025-08-26 22:04:39.017174'),(10,6,2,'2025-08-26 22:05:21','Link driver  Link driver ','Link driver ',1,'2025-08-26 22:05:21.443111','2025-08-26 22:05:21.443111'),(11,11,10,'2025-08-26 22:34:47','Nộp đề tài','https://vnexpress.net/',1,'2025-08-26 22:34:47.009664','2025-08-26 22:34:47.009664'),(12,11,10,'2025-08-26 22:35:07','Nộp lần 2','https://vnexpress.net/',2,'2025-08-26 22:35:06.591809','2025-08-26 22:35:06.591809');
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
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'Vai trò của bạn trong dự án đã thay đổi','Vai trò của bạn trong dự án \"Hệ thống quản lý bãi đố xe thông minh\" (P0000001) đã thay đổi từ \"PM2\" thành \"PM\"',NULL,1,'2025-08-22 04:16:38.436207','2025-08-22 06:19:12.000000'),(2,6,'Bạn đã bị loại khỏi dự án','Bạn đã bị loại khỏi dự án \"Hệ thống quản lý bãi đố xe thông minh\" (P0000001)',NULL,0,'2025-08-22 04:16:58.566995','2025-08-22 04:16:58.566995'),(3,6,'Bạn đã được thêm vào dự án','Bạn đã được thêm vào dự án \"Hệ thống quản lý bãi đố xe thông minh\" (P0000001) với vai trò Member',NULL,0,'2025-08-22 04:17:07.733343','2025-08-22 04:17:07.733343'),(4,2,'Bạn đã bị loại khỏi dự án','Bạn đã bị loại khỏi dự án \"Hệ thống quản lý bãi đố xe thông minh\" (P0000002)',NULL,0,'2025-08-22 09:16:25.824573','2025-08-22 09:16:25.824573'),(5,5,'Dự án mới được giao','Bạn đã được yêu cầu làm giảng viên hướng dẫn cho dự án \"Machine Learning\" (P00001)',NULL,0,'2025-08-22 21:49:53.169158','2025-08-22 21:49:53.169158'),(6,3,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Machine Learning\" (P00001) với vai trò Member',NULL,0,'2025-08-22 21:49:53.205277','2025-08-22 21:49:53.205277'),(7,7,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Machine Learning\" (P00001) với vai trò Member',NULL,0,'2025-08-22 21:49:53.208642','2025-08-22 21:49:53.208642'),(8,2,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Machine Learning\" (P00001) với vai trò Member',NULL,0,'2025-08-22 21:49:53.210590','2025-08-22 21:49:53.210590'),(9,4,'Dự án mới được giao','Bạn đã được yêu cầu làm giảng viên hướng dẫn cho dự án \"Quan ly khach san\" (P3232323)',NULL,0,'2025-08-22 21:57:55.029522','2025-08-22 21:57:55.029522'),(10,2,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Quan ly khach san\" (P3232323) với vai trò Member',NULL,0,'2025-08-22 21:57:55.066780','2025-08-22 21:57:55.066780'),(11,3,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Quan ly khach san\" (P3232323) với vai trò Member',NULL,0,'2025-08-22 21:57:55.067396','2025-08-22 21:57:55.067396'),(12,7,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Quan ly khach san\" (P3232323) với vai trò Member',NULL,0,'2025-08-22 21:57:55.069333','2025-08-22 21:57:55.069333'),(13,4,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên E đã nộp tài liệu cho mốc \"Chon de tai\" của dự án \"Quan ly khach san\" (P3232323). Phiên bản: v1',NULL,0,'2025-08-22 21:58:48.475989','2025-08-22 21:58:48.475989'),(14,2,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên E đã nộp tài liệu cho mốc \"Chon de tai\" của dự án \"Quan ly khach san\" (P3232323). Phiên bản: v1',NULL,0,'2025-08-22 21:58:48.502423','2025-08-22 21:58:48.502423'),(15,3,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên E đã nộp tài liệu cho mốc \"Chon de tai\" của dự án \"Quan ly khach san\" (P3232323). Phiên bản: v1',NULL,0,'2025-08-22 21:58:48.503216','2025-08-22 21:58:48.503216'),(16,4,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên B đã nộp tài liệu cho mốc \"Chon de tai\" của dự án \"Quan ly khach san\" (P3232323). Phiên bản: v2',NULL,0,'2025-08-22 22:01:02.197161','2025-08-22 22:01:02.197161'),(17,2,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên B đã nộp tài liệu cho mốc \"Chon de tai\" của dự án \"Quan ly khach san\" (P3232323). Phiên bản: v2',NULL,0,'2025-08-22 22:01:02.225546','2025-08-22 22:01:02.225546'),(18,7,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên B đã nộp tài liệu cho mốc \"Chon de tai\" của dự án \"Quan ly khach san\" (P3232323). Phiên bản: v2',NULL,0,'2025-08-22 22:01:02.238840','2025-08-22 22:01:02.238840'),(19,3,'Vai trò của bạn trong dự án đã thay đổi','Vai trò của bạn trong dự án \"Quan ly khach san\" (P3232323) đã thay đổi từ \"Member\" thành \"Team leader\"',NULL,0,'2025-08-22 22:02:17.871683','2025-08-22 22:02:17.871683'),(20,7,'Vai trò của bạn trong dự án đã thay đổi','Vai trò của bạn trong dự án \"Machine Learning\" (P00001) đã thay đổi từ \"Member\" thành \"Member 2\"',NULL,0,'2025-08-23 21:33:40.912097','2025-08-23 21:33:40.912097'),(21,7,'Vai trò của bạn trong dự án đã thay đổi','Vai trò của bạn trong dự án \"Machine Learning\" (P00001) đã thay đổi từ \"Member 2\" thành \"Member\"',NULL,0,'2025-08-23 21:33:53.930504','2025-08-23 21:33:53.930504'),(22,8,'Dự án mới được giao','Bạn đã được yêu cầu làm giảng viên hướng dẫn cho dự án \"Dự án Smart City\" (SVE0002)',NULL,1,'2025-08-23 22:09:34.021080','2025-08-26 22:03:11.000000'),(23,2,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Dự án Smart City\" (SVE0002) với vai trò Member',NULL,0,'2025-08-23 22:09:34.044972','2025-08-23 22:09:34.044972'),(24,3,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Dự án Smart City\" (SVE0002) với vai trò Member',NULL,0,'2025-08-23 22:09:34.045869','2025-08-23 22:09:34.045869'),(25,6,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Dự án Smart City\" (SVE0002) với vai trò Member',NULL,0,'2025-08-23 22:09:34.048551','2025-08-23 22:09:34.048551'),(26,7,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Dự án Smart City\" (SVE0002) với vai trò Member',NULL,0,'2025-08-23 22:09:34.050666','2025-08-23 22:09:34.050666'),(27,4,'Dự án mới được giao','Bạn đã được yêu cầu làm giảng viên hướng dẫn cho dự án \"Nghiên cứu AI trong lĩnh vực y tế\" (P02121212)',NULL,0,'2025-08-23 22:25:46.240520','2025-08-23 22:25:46.240520'),(28,7,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Nghiên cứu AI trong lĩnh vực y tế\" (P02121212) với vai trò Thành viên',NULL,1,'2025-08-23 22:25:46.259431','2025-08-23 22:26:53.000000'),(29,9,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Nghiên cứu AI trong lĩnh vực y tế\" (P02121212) với vai trò Team leader',NULL,0,'2025-08-23 22:25:46.259946','2025-08-23 22:25:46.259946'),(30,4,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên E đã nộp tài liệu cho mốc \"Báo cáo sơ bộ lần 1\" của dự án \"Nghiên cứu AI trong lĩnh vực y tế\" (P02121212). Phiên bản: v1',NULL,0,'2025-08-23 22:29:57.944037','2025-08-23 22:29:57.944037'),(31,9,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên E đã nộp tài liệu cho mốc \"Báo cáo sơ bộ lần 1\" của dự án \"Nghiên cứu AI trong lĩnh vực y tế\" (P02121212). Phiên bản: v1',NULL,0,'2025-08-23 22:29:57.960299','2025-08-23 22:29:57.960299'),(32,4,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên D đã nộp tài liệu cho mốc \"Báo cáo sơ bộ lần 1\" của dự án \"Nghiên cứu AI trong lĩnh vực y tế\" (P02121212). Phiên bản: v2',NULL,0,'2025-08-23 22:30:47.740633','2025-08-23 22:30:47.740633'),(33,7,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên D đã nộp tài liệu cho mốc \"Báo cáo sơ bộ lần 1\" của dự án \"Nghiên cứu AI trong lĩnh vực y tế\" (P02121212). Phiên bản: v2',NULL,0,'2025-08-23 22:30:47.760545','2025-08-23 22:30:47.760545'),(34,2,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:40:01.089789','2025-08-23 23:40:01.089789'),(35,3,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:40:01.120922','2025-08-23 23:40:01.120922'),(36,7,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:40:01.148993','2025-08-23 23:40:01.148993'),(37,2,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Chờ duyệt\" sang \"Nháp\"',NULL,0,'2025-08-23 23:41:55.686460','2025-08-23 23:41:55.686460'),(38,3,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Chờ duyệt\" sang \"Nháp\"',NULL,0,'2025-08-23 23:41:55.720679','2025-08-23 23:41:55.720679'),(39,7,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Chờ duyệt\" sang \"Nháp\"',NULL,0,'2025-08-23 23:41:55.741540','2025-08-23 23:41:55.741540'),(40,2,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:42:16.601647','2025-08-23 23:42:16.601647'),(41,3,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:42:16.628596','2025-08-23 23:42:16.628596'),(42,7,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:42:16.650956','2025-08-23 23:42:16.650956'),(43,4,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Chờ duyệt\" sang \"Nháp\"',NULL,0,'2025-08-23 23:45:02.459005','2025-08-23 23:45:02.459005'),(44,2,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Chờ duyệt\" sang \"Nháp\"',NULL,0,'2025-08-23 23:45:02.487001','2025-08-23 23:45:02.487001'),(45,3,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Chờ duyệt\" sang \"Nháp\"',NULL,0,'2025-08-23 23:45:02.510212','2025-08-23 23:45:02.510212'),(46,7,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Chờ duyệt\" sang \"Nháp\"',NULL,0,'2025-08-23 23:45:02.534034','2025-08-23 23:45:02.534034'),(47,1,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Chờ duyệt\" sang \"Nháp\"',NULL,0,'2025-08-23 23:45:02.555939','2025-08-23 23:45:02.555939'),(48,4,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:45:28.259065','2025-08-23 23:45:28.259065'),(49,2,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:45:28.283964','2025-08-23 23:45:28.283964'),(50,3,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:45:28.308744','2025-08-23 23:45:28.308744'),(51,7,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:45:28.334883','2025-08-23 23:45:28.334883'),(52,1,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:45:28.356159','2025-08-23 23:45:28.356159'),(53,4,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Chờ duyệt\" sang \"Nháp\"',NULL,0,'2025-08-23 23:46:12.507930','2025-08-23 23:46:12.507930'),(54,2,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Chờ duyệt\" sang \"Nháp\"',NULL,0,'2025-08-23 23:46:12.532597','2025-08-23 23:46:12.532597'),(55,3,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Chờ duyệt\" sang \"Nháp\"',NULL,0,'2025-08-23 23:46:12.553706','2025-08-23 23:46:12.553706'),(56,7,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Chờ duyệt\" sang \"Nháp\"',NULL,0,'2025-08-23 23:46:12.572806','2025-08-23 23:46:12.572806'),(57,1,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Chờ duyệt\" sang \"Nháp\"',NULL,0,'2025-08-23 23:46:12.591296','2025-08-23 23:46:12.591296'),(58,4,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:46:20.816534','2025-08-23 23:46:20.816534'),(59,2,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:46:20.837337','2025-08-23 23:46:20.837337'),(60,3,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:46:20.858095','2025-08-23 23:46:20.858095'),(61,7,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:46:20.877617','2025-08-23 23:46:20.877617'),(62,1,'Trạng thái dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Nháp\" sang \"Chờ duyệt\"',NULL,0,'2025-08-23 23:46:20.906816','2025-08-23 23:46:20.906816'),(63,4,'Cấp độ dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Đại học\" sang \"Sau đại học\"',NULL,0,'2025-08-23 23:46:44.276571','2025-08-23 23:46:44.276571'),(64,2,'Cấp độ dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Đại học\" sang \"Sau đại học\"',NULL,0,'2025-08-23 23:46:44.301158','2025-08-23 23:46:44.301158'),(65,3,'Cấp độ dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Đại học\" sang \"Sau đại học\"',NULL,0,'2025-08-23 23:46:44.322530','2025-08-23 23:46:44.322530'),(66,7,'Cấp độ dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Đại học\" sang \"Sau đại học\"',NULL,0,'2025-08-23 23:46:44.344446','2025-08-23 23:46:44.344446'),(67,1,'Cấp độ dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Đại học\" sang \"Sau đại học\"',NULL,0,'2025-08-23 23:46:44.368680','2025-08-23 23:46:44.368680'),(68,4,'Cấp độ dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Sau đại học\" sang \"Đại học\"',NULL,0,'2025-08-23 23:46:54.255958','2025-08-23 23:46:54.255958'),(69,2,'Cấp độ dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Sau đại học\" sang \"Đại học\"',NULL,0,'2025-08-23 23:46:54.282200','2025-08-23 23:46:54.282200'),(70,3,'Cấp độ dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Sau đại học\" sang \"Đại học\"',NULL,0,'2025-08-23 23:46:54.302832','2025-08-23 23:46:54.302832'),(71,7,'Cấp độ dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Sau đại học\" sang \"Đại học\"',NULL,0,'2025-08-23 23:46:54.320092','2025-08-23 23:46:54.320092'),(72,1,'Cấp độ dự án đã thay đổi','Dự án \"Quản lý khách sạn\" (P3232323) đã thay đổi từ \"Sau đại học\" sang \"Đại học\"',NULL,0,'2025-08-23 23:46:54.338856','2025-08-23 23:46:54.338856'),(73,8,'Trạng thái dự án đã thay đổi','Dự án \"Dự án Smart City\" (SVE0002) đã thay đổi từ \"Chờ duyệt\" sang \"Đã duyệt\"',NULL,1,'2025-08-26 22:03:04.157135','2025-08-26 22:03:09.000000'),(74,2,'Trạng thái dự án đã thay đổi','Dự án \"Dự án Smart City\" (SVE0002) đã thay đổi từ \"Chờ duyệt\" sang \"Đã duyệt\"',NULL,0,'2025-08-26 22:03:04.182893','2025-08-26 22:03:04.182893'),(75,3,'Trạng thái dự án đã thay đổi','Dự án \"Dự án Smart City\" (SVE0002) đã thay đổi từ \"Chờ duyệt\" sang \"Đã duyệt\"',NULL,0,'2025-08-26 22:03:04.207660','2025-08-26 22:03:04.207660'),(76,6,'Trạng thái dự án đã thay đổi','Dự án \"Dự án Smart City\" (SVE0002) đã thay đổi từ \"Chờ duyệt\" sang \"Đã duyệt\"',NULL,0,'2025-08-26 22:03:04.231831','2025-08-26 22:03:04.231831'),(77,7,'Trạng thái dự án đã thay đổi','Dự án \"Dự án Smart City\" (SVE0002) đã thay đổi từ \"Chờ duyệt\" sang \"Đã duyệt\"',NULL,0,'2025-08-26 22:03:04.269559','2025-08-26 22:03:04.269559'),(78,7,'Trạng thái dự án đã thay đổi','Dự án \"Dự án Smart City\" (SVE0002) đã thay đổi từ \"Chờ duyệt\" sang \"Đã duyệt\"',NULL,0,'2025-08-26 22:03:04.299614','2025-08-26 22:03:04.299614'),(79,4,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên A đã nộp tài liệu cho mốc \"Báo cáo sơ bộ lần 1\" của dự án \"Hệ thống quản lý bãi đố xe thông minh\" (P0000001). Phiên bản: v5',NULL,0,'2025-08-26 22:04:39.056196','2025-08-26 22:04:39.056196'),(80,3,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên A đã nộp tài liệu cho mốc \"Báo cáo sơ bộ lần 1\" của dự án \"Hệ thống quản lý bãi đố xe thông minh\" (P0000001). Phiên bản: v5',NULL,0,'2025-08-26 22:04:39.077535','2025-08-26 22:04:39.077535'),(81,6,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên A đã nộp tài liệu cho mốc \"Báo cáo sơ bộ lần 1\" của dự án \"Hệ thống quản lý bãi đố xe thông minh\" (P0000001). Phiên bản: v5',NULL,0,'2025-08-26 22:04:39.078274','2025-08-26 22:04:39.078274'),(82,8,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên A đã nộp tài liệu cho mốc \"Chon de tai\" của dự án \"Dự án Smart City\" (SVE0002). Phiên bản: v1',NULL,0,'2025-08-26 22:05:21.475279','2025-08-26 22:05:21.475279'),(83,3,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên A đã nộp tài liệu cho mốc \"Chon de tai\" của dự án \"Dự án Smart City\" (SVE0002). Phiên bản: v1',NULL,0,'2025-08-26 22:05:21.493534','2025-08-26 22:05:21.493534'),(84,6,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên A đã nộp tài liệu cho mốc \"Chon de tai\" của dự án \"Dự án Smart City\" (SVE0002). Phiên bản: v1',NULL,0,'2025-08-26 22:05:21.504505','2025-08-26 22:05:21.504505'),(85,7,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên A đã nộp tài liệu cho mốc \"Chon de tai\" của dự án \"Dự án Smart City\" (SVE0002). Phiên bản: v1',NULL,0,'2025-08-26 22:05:21.506842','2025-08-26 22:05:21.506842'),(86,2,'Cập nhật điểm trung bình dự án','Điểm trung bình mới của dự án là 9.5',NULL,0,'2025-08-26 22:07:16.700660','2025-08-26 22:07:16.700660'),(87,3,'Cập nhật điểm trung bình dự án','Điểm trung bình mới của dự án là 9.5',NULL,0,'2025-08-26 22:07:16.712167','2025-08-26 22:07:16.712167'),(88,6,'Cập nhật điểm trung bình dự án','Điểm trung bình mới của dự án là 9.5',NULL,0,'2025-08-26 22:07:16.712839','2025-08-26 22:07:16.712839'),(89,7,'Cập nhật điểm trung bình dự án','Điểm trung bình mới của dự án là 9.5',NULL,0,'2025-08-26 22:07:16.714121','2025-08-26 22:07:16.714121'),(90,5,'Dự án mới được giao','Bạn đã được yêu cầu làm giảng viên hướng dẫn cho dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008)',NULL,0,'2025-08-26 22:32:25.082505','2025-08-26 22:32:25.082505'),(91,9,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) với vai trò Member',NULL,0,'2025-08-26 22:32:25.114428','2025-08-26 22:32:25.114428'),(92,10,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) với vai trò Leader',NULL,0,'2025-08-26 22:32:25.118634','2025-08-26 22:32:25.118634'),(93,7,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) với vai trò Member',NULL,0,'2025-08-26 22:32:25.120326','2025-08-26 22:32:25.120326'),(94,9,'Vai trò của bạn trong dự án đã thay đổi','Vai trò của bạn trong dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Member\" thành \"Thành viên\"',NULL,0,'2025-08-26 22:32:47.614832','2025-08-26 22:32:47.614832'),(95,10,'Vai trò của bạn trong dự án đã thay đổi','Vai trò của bạn trong dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Leader\" thành \"Trưởng nhóm\"',NULL,0,'2025-08-26 22:32:47.637384','2025-08-26 22:32:47.637384'),(96,7,'Vai trò của bạn trong dự án đã thay đổi','Vai trò của bạn trong dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Member\" thành \"Thành viên\"',NULL,0,'2025-08-26 22:32:47.656820','2025-08-26 22:32:47.656820'),(97,5,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Chờ duyệt\" sang \"Đã duyệt\"',NULL,0,'2025-08-26 22:33:53.345322','2025-08-26 22:33:53.345322'),(98,9,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Chờ duyệt\" sang \"Đã duyệt\"',NULL,0,'2025-08-26 22:33:53.371456','2025-08-26 22:33:53.371456'),(99,10,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Chờ duyệt\" sang \"Đã duyệt\"',NULL,0,'2025-08-26 22:33:53.393998','2025-08-26 22:33:53.393998'),(100,7,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Chờ duyệt\" sang \"Đã duyệt\"',NULL,0,'2025-08-26 22:33:53.422687','2025-08-26 22:33:53.422687'),(101,10,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Chờ duyệt\" sang \"Đã duyệt\"',NULL,0,'2025-08-26 22:33:53.447922','2025-08-26 22:33:53.447922'),(102,5,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên H đã nộp tài liệu cho mốc \"Báo cáo sơ bộ lần 1\" của dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008). Phiên bản: v1',NULL,0,'2025-08-26 22:34:47.060574','2025-08-26 22:34:47.060574'),(103,9,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên H đã nộp tài liệu cho mốc \"Báo cáo sơ bộ lần 1\" của dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008). Phiên bản: v1',NULL,0,'2025-08-26 22:34:47.081767','2025-08-26 22:34:47.081767'),(104,7,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên H đã nộp tài liệu cho mốc \"Báo cáo sơ bộ lần 1\" của dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008). Phiên bản: v1',NULL,0,'2025-08-26 22:34:47.085794','2025-08-26 22:34:47.085794'),(105,5,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên H đã nộp tài liệu cho mốc \"Báo cáo sơ bộ lần 1\" của dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008). Phiên bản: v2',NULL,0,'2025-08-26 22:35:06.645441','2025-08-26 22:35:06.645441'),(106,9,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên H đã nộp tài liệu cho mốc \"Báo cáo sơ bộ lần 1\" của dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008). Phiên bản: v2',NULL,0,'2025-08-26 22:35:06.672831','2025-08-26 22:35:06.672831'),(107,7,'Tài liệu mốc mới được nộp','Sinh viên Sinh viên H đã nộp tài liệu cho mốc \"Báo cáo sơ bộ lần 1\" của dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008). Phiên bản: v2',NULL,0,'2025-08-26 22:35:06.673928','2025-08-26 22:35:06.673928'),(108,9,'Cập nhật điểm trung bình dự án','Điểm trung bình mới của dự án là 9.8',NULL,0,'2025-08-26 22:37:06.411523','2025-08-26 22:37:06.411523'),(109,10,'Cập nhật điểm trung bình dự án','Điểm trung bình mới của dự án là 9.8',NULL,0,'2025-08-26 22:37:06.412373','2025-08-26 22:37:06.412373'),(110,7,'Cập nhật điểm trung bình dự án','Điểm trung bình mới của dự án là 9.8',NULL,0,'2025-08-26 22:37:06.414656','2025-08-26 22:37:06.414656'),(111,9,'Cập nhật điểm trung bình dự án','Điểm trung bình mới của dự án là 9.5',NULL,0,'2025-08-26 22:37:28.135758','2025-08-26 22:37:28.135758'),(112,10,'Cập nhật điểm trung bình dự án','Điểm trung bình mới của dự án là 9.5',NULL,0,'2025-08-26 22:37:28.136214','2025-08-26 22:37:28.136214'),(113,7,'Cập nhật điểm trung bình dự án','Điểm trung bình mới của dự án là 9.5',NULL,0,'2025-08-26 22:37:28.140153','2025-08-26 22:37:28.140153'),(114,9,'Cập nhật điểm trung bình dự án','Điểm trung bình mới của dự án là 8.75',NULL,0,'2025-08-26 22:37:59.741805','2025-08-26 22:37:59.741805'),(115,10,'Cập nhật điểm trung bình dự án','Điểm trung bình mới của dự án là 8.75',NULL,0,'2025-08-26 22:37:59.742493','2025-08-26 22:37:59.742493'),(116,7,'Cập nhật điểm trung bình dự án','Điểm trung bình mới của dự án là 8.75',NULL,0,'2025-08-26 22:37:59.747090','2025-08-26 22:37:59.747090'),(117,5,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Đã duyệt\" sang \"Đang thực hiện\"',NULL,0,'2025-08-26 22:38:27.335550','2025-08-26 22:38:27.335550'),(118,9,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Đã duyệt\" sang \"Đang thực hiện\"',NULL,0,'2025-08-26 22:38:27.359981','2025-08-26 22:38:27.359981'),(119,10,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Đã duyệt\" sang \"Đang thực hiện\"',NULL,0,'2025-08-26 22:38:27.379641','2025-08-26 22:38:27.379641'),(120,7,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Đã duyệt\" sang \"Đang thực hiện\"',NULL,0,'2025-08-26 22:38:27.398403','2025-08-26 22:38:27.398403'),(121,10,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Đã duyệt\" sang \"Đang thực hiện\"',NULL,0,'2025-08-26 22:38:27.417625','2025-08-26 22:38:27.417625'),(122,5,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Đang thực hiện\" sang \"Hoàn thành\"',NULL,0,'2025-08-26 22:38:35.630195','2025-08-26 22:38:35.630195'),(123,9,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Đang thực hiện\" sang \"Hoàn thành\"',NULL,0,'2025-08-26 22:38:35.661159','2025-08-26 22:38:35.661159'),(124,10,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Đang thực hiện\" sang \"Hoàn thành\"',NULL,0,'2025-08-26 22:38:35.686023','2025-08-26 22:38:35.686023'),(125,7,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Đang thực hiện\" sang \"Hoàn thành\"',NULL,0,'2025-08-26 22:38:35.719569','2025-08-26 22:38:35.719569'),(126,10,'Trạng thái dự án đã thay đổi','Dự án \"Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội\" (P0000008) đã thay đổi từ \"Đang thực hiện\" sang \"Hoàn thành\"',NULL,0,'2025-08-26 22:38:35.756386','2025-08-26 22:38:35.756386'),(127,11,'Dự án mới được giao','Bạn đã được yêu cầu làm giảng viên hướng dẫn cho dự án \"Luận án tiến sĩ về ứng dụng AI trong y tế\" (P0000088)',NULL,0,'2025-08-26 22:45:42.823682','2025-08-26 22:45:42.823682'),(128,12,'Bạn đã được thêm vào dự án mới','Bạn đã được thêm vào dự án \"Luận án tiến sĩ về ứng dụng AI trong y tế\" (P0000088) với vai trò Member',NULL,0,'2025-08-26 22:45:42.837474','2025-08-26 22:45:42.837474'),(129,11,'Trạng thái dự án đã thay đổi','Dự án \"Luận án tiến sĩ về ứng dụng AI trong y tế\" (P0000088) đã thay đổi từ \"Chờ duyệt\" sang \"Đã duyệt\"',NULL,0,'2025-08-26 22:46:50.103193','2025-08-26 22:46:50.103193'),(130,12,'Trạng thái dự án đã thay đổi','Dự án \"Luận án tiến sĩ về ứng dụng AI trong y tế\" (P0000088) đã thay đổi từ \"Chờ duyệt\" sang \"Đã duyệt\"',NULL,0,'2025-08-26 22:46:50.127939','2025-08-26 22:46:50.127939'),(131,12,'Trạng thái dự án đã thay đổi','Dự án \"Luận án tiến sĩ về ứng dụng AI trong y tế\" (P0000088) đã thay đổi từ \"Chờ duyệt\" sang \"Đã duyệt\"',NULL,0,'2025-08-26 22:46:50.149524','2025-08-26 22:46:50.149524'),(132,11,'Đề tài mới được giao','Bạn đã được yêu cầu làm giảng viên hướng dẫn cho đề tài \"BBBBBBBBBBB\" (AAAAAAAAAAA)',NULL,0,'2025-09-06 17:10:55.079607','2025-09-06 17:10:55.079607'),(133,11,'Trạng thái đề tài đã thay đổi','Đề tài \"BBBBBBBBBBB\" (AAAAAAAAAAA) đã thay đổi từ \"Chờ duyệt\" sang \"Giảng viên đã duyệt\"',NULL,0,'2025-09-06 18:02:48.246685','2025-09-06 18:02:48.246685'),(134,12,'Trạng thái đề tài đã thay đổi','Đề tài \"BBBBBBBBBBB\" (AAAAAAAAAAA) đã thay đổi từ \"Chờ duyệt\" sang \"Giảng viên đã duyệt\"',NULL,0,'2025-09-06 18:02:48.274998','2025-09-06 18:02:48.274998'),(135,11,'Trạng thái đề tài đã thay đổi','Đề tài \"BBBBBBBBBBB\" (AAAAAAAAAAA) đã thay đổi từ \"Giảng viên đã duyệt\" sang \"Trưởng khoa đã duyệt\"',NULL,0,'2025-09-06 18:02:56.887931','2025-09-06 18:02:56.887931'),(136,12,'Trạng thái đề tài đã thay đổi','Đề tài \"BBBBBBBBBBB\" (AAAAAAAAAAA) đã thay đổi từ \"Giảng viên đã duyệt\" sang \"Trưởng khoa đã duyệt\"',NULL,0,'2025-09-06 18:02:56.912870','2025-09-06 18:02:56.912870'),(137,11,'Trạng thái đề tài đã thay đổi','Đề tài \"BBBBBBBBBBB\" (AAAAAAAAAAA) đã thay đổi từ \"Trưởng khoa đã duyệt\" sang \"Phòng NCKH duyệt\"',NULL,0,'2025-09-06 18:03:02.561146','2025-09-06 18:03:02.561146'),(138,12,'Trạng thái đề tài đã thay đổi','Đề tài \"BBBBBBBBBBB\" (AAAAAAAAAAA) đã thay đổi từ \"Trưởng khoa đã duyệt\" sang \"Phòng NCKH duyệt\"',NULL,0,'2025-09-06 18:03:02.587202','2025-09-06 18:03:02.587202'),(139,11,'Trạng thái đề tài đã thay đổi','Đề tài \"Luận án tiến sĩ về ứng dụng AI trong y tế\" (P0000013) đã thay đổi từ \"Giảng viên đã duyệt\" sang \"Đang thực hiện\"',NULL,0,'2025-09-06 18:04:26.358713','2025-09-06 18:04:26.358713'),(140,12,'Trạng thái đề tài đã thay đổi','Đề tài \"Luận án tiến sĩ về ứng dụng AI trong y tế\" (P0000013) đã thay đổi từ \"Giảng viên đã duyệt\" sang \"Đang thực hiện\"',NULL,0,'2025-09-06 18:04:26.380904','2025-09-06 18:04:26.380904'),(141,11,'Trạng thái đề tài đã thay đổi','Đề tài \"BBBBBBBBBBB\" (AAAAAAAAAAA) đã thay đổi từ \"Phòng NCKH duyệt\" sang \"Giảng viên đã duyệt\"',NULL,0,'2025-09-06 22:08:32.494040','2025-09-06 22:08:32.494040'),(142,12,'Trạng thái đề tài đã thay đổi','Đề tài \"BBBBBBBBBBB\" (AAAAAAAAAAA) đã thay đổi từ \"Phòng NCKH duyệt\" sang \"Giảng viên đã duyệt\"',NULL,0,'2025-09-06 22:08:32.512420','2025-09-06 22:08:32.512420');
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
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_members`
--

LOCK TABLES `project_members` WRITE;
/*!40000 ALTER TABLE `project_members` DISABLE KEYS */;
INSERT INTO `project_members` VALUES (38,4,3,'PM','2025-08-22 03:17:54.566815','2025-08-22 03:17:54.566815'),(39,4,6,'Member','2025-08-22 03:17:54.568538','2025-08-22 03:17:54.568538'),(53,1,2,'PM','2025-08-22 03:51:59.231401','2025-08-22 04:16:38.000000'),(54,1,3,'Tester','2025-08-22 03:51:59.236301','2025-08-22 03:51:59.236301'),(57,1,6,'Member','2025-08-22 04:17:07.727198','2025-08-22 04:17:07.727198'),(58,5,7,'Member','2025-08-22 21:49:53.094321','2025-08-23 21:33:53.000000'),(59,5,2,'Member','2025-08-22 21:49:53.098999','2025-08-22 21:49:53.098999'),(60,5,3,'Member','2025-08-22 21:49:53.103921','2025-08-22 21:49:53.103921'),(61,6,2,'Member','2025-08-22 21:57:54.929137','2025-08-22 21:57:54.929137'),(62,6,3,'Team leader','2025-08-22 21:57:54.943582','2025-08-22 22:02:17.000000'),(63,6,7,'Member','2025-08-22 21:57:54.947091','2025-08-22 21:57:54.947091'),(64,7,2,'Member','2025-08-23 22:09:33.972507','2025-08-23 22:09:33.972507'),(65,7,3,'Member','2025-08-23 22:09:33.975783','2025-08-23 22:09:33.975783'),(66,7,6,'Member','2025-08-23 22:09:33.978204','2025-08-23 22:09:33.978204'),(67,7,7,'Member','2025-08-23 22:09:33.981294','2025-08-23 22:09:33.981294'),(68,8,7,'Thành viên','2025-08-23 22:25:46.205148','2025-08-23 22:25:46.205148'),(69,8,9,'Team leader','2025-08-23 22:25:46.206886','2025-08-23 22:25:46.206886'),(70,9,9,'Thành viên','2025-08-26 22:32:24.998434','2025-08-26 22:32:47.000000'),(71,9,10,'Trưởng nhóm','2025-08-26 22:32:25.001840','2025-08-26 22:32:47.000000'),(72,9,7,'Thành viên','2025-08-26 22:32:25.004616','2025-08-26 22:32:47.000000'),(73,10,12,'Member','2025-08-26 22:45:42.767736','2025-08-26 22:45:42.767736');
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
  `isRequired` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_9fb847267f120c4cdbbb28b408b` (`projectId`),
  CONSTRAINT `FK_9fb847267f120c4cdbbb28b408b` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_milestones`
--

LOCK TABLES `project_milestones` WRITE;
/*!40000 ALTER TABLE `project_milestones` DISABLE KEYS */;
INSERT INTO `project_milestones` VALUES (1,1,'2025-01-02','Chọn đề tài: quá trình lựa chọn một chủ đề cụ thể để làm bài nghiên cứu, luận văn, đồ án, bài thuyết trình hoặc dự án khoa học.',1,'inactive','2025-08-21 10:38:24.113680','2025-08-21 10:38:24.113680','Chọn đề tài,  lựa chọn một chủ đề cụ thể',0),(2,1,'2025-12-02','Báo cáo sơ bộ lần 1',2,'active','2025-08-21 10:38:24.117878','2025-08-21 10:38:24.117878','Báo cáo sơ bộ lần 1',0),(3,1,'2025-03-01','Báo cáo sơ bộ lần 2',3,'active','2025-08-21 10:38:24.121812','2025-08-21 10:38:24.121812','Báo cáo sơ bộ lần 2',0),(4,5,'2025-01-14','Chọn đề tài',1,'active','2025-08-22 21:49:53.120947','2025-08-22 21:49:53.120947','Chọn đề tài',1),(5,6,'2025-12-12','',1,'active','2025-08-22 21:57:54.959833','2025-08-22 21:57:54.959833','Chon de tai',1),(6,7,'2025-12-12','',1,'active','2025-08-23 22:14:27.585816','2025-08-23 22:14:27.585816','Chon de tai',0),(7,8,'2025-01-02','Chọn đề tài: quá trình lựa chọn một chủ đề cụ thể để làm bài nghiên cứu, luận văn, đồ án, bài thuyết trình hoặc dự án khoa học.',1,'inactive','2025-08-23 22:25:46.210396','2025-08-23 22:25:46.210396','Chọn đề tài,  lựa chọn một chủ đề cụ thể',1),(8,8,'2025-12-02','Báo cáo sơ bộ lần 1',2,'active','2025-08-23 22:25:46.214505','2025-08-23 22:25:46.214505','Báo cáo sơ bộ lần 1',1),(9,8,'2025-03-01','Báo cáo sơ bộ lần 2',3,'active','2025-08-23 22:25:46.217120','2025-08-23 22:25:46.217120','Báo cáo sơ bộ lần 2',1),(10,9,'2025-01-02','Chọn đề tài: quá trình lựa chọn một chủ đề cụ thể để làm bài nghiên cứu, luận văn, đồ án, bài thuyết trình hoặc dự án khoa học.',1,'inactive','2025-08-26 22:32:25.011493','2025-08-26 22:32:25.011493','Chọn đề tài,  lựa chọn một chủ đề cụ thể',1),(11,9,'2025-12-02','Báo cáo sơ bộ lần 1',2,'active','2025-08-26 22:32:25.015790','2025-08-26 22:32:25.015790','Báo cáo sơ bộ lần 1',1),(12,9,'2025-03-01','Báo cáo sơ bộ lần 2',3,'active','2025-08-26 22:32:25.018032','2025-08-26 22:32:25.018032','Báo cáo sơ bộ lần 2',1),(13,10,'2025-01-02','Trình bày mục tiêu đề tài, phương pháp luận, .... ',1,'active','2025-08-26 22:45:42.781738','2025-08-26 22:45:42.781738','Trình bày đề tài',1),(14,10,'2025-03-01','',2,'active','2025-08-26 22:45:42.784266','2025-08-26 22:45:42.784266','Báo cáo đề tài lần 1',1),(15,10,'2025-03-01','',3,'active','2025-08-26 22:45:42.786514','2025-08-26 22:45:42.786514','Báo cáo đề tài lần 2',1),(16,10,'2025-05-15','',4,'active','2025-08-26 22:45:42.789459','2025-08-26 22:45:42.789459','Mã chương trình ',0),(17,16,'2025-01-02','Trình bày mục tiêu đề tài, phương pháp luận, .... ',1,'active','2025-09-06 17:10:55.004889','2025-09-06 17:10:55.004889','Trình bày đề tài',1),(18,16,'2025-03-01','',2,'active','2025-09-06 17:10:55.010279','2025-09-06 17:10:55.010279','Báo cáo đề tài lần 1',1),(19,16,'2025-03-01','',3,'active','2025-09-06 17:10:55.020049','2025-09-06 17:10:55.020049','Báo cáo đề tài lần 2',1),(20,16,'2025-05-15','',4,'active','2025-09-06 17:10:55.027014','2025-09-06 17:10:55.027014','Mã chương trình ',0),(21,13,'2025-01-02','Trình bày mục tiêu đề tài, phương pháp luận, .... ',1,'active','2025-09-06 18:04:26.403304','2025-09-06 18:04:26.403304','Trình bày đề tài',0),(22,13,'2025-03-01','',2,'active','2025-09-06 18:04:26.406184','2025-09-06 18:04:26.406184','Báo cáo đề tài lần 1',0),(23,13,'2025-03-01','',3,'active','2025-09-06 18:04:26.408094','2025-09-06 18:04:26.408094','Báo cáo đề tài lần 2',0),(24,13,'2025-05-15','',4,'active','2025-09-06 18:04:26.410745','2025-09-06 18:04:26.410745','Mã chương trình ',0);
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
  `status` enum('draft','pending','approved_by_lecturer','approved_by_faculty_dean','approved_by_rector','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
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
  `averageScore` decimal(4,2) DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'P0000001','Cải tiến mô hình YOLOv8 cho phát hiện đối tượng trong điều kiện ánh sáng yếu','Cải tiến mô hình YOLOv8 cho phát hiện đối tượng trong điều kiện ánh sáng yếu.','Cải tiến mô hình YOLOv8 cho phát hiện đối tượng trong điều kiện ánh sáng yếu.','Cải tiến mô hình YOLOv8 cho phát hiện đối tượng trong điều kiện ánh sáng yếu.','Cải tiến mô hình YOLOv8 cho phát hiện đối tượng trong điều kiện ánh sáng yếu.','vvvv','2025-01-01','2025-01-09','approved_by_lecturer','undergraduate',0.00,1,1,1,1,4,1,'2025-08-21 08:24:38.562871','2025-09-06 18:00:12.573103',NULL),(4,'P0000002','Ứng dụng Transformer trong dịch tự động Anh – Việt','Ứng dụng Transformer trong dịch tự động Anh – Việt','Ứng dụng Transformer trong dịch tự động Anh – Việt.','Ứng dụng Transformer trong dịch tự động Anh – Việt.','Ứng dụng Transformer trong dịch tự động Anh – Việt.','Ứng dụng Transformer trong dịch tự động Anh – Việt.','2025-01-01','2025-01-09','pending','graduate',0.00,1,1,1,1,5,2,'2025-08-21 09:10:57.100312','2025-08-26 22:22:57.000000',NULL),(5,'P0000003','Nghiên cứu học sâu cho tóm tắt văn bản tiếng Việt','Machine Learning','Machine Learning','Machine Learning','Machine Learning','Machine Learning','2025-01-01','2025-12-31','completed','undergraduate',0.00,1,1,1,1,5,3,'2025-08-22 21:49:53.085355','2025-08-26 22:22:42.354037',NULL),(6,'P0000004','Phát triển chatbot tiếng Việt dựa trên mô hình Seq2Seq kết hợp Attention','Quan ly khach san','Quan ly khach san','Quan ly khach san','Quan ly khach san','Quan ly khach san','2025-01-01','2025-12-31','pending','undergraduate',0.00,1,1,1,1,4,3,'2025-08-22 21:57:54.911068','2025-08-26 22:22:42.353425',NULL),(7,'P0000005','Ứng dụng học sâu trong phát hiện gian lận thẻ tín dụng','Ứng dụng học sâu trong phát hiện gian lận thẻ tín dụng.','Ứng dụng học sâu trong phát hiện gian lận thẻ tín dụng.','Dự án Smart City','Dự án Smart City','Dự án Smart City','2025-01-01','2025-12-01','approved_by_lecturer','undergraduate',0.00,1,1,2,7,8,3,'2025-08-23 22:09:33.968083','2025-09-06 18:00:12.574074',9.50),(8,'P0000006','Nghiên cứu và cải tiến mô hình học sâu cho chuyển văn bản thành giọng nói tiếng Việt tự nhiên','Nghiên cứu AI trong lĩnh vực y tế 0010210212','Nghiên cứu AI trong lĩnh vực y tế','Nghiên cứu AI trong lĩnh vực y tế','Nghiên cứu AI trong lĩnh vực y tế','Nghiên cứu AI trong lĩnh vực y tế','2025-01-01','2025-12-30','approved_by_lecturer','undergraduate',0.00,1,1,2,9,4,1,'2025-08-23 22:25:46.201314','2025-09-06 18:00:12.574774',NULL),(9,'P0000008','Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội','Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội','Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội','Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội','Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội','Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội','2025-01-01','2025-12-01','completed','undergraduate',0.00,2,2,3,10,5,1,'2025-08-26 22:32:24.988501','2025-08-26 22:38:35.000000',8.75),(10,'P0000088','Luận án tiến sĩ về ứng dụng AI trong y tế','Luận án tiến sĩ về ứng dụng AI trong y tế','Luận án tiến sĩ về ứng dụng AI trong y tế','Luận án tiến sĩ về ứng dụng AI trong y tế','Luận án tiến sĩ về ứng dụng AI trong y tế','Luận án tiến sĩ về ứng dụng AI trong y tế','2025-01-01','2025-12-31','approved_by_lecturer','research',0.00,1,1,1,12,11,4,'2025-08-26 22:45:42.760742','2025-09-06 18:00:12.575481',NULL),(11,'P0000011','Nghiên cứu và cải tiến mô hình học sâu cho chuyển văn bản thành giọng nói tiếng Việt tự nhiên','Nghiên cứu AI trong lĩnh vực y tế 0010210212','Nghiên cứu AI trong lĩnh vực y tế','Nghiên cứu AI trong lĩnh vực y tế','Nghiên cứu AI trong lĩnh vực y tế','Nghiên cứu AI trong lĩnh vực y tế','2025-01-01','2025-12-30','approved_by_lecturer','undergraduate',0.00,1,1,2,9,4,1,'2025-08-23 22:25:46.201314','2025-09-06 18:00:12.576490',NULL),(12,'P0000012','Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội','Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội','Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội','Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội','Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội','Ứng dụng BERT trong phân tích cảm xúc từ bình luận mạng xã hội','2025-01-01','2025-12-01','completed','undergraduate',0.00,2,2,3,10,5,1,'2025-08-26 22:32:24.988501','2025-08-26 22:38:35.000000',8.75),(13,'P0000013','Luận án tiến sĩ về ứng dụng AI trong y tế','Luận án tiến sĩ về ứng dụng AI trong y tế','Luận án tiến sĩ về ứng dụng AI trong y tế','Luận án tiến sĩ về ứng dụng AI trong y tế','Luận án tiến sĩ về ứng dụng AI trong y tế','Luận án tiến sĩ về ứng dụng AI trong y tế','2025-01-01','2025-12-31','in_progress','research',0.00,1,1,1,12,11,4,'2025-08-26 22:45:42.760742','2025-09-06 18:04:26.000000',NULL),(16,'AAAAAAAAAAA','BBBBBBBBBBB','AAAAAAAAAAA','AAAAAAAAAAA','AAAAAAAAAAA','AAAAAAAAAAA','AAAAAAAAAAA','2025-01-01','2025-03-11','approved_by_lecturer','undergraduate',0.00,11,10,11,12,11,4,'2025-09-06 17:10:54.986413','2025-09-06 22:08:32.000000',NULL);
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
  `name` enum('Student','Lecturer','DepartmentHead','FacultyDean','Rector','Council','Admin') NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_648e3f5447f725579d7d4ffdfb` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Student','2025-08-20 10:24:08.158121','2025-08-20 10:24:08.158121'),(2,'Lecturer','2025-08-20 10:24:08.163030','2025-08-20 10:24:08.163030'),(3,'DepartmentHead','2025-08-20 10:24:08.166262','2025-08-20 10:24:08.166262'),(4,'FacultyDean','2025-08-20 10:24:08.168164','2025-08-20 10:24:08.168164'),(5,'Council','2025-08-20 10:24:08.170163','2025-08-20 10:24:08.170163'),(6,'Admin','2025-08-20 10:24:08.171589','2025-08-20 10:24:08.171589'),(7,'Rector','2025-09-06 17:52:42.864010','2025-09-06 17:52:42.864010');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schools`
--

DROP TABLE IF EXISTS `schools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schools` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(15) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `address` text,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_35e8277da52a915513e3ece8cf` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schools`
--

LOCK TABLES `schools` WRITE;
/*!40000 ALTER TABLE `schools` DISABLE KEYS */;
INSERT INTO `schools` VALUES (1,'SCH-001','Trường Đại học Bách khoa Hà Nội','Trường đại học công lập hàng đầu Việt Nam','Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội','2025-09-04 22:45:24.566963','2025-09-04 22:45:24.566963'),(2,'SCH-002','Trường Đại học Kinh tế TP. Hồ Chí Minh','Một trong những trường đại học kinh tế hàng đầu tại Việt Nam','59C Nguyễn Đình Chiểu, Quận 3, TP. Hồ Chí Minh','2025-09-04 22:46:04.136339','2025-09-04 22:46:04.136339'),(3,'SCH-003','Trường Đại học Quốc gia Hà Nội','Đại học đa ngành, đa lĩnh vực hàng đầu của Việt Nam','144 Xuân Thủy, Cầu Giấy, Hà Nội','2025-09-04 22:46:22.601241','2025-09-04 22:46:22.601241');
/*!40000 ALTER TABLE `schools` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `term_milestones`
--

LOCK TABLES `term_milestones` WRITE;
/*!40000 ALTER TABLE `term_milestones` DISABLE KEYS */;
INSERT INTO `term_milestones` VALUES (1,1,'Chọn đề tài,  lựa chọn một chủ đề cụ thể','2025-01-02','Chọn đề tài: quá trình lựa chọn một chủ đề cụ thể để làm bài nghiên cứu, luận văn, đồ án, bài thuyết trình hoặc dự án khoa học.',1,'inactive','2025-08-21 05:02:45.120531','2025-08-21 07:32:28.000000',1),(2,1,'Báo cáo sơ bộ lần 1','2025-12-02','Báo cáo sơ bộ lần 1',2,'active','2025-08-21 07:08:53.297417','2025-08-21 07:29:36.000000',1),(3,1,'Báo cáo sơ bộ lần 2','2025-03-01','Báo cáo sơ bộ lần 2',3,'active','2025-08-21 07:29:25.386423','2025-08-21 07:29:25.386423',1),(5,3,'Chon de tai','2025-12-12','',1,'active','2025-08-22 21:54:59.030511','2025-08-22 21:54:59.030511',1),(6,4,'Trình bày đề tài','2025-01-02','Trình bày mục tiêu đề tài, phương pháp luận, .... ',1,'active','2025-08-26 22:41:34.269229','2025-08-26 22:41:34.269229',1),(7,4,'Báo cáo đề tài lần 1','2025-03-01','',2,'active','2025-08-26 22:42:00.500656','2025-08-26 22:42:00.500656',1),(8,4,'Báo cáo đề tài lần 2','2025-03-01','',3,'active','2025-08-26 22:42:24.270879','2025-08-26 22:42:24.270879',1),(9,4,'Mã chương trình ','2025-05-15','',4,'active','2025-08-26 22:42:51.204218','2025-08-26 22:42:51.204218',0);
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `terms`
--

LOCK TABLES `terms` WRITE;
/*!40000 ALTER TABLE `terms` DISABLE KEYS */;
INSERT INTO `terms` VALUES (1,'2025A','Bảo vệ đồ án tốt nghiệp 2025A','2025-01-01','2025-02-07','Bảo vệ đồ án tốt nghiệp 2025A','open','2025-08-21 04:57:02.166630','2025-08-21 07:36:17.000000'),(2,'2025-NCKH-A','Nghiên cứu khoa học 2025A','2025-01-01','2025-01-09','Nghiên cứu khoa học cấp trường','open','2025-08-21 07:34:49.057494','2025-08-21 09:20:57.000000'),(3,'DA2025B','Bảo vệ đồ án tốt nghiệp 2025B','2025-01-01','2025-12-31','Bảo vệ đồ án 2025B','open','2025-08-22 21:36:45.234659','2025-08-23 22:41:00.000000'),(4,'E0000028','Bảo vệ Luận án tiến sĩ (1)','2025-02-01','2025-12-31','Bảo vệ Luận án tiến sĩ 2025','open','2025-08-26 22:40:53.056581','2025-09-06 18:02:40.000000'),(5,'2025A5','Bảo vệ đồ án tốt nghiệp 2025A','2025-01-01','2025-02-07','Bảo vệ đồ án tốt nghiệp 2025A','open','2025-08-21 04:57:02.166630','2025-08-21 07:36:17.000000'),(6,'2025-NCKH-A6','Nghiên cứu khoa học 2025A','2025-01-01','2025-01-09','Nghiên cứu khoa học cấp trường','open','2025-08-21 07:34:49.057494','2025-08-21 09:20:57.000000'),(7,'DA2025B7','Bảo vệ đồ án tốt nghiệp 2025B','2025-01-01','2025-12-31','Bảo vệ đồ án 2025B','open','2025-08-22 21:36:45.234659','2025-08-23 22:41:00.000000'),(8,'E00000288','Bảo vệ Luận án tiến sĩ (2)','2025-01-01','2025-07-31','Bảo vệ Luận án tiến sĩ 2025','open','2025-08-26 22:40:53.056581','2025-09-06 17:37:26.000000'),(9,'2025A9','Bảo vệ đồ án tốt nghiệp 2025A','2025-01-01','2025-02-07','Bảo vệ đồ án tốt nghiệp 2025A','open','2025-08-21 04:57:02.166630','2025-08-21 07:36:17.000000'),(10,'2025-NCKH-A10','Nghiên cứu khoa học 2025A','2025-01-01','2025-01-09','Nghiên cứu khoa học cấp trường','open','2025-08-21 07:34:49.057494','2025-08-21 09:20:57.000000'),(11,'DA2025B11','Bảo vệ đồ án tốt nghiệp 2025B','2025-01-01','2025-12-31','Bảo vệ đồ án 2025B','open','2025-08-22 21:36:45.234659','2025-08-23 22:41:00.000000'),(12,'E000002812','Bảo vệ Luận án tiến sĩ (3)','2025-01-01','2025-07-31','Bảo vệ Luận án tiến sĩ 2025','open','2025-08-26 22:40:53.056581','2025-09-06 17:37:42.000000');
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (2,1,4,'2025-08-21 04:48:48.464570','2025-08-21 04:48:48.464570'),(3,1,6,'2025-08-21 04:48:48.464570','2025-08-21 04:48:48.464570'),(5,1,3,'2025-08-21 08:12:26.653259','2025-08-21 08:12:26.653259'),(6,1,5,'2025-08-21 08:12:26.655184','2025-08-21 08:12:26.655184'),(7,2,1,'2025-08-21 08:12:55.217587','2025-08-21 08:12:55.217587'),(8,3,1,'2025-08-21 08:13:18.250052','2025-08-21 08:13:18.250052'),(9,4,2,'2025-08-21 08:15:40.457889','2025-08-21 08:15:40.457889'),(11,5,2,'2025-08-21 08:16:49.266512','2025-08-21 08:16:49.266512'),(12,6,1,'2025-08-21 08:17:14.314373','2025-08-21 08:17:14.314373'),(13,7,1,'2025-08-22 21:43:51.289427','2025-08-22 21:43:51.289427'),(14,8,2,'2025-08-23 21:28:49.792556','2025-08-23 21:28:49.792556'),(15,9,1,'2025-08-23 22:21:12.297401','2025-08-23 22:21:12.297401'),(16,10,1,'2025-08-26 22:26:54.190888','2025-08-26 22:26:54.190888'),(17,11,2,'2025-08-26 22:29:14.107505','2025-08-26 22:29:14.107505'),(18,12,1,'2025-08-26 22:44:18.213120','2025-08-26 22:44:18.213120'),(19,13,7,'2025-09-06 21:05:51.339811','2025-09-06 21:05:51.339811');
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
  `facultyId` bigint DEFAULT NULL,
  `departmentId` bigint DEFAULT NULL,
  `majorId` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_1f7a2b11e29b1422a2622beab3` (`code`),
  UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`),
  KEY `FK_5d40b83f5d5169dcefd9a120bd8` (`facultyId`),
  KEY `FK_554d853741f2083faaa5794d2ae` (`departmentId`),
  KEY `FK_b653f9af2e6770f4e2665eb3418` (`majorId`),
  CONSTRAINT `FK_554d853741f2083faaa5794d2ae` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`),
  CONSTRAINT `FK_5d40b83f5d5169dcefd9a120bd8` FOREIGN KEY (`facultyId`) REFERENCES `faculties` (`id`),
  CONSTRAINT `FK_b653f9af2e6770f4e2665eb3418` FOREIGN KEY (`majorId`) REFERENCES `majors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'00000001','Quản trị viên','https://static.vecteezy.com/system/resources/previews/001/912/631/non_2x/beautiful-woman-in-frame-circular-avatar-character-free-vector.jpg','0123456789','administrator@example.com','$2b$10$AryVeBDzUxIVM3vnsd4HXOr52kDr3uUsgvfqZloWV6qzD5vzWLdTi','2025-08-21 04:48:48.456977','2025-08-21 10:06:06.656811',NULL,NULL,NULL),(2,'00000011','Sinh viên A','https://static.vecteezy.com/system/resources/previews/001/912/631/non_2x/beautiful-woman-in-frame-circular-avatar-character-free-vector.jpg','0123456780','sinhviena@gmail.com','$2b$10$SawYYnmIY67NqB1kb2z9V.XygZCNjJi6GhEpWaOwAjA/gVMya.Y5e','2025-08-21 08:12:55.213515','2025-08-21 10:06:06.658536',NULL,NULL,NULL),(3,'00000021','Sinh viên B','https://static.vecteezy.com/system/resources/previews/001/912/631/non_2x/beautiful-woman-in-frame-circular-avatar-character-free-vector.jpg','0123456780','sinhvienb@gmail.com','$2b$10$iOw4/tr4PdNFEIZoo91FTuIlksrxDBj58W4Rt0Q0Nvk8ehQxnPHfK','2025-08-21 08:13:18.248065','2025-08-21 10:06:06.661503',NULL,NULL,NULL),(4,'00000031','Giảng viên 1','https://static.vecteezy.com/system/resources/previews/001/912/631/non_2x/beautiful-woman-in-frame-circular-avatar-character-free-vector.jpg','0123456780','giangvien1@gmail.com','$2b$10$xUrLZAcyMbs879ioPdnMaeecb35t99G5d8xZVy/6UFnRu2Uo406Q2','2025-08-21 08:15:40.455747','2025-08-21 10:06:06.663172',NULL,NULL,NULL),(5,'00000041','Giảng viên 2','https://static.vecteezy.com/system/resources/previews/001/912/631/non_2x/beautiful-woman-in-frame-circular-avatar-character-free-vector.jpg','0981248922','giangvien2@gmail.com','$2b$10$fZ2IguFNpSNYhlu88/yIjuSEl1vXmX.wcDuiSviQbde4xdMeOcI0K','2025-08-21 08:16:42.538906','2025-08-21 10:06:06.665010',NULL,NULL,NULL),(6,'00000051','Sinh viên C','https://static.vecteezy.com/system/resources/previews/001/912/631/non_2x/beautiful-woman-in-frame-circular-avatar-character-free-vector.jpg','0123456780','sinhvienc@gmail.com','$2b$10$AHptzmSvTGmVDpJNuNkwv.7Kq2ofz/5UBbf/3Z7AxbA5B/stwZ7mS','2025-08-21 08:17:14.311720','2025-08-21 10:06:06.666733',NULL,NULL,NULL),(7,'00000061','Sinh viên E',NULL,'09821321212','sinhviene@gmail.com','$2b$10$9Z12nVF5yasEJiJHXLIT/.X67tb8DdVsgJ4G2SgSsP/K8VqZGJqBC','2025-08-22 21:43:51.274639','2025-08-22 21:43:51.274639',NULL,NULL,NULL),(8,'00000071','Giảng viên 3',NULL,'09832121212','giangvien3@gmail.com','$2b$10$yd59ZtGh1HnFtaICKp4AGuxovIbbQaennEACxcGVaQi3HNC9/w/kq','2025-08-23 21:28:49.785488','2025-08-23 21:30:06.000000',1,1,2),(9,'00000081','Sinh viên D',NULL,'0978212122','sinhviend@gmail.com','$2b$10$.ZaSPZn1nNSIs0Q9UAKXUOM7gUSI05kqurFzrIE.CosAkymZp14Au','2025-08-23 22:21:12.291528','2025-08-23 22:21:12.291528',1,1,2),(10,'00000091','Sinh viên H',NULL,'0921212122','sinhvienh@gmail.com','$2b$10$irs4OZUs1lzWkOmh3iwrsO5UC8ycPUthkrlbXO8eVOEj0y62n0ade','2025-08-26 22:26:54.186314','2025-08-26 22:26:54.186314',2,2,3),(11,'00000101','Giảng viên 5',NULL,'0982312345','giangvien5@gmail.com','$2b$10$OF1K4aP5DS4xavN98IirouDz0DR8/mvFEjmR2vEk8cfU/FpJQ2MQG','2025-08-26 22:29:14.100229','2025-08-26 22:29:14.100229',2,2,3),(12,'00000111','Sinh viên L',NULL,'0982323231','sinhvienl@gmail.com','$2b$10$SO0lJOUeDbffI7IVPArLROhP02zisrEg/wUxXpXnteSLOyyrkiEPa','2025-08-26 22:44:18.209654','2025-08-26 22:44:18.209654',1,1,1),(13,'00000121','Phòng nghiên cứu khoa học 1',NULL,'0923323232','phongdaotao1@gmail.com','$2b$10$cqQacMc74jDr.f1Tu55yNO4g7YimkQUVv1FXS9VleWAZg8a0jutTW','2025-09-06 21:05:51.335059','2025-09-06 21:05:51.335059',10,5,6);
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

-- Dump completed on 2025-09-06 22:15:58
