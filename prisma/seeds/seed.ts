import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Database (Common Words Edition) ---');

  await prisma.questionAnswer.deleteMany();
  await prisma.playSession.deleteMany();
  await prisma.vocabularyUnlock.deleteMany();
  await prisma.answerOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quest.deleteMany();
  await prisma.vocabularyNode.deleteMany();

  const vData = [
    {
      id: 'nature',
      word: 'nature',
      jp: '自然',
      def: 'The physical world and everything in it',
      abs: 10,
      diff: 1,
      reqLevel: 1,
    },
    {
      id: 'animal',
      word: 'animal',
      jp: '動物',
      def: 'A living creature such as a dog or cat',
      abs: 8,
      diff: 1,
      reqLevel: 1,
      parent: 'nature',
    },
    {
      id: 'plant',
      word: 'plant',
      jp: '植物',
      def: 'A living thing that grows like trees',
      abs: 8,
      diff: 1,
      reqLevel: 1,
      parent: 'nature',
    },
    {
      id: 'dog',
      word: 'dog',
      jp: '犬',
      def: 'A common four-legged pet',
      abs: 4,
      diff: 1,
      reqLevel: 1,
      parent: 'animal',
    },
    {
      id: 'vehicle',
      word: 'vehicle',
      jp: '乗り物',
      def: 'A machine used for transport',
      abs: 9,
      diff: 1,
      reqLevel: 1,
    },
    {
      id: 'train',
      word: 'train',
      jp: '電車',
      def: 'Vehicles traveling on railways',
      abs: 5,
      diff: 1,
      reqLevel: 1,
      parent: 'vehicle',
    },
    {
      id: 'car',
      word: 'car',
      jp: '車',
      def: 'A road vehicle with four wheels',
      abs: 5,
      diff: 1,
      reqLevel: 1,
      parent: 'vehicle',
    },
    {
      id: 'food',
      word: 'food',
      jp: '食べ物',
      def: 'Things that people eat',
      abs: 9,
      diff: 2,
      reqLevel: 2,
    },
    {
      id: 'fruit',
      word: 'fruit',
      jp: '果物',
      def: 'Sweet and fleshy plant product',
      abs: 7,
      diff: 2,
      reqLevel: 2,
      parent: 'food',
    },
    {
      id: 'apple',
      word: 'apple',
      jp: 'りんご',
      def: 'A common round fruit',
      abs: 4,
      diff: 2,
      reqLevel: 2,
      parent: 'fruit',
    },
    {
      id: 'drink',
      word: 'drink',
      jp: '飲み物',
      def: 'A liquid that can be swallowed',
      abs: 7,
      diff: 2,
      reqLevel: 2,
      parent: 'food',
    },
    {
      id: 'water',
      word: 'water',
      jp: '水',
      def: 'A clear liquid essential for life',
      abs: 3,
      diff: 2,
      reqLevel: 2,
      parent: 'drink',
    },
    {
      id: 'building',
      word: 'building',
      jp: '建物',
      def: 'A structure with a roof and walls',
      abs: 9,
      diff: 3,
      reqLevel: 3,
    },
    {
      id: 'house',
      word: 'house',
      jp: '家',
      def: 'A building for human living',
      abs: 6,
      diff: 3,
      reqLevel: 3,
      parent: 'building',
    },
    {
      id: 'furniture',
      word: 'furniture',
      jp: '家具',
      def: 'Large movable equipment like tables',
      abs: 8,
      diff: 3,
      reqLevel: 3,
    },
    {
      id: 'bed',
      word: 'bed',
      jp: 'ベッド',
      def: 'A piece of furniture for sleeping',
      abs: 5,
      diff: 3,
      reqLevel: 3,
      parent: 'furniture',
    },
    {
      id: 'chair',
      word: 'chair',
      jp: '椅子',
      def: 'A seat for one person',
      abs: 5,
      diff: 3,
      reqLevel: 3,
      parent: 'furniture',
    },
    {
      id: 'job',
      word: 'job',
      jp: '仕事',
      def: 'A paid position of employment',
      abs: 9,
      diff: 4,
      reqLevel: 4,
    },
    {
      id: 'doctor',
      word: 'doctor',
      jp: '医者',
      def: 'A practitioner of medicine',
      abs: 5,
      diff: 4,
      reqLevel: 4,
      parent: 'job',
    },
    {
      id: 'teacher',
      word: 'teacher',
      jp: '先生',
      def: 'A person who teaches',
      abs: 5,
      diff: 4,
      reqLevel: 4,
      parent: 'job',
    },
    {
      id: 'feeling',
      word: 'feeling',
      jp: '感情',
      def: 'An emotional state',
      abs: 9,
      diff: 5,
      reqLevel: 6,
    },
    {
      id: 'joy',
      word: 'joy',
      jp: '喜び',
      def: 'A feeling of happiness',
      abs: 5,
      diff: 5,
      reqLevel: 6,
      parent: 'feeling',
    },
    {
      id: 'technology',
      word: 'technology',
      jp: '技術',
      def: 'Application of scientific knowledge',
      abs: 10,
      diff: 6,
      reqLevel: 7,
    },
    {
      id: 'computer',
      word: 'computer',
      jp: 'コンピュータ',
      def: 'Electronic device for data processing',
      abs: 8,
      diff: 6,
      reqLevel: 7,
      parent: 'technology',
    },
    {
      id: 'smartphone',
      word: 'smartphone',
      jp: 'スマホ',
      def: 'Mobile phone with computer features',
      abs: 6,
      diff: 6,
      reqLevel: 7,
      parent: 'computer',
    },
    {
      id: 'clothes',
      word: 'clothes',
      jp: '服',
      def: 'Items worn to cover the body',
      abs: 9,
      diff: 7,
      reqLevel: 8,
    },
    {
      id: 'shoe',
      word: 'shoe',
      jp: '靴',
      def: 'A covering for the foot',
      abs: 5,
      diff: 7,
      reqLevel: 8,
      parent: 'clothes',
    },
    {
      id: 'art',
      word: 'art',
      jp: '芸術',
      def: 'Expression of creative skill',
      abs: 10,
      diff: 8,
      reqLevel: 9,
    },
    {
      id: 'music',
      word: 'music',
      jp: '音楽',
      def: 'Vocal or instrumental sounds',
      abs: 8,
      diff: 8,
      reqLevel: 9,
      parent: 'art',
    },
    {
      id: 'science',
      word: 'science',
      jp: '科学',
      def: 'Study of the physical and natural world',
      abs: 10,
      diff: 9,
      reqLevel: 10,
    },
    {
      id: 'space',
      word: 'space',
      jp: '宇宙',
      def: 'Physical universe beyond earth',
      abs: 7,
      diff: 9,
      reqLevel: 10,
      parent: 'science',
    },
  ];

  const vocabMap = new Map();
  for (const v of vData) {
    let parentId = undefined;
    if (v.parent) {
      parentId = vocabMap.get(v.parent).id;
    }
    const node = await prisma.vocabularyNode.create({
      data: {
        word: v.word,
        japaneseMeaning: v.jp,
        definition: v.def,
        abstractionLevel: v.abs,
        difficulty: v.diff,
        requiredPlayerLevel: v.reqLevel,
        parentId,
      },
    });
    vocabMap.set(v.id, node);
  }

  const createQuest = async (
    title: string,
    desc: string,
    qType: string,
    level: number,
    diff: number,
    xp: number,
    questions: {
      text: string;
      targetId: string;
      correctWord: string;
      exp: string;
      options: { word: string; id?: string }[];
    }[]
  ) => {
    const quest = await prisma.quest.create({
      data: {
        title,
        description: desc,
        questType: qType,
        requiredLevel: level,
        difficulty: diff,
        baseXpReward: xp,
        questionCount: questions.length,
        isActive: true,
      },
    });
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const createdQ = await prisma.question.create({
        data: {
          questId: quest.id,
          questionText: q.text,
          questionType: 'MULTIPLE_CHOICE',
          targetVocabularyId: vocabMap.get(q.targetId).id,
          explanation: q.exp,
          sortOrder: i + 1,
          timeLimitSeconds: 20,
        },
      });
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        await prisma.answerOption.create({
          data: {
            questionId: createdQ.id,
            text: opt.word,
            isCorrect: opt.word === q.correctWord,
            vocabularyNodeId: opt.id ? vocabMap.get(opt.id)?.id : undefined,
            sortOrder: j + 1,
          },
        });
      }
    }
  };

  await createQuest(
    '自然の学習',
    '自然に関連する基本的な単語を学ぼう',
    'GENERALIZE',
    1,
    1,
    100,
    [
      {
        text: '犬や猫などをまとめた動物全般を表す単語は？',
        targetId: 'animal',
        correctWord: 'animal',
        exp: 'animal(動物)はnature(自然)の一部です。',
        options: [
          { word: 'animal', id: 'animal' },
          { word: 'computer' },
          { word: 'house' },
          { word: 'vehicle' },
        ],
      },
      {
        text: '花や木などを表す単語は？',
        targetId: 'plant',
        correctWord: 'plant',
        exp: 'plant(植物)もnature(自然)の一部です。',
        options: [
          { word: 'plant', id: 'plant' },
          { word: 'animal' },
          { word: 'food' },
          { word: 'furniture' },
        ],
      },
    ]
  );

  await createQuest(
    '乗り物の学習',
    '様々な乗り物について学ぼう',
    'SPECIFY',
    1,
    1,
    120,
    [
      {
        text: '乗り物の中で、道路を走る４つの車輪があるものは？',
        targetId: 'car',
        correctWord: 'car',
        exp: 'car(車)はvehicle(乗り物)の具体例です。',
        options: [
          { word: 'car', id: 'car' },
          { word: 'doctor' },
          { word: 'dog' },
          { word: 'nature' },
        ],
      },
      {
        text: '線路の上を走る乗り物は？',
        targetId: 'train',
        correctWord: 'train',
        exp: 'train(電車)もvehicle(乗り物)の具体例です。',
        options: [
          { word: 'train', id: 'train' },
          { word: 'house' },
          { word: 'music' },
          { word: 'apple' },
        ],
      },
    ]
  );

  await createQuest(
    '共通する概念１',
    '複数の単語の上位概念を見つけよう',
    'COMMON_CONCEPT',
    1,
    2,
    150,
    [
      {
        text: 'car(車)やtrain(電車)の共通の上位概念は？',
        targetId: 'vehicle',
        correctWord: 'vehicle',
        exp: 'これらはvehicle(乗り物)というカテゴリーです。',
        options: [
          { word: 'vehicle', id: 'vehicle' },
          { word: 'animal' },
          { word: 'building' },
          { word: 'clothes' },
        ],
      },
      {
        text: 'animal(動物)やplant(植物)の共通の上位概念は？',
        targetId: 'nature',
        correctWord: 'nature',
        exp: 'これらはnature(自然)に含まれます。',
        options: [
          { word: 'nature', id: 'nature' },
          { word: 'vehicle' },
          { word: 'computer' },
          { word: 'food' },
        ],
      },
    ]
  );

  await createQuest(
    '食べ物と飲み物',
    '食事に関する単語を学ぼう',
    'GENERALIZE',
    2,
    2,
    200,
    [
      {
        text: 'りんごやみかんをまとめた果物を表す単語は？',
        targetId: 'fruit',
        correctWord: 'fruit',
        exp: 'fruit(果物)はfood(食べ物)の一種です。',
        options: [
          { word: 'fruit', id: 'fruit' },
          { word: 'animal' },
          { word: 'drink' },
          { word: 'vehicle' },
        ],
      },
      {
        text: '水やジュースなどを表す単語は？',
        targetId: 'drink',
        correctWord: 'drink',
        exp: 'drink(飲み物)もfood(食べ物)の一部と考えられます。',
        options: [
          { word: 'drink', id: 'drink' },
          { word: 'plant' },
          { word: 'fruit' },
          { word: 'building' },
        ],
      },
    ]
  );

  await createQuest(
    '食べ物の種類',
    '具体的な食べ物について学ぼう',
    'SPECIFY',
    2,
    2,
    250,
    [
      {
        text: 'fruit(果物)の中で、赤くて丸い一般的な果物は？',
        targetId: 'apple',
        correctWord: 'apple',
        exp: 'apple(りんご)はfruit(果物)の具体例です。',
        options: [
          { word: 'apple', id: 'apple' },
          { word: 'car' },
          { word: 'water' },
          { word: 'dog' },
        ],
      },
      {
        text: 'drink(飲み物)の中で、生命に不可欠な透明な液体は？',
        targetId: 'water',
        correctWord: 'water',
        exp: 'water(水)は最も基本的な飲み物です。',
        options: [
          { word: 'water', id: 'water' },
          { word: 'train' },
          { word: 'apple' },
          { word: 'plant' },
        ],
      },
    ]
  );

  await createQuest(
    '建物と家具',
    '住まいに関する単語を学ぼう',
    'GENERALIZE',
    3,
    3,
    300,
    [
      {
        text: '人が住むための家を表す単語は？',
        targetId: 'house',
        correctWord: 'house',
        exp: 'house(家)はbuilding(建物)の一種です。',
        options: [
          { word: 'house', id: 'house' },
          { word: 'nature' },
          { word: 'furniture' },
          { word: 'food' },
        ],
      },
      {
        text: 'ベッドや椅子などの家具を表す単語は？',
        targetId: 'furniture',
        correctWord: 'furniture',
        exp: 'furniture(家具)は家の中に置くものです。',
        options: [
          { word: 'furniture', id: 'furniture' },
          { word: 'chair' },
          { word: 'bed' },
          { word: 'water' },
        ],
      },
    ]
  );

  await createQuest(
    '家具の種類',
    '具体的な家具について学ぼう',
    'SPECIFY',
    3,
    3,
    350,
    [
      {
        text: 'furniture(家具)の中で、寝るために使うものは？',
        targetId: 'bed',
        correctWord: 'bed',
        exp: 'bed(ベッド)は家具の一つです。',
        options: [
          { word: 'bed', id: 'bed' },
          { word: 'house' },
          { word: 'apple' },
          { word: 'chair' },
        ],
      },
      {
        text: 'furniture(家具)の中で、座るために使うものは？',
        targetId: 'chair',
        correctWord: 'chair',
        exp: 'chair(椅子)も家具の一つです。',
        options: [
          { word: 'chair', id: 'chair' },
          { word: 'bed' },
          { word: 'building' },
          { word: 'animal' },
        ],
      },
    ]
  );

  await createQuest(
    '仕事について',
    '色々な仕事の単語を学ぼう',
    'SPECIFY',
    4,
    4,
    400,
    [
      {
        text: '病気の人を助ける仕事は？',
        targetId: 'doctor',
        correctWord: 'doctor',
        exp: 'doctor(医者)はjob(仕事)の具体例です。',
        options: [
          { word: 'doctor', id: 'doctor' },
          { word: 'teacher' },
          { word: 'house' },
          { word: 'food' },
        ],
      },
      {
        text: '学校で生徒に教える仕事は？',
        targetId: 'teacher',
        correctWord: 'teacher',
        exp: 'teacher(先生)はjob(仕事)の具体例です。',
        options: [
          { word: 'teacher', id: 'teacher' },
          { word: 'doctor' },
          { word: 'building' },
          { word: 'dog' },
        ],
      },
    ]
  );

  await createQuest(
    '共通する概念２',
    '仕事や家具の上位概念を見つけよう',
    'COMMON_CONCEPT',
    5,
    5,
    500,
    [
      {
        text: 'doctor(医者)やteacher(先生)に共通する言葉は？',
        targetId: 'job',
        correctWord: 'job',
        exp: 'これらはjob(仕事)の一種です。',
        options: [
          { word: 'job', id: 'job' },
          { word: 'nature' },
          { word: 'building' },
          { word: 'food' },
        ],
      },
      {
        text: 'bed(ベッド)やchair(椅子)に共通する言葉は？',
        targetId: 'furniture',
        correctWord: 'furniture',
        exp: 'これらはfurniture(家具)の一種です。',
        options: [
          { word: 'furniture', id: 'furniture' },
          { word: 'vehicle' },
          { word: 'fruit' },
          { word: 'job' },
        ],
      },
    ]
  );

  await createQuest(
    '感情の世界',
    '心の動きについて学ぼう',
    'SPECIFY',
    6,
    5,
    600,
    [
      {
        text: '笑ったり喜んだりする感情は？',
        targetId: 'joy',
        correctWord: 'joy',
        exp: 'joy(喜び)はfeeling(感情)の一種です。',
        options: [
          { word: 'joy', id: 'joy' },
          { word: 'vehicle' },
          { word: 'furniture' },
          { word: 'food' },
        ],
      },
      {
        text: 'joy(喜び)などの心の動きの上位概念は？',
        targetId: 'feeling',
        correctWord: 'feeling',
        exp: 'feeling(感情)は心の動き全体を指します。',
        options: [
          { word: 'feeling', id: 'feeling' },
          { word: 'technology' },
          { word: 'art' },
          { word: 'job' },
        ],
      },
    ]
  );

  await createQuest(
    '技術の進化',
    '便利な技術について学ぼう',
    'SPECIFY',
    7,
    6,
    700,
    [
      {
        text: 'データを計算・処理する電子機器は？',
        targetId: 'computer',
        correctWord: 'computer',
        exp: 'computer(コンピュータ)はtechnology(技術)の代表例です。',
        options: [
          { word: 'computer', id: 'computer' },
          { word: 'feeling' },
          { word: 'nature' },
          { word: 'animal' },
        ],
      },
      {
        text: '持ち運べる小型のコンピュータともいえる電話は？',
        targetId: 'smartphone',
        correctWord: 'smartphone',
        exp: 'smartphone(スマホ)は身近なコンピュータです。',
        options: [
          { word: 'smartphone', id: 'smartphone' },
          { word: 'apple' },
          { word: 'house' },
          { word: 'plant' },
        ],
      },
    ]
  );

  await createQuest(
    '服と靴',
    '身につけるものについて学ぼう',
    'GENERALIZE',
    8,
    7,
    800,
    [
      {
        text: 'Tシャツなどの体を覆うものは？',
        targetId: 'clothes',
        correctWord: 'clothes',
        exp: 'clothes(服)は身につけるものの総称です。',
        options: [
          { word: 'clothes', id: 'clothes' },
          { word: 'technology' },
          { word: 'building' },
          { word: 'food' },
        ],
      },
      {
        text: '足を守るために履くものは？',
        targetId: 'shoe',
        correctWord: 'shoe',
        exp: 'shoe(靴)も身につけるものの一つです。',
        options: [
          { word: 'shoe', id: 'shoe' },
          { word: 'smartphone' },
          { word: 'chair' },
          { word: 'water' },
        ],
      },
    ]
  );

  await createQuest('芸術', '音楽について学ぼう', 'GENERALIZE', 9, 8, 900, [
    {
      text: '絵画や音楽などの美しい表現の総称は？',
      targetId: 'art',
      correctWord: 'art',
      exp: 'art(芸術)は人間の創造的なスキルです。',
      options: [
        { word: 'art', id: 'art' },
        { word: 'computer' },
        { word: 'clothes' },
        { word: 'animal' },
      ],
    },
    {
      text: '楽器を使って演奏するものは？',
      targetId: 'music',
      correctWord: 'music',
      exp: 'music(音楽)はart(芸術)の一種です。',
      options: [
        { word: 'music', id: 'music' },
        { word: 'smartphone' },
        { word: 'doctor' },
        { word: 'bed' },
      ],
    },
  ]);

  await createQuest(
    '科学',
    '世界の仕組みについて学ぼう',
    'GENERALIZE',
    10,
    9,
    1000,
    [
      {
        text: '世界や自然の法則を研究する分野は？',
        targetId: 'science',
        correctWord: 'science',
        exp: 'science(科学)は知識の体系です。',
        options: [
          { word: 'science', id: 'science' },
          { word: 'art' },
          { word: 'clothes' },
          { word: 'feeling' },
        ],
      },
      {
        text: '地球の外に広がる世界を何という？',
        targetId: 'space',
        correctWord: 'space',
        exp: 'space(宇宙)は科学の探究対象の1つです。',
        options: [
          { word: 'space', id: 'space' },
          { word: 'music' },
          { word: 'shoe' },
          { word: 'computer' },
        ],
      },
    ]
  );

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
