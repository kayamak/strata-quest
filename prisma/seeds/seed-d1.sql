-- ============================================================
-- Seed Data for Cloudflare D1 (strata-quest-db)
-- Generated from prisma/seeds/seed.ts
-- ============================================================

-- 既存データのクリア (依存順に削除)
DELETE FROM "QuestionAnswer";
DELETE FROM "PlaySession";
DELETE FROM "VocabularyUnlock";
DELETE FROM "AnswerOption";
DELETE FROM "Question";
DELETE FROM "Quest";
DELETE FROM "VocabularyNode";

-- ============================================================
-- VocabularyNode
-- ============================================================

-- Level 1: nature, vehicle (no parent)
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_nature','nature','自然','The physical world and everything in it',10,1,NULL,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('vn_vehicle','vehicle','乗り物','A machine used for transport',9,1,NULL,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Level 1 children of nature / vehicle
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_animal','animal','動物','A living creature such as a dog or cat',8,1,'vn_nature',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('vn_plant','plant','植物','A living thing that grows like trees',8,1,'vn_nature',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('vn_train','train','電車','Vehicles traveling on railways',5,1,'vn_vehicle',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('vn_car','car','車','A road vehicle with four wheels',5,1,'vn_vehicle',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Level 1 child of animal
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_dog','dog','犬','A common four-legged pet',4,1,'vn_animal',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Level 2: food (no parent)
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_food','food','食べ物','Things that people eat',9,2,NULL,2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Level 2 children of food
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_fruit','fruit','果物','Sweet and fleshy plant product',7,2,'vn_food',2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('vn_drink','drink','飲み物','A liquid that can be swallowed',7,2,'vn_food',2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Level 2 children of fruit / drink
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_apple','apple','りんご','A common round fruit',4,2,'vn_fruit',2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('vn_water','water','水','A clear liquid essential for life',3,2,'vn_drink',2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Level 3: building, furniture (no parent)
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_building','building','建物','A structure with a roof and walls',9,3,NULL,3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('vn_furniture','furniture','家具','Large movable equipment like tables',8,3,NULL,3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Level 3 children
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_house','house','家','A building for human living',6,3,'vn_building',3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('vn_bed','bed','ベッド','A piece of furniture for sleeping',5,3,'vn_furniture',3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('vn_chair','chair','椅子','A seat for one person',5,3,'vn_furniture',3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Level 4: job (no parent)
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_job','job','仕事','A paid position of employment',9,4,NULL,4,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Level 4 children
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_doctor','doctor','医者','A practitioner of medicine',5,4,'vn_job',4,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('vn_teacher','teacher','先生','A person who teaches',5,4,'vn_job',4,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Level 6: feeling
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_feeling','feeling','感情','An emotional state',9,5,NULL,6,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_joy','joy','喜び','A feeling of happiness',5,5,'vn_feeling',6,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Level 7: technology
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_technology','technology','技術','Application of scientific knowledge',10,6,NULL,7,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_computer','computer','コンピュータ','Electronic device for data processing',8,6,'vn_technology',7,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_smartphone','smartphone','スマホ','Mobile phone with computer features',6,6,'vn_computer',7,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Level 8: clothes
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_clothes','clothes','服','Items worn to cover the body',9,7,NULL,8,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_shoe','shoe','靴','A covering for the foot',5,7,'vn_clothes',8,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Level 9: art
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_art','art','芸術','Expression of creative skill',10,8,NULL,9,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_music','music','音楽','Vocal or instrumental sounds',8,8,'vn_art',9,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Level 10: science
INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_science','science','科学','Study of the physical and natural world',10,9,NULL,10,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "VocabularyNode" ("id","word","japaneseMeaning","definition","abstractionLevel","difficulty","parentId","requiredPlayerLevel","createdAt","updatedAt")
VALUES
  ('vn_space','space','宇宙','Physical universe beyond earth',7,9,'vn_science',10,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- ============================================================
-- Quest 1: 自然の学習 (Level 1, Diff 1, XP 100)
-- ============================================================
INSERT INTO "Quest" ("id","title","description","questType","requiredLevel","difficulty","baseXpReward","questionCount","isActive","createdAt","updatedAt")
VALUES ('q1','自然の学習','自然に関連する基本的な単語を学ぼう','GENERALIZE',1,1,100,2,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q1_1','q1','犬や猫などをまとめた動物全般を表す単語は？','MULTIPLE_CHOICE','vn_animal','animal(動物)はnature(自然)の一部です。',1,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q1_1_a1','q1_1','animal',1,'vn_animal',1,CURRENT_TIMESTAMP),
  ('q1_1_a2','q1_1','computer',0,NULL,2,CURRENT_TIMESTAMP),
  ('q1_1_a3','q1_1','house',0,NULL,3,CURRENT_TIMESTAMP),
  ('q1_1_a4','q1_1','vehicle',0,NULL,4,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q1_2','q1','花や木などを表す単語は？','MULTIPLE_CHOICE','vn_plant','plant(植物)もnature(自然)の一部です。',2,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q1_2_a1','q1_2','plant',1,'vn_plant',1,CURRENT_TIMESTAMP),
  ('q1_2_a2','q1_2','animal',0,NULL,2,CURRENT_TIMESTAMP),
  ('q1_2_a3','q1_2','food',0,NULL,3,CURRENT_TIMESTAMP),
  ('q1_2_a4','q1_2','furniture',0,NULL,4,CURRENT_TIMESTAMP);

-- ============================================================
-- Quest 2: 乗り物の学習 (Level 1, Diff 1, XP 120)
-- ============================================================
INSERT INTO "Quest" ("id","title","description","questType","requiredLevel","difficulty","baseXpReward","questionCount","isActive","createdAt","updatedAt")
VALUES ('q2','乗り物の学習','様々な乗り物について学ぼう','SPECIFY',1,1,120,2,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q2_1','q2','乗り物の中で、道路を走る４つの車輪があるものは？','MULTIPLE_CHOICE','vn_car','car(車)はvehicle(乗り物)の具体例です。',1,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q2_1_a1','q2_1','car',1,'vn_car',1,CURRENT_TIMESTAMP),
  ('q2_1_a2','q2_1','doctor',0,NULL,2,CURRENT_TIMESTAMP),
  ('q2_1_a3','q2_1','dog',0,NULL,3,CURRENT_TIMESTAMP),
  ('q2_1_a4','q2_1','nature',0,NULL,4,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q2_2','q2','線路の上を走る乗り物は？','MULTIPLE_CHOICE','vn_train','train(電車)もvehicle(乗り物)の具体例です。',2,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q2_2_a1','q2_2','train',1,'vn_train',1,CURRENT_TIMESTAMP),
  ('q2_2_a2','q2_2','house',0,NULL,2,CURRENT_TIMESTAMP),
  ('q2_2_a3','q2_2','music',0,NULL,3,CURRENT_TIMESTAMP),
  ('q2_2_a4','q2_2','apple',0,NULL,4,CURRENT_TIMESTAMP);

-- ============================================================
-- Quest 3: 共通する概念１ (Level 1, Diff 2, XP 150)
-- ============================================================
INSERT INTO "Quest" ("id","title","description","questType","requiredLevel","difficulty","baseXpReward","questionCount","isActive","createdAt","updatedAt")
VALUES ('q3','共通する概念１','複数の単語の上位概念を見つけよう','COMMON_CONCEPT',1,2,150,2,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q3_1','q3','car(車)やtrain(電車)の共通の上位概念は？','MULTIPLE_CHOICE','vn_vehicle','これらはvehicle(乗り物)というカテゴリーです。',1,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q3_1_a1','q3_1','vehicle',1,'vn_vehicle',1,CURRENT_TIMESTAMP),
  ('q3_1_a2','q3_1','animal',0,NULL,2,CURRENT_TIMESTAMP),
  ('q3_1_a3','q3_1','building',0,NULL,3,CURRENT_TIMESTAMP),
  ('q3_1_a4','q3_1','clothes',0,NULL,4,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q3_2','q3','animal(動物)やplant(植物)の共通の上位概念は？','MULTIPLE_CHOICE','vn_nature','これらはnature(自然)に含まれます。',2,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q3_2_a1','q3_2','nature',1,'vn_nature',1,CURRENT_TIMESTAMP),
  ('q3_2_a2','q3_2','vehicle',0,NULL,2,CURRENT_TIMESTAMP),
  ('q3_2_a3','q3_2','computer',0,NULL,3,CURRENT_TIMESTAMP),
  ('q3_2_a4','q3_2','food',0,NULL,4,CURRENT_TIMESTAMP);

-- ============================================================
-- Quest 4: 食べ物と飲み物 (Level 2, Diff 2, XP 200)
-- ============================================================
INSERT INTO "Quest" ("id","title","description","questType","requiredLevel","difficulty","baseXpReward","questionCount","isActive","createdAt","updatedAt")
VALUES ('q4','食べ物と飲み物','食事に関する単語を学ぼう','GENERALIZE',2,2,200,2,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q4_1','q4','りんごやみかんをまとめた果物を表す単語は？','MULTIPLE_CHOICE','vn_fruit','fruit(果物)はfood(食べ物)の一種です。',1,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q4_1_a1','q4_1','fruit',1,'vn_fruit',1,CURRENT_TIMESTAMP),
  ('q4_1_a2','q4_1','animal',0,NULL,2,CURRENT_TIMESTAMP),
  ('q4_1_a3','q4_1','drink',0,NULL,3,CURRENT_TIMESTAMP),
  ('q4_1_a4','q4_1','vehicle',0,NULL,4,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q4_2','q4','水やジュースなどを表す単語は？','MULTIPLE_CHOICE','vn_drink','drink(飲み物)もfood(食べ物)の一部と考えられます。',2,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q4_2_a1','q4_2','drink',1,'vn_drink',1,CURRENT_TIMESTAMP),
  ('q4_2_a2','q4_2','plant',0,NULL,2,CURRENT_TIMESTAMP),
  ('q4_2_a3','q4_2','fruit',0,NULL,3,CURRENT_TIMESTAMP),
  ('q4_2_a4','q4_2','building',0,NULL,4,CURRENT_TIMESTAMP);

-- ============================================================
-- Quest 5: 食べ物の種類 (Level 2, Diff 2, XP 250)
-- ============================================================
INSERT INTO "Quest" ("id","title","description","questType","requiredLevel","difficulty","baseXpReward","questionCount","isActive","createdAt","updatedAt")
VALUES ('q5','食べ物の種類','具体的な食べ物について学ぼう','SPECIFY',2,2,250,2,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q5_1','q5','fruit(果物)の中で、赤くて丸い一般的な果物は？','MULTIPLE_CHOICE','vn_apple','apple(りんご)はfruit(果物)の具体例です。',1,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q5_1_a1','q5_1','apple',1,'vn_apple',1,CURRENT_TIMESTAMP),
  ('q5_1_a2','q5_1','car',0,NULL,2,CURRENT_TIMESTAMP),
  ('q5_1_a3','q5_1','water',0,NULL,3,CURRENT_TIMESTAMP),
  ('q5_1_a4','q5_1','dog',0,NULL,4,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q5_2','q5','drink(飲み物)の中で、生命に不可欠な透明な液体は？','MULTIPLE_CHOICE','vn_water','water(水)は最も基本的な飲み物です。',2,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q5_2_a1','q5_2','water',1,'vn_water',1,CURRENT_TIMESTAMP),
  ('q5_2_a2','q5_2','train',0,NULL,2,CURRENT_TIMESTAMP),
  ('q5_2_a3','q5_2','apple',0,NULL,3,CURRENT_TIMESTAMP),
  ('q5_2_a4','q5_2','plant',0,NULL,4,CURRENT_TIMESTAMP);

-- ============================================================
-- Quest 6: 建物と家具 (Level 3, Diff 3, XP 300)
-- ============================================================
INSERT INTO "Quest" ("id","title","description","questType","requiredLevel","difficulty","baseXpReward","questionCount","isActive","createdAt","updatedAt")
VALUES ('q6','建物と家具','住まいに関する単語を学ぼう','GENERALIZE',3,3,300,2,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q6_1','q6','人が住むための家を表す単語は？','MULTIPLE_CHOICE','vn_house','house(家)はbuilding(建物)の一種です。',1,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q6_1_a1','q6_1','house',1,'vn_house',1,CURRENT_TIMESTAMP),
  ('q6_1_a2','q6_1','nature',0,NULL,2,CURRENT_TIMESTAMP),
  ('q6_1_a3','q6_1','furniture',0,NULL,3,CURRENT_TIMESTAMP),
  ('q6_1_a4','q6_1','food',0,NULL,4,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q6_2','q6','ベッドや椅子などの家具を表す単語は？','MULTIPLE_CHOICE','vn_furniture','furniture(家具)は家の中に置くものです。',2,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q6_2_a1','q6_2','furniture',1,'vn_furniture',1,CURRENT_TIMESTAMP),
  ('q6_2_a2','q6_2','chair',0,NULL,2,CURRENT_TIMESTAMP),
  ('q6_2_a3','q6_2','bed',0,NULL,3,CURRENT_TIMESTAMP),
  ('q6_2_a4','q6_2','water',0,NULL,4,CURRENT_TIMESTAMP);

-- ============================================================
-- Quest 7: 家具の種類 (Level 3, Diff 3, XP 350)
-- ============================================================
INSERT INTO "Quest" ("id","title","description","questType","requiredLevel","difficulty","baseXpReward","questionCount","isActive","createdAt","updatedAt")
VALUES ('q7','家具の種類','具体的な家具について学ぼう','SPECIFY',3,3,350,2,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q7_1','q7','furniture(家具)の中で、寝るために使うものは？','MULTIPLE_CHOICE','vn_bed','bed(ベッド)は家具の一つです。',1,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q7_1_a1','q7_1','bed',1,'vn_bed',1,CURRENT_TIMESTAMP),
  ('q7_1_a2','q7_1','house',0,NULL,2,CURRENT_TIMESTAMP),
  ('q7_1_a3','q7_1','apple',0,NULL,3,CURRENT_TIMESTAMP),
  ('q7_1_a4','q7_1','chair',0,NULL,4,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q7_2','q7','furniture(家具)の中で、座るために使うものは？','MULTIPLE_CHOICE','vn_chair','chair(椅子)も家具の一つです。',2,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q7_2_a1','q7_2','chair',1,'vn_chair',1,CURRENT_TIMESTAMP),
  ('q7_2_a2','q7_2','bed',0,NULL,2,CURRENT_TIMESTAMP),
  ('q7_2_a3','q7_2','building',0,NULL,3,CURRENT_TIMESTAMP),
  ('q7_2_a4','q7_2','animal',0,NULL,4,CURRENT_TIMESTAMP);

-- ============================================================
-- Quest 8: 仕事について (Level 4, Diff 4, XP 400)
-- ============================================================
INSERT INTO "Quest" ("id","title","description","questType","requiredLevel","difficulty","baseXpReward","questionCount","isActive","createdAt","updatedAt")
VALUES ('q8','仕事について','色々な仕事の単語を学ぼう','SPECIFY',4,4,400,2,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q8_1','q8','病気の人を助ける仕事は？','MULTIPLE_CHOICE','vn_doctor','doctor(医者)はjob(仕事)の具体例です。',1,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q8_1_a1','q8_1','doctor',1,'vn_doctor',1,CURRENT_TIMESTAMP),
  ('q8_1_a2','q8_1','teacher',0,NULL,2,CURRENT_TIMESTAMP),
  ('q8_1_a3','q8_1','house',0,NULL,3,CURRENT_TIMESTAMP),
  ('q8_1_a4','q8_1','food',0,NULL,4,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q8_2','q8','学校で生徒に教える仕事は？','MULTIPLE_CHOICE','vn_teacher','teacher(先生)はjob(仕事)の具体例です。',2,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q8_2_a1','q8_2','teacher',1,'vn_teacher',1,CURRENT_TIMESTAMP),
  ('q8_2_a2','q8_2','doctor',0,NULL,2,CURRENT_TIMESTAMP),
  ('q8_2_a3','q8_2','building',0,NULL,3,CURRENT_TIMESTAMP),
  ('q8_2_a4','q8_2','dog',0,NULL,4,CURRENT_TIMESTAMP);

-- ============================================================
-- Quest 9: 共通する概念２ (Level 5, Diff 5, XP 500)
-- ============================================================
INSERT INTO "Quest" ("id","title","description","questType","requiredLevel","difficulty","baseXpReward","questionCount","isActive","createdAt","updatedAt")
VALUES ('q9','共通する概念２','仕事や家具の上位概念を見つけよう','COMMON_CONCEPT',5,5,500,2,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q9_1','q9','doctor(医者)やteacher(先生)に共通する言葉は？','MULTIPLE_CHOICE','vn_job','これらはjob(仕事)の一種です。',1,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q9_1_a1','q9_1','job',1,'vn_job',1,CURRENT_TIMESTAMP),
  ('q9_1_a2','q9_1','nature',0,NULL,2,CURRENT_TIMESTAMP),
  ('q9_1_a3','q9_1','building',0,NULL,3,CURRENT_TIMESTAMP),
  ('q9_1_a4','q9_1','food',0,NULL,4,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q9_2','q9','bed(ベッド)やchair(椅子)に共通する言葉は？','MULTIPLE_CHOICE','vn_furniture','これらはfurniture(家具)の一種です。',2,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q9_2_a1','q9_2','furniture',1,'vn_furniture',1,CURRENT_TIMESTAMP),
  ('q9_2_a2','q9_2','vehicle',0,NULL,2,CURRENT_TIMESTAMP),
  ('q9_2_a3','q9_2','fruit',0,NULL,3,CURRENT_TIMESTAMP),
  ('q9_2_a4','q9_2','job',0,NULL,4,CURRENT_TIMESTAMP);

-- ============================================================
-- Quest 10: 感情の世界 (Level 6, Diff 5, XP 600)
-- ============================================================
INSERT INTO "Quest" ("id","title","description","questType","requiredLevel","difficulty","baseXpReward","questionCount","isActive","createdAt","updatedAt")
VALUES ('q10','感情の世界','心の動きについて学ぼう','SPECIFY',6,5,600,2,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q10_1','q10','笑ったり喜んだりする感情は？','MULTIPLE_CHOICE','vn_joy','joy(喜び)はfeeling(感情)の一種です。',1,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q10_1_a1','q10_1','joy',1,'vn_joy',1,CURRENT_TIMESTAMP),
  ('q10_1_a2','q10_1','vehicle',0,NULL,2,CURRENT_TIMESTAMP),
  ('q10_1_a3','q10_1','furniture',0,NULL,3,CURRENT_TIMESTAMP),
  ('q10_1_a4','q10_1','food',0,NULL,4,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q10_2','q10','joy(喜び)などの心の動きの上位概念は？','MULTIPLE_CHOICE','vn_feeling','feeling(感情)は心の動き全体を指します。',2,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q10_2_a1','q10_2','feeling',1,'vn_feeling',1,CURRENT_TIMESTAMP),
  ('q10_2_a2','q10_2','technology',0,NULL,2,CURRENT_TIMESTAMP),
  ('q10_2_a3','q10_2','art',0,NULL,3,CURRENT_TIMESTAMP),
  ('q10_2_a4','q10_2','job',0,NULL,4,CURRENT_TIMESTAMP);

-- ============================================================
-- Quest 11: 技術の進化 (Level 7, Diff 6, XP 700)
-- ============================================================
INSERT INTO "Quest" ("id","title","description","questType","requiredLevel","difficulty","baseXpReward","questionCount","isActive","createdAt","updatedAt")
VALUES ('q11','技術の進化','便利な技術について学ぼう','SPECIFY',7,6,700,2,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q11_1','q11','データを計算・処理する電子機器は？','MULTIPLE_CHOICE','vn_computer','computer(コンピュータ)はtechnology(技術)の代表例です。',1,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q11_1_a1','q11_1','computer',1,'vn_computer',1,CURRENT_TIMESTAMP),
  ('q11_1_a2','q11_1','feeling',0,NULL,2,CURRENT_TIMESTAMP),
  ('q11_1_a3','q11_1','nature',0,NULL,3,CURRENT_TIMESTAMP),
  ('q11_1_a4','q11_1','animal',0,NULL,4,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q11_2','q11','持ち運べる小型のコンピュータともいえる電話は？','MULTIPLE_CHOICE','vn_smartphone','smartphone(スマホ)は身近なコンピュータです。',2,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q11_2_a1','q11_2','smartphone',1,'vn_smartphone',1,CURRENT_TIMESTAMP),
  ('q11_2_a2','q11_2','apple',0,NULL,2,CURRENT_TIMESTAMP),
  ('q11_2_a3','q11_2','house',0,NULL,3,CURRENT_TIMESTAMP),
  ('q11_2_a4','q11_2','plant',0,NULL,4,CURRENT_TIMESTAMP);

-- ============================================================
-- Quest 12: 服と靴 (Level 8, Diff 7, XP 800)
-- ============================================================
INSERT INTO "Quest" ("id","title","description","questType","requiredLevel","difficulty","baseXpReward","questionCount","isActive","createdAt","updatedAt")
VALUES ('q12','服と靴','身につけるものについて学ぼう','GENERALIZE',8,7,800,2,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q12_1','q12','Tシャツなどの体を覆うものは？','MULTIPLE_CHOICE','vn_clothes','clothes(服)は身につけるものの総称です。',1,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q12_1_a1','q12_1','clothes',1,'vn_clothes',1,CURRENT_TIMESTAMP),
  ('q12_1_a2','q12_1','technology',0,NULL,2,CURRENT_TIMESTAMP),
  ('q12_1_a3','q12_1','building',0,NULL,3,CURRENT_TIMESTAMP),
  ('q12_1_a4','q12_1','food',0,NULL,4,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q12_2','q12','足を守るために履くものは？','MULTIPLE_CHOICE','vn_shoe','shoe(靴)も身につけるものの一つです。',2,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q12_2_a1','q12_2','shoe',1,'vn_shoe',1,CURRENT_TIMESTAMP),
  ('q12_2_a2','q12_2','smartphone',0,NULL,2,CURRENT_TIMESTAMP),
  ('q12_2_a3','q12_2','chair',0,NULL,3,CURRENT_TIMESTAMP),
  ('q12_2_a4','q12_2','water',0,NULL,4,CURRENT_TIMESTAMP);

-- ============================================================
-- Quest 13: 芸術 (Level 9, Diff 8, XP 900)
-- ============================================================
INSERT INTO "Quest" ("id","title","description","questType","requiredLevel","difficulty","baseXpReward","questionCount","isActive","createdAt","updatedAt")
VALUES ('q13','芸術','音楽について学ぼう','GENERALIZE',9,8,900,2,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q13_1','q13','絵画や音楽などの美しい表現の総称は？','MULTIPLE_CHOICE','vn_art','art(芸術)は人間の創造的なスキルです。',1,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q13_1_a1','q13_1','art',1,'vn_art',1,CURRENT_TIMESTAMP),
  ('q13_1_a2','q13_1','computer',0,NULL,2,CURRENT_TIMESTAMP),
  ('q13_1_a3','q13_1','clothes',0,NULL,3,CURRENT_TIMESTAMP),
  ('q13_1_a4','q13_1','animal',0,NULL,4,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q13_2','q13','楽器を使って演奏するものは？','MULTIPLE_CHOICE','vn_music','music(音楽)はart(芸術)の一種です。',2,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q13_2_a1','q13_2','music',1,'vn_music',1,CURRENT_TIMESTAMP),
  ('q13_2_a2','q13_2','smartphone',0,NULL,2,CURRENT_TIMESTAMP),
  ('q13_2_a3','q13_2','doctor',0,NULL,3,CURRENT_TIMESTAMP),
  ('q13_2_a4','q13_2','bed',0,NULL,4,CURRENT_TIMESTAMP);

-- ============================================================
-- Quest 14: 科学 (Level 10, Diff 9, XP 1000)
-- ============================================================
INSERT INTO "Quest" ("id","title","description","questType","requiredLevel","difficulty","baseXpReward","questionCount","isActive","createdAt","updatedAt")
VALUES ('q14','科学','世界の仕組みについて学ぼう','GENERALIZE',10,9,1000,2,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q14_1','q14','世界や自然の法則を研究する分野は？','MULTIPLE_CHOICE','vn_science','science(科学)は知識の体系です。',1,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q14_1_a1','q14_1','science',1,'vn_science',1,CURRENT_TIMESTAMP),
  ('q14_1_a2','q14_1','art',0,NULL,2,CURRENT_TIMESTAMP),
  ('q14_1_a3','q14_1','clothes',0,NULL,3,CURRENT_TIMESTAMP),
  ('q14_1_a4','q14_1','feeling',0,NULL,4,CURRENT_TIMESTAMP);

INSERT INTO "Question" ("id","questId","questionText","questionType","targetVocabularyId","explanation","sortOrder","timeLimitSeconds","createdAt","updatedAt")
VALUES ('q14_2','q14','地球の外に広がる世界を何という？','MULTIPLE_CHOICE','vn_space','space(宇宙)は科学の探究対象の1つです。',2,20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

INSERT INTO "AnswerOption" ("id","questionId","text","isCorrect","vocabularyNodeId","sortOrder","createdAt")
VALUES
  ('q14_2_a1','q14_2','space',1,'vn_space',1,CURRENT_TIMESTAMP),
  ('q14_2_a2','q14_2','music',0,NULL,2,CURRENT_TIMESTAMP),
  ('q14_2_a3','q14_2','shoe',0,NULL,3,CURRENT_TIMESTAMP),
  ('q14_2_a4','q14_2','computer',0,NULL,4,CURRENT_TIMESTAMP);
