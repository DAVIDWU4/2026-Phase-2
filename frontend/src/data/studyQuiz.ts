export interface QuizQuestion {
  id: string;
  /** Subject ids that can show this question; empty = any subject */
  subjects: string[];
  en: { q: string; options: string[]; correct: number; explain: string };
  zh: { q: string; options: string[]; correct: number; explain: string };
}

/** Compact local question bank for Study page practice while the timer runs. */
export const STUDY_QUIZ: QuizQuestion[] = [
  {
    id: 'math-1',
    subjects: ['math'],
    en: {
      q: 'What is 12 × 8?',
      options: ['86', '96', '108', '88'],
      correct: 1,
      explain: '12 × 8 = 96.',
    },
    zh: {
      q: '12 × 8 等于多少？',
      options: ['86', '96', '108', '88'],
      correct: 1,
      explain: '12 × 8 = 96。',
    },
  },
  {
    id: 'math-2',
    subjects: ['math'],
    en: {
      q: 'The square root of 81 is…',
      options: ['7', '8', '9', '10'],
      correct: 2,
      explain: '9 × 9 = 81.',
    },
    zh: {
      q: '81 的平方根是？',
      options: ['7', '8', '9', '10'],
      correct: 2,
      explain: '9 × 9 = 81。',
    },
  },
  {
    id: 'math-3',
    subjects: ['math'],
    en: {
      q: 'What is 25% of 200?',
      options: ['25', '40', '50', '75'],
      correct: 2,
      explain: '25% = 1/4, so 200 ÷ 4 = 50.',
    },
    zh: {
      q: '200 的 25% 是多少？',
      options: ['25', '40', '50', '75'],
      correct: 2,
      explain: '25% = 1/4，所以 200 ÷ 4 = 50。',
    },
  },
  {
    id: 'prog-1',
    subjects: ['programming'],
    en: {
      q: 'Which keyword declares a constant in JavaScript?',
      options: ['var', 'let', 'const', 'static'],
      correct: 2,
      explain: '`const` declares a block-scoped constant.',
    },
    zh: {
      q: 'JavaScript 中用哪个关键字声明常量？',
      options: ['var', 'let', 'const', 'static'],
      correct: 2,
      explain: '`const` 用于声明块级作用域常量。',
    },
  },
  {
    id: 'prog-2',
    subjects: ['programming'],
    en: {
      q: 'What does HTTP status 404 mean?',
      options: ['OK', 'Unauthorized', 'Not Found', 'Server Error'],
      correct: 2,
      explain: '404 means the resource was not found.',
    },
    zh: {
      q: 'HTTP 状态码 404 表示什么？',
      options: ['成功', '未授权', '未找到', '服务器错误'],
      correct: 2,
      explain: '404 表示请求的资源不存在。',
    },
  },
  {
    id: 'prog-3',
    subjects: ['programming'],
    en: {
      q: 'In Git, which command downloads remote updates?',
      options: ['git push', 'git pull', 'git commit', 'git init'],
      correct: 1,
      explain: '`git pull` fetches and merges remote changes.',
    },
    zh: {
      q: 'Git 中哪个命令拉取远程更新？',
      options: ['git push', 'git pull', 'git commit', 'git init'],
      correct: 1,
      explain: '`git pull` 用于拉取并合并远程更改。',
    },
  },
  {
    id: 'eng-1',
    subjects: ['english'],
    en: {
      q: 'Choose the correct form: She ____ to school every day.',
      options: ['go', 'goes', 'going', 'gone'],
      correct: 1,
      explain: 'Third-person singular present tense uses "goes".',
    },
    zh: {
      q: '选择正确形式：She ____ to school every day.',
      options: ['go', 'goes', 'going', 'gone'],
      correct: 1,
      explain: '第三人称单数一般现在时用 goes。',
    },
  },
  {
    id: 'eng-2',
    subjects: ['english'],
    en: {
      q: 'Synonym of "happy"?',
      options: ['sad', 'joyful', 'angry', 'tired'],
      correct: 1,
      explain: '"Joyful" means feeling happy.',
    },
    zh: {
      q: '"happy" 的近义词是？',
      options: ['难过', 'joyful（愉快）', '愤怒', '疲惫'],
      correct: 1,
      explain: 'joyful 表示愉快、高兴。',
    },
  },
  {
    id: 'eng-3',
    subjects: ['english'],
    en: {
      q: 'Past tense of "write"?',
      options: ['writed', 'wrote', 'written', 'writing'],
      correct: 1,
      explain: 'The simple past of write is wrote.',
    },
    zh: {
      q: '"write" 的过去式是？',
      options: ['writed', 'wrote', 'written', 'writing'],
      correct: 1,
      explain: 'write 的过去式是 wrote。',
    },
  },
  {
    id: 'sci-1',
    subjects: ['science'],
    en: {
      q: 'Water’s chemical formula is…',
      options: ['CO₂', 'H₂O', 'O₂', 'NaCl'],
      correct: 1,
      explain: 'Water is H₂O — two hydrogen, one oxygen.',
    },
    zh: {
      q: '水的化学式是？',
      options: ['CO₂', 'H₂O', 'O₂', 'NaCl'],
      correct: 1,
      explain: '水是 H₂O：两个氢原子和一个氧原子。',
    },
  },
  {
    id: 'sci-2',
    subjects: ['science'],
    en: {
      q: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
      correct: 1,
      explain: 'Mars appears reddish due to iron oxide.',
    },
    zh: {
      q: '哪颗行星被称为红色星球？',
      options: ['金星', '火星', '木星', '水星'],
      correct: 1,
      explain: '火星表面含氧化铁，呈红色。',
    },
  },
  {
    id: 'sci-3',
    subjects: ['science'],
    en: {
      q: 'Photosynthesis mainly happens in which plant part?',
      options: ['Roots', 'Flowers', 'Leaves', 'Seeds'],
      correct: 2,
      explain: 'Leaves contain chlorophyll for photosynthesis.',
    },
    zh: {
      q: '光合作用主要发生在植物的哪一部分？',
      options: ['根', '花', '叶', '种子'],
      correct: 2,
      explain: '叶片含叶绿素，是光合作用的主要场所。',
    },
  },
  {
    id: 'hist-1',
    subjects: ['history'],
    en: {
      q: 'The Great Wall is associated with which country?',
      options: ['Japan', 'China', 'India', 'Egypt'],
      correct: 1,
      explain: 'The Great Wall of China is a historic landmark.',
    },
    zh: {
      q: '长城主要与哪个国家相关？',
      options: ['日本', '中国', '印度', '埃及'],
      correct: 1,
      explain: '长城是中国著名的历史建筑。',
    },
  },
  {
    id: 'hist-2',
    subjects: ['history'],
    en: {
      q: 'Who was the first emperor of a unified China?',
      options: ['Liu Bang', 'Qin Shi Huang', 'Kublai Khan', 'Sun Yat-sen'],
      correct: 1,
      explain: 'Qin Shi Huang unified China in 221 BCE.',
    },
    zh: {
      q: '统一中国的第一位皇帝是？',
      options: ['刘邦', '秦始皇', '忽必烈', '孙中山'],
      correct: 1,
      explain: '秦始皇于公元前 221 年统一中国。',
    },
  },
  {
    id: 'hist-3',
    subjects: ['history'],
    en: {
      q: 'World War II ended in which year?',
      options: ['1918', '1939', '1945', '1950'],
      correct: 2,
      explain: 'WWII ended in 1945.',
    },
    zh: {
      q: '第二次世界大战结束于哪一年？',
      options: ['1918', '1939', '1945', '1950'],
      correct: 2,
      explain: '二战结束于 1945 年。',
    },
  },
  {
    id: 'art-1',
    subjects: ['art'],
    en: {
      q: 'Primary colors are…',
      options: ['Red, green, blue', 'Red, yellow, blue', 'Orange, purple, green', 'Black, white, gray'],
      correct: 1,
      explain: 'In traditional color theory: red, yellow, blue.',
    },
    zh: {
      q: '传统三原色是？',
      options: ['红绿蓝', '红黄蓝', '橙紫绿', '黑白灰'],
      correct: 1,
      explain: '传统色彩理论中的三原色是红、黄、蓝。',
    },
  },
  {
    id: 'art-2',
    subjects: ['art'],
    en: {
      q: 'Who painted the Mona Lisa?',
      options: ['Van Gogh', 'Picasso', 'Da Vinci', 'Monet'],
      correct: 2,
      explain: 'Leonardo da Vinci painted the Mona Lisa.',
    },
    zh: {
      q: '《蒙娜丽莎》的作者是？',
      options: ['梵高', '毕加索', '达·芬奇', '莫奈'],
      correct: 2,
      explain: '《蒙娜丽莎》由达·芬奇创作。',
    },
  },
  {
    id: 'art-3',
    subjects: ['art'],
    en: {
      q: 'A sketch is usually made with…',
      options: ['Clay', 'Pencil', 'Marble', 'Glass'],
      correct: 1,
      explain: 'Sketches are commonly drawn with pencil.',
    },
    zh: {
      q: '素描通常用什么工具完成？',
      options: ['黏土', '铅笔', '大理石', '玻璃'],
      correct: 1,
      explain: '素描常用铅笔完成。',
    },
  },
  {
    id: 'gen-1',
    subjects: [],
    en: {
      q: 'Pomodoro technique suggests focusing for about…',
      options: ['5 minutes', '25 minutes', '2 hours', '1 day'],
      correct: 1,
      explain: 'Classic Pomodoro cycles are about 25 minutes.',
    },
    zh: {
      q: '番茄工作法建议专注大约多久？',
      options: ['5 分钟', '25 分钟', '2 小时', '1 天'],
      correct: 1,
      explain: '经典番茄钟约为 25 分钟专注。',
    },
  },
  {
    id: 'gen-2',
    subjects: [],
    en: {
      q: 'A good study habit is to…',
      options: ['Only cram before exams', 'Review regularly', 'Never take breaks', 'Skip sleep'],
      correct: 1,
      explain: 'Regular review helps long-term memory.',
    },
    zh: {
      q: '好的学习习惯是？',
      options: ['只在考前突击', '定期复习', '从不休息', '熬夜学习'],
      correct: 1,
      explain: '定期复习有助于长期记忆。',
    },
  },
];

export function getQuizForSubject(subjectId: string): QuizQuestion[] {
  const specific = STUDY_QUIZ.filter(q => q.subjects.includes(subjectId));
  // Only fall back to general tips when a subject has no dedicated questions.
  if (specific.length > 0) return specific;
  return STUDY_QUIZ.filter(q => q.subjects.length === 0);
}
