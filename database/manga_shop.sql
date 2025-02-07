-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: manga_shop
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` mediumtext NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 10,
  `genre` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` VALUES (1,'One Piece เล่ม 1',120.00,'https://cdn-local.mebmarket.com/meb/server1/55018/Thumbnail/book_detail_large.gif?6',15,'แอคชั่น','เรื่องราวการผจญภัยของโจรสลัดลูฟี่'),(2,'Naruto เล่ม 1',120.00,'https://cdn-local.mebmarket.com/meb/server1/103272/Thumbnail/book_detail_large.gif?3',10,'แอคชั่น','เรื่องราวของนารูโตะ นินจาผู้ต้องการเป็นโฮคาเงะ'),(11,'Bluelock เล่ม 1',65.00,'https://storage.naiin.com/system/application/bookstore/resource/product/202209/559989/6000065220_front_XXL.jpg?imgname=BLUE-LOCK-%E0%B8%82%E0%B8%B1%E0%B8%87%E0%B8%94%E0%B8%A7%E0%B8%A5%E0%B8%81%E0%B8%B1%E0%B8%9A-%E0%B9%80%E0%B8%A5%E0%B9%88%E0%B8%A1-1',20,'กีฬา','Blue Lock มังงะที่ถ่ายทอดการคัดเลือกนักฟุตบอลระดับเยาวชน 300 คน เพื่อตามหาผู้เล่นที่เก่งที่สุดในการทำประตู'),(12,'Horimiya เล่ม 1',70.00,'https://storage.naiin.com/system/application/bookstore/resource/product/202103/522799/1000239847_front_XXL.jpg?imgname=%E0%B9%82%E0%B8%AE%E0%B8%A3%E0%B8%B4%E0%B8%A1%E0%B8%B4%E0%B8%A2%E0%B8%B0-%E0%B8%AA%E0%B8%B2%E0%B8%A7%E0%B8%A1%E0%B8%B1%E0%B9%88%E0%B8%99%E0%B8%81%E0%B8%B1%E0%B8%9A%E0%B8%99%E0%B8%B2%E0%B8%A2%E0%B8%A1%E0%B8%B7%E0%B8%94%E0%B8%A1%E0%B8%99-%E0%B9%80%E0%B8%A5%E0%B9%88%E0%B8%A1-1',5,'โรแมนซ์','Horimiya เป็นเรื่องราวของ Hori Kyoko สาวมั่นที่ดูแลบ้านและครอบครัวแทนพ่อแม่ที่ทำงานหนัก และ Miyamura Izumi หนุ่มมืดมนที่ดูเป็นคนขี้เหร่และเก็บตัว แต่ในความเป็นจริงแล้วเขามีลักษณะหล่อและรอยสักที่ไม่เคยเผยให้ใครเห็น ทั้งสองคนมีความลับที่แตกต่างกันและพบกันโดยบังเอิญในขณะเรียนในโรงเรียน เมื่อเริ่มเปิดใจและรู้จักกัน ทั้งคู่เริ่มมีความสัมพันธ์ที่ใกล้ชิดขึ้น เรื่องราวสะท้อนมิตรภาพและความรักระหว่างสองคนที่เริ่มจากความลับและความไม่สมบูรณ์แบบที่ทั้งคู่ยอมรับและเข้าใจกัน.'),(13,'Kuroko no Basket เล่ม 1',95.00,'https://www.phanpha.com/sites/default/files/imagecache/product_full/images01/9786163231482.JPG',10,'กีฬา','ในวงการบาสเก็ตบอลระดับมัธยมต้น \"เจเนอเรชั่นแห่งปาฏิหาริย์\" (Generation of Miracles) คือกลุ่มผู้เล่นอัจฉริยะ 5 คนจากโรงเรียนเทย์โคว์ ที่ได้รับการยกย่องว่าเก่งที่สุด แต่มี สมาชิกคนที่ 6 ที่ไม่มีใครสังเกตเห็น นั่นคือ \"คุโรโกะ เท็ตสึยะ\"'),(14,'Your Name เล่ม 1',85.00,'https://storage.naiin.com/system/application/bookstore/resource/product/202102/520938/6000044906_front_XXL.jpg?imgname=Your-Name.-%E0%B9%80%E0%B8%98%E0%B8%AD%E0%B8%84%E0%B8%B7%E0%B8%AD...-%E0%B9%80%E0%B8%A5%E0%B9%88%E0%B8%A1-1-(Mg)',10,'โรแมนซ์','มิตสึฮะ เด็กสาวชนบทที่ฝันอยากใช้ชีวิตในโตเกียว และ ทาคิ เด็กหนุ่มโตเกียว พบว่าพวกเขาสลับร่างกันโดยไม่ทราบสาเหตุ '),(15,'Komi เล่ม 1',65.00,'https://cdn-local.mebmarket.com/meb/server1/120675/Thumbnail/book_detail_large.gif?2',5,'โรแมนซ์','เล่าเรื่องราวของ โคมิ ชิเงะ นักเรียนสาวที่มีความสวยและความสมบูรณ์แบบทุกด้าน จนกลายเป็นสาวที่ได้รับความสนใจจากเพื่อนๆ ในโรงเรียน แต่แท้จริงแล้ว โคมิกลับมีอาการ ขี้อาย และไม่สามารถพูดคุยหรือเข้าสังคมกับคนอื่นได้เลย'),(16,'jujutsu kaisen เล่ม 1',50.00,'https://storage.naiin.com/system/application/bookstore/resource/product/202104/525556/6000047337_front_XXL.jpg?imgname=%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B9%80%E0%B8%A7%E0%B8%97%E0%B8%A2%E0%B9%8C%E0%B8%9C%E0%B8%99%E0%B8%B6%E0%B8%81%E0%B8%A1%E0%B8%B2%E0%B8%A3-%E0%B9%80%E0%B8%A5%E0%B9%88%E0%B8%A1-1',5,'แอคชั่น','เป็นเรื่องราวของ อิโตะ โยจิ เด็กหนุ่มที่มีพลังพิเศษในการต่อสู้กับวิญญาณร้ายที่เป็นอันตรายต่อมนุษย์ เขาได้พบกับ ซากุระ และ ฟุชิกุรุ ซึ่งเป็นสมาชิกของกลุ่มที่ต่อสู้กับวิญญาณร้ายที่มีพลังอันทรงพลัง แต่เมื่อเกิดเหตุการณ์ที่ทำให้โยจิเสียชีวิต เขาถูก \"ผนึก\" จิตวิญญาณของ \"สแปร์ราวด์\" หรือ \"ยัยมาร\" ที่มีพลังมหาศาลเข้าสู่ร่างของเขา และกลายเป็น \"วัตถุผนึกมาร\" ทำให้เขามีภารกิจที่จะทำลายมารร้าย และรับมือกับภัยจากพลังที่เขาควบคุมไม่ได้'),(17,'The Prince of Tennis เจ้าชายลูกสักหลาด เล่ม 1',65.00,'https://cdn-local.mebmarket.com/meb/server1/145031/Thumbnail/book_detail_large.gif?3',10,'กีฬา','เป็นเรื่องราวเกี่ยวกับ เรียวมะ เอจิเซ็น (Ryoma Echizen) เด็กอัจฉริยะด้านเทนนิสวัย 12 ปี ที่ย้ายกลับมาจากอเมริกาเพื่อเข้าเรียนที่ โรงเรียนเซชุน (Seishun Academy หรือ Seigaku) ซึ่งเป็นโรงเรียนที่มีชื่อเสียงด้านเทนนิสของญี่ปุ่น\n\nแม้ว่าเขาจะเป็นเด็กปี 1 แต่ฝีมือของเขากลับโดดเด่นจนสามารถเข้าร่วมทีมตัวจริงของโรงเรียนได้อย่างรวดเร็ว และมีเป้าหมายที่จะเป็นสุดยอดนักเทนนิสของญี่ปุ่น โดยต้องเผชิญหน้ากับคู่แข่งจากโรงเรียนต่างๆ ที่แข็งแกร่ง ทั้งการแข่งขันระดับจังหวัด ระดับประเทศ ไปจนถึงการแข่งขันระดับนานาชาติ'),(18,'SAKAMOTO DAYS เล่ม 1',115.00,'https://cdn-local.mebmarket.com/meb/server1/220365/Thumbnail/book_detail_large.gif?2',10,'แอคชั่น','เล่าเรื่องราวของ ซากาโมโตะ ทาโร่ อดีตนักฆ่าระดับตำนานที่เคยเป็นสุดยอดมือสังหารไร้พ่ายของวงการ \nแต่เขากลับตัดสินใจวางมือจากโลกแห่งความโหดร้าย เพื่อใช้ชีวิตแบบคนธรรมดาและเปิดร้านสะดวกซื้อเล็ก ๆ \nพร้อมใช้ชีวิตครอบครัวกับภรรยาและลูกสาวสุดที่รัก \n\nแต่ความสงบสุขของเขากลับถูกท้าทายอีกครั้ง เมื่ออดีตตามมาหลอกหลอน! \nองค์กรนักฆ่าเริ่มพยายามตามล่าตัวเขา ซากาโมโตะจึงต้องกลับมาใช้ทักษะการต่อสู้สุดเทพแบบไร้ปราณี \nแต่คราวนี้... เขาไม่สามารถฆ่าใครได้อีกแล้ว! จึงต้องรับมือกับศัตรูด้วยไหวพริบ ความแข็งแกร่ง \nและท่วงท่าการต่อสู้ที่ดิบเถื่อนแต่เต็มไปด้วยอารมณ์ขัน'),(19,'ก้าวแรกสู่สังเวียน Hajime no Ippo เล่ม 1',60.00,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSI70cTQmTqZCCKPWx8OUznLVtm4An3VuItvw&s',9,'กีฬา','เรื่องราวของ มาคุโนอุจิ อิปโปะ (Makunouchi Ippo) เด็กหนุ่มขี้อายและขาดความมั่นใจ ที่ถูกกลั่นแกล้งมาตลอดชีวิต วันหนึ่งเขาถูกกลุ่มนักเลงรุมรังแก แต่โชคดีที่ได้รับความช่วยเหลือจาก ทาคามูระ มาโมรุ (Takamura Mamoru) นักมวยระดับโปรที่ผ่านมาพอดี\r\n\r\n\r\n    เมื่อ ทาคามูระ เห็นว่าอิปโปะมีพละกำลังและศักยภาพ เขาจึงพาอิปโปะไปที่ ค่ายมวยคามากาวะ (Kamagawa Gym) และให้เขาลองฝึกมวยเพื่อปลดปล่อยพลังที่มีอยู่ในตัว อิปโปะได้ค้นพบว่าตัวเองมี พลังหมัดที่หนักหน่วง และเริ่มหลงใหลในกีฬามวย\r\n\r\n\r\n    จากเด็กหนุ่มธรรมดา อิปโปะเริ่มต้นเส้นทางการเป็นนักมวยอาชีพ ด้วยความพยายามและฝึกฝนอย่างหนัก เขาต้องเผชิญหน้ากับคู่แข่งมากมาย ตั้งแต่ มิยาตะ อิจิโร่ (Miyata Ichirou) นักมวยพรสวรรค์ผู้เป็นแรงบันดาลใจของเขา, เซนโด ทาเครุ (Sendou Takeshi) คู่ปรับสุดดุเดือด และ อาโอกิ-คิมูระ นักมวยรุ่นพี่ที่สร้างสีสันให้เรื่องราว'),(22,'KAIJYU No. 8 เล่ม 1',89.00,'https://www.mangozero.com/wp-content/uploads/2022/08/kaiju-no-8-vol-1.jpg',9,'แอคชั่น','ในโลกที่เต็มไปด้วยไคจู (สัตว์ประหลาดยักษ์) คาฟก้า ฮิบิโนะ ชายวัย 32 ปี เคยฝันอยากเข้ากองกำลังป้องกันไคจู แต่สอบไม่ผ่านและทำงานในหน่วยกำจัดซากแทน\r\n\r\nวันหนึ่ง เขาได้รับพลังไคจูโดยบังเอิญ ทำให้สามารถแปลงร่างเป็นไคจูหมายเลข 8 ที่มีพลังมหาศาล กลายเป็นเป้าหมายของกองกำลังที่เขาใฝ่ฝันอยากเข้าร่วม คาฟก้าต้องหาทางควบคุมพลัง ซ่อนตัวตน และใช้มันเพื่อต่อสู้กับไคจูแทนที่จะเป็นศัตรูของมนุษย์');
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) DEFAULT NULL,
  `book_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_order_id` (`order_id`),
  KEY `FK_book_id` (`book_id`),
  CONSTRAINT `FK_book_id` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,16,1,50.00),(2,1,11,1,65.00),(3,2,14,1,85.00),(4,3,12,1,70.00),(5,4,14,5,85.00),(6,5,13,5,95.00),(7,6,15,1,65.00),(8,7,1,2,120.00),(9,8,19,1,60.00),(10,9,18,1,115.00),(11,10,22,2,89.00),(12,11,19,10,60.00),(13,12,2,10,120.00),(14,13,2,1,120.00),(15,14,22,2,89.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(15) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `payment_status` enum('Pending','Completed') DEFAULT 'Pending',
  `payment_slip` varchar(255) DEFAULT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'อนุสิษฐ์ ง้วนกันทะ','56 หมู่3 ต.บ้านพี้ อ.บ้านหลวง จ.น่าน 55190','088888888888',115.00,'Pending','/uploads/1738816746620.jpg','2025-02-06 04:39:06',5),(2,'อนุสิษฐ์ ง้วนกันทะ','56 หมู่3 ต.บ้านพี้ อ.บ้านหลวง จ.น่าน 55190','088888888888',85.00,'Pending','/uploads/1738816792744.jpg','2025-02-06 04:39:52',5),(3,'นัทธพงศ์ อุปถัมภ์','56 หมู่3 ต.บ้านพี้ อ.บ้านหลวง จ.น่าน 55190','088888888888',70.00,'Pending','/uploads/1738820356490.jpg','2025-02-06 05:39:16',4),(4,'อนุสิษฐ์ ง้วนกันทะ','56 หมู่3 ต.บ้านพี้ อ.บ้านหลวง จ.น่าน 55190','088888888888',425.00,'Pending','/uploads/1738821442755.jpg','2025-02-06 05:57:22',5),(5,'นัทธพงศ์ อุปถัมภ์','56 หมู่3 ต.บ้านพี้ อ.บ้านหลวง จ.น่าน 55190','088888888888',475.00,'Pending','/uploads/1738830693340.jpg','2025-02-06 08:31:33',6),(6,'นัทธพงศ์ อุปถัมภ์','56 หมู่3 ต.บ้านพี้ อ.บ้านหลวง จ.น่าน 55190','088888888888',65.00,'Pending','/uploads/1738847367990.jpg','2025-02-06 13:09:28',7),(7,'อนุสิษฐ์ ง้วนกันทะ','56 หมู่3 ต.บ้านพี้ อ.บ้านหลวง จ.น่าน 55190','088888888888',240.00,'Pending','/uploads/1738852012263.jpg','2025-02-06 14:26:52',7),(8,'นัทธพงศ์ อุปถัมภ์','56 หมู่3 ต.บ้านพี้ อ.บ้านหลวง จ.น่าน 55190','088888888888',60.00,'Pending','/uploads/1738855566201.jpg','2025-02-06 15:26:06',7),(9,'นัทธพงศ์ อุปถัมภ์','56 หมู่3 ต.บ้านพี้ อ.บ้านหลวง จ.น่าน 55190','088888888888',115.00,'Pending','/uploads/1738857341197.jpg','2025-02-06 15:55:41',7),(10,'นัทธพงศ์ อุปถัมภ์','56 หมู่3 ต.บ้านพี้ อ.บ้านหลวง จ.น่าน 55190','088888888888',178.00,'Pending','/uploads/1738914420837.jpg','2025-02-07 07:47:00',9),(11,'นัทธพงศ์ อุปถัมภ์','56 หมู่3 ต.บ้านพี้ อ.บ้านหลวง จ.น่าน 55190','088888888888',600.00,'Pending','/uploads/1738922739430.jpg','2025-02-07 10:05:39',9),(12,'อนุสิษฐ์ ง้วนกันทะ','56 หมู่3 ต.บ้านพี้ อ.บ้านหลวง จ.น่าน 55190','088888888888',1200.00,'Pending','/uploads/1738925100677.jpg','2025-02-07 10:45:00',9),(13,'นัทธพงศ์ อุปถัมภ์','56 หมู่3 ต.บ้านพี้ อ.บ้านหลวง จ.น่าน 55190','088888888888',120.00,'Pending','/uploads/1738927673562.jpg','2025-02-07 11:27:53',9),(14,'อนุสิษฐ์ ง้วนกันทะ','56 หมู่3 ต.บ้านพี้ อ.บ้านหลวง จ.น่าน 55190','088888888888',178.00,'Pending','/uploads/1738939517676.jpg','2025-02-07 14:45:17',9);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) NOT NULL,
  `user` varchar(255) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `comment` mediumtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,16,'ดรีม',5,'112121212','2025-02-06 05:18:09'),(2,16,'หนุ่ย',5,'very Good','2025-02-06 05:27:56'),(3,14,'ดรีม',5,'good','2025-02-06 05:36:31'),(4,12,'ดรีม',5,'ดี','2025-02-06 05:42:50'),(5,1,'ทดสอบ',5,'นี่เป็นรีวิวทดสอบภาษาไทย','2025-02-06 05:54:44'),(6,1,'ดรีม',5,'ฟฟ','2025-02-06 06:41:07'),(7,16,'ดรีม',2,'4545454','2025-02-06 06:42:40'),(8,11,'อนุสิษฐ์',4,'ดีผมชอบฟุตบอล','2025-02-06 06:57:44'),(9,13,'ดรีม',5,'ดีจัด','2025-02-06 08:32:08'),(10,2,'ดรีม',5,'ดีมาก','2025-02-06 11:59:57'),(11,2,'ดรีม',5,'เทสสส','2025-02-06 12:28:10'),(12,11,'ดรีม',5,'เทสระบบ','2025-02-06 13:08:44'),(13,19,'ดรีม',5,'test','2025-02-06 15:54:33'),(14,22,'ดรีม',5,'เทสสส','2025-02-07 11:28:20'),(15,1,'ดรีม',5,'เทสส','2025-02-07 14:46:11');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'อนุสิษฐ์','test@example.com','123456','user'),(3,'nui','nui@nui.com','$2b$10$POHc38chrho.94oSaeIbCuk7w6NCOuarCL80Ctfr3PIqfQ8YJ/HCK','user'),(4,'ดรีม','dre@2.com','$2b$10$BNTG4OhyIsyPzH6qvO6r9OJgwL84.jXaMkdNI7ymLTm50WoKKcUmG','user'),(5,'Dream','dream@2.com','$2b$10$M/x8j9C6nZ2Lmx5PvRR5.OAREH/TchQblXMPCaoHamgb4ai5sr6za','user'),(6,'อนุสิษฐ์ ง้วนกันทะๆ ','Nui@zz.com','$2b$10$r/vYbSQLDwLMzXRqTMjeUeJjhCUxh2ajaJPabmoci25qmZPYnZNl.','user'),(7,'นัทธพงศ์','nui@zy.com','$2b$10$54FEE0l9xLV5Pkg4n8ULkeTs2ABwURLQbr1g6/EpmMLi1bppcFq5e','user'),(8,'admin','admin@example.com','$2a$10$PxkspnM3DUSwva97K4aG../5iL85JdtSB7tfSaDfj./6qdZIy//S6','admin'),(9,'ดรีม','dream@d.com','$2a$10$bJY5QF4NqutJKksA1tAFl.C3ccfBMxbWDMko9J.0xzEpDbtNNCJbO','user');
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

-- Dump completed on 2025-02-07 22:31:01
