import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, BarChart3, PlusCircle, ArrowLeft,
  CheckCircle, XCircle, RotateCcw, ChevronRight,
  Upload, Sparkles, Download, FileJson, KeyRound,
  X, AlertCircle, Eye, EyeOff, Shuffle, Menu
} from 'lucide-react';

// ============================================================
// カラー定数
// ============================================================
const C = {
  bg: '#F5F7FA', card: '#FFFFFF',
  text: '#1F2A44', textMuted: '#9CA3AF', textSub: '#6B7280',
  border: '#E5E7EB', borderLight: '#F1F3F7',
  primary: '#6366F1', primaryBg: '#EEF2FF', primaryH: '#4F46E5',
  g2Bg: '#D1FAE5', g2Text: '#059669',

  g1Bg: '#EDE9FE', g1Text: '#7C3AED',
  ok: '#10B981', okBg: '#ECFDF5',
  ng: '#EF4444', ngBg: '#FEF2F2',
  ai: '#8B5CF6', aiBg: '#F5F3FF', aiH: '#7C3AED',
};
const SH = '0 1px 3px rgba(15,23,42,0.05),0 1px 2px rgba(15,23,42,0.04)';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

// ============================================================
// 問題データ (SEED)
// ============================================================
const SEED_DATA = [
  {
    id: 'seed-001', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'There are several (   ) to consider before developing our company\'s new product.' },
      { speaker: 'B', text: 'Yes. We need to start by understanding and evaluating how the product fits the current market.' },
    ],
    questionText: null,
    questionJa: 'A：当社の新製品を開発する前に考慮すべき要素がいくつかある。\nB：そうだね。その製品が現在の市場にどう適合するか理解し、評価することから始める必要がある。',
    choices: [
      { key: '1', word: 'palaces',     meaning: '宮殿' },
      { key: '2', word: 'manuscripts', meaning: '(文芸の)原稿' },
      { key: '3', word: 'victims',     meaning: '犠牲者' },
      { key: '4', word: 'factors',     meaning: '要素' },
    ],
    answer: '4',
    explanation: '「新製品開発前に考慮すべき」ことだから、4 factors「要素」が文意に合う。1 palaces「宮殿」2 manuscripts「(文芸の)原稿」3 victims「犠牲者」。いずれも不適。',
    tags: [], addedAt: 1715000001000,
  },
  {
    id: 'seed-002', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'Was the committee held (   )?' },
      { speaker: 'B', text: 'Yes. We had one every two weeks.' },
    ],
    questionText: null,
    questionJa: 'A：委員会はよく開かれたのですか？\nB：ええ。2週間に一度でした。',
    choices: [
      { key: '1', word: 'frequently',  meaning: 'たびたび' },
      { key: '2', word: 'temporarily', meaning: '一時的に' },
      { key: '3', word: 'gradually',   meaning: '徐々に' },
      { key: '4', word: 'seriously',   meaning: '深刻に' },
    ],
    answer: '1',
    explanation: 'Bの答えから開催頻度をたずねているとわかるので、頻度を表す1 frequently「たびたび」が正解。2 temporarily「一時的に」3 gradually「徐々に」4 seriously「深刻に」で、いずれもBの答えと合わない。',
    tags: [], addedAt: 1715000002000,
  },
  {
    id: 'seed-003', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'This actress can play a wide (   ) of roles.',
    questionJa: 'この女優は幅広い役柄を演じることができる。',
    choices: [
      { key: '1', word: 'career', meaning: '経歴' },
      { key: '2', word: 'tone',   meaning: '調子' },
      { key: '3', word: 'range',  meaning: '範囲' },
      { key: '4', word: 'sketch', meaning: '素描' },
    ],
    answer: '3',
    explanation: '役柄の3 range「範囲」が広いということ。1 career「経歴」2 tone「調子」4 sketch「素描」で、いずれも役の幅広さを表さない。',
    tags: [], addedAt: 1715000003000,
  },
  {
    id: 'seed-004', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'Some of her new coach\'s advice just before the final seems to have a great (   ) to do with Naomi\'s victory in this tennis championship.',
    questionJa: '決勝戦直前の新コーチによる何らかの助言が、ナオミのこのテニス選手権勝利に大いに関係あるようだ。',
    choices: [
      { key: '1', word: 'deal',   meaning: 'こと・量' },
      { key: '2', word: 'relief', meaning: '安堵' },
      { key: '3', word: 'place',  meaning: '場所' },
      { key: '4', word: 'growth', meaning: '成長' },
    ],
    answer: '1',
    explanation: '1 deal が a great deal「多量、たくさん」の意味の熟語を形成し、have a great deal to do with 〜 で「〜に関して多大に影響する」という意味になる。',
    tags: [], addedAt: 1715000004000,
  },
  {
    id: 'seed-005', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'Experts at the art gallery believed the painting was a (   ) Rembrandt, but it had been replaced with a fake.',
    questionJa: '画廊の専門家は、その絵が本物のレンブラントだと信じたが、それは偽物と取り換えられていた。',
    choices: [
      { key: '1', word: 'severe',   meaning: '厳しい' },
      { key: '2', word: 'logical',  meaning: '論理的な' },
      { key: '3', word: 'genuine',  meaning: '本物の' },
      { key: '4', word: 'portable', meaning: '持ち運びできる' },
    ],
    answer: '3',
    explanation: 'fake「偽物」の反対語だから、3 genuine「本物の」が正解。1 severe「厳しい」2 logical「論理的な」4 portable「持ち運びできる」。いずれも不適。',
    tags: [], addedAt: 1715000005000,
  },
  {
    id: 'seed-006', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'When the manager asked Sarah about the current stock market, she answered (   ) because she was not sure if she was well informed.',
    questionJa: 'マネージャーがサラに現在の株式市場について尋ねた時、彼女は情報が十分かどうか確信が持てなかったため、ためらいがちに答えた。',
    choices: [
      { key: '1', word: 'academically', meaning: '学術的に' },
      { key: '2', word: 'hesitantly',   meaning: 'ためらいがちに' },
      { key: '3', word: 'spiritually',  meaning: '精神的に' },
      { key: '4', word: 'terribly',     meaning: 'ひどく' },
    ],
    answer: '2',
    explanation: '情報が十分かどうかわからないので、2 hesitantly「ためらいがちに」になる。1 academically「学術的に」3 spiritually「精神的に」4 terribly「ひどく」。いずれも文意と合わない。',
    tags: [], addedAt: 1715000006000,
  },
  {
    id: 'seed-007', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'I heard the company is planning to (   ) its operations to other countries.' },
      { speaker: 'B', text: 'Yes, they\'re looking at markets in Southeast Asia first.' },
    ],
    questionText: null,
    questionJa: 'A：会社が事業を他の国に拡大する計画だと聞きました。\nB：はい、まず東南アジア市場に注目しています。',
    choices: [
      { key: '1', word: 'expand',  meaning: '拡大する' },
      { key: '2', word: 'replace', meaning: '取り替える' },
      { key: '3', word: 'destroy', meaning: '破壊する' },
      { key: '4', word: 'ignore',  meaning: '無視する' },
    ],
    answer: '1',
    explanation: '会社の事業を他の国に広げることだから、1 expand「拡大する」が適切。2 replace「取り替える」3 destroy「破壊する」4 ignore「無視する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000007000,
  },
  {
    id: 'seed-008', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The scientist made a (   ) discovery that changed our understanding of the universe.',
    questionJa: 'その科学者は宇宙についての私たちの理解を変えた革命的な発見をした。',
    choices: [
      { key: '1', word: 'revolutionary', meaning: '革命的な' },
      { key: '2', word: 'temporary',     meaning: '一時的な' },
      { key: '3', word: 'harmful',       meaning: '有害な' },
      { key: '4', word: 'ordinary',      meaning: '普通の' },
    ],
    answer: '1',
    explanation: '宇宙理解を「変えた」発見だから、1 revolutionary「革命的な」が適切。2 temporary「一時的な」3 harmful「有害な」4 ordinary「普通の」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000008000,
  },
  {
    id: 'seed-009', source: 'builtin', grade: 'grade1',
    dialogueLines: null,
    questionText: 'The government decided to (   ) the use of single-use plastics in order to protect the environment.',
    questionJa: '政府は環境を守るために、使い捨てプラスチックの使用を禁止することを決定した。',
    choices: [
      { key: '1', word: 'prohibit',  meaning: '禁止する' },
      { key: '2', word: 'promote',   meaning: '促進する' },
      { key: '3', word: 'postpone',  meaning: '延期する' },
      { key: '4', word: 'preserve',  meaning: '保護する' },
    ],
    answer: '1',
    explanation: '「環境を守るために」使い捨てプラスチック使用を「禁止」することだから、1 prohibit が正解。2 promote「促進する」3 postpone「延期する」4 preserve「保護する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000009000,
  },
  {
    id: 'seed-010', source: 'builtin', grade: 'grade1',
    dialogueLines: [
      { speaker: 'A', text: 'The report says the company\'s profits have been (   ) declining for three consecutive years.' },
      { speaker: 'B', text: 'That\'s concerning. They need to change their strategy soon.' },
    ],
    questionText: null,
    questionJa: 'A：報告書によると、会社の利益は3年連続で着実に減少しているそうです。\nB：それは心配ですね。早急に戦略を変える必要があります。',
    choices: [
      { key: '1', word: 'steadily',    meaning: '着実に' },
      { key: '2', word: 'randomly',    meaning: 'ランダムに' },
      { key: '3', word: 'cheerfully',  meaning: '明るく' },
      { key: '4', word: 'accidentally',meaning: '偶然に' },
    ],
    answer: '1',
    explanation: '3年連続という文脈から、1 steadily「着実に」が正解。2 randomly「ランダムに」3 cheerfully「明るく」4 accidentally「偶然に」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000010000,
  },
  {
    id: 'seed-011', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'I\'ve heard the city is planning to (   ) the old bridge next year.' },
      { speaker: 'B', text: 'Yes, it\'s been there for over 100 years, so it needs to be rebuilt.' },
    ],
    questionText: null,
    questionJa: 'A：市は来年、あの古い橋を取り壊す計画だと聞きました。\nB：そうですね。100年以上経っているので、建て替えが必要です。',
    choices: [
      { key: '1', word: 'demolish',  meaning: '取り壊す' },
      { key: '2', word: 'celebrate', meaning: '祝う' },
      { key: '3', word: 'purchase',  meaning: '購入する' },
      { key: '4', word: 'classify',  meaning: '分類する' },
    ],
    answer: '1',
    explanation: '100年以上経った古い橋を「取り壊す」計画だから、1 demolish「取り壊す」が正解。2 celebrate「祝う」3 purchase「購入する」4 classify「分類する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000011000,
  },
  {
    id: 'seed-012', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The new employee showed great (   ) in learning the company\'s systems in just one week.',
    questionJa: '新入社員はわずか1週間で会社のシステムを習得し、非常に高い効率を示した。',
    choices: [
      { key: '1', word: 'efficiency', meaning: '効率' },
      { key: '2', word: 'jealousy',   meaning: '嫉妬' },
      { key: '3', word: 'darkness',   meaning: '暗さ' },
      { key: '4', word: 'hunger',     meaning: '空腹' },
    ],
    answer: '1',
    explanation: '1週間でシステムを習得したことへの評価だから、1 efficiency「効率」が正解。2 jealousy「嫉妬」3 darkness「暗さ」4 hunger「空腹」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000012000,
  },
  {
    id: 'seed-013', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'Why did you choose this (   ) neighborhood to open your restaurant?' },
      { speaker: 'B', text: 'Because many young families live here, and there\'s not much competition.' },
    ],
    questionText: null,
    questionJa: 'A：なぜこの特定の地域にレストランを開くことにしたのですか？\nB：若い家族が多く住んでいて、競合が少ないからです。',
    choices: [
      { key: '1', word: 'particular', meaning: '特定の' },
      { key: '2', word: 'ancient',    meaning: '古代の' },
      { key: '3', word: 'dangerous',  meaning: '危険な' },
      { key: '4', word: 'invisible',  meaning: '見えない' },
    ],
    answer: '1',
    explanation: '「なぜこの地域を選んだか」と特定の場所を指して質問しているから、1 particular「特定の」が正解。2 ancient「古代の」3 dangerous「危険な」4 invisible「見えない」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000013000,
  },
  {
    id: 'seed-014', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The drought had a severe (   ) on crop production in the region this summer.',
    questionJa: 'その干ばつは今夏、この地域の農作物生産に深刻な影響を与えた。',
    choices: [
      { key: '1', word: 'impact',  meaning: '影響' },
      { key: '2', word: 'hobby',   meaning: '趣味' },
      { key: '3', word: 'flavor',  meaning: '風味' },
      { key: '4', word: 'silence', meaning: '沈黙' },
    ],
    answer: '1',
    explanation: '干ばつが農作物生産に与えた「影響」だから、1 impact「影響」が正解。have an impact on 〜「〜に影響を与える」という熟語。2 hobby「趣味」3 flavor「風味」4 silence「沈黙」はいずれも不適。',
    tags: [], addedAt: 1715000014000,
  },
  {
    id: 'seed-015', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'Did you manage to (   ) a hotel room for the conference next month?' },
      { speaker: 'B', text: 'Yes, I booked one near the venue this morning.' },
    ],
    questionText: null,
    questionJa: 'A：来月の会議のためにホテルの部屋を予約できましたか？\nB：はい、今朝、会場近くのホテルを予約しました。',
    choices: [
      { key: '1', word: 'reserve', meaning: '予約する' },
      { key: '2', word: 'pretend', meaning: 'ふりをする' },
      { key: '3', word: 'punish',  meaning: '罰する' },
      { key: '4', word: 'exhaust', meaning: '消耗させる' },
    ],
    answer: '1',
    explanation: 'Bが「予約した」と答えていることから、1 reserve「予約する」が正解。2 pretend「ふりをする」3 punish「罰する」4 exhaust「消耗させる」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000015000,
  },
  {
    id: 'seed-016', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'She decided to (   ) her career from teaching to working in the technology industry.',
    questionJa: '彼女は教職からテクノロジー業界へキャリアを切り替えることを決めた。',
    choices: [
      { key: '1', word: 'switch',   meaning: '切り替える' },
      { key: '2', word: 'freeze',   meaning: '凍らせる' },
      { key: '3', word: 'decorate', meaning: '飾る' },
      { key: '4', word: 'whisper',  meaning: 'ささやく' },
    ],
    answer: '1',
    explanation: '教職からIT業界へキャリアを「切り替える」ことだから、1 switch「切り替える」が正解。2 freeze「凍らせる」3 decorate「飾る」4 whisper「ささやく」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000016000,
  },
  {
    id: 'seed-017', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The mayor announced a new (   ) to improve public transportation in the city.',
    questionJa: '市長は市内の公共交通機関を改善するための新しい取り組みを発表した。',
    choices: [
      { key: '1', word: 'initiative', meaning: '取り組み' },
      { key: '2', word: 'obstacle',   meaning: '障害' },
      { key: '3', word: 'exception',  meaning: '例外' },
      { key: '4', word: 'tradition',  meaning: '伝統' },
    ],
    answer: '1',
    explanation: '公共交通を改善するために市長が発表した新しい「取り組み」だから、1 initiative「取り組み」が正解。2 obstacle「障害」3 exception「例外」4 tradition「伝統」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000017000,
  },
  {
    id: 'seed-018', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'The professor always gives very (   ) feedback on our essays.' },
      { speaker: 'B', text: 'I know. Her detailed comments really help me improve my writing.' },
    ],
    questionText: null,
    questionJa: 'A：あの教授はいつも私たちのエッセイにとても建設的なフィードバックをくれます。\nB：そうですね。彼女の詳細なコメントは本当にライティング上達の助けになります。',
    choices: [
      { key: '1', word: 'constructive', meaning: '建設的な' },
      { key: '2', word: 'careless',     meaning: '不注意な' },
      { key: '3', word: 'ancient',      meaning: '古代の' },
      { key: '4', word: 'narrow',       meaning: '狭い' },
    ],
    answer: '1',
    explanation: 'Bが「詳細なコメントが役立つ」と言っていることから、1 constructive「建設的な」フィードバックが正解。2 careless「不注意な」3 ancient「古代の」4 narrow「狭い」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000018000,
  },
  {
    id: 'seed-019', source: 'builtin', grade: 'grade1',
    dialogueLines: null,
    questionText: 'The politician\'s speech was criticized for being (   ), as it lacked any specific solutions to the problems discussed.',
    questionJa: 'その政治家の演説は、議論された問題に対する具体的な解決策が欠けていたとして、漠然としていると批判された。',
    choices: [
      { key: '1', word: 'vague',         meaning: '漠然とした' },
      { key: '2', word: 'persuasive',    meaning: '説得力のある' },
      { key: '3', word: 'comprehensive', meaning: '包括的な' },
      { key: '4', word: 'diplomatic',    meaning: '外交的な' },
    ],
    answer: '1',
    explanation: '「具体的な解決策がない」という批判内容から、1 vague「漠然とした」が正解。2 persuasive「説得力のある」3 comprehensive「包括的な」4 diplomatic「外交的な」はいずれも批判の内容と合わない。',
    tags: [], addedAt: 1715000019000,
  },
  {
    id: 'seed-020', source: 'builtin', grade: 'grade1',
    dialogueLines: [
      { speaker: 'A', text: 'The new policy is expected to (   ) the economic gap between wealthy and poor regions.' },
      { speaker: 'B', text: 'I hope so. The difference has been growing for decades.' },
    ],
    questionText: null,
    questionJa: 'A：新しい政策は豊かな地域と貧しい地域の経済格差を緩和することが期待されています。\nB：そうだといいですね。その差は数十年にわたって広がり続けています。',
    choices: [
      { key: '1', word: 'alleviate',   meaning: '緩和する' },
      { key: '2', word: 'accelerate',  meaning: '加速する' },
      { key: '3', word: 'contaminate', meaning: '汚染する' },
      { key: '4', word: 'manipulate',  meaning: '操作する' },
    ],
    answer: '1',
    explanation: '経済格差が広がり続けている文脈で「緩和する」ことが期待されているから、1 alleviate「緩和する」が正解。2 accelerate「加速する」3 contaminate「汚染する」4 manipulate「操作する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000020000,
  },
  {
    id: 'seed-021', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'I heard the factory had to (   ) production last month due to a shortage of materials.' },
      { speaker: 'B', text: 'Yes, they couldn\'t get enough parts from their suppliers.' },
    ],
    questionText: null,
    questionJa: 'A：先月、工場は材料不足のため生産を一時停止しなければならなかったと聞きました。\nB：はい、サプライヤーから十分な部品を調達できなかったのです。',
    choices: [
      { key: '1', word: 'suspend',  meaning: '一時停止する' },
      { key: '2', word: 'increase', meaning: '増加させる' },
      { key: '3', word: 'announce', meaning: '発表する' },
      { key: '4', word: 'admire',   meaning: '称賛する' },
    ],
    answer: '1',
    explanation: '材料不足を理由にBも部品が足りなかったと述べているから、1 suspend「一時停止する」が正解。2 increase「増加させる」3 announce「発表する」4 admire「称賛する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000021000,
  },
  {
    id: 'seed-022', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The charity event raised enough money to (   ) a new community center in the town.',
    questionJa: 'チャリティーイベントで集まった資金は、町に新しいコミュニティーセンターを建設するのに十分な額だった。',
    choices: [
      { key: '1', word: 'construct', meaning: '建設する' },
      { key: '2', word: 'abandon',   meaning: '放棄する' },
      { key: '3', word: 'borrow',    meaning: '借りる' },
      { key: '4', word: 'frighten',  meaning: '怖がらせる' },
    ],
    answer: '1',
    explanation: 'チャリティーで集まった資金でコミュニティーセンターを「建設する」ことだから、1 construct「建設する」が正解。2 abandon「放棄する」3 borrow「借りる」4 frighten「怖がらせる」はいずれも不適。',
    tags: [], addedAt: 1715000022000,
  },
  {
    id: 'seed-023', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'The new traffic regulations came into (   ) starting from April 1st.' },
      { speaker: 'B', text: 'I see. I need to read through them carefully before driving again.' },
    ],
    questionText: null,
    questionJa: 'A：新しい交通規制は4月1日から施行されました。\nB：なるほど。また運転する前にしっかり読まなければいけませんね。',
    choices: [
      { key: '1', word: 'effect',   meaning: '効力' },
      { key: '2', word: 'silence',  meaning: '沈黙' },
      { key: '3', word: 'pressure', meaning: '圧力' },
      { key: '4', word: 'comfort',  meaning: '快適さ' },
    ],
    answer: '1',
    explanation: 'come into effect で「施行される、発効する」という熟語。1 effect「効力」が正解。2 silence「沈黙」3 pressure「圧力」4 comfort「快適さ」では熟語が成立しない。',
    tags: [], addedAt: 1715000023000,
  },
  {
    id: 'seed-024', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The project manager asked everyone to submit their reports by Friday to avoid any (   ) in the schedule.',
    questionJa: 'プロジェクトマネージャーはスケジュールの遅れを避けるため、全員に金曜日までに報告書を提出するよう求めた。',
    choices: [
      { key: '1', word: 'delays',    meaning: '遅れ' },
      { key: '2', word: 'rewards',   meaning: '報酬' },
      { key: '3', word: 'memories',  meaning: '記憶' },
      { key: '4', word: 'accidents', meaning: '事故' },
    ],
    answer: '1',
    explanation: '期限を設けてスケジュールの「遅れ」を避けようとしているから、1 delays「遅れ」が正解。2 rewards「報酬」3 memories「記憶」4 accidents「事故」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000024000,
  },
  {
    id: 'seed-025', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'Have you read the (   ) for the new product launch event?' },
      { speaker: 'B', text: 'Not yet. When does it start and where will it be held?' },
    ],
    questionText: null,
    questionJa: 'A：新製品発表イベントの案内を読みましたか？\nB：まだです。いつ始まって、どこで開催されるのですか？',
    choices: [
      { key: '1', word: 'notice',    meaning: '案内・通知' },
      { key: '2', word: 'weakness',  meaning: '弱点' },
      { key: '3', word: 'landscape', meaning: '景色' },
      { key: '4', word: 'penalty',   meaning: '罰則' },
    ],
    answer: '1',
    explanation: 'Bが「いつ・どこで」と聞いていることから、日時・場所などが書かれた「案内・通知」だとわかるので、1 notice が正解。2 weakness「弱点」3 landscape「景色」4 penalty「罰則」はいずれも不適。',
    tags: [], addedAt: 1715000025000,
  },
  {
    id: 'seed-026', source: 'builtin', grade: 'grade1',
    dialogueLines: null,
    questionText: 'The researcher\'s findings were (   ) by several independent studies, strengthening confidence in the original results.',
    questionJa: 'その研究者の発見は複数の独立した研究によって裏付けられ、元の結果への信頼が高まった。',
    choices: [
      { key: '1', word: 'corroborated', meaning: '裏付けられた' },
      { key: '2', word: 'undermined',   meaning: '損なわれた' },
      { key: '3', word: 'exaggerated',  meaning: '誇張された' },
      { key: '4', word: 'suspended',    meaning: '一時停止された' },
    ],
    answer: '1',
    explanation: '「信頼が高まった」とあるから、結果が「裏付けられた」ことになり、1 corroborated が正解。2 undermined「損なわれた」3 exaggerated「誇張された」4 suspended「一時停止された」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000026000,
  },
  {
    id: 'seed-027', source: 'builtin', grade: 'grade1',
    dialogueLines: [
      { speaker: 'A', text: 'The documentary revealed that the company had been (   ) dumping waste into the river for years.' },
      { speaker: 'B', text: 'That\'s outrageous. There should be serious legal consequences for that.' },
    ],
    questionText: null,
    questionJa: 'A：そのドキュメンタリーは、その会社が数年間にわたって密かに廃棄物を川に投棄していたことを暴露した。\nB：それはひどい。それに対して深刻な法的制裁があるべきです。',
    choices: [
      { key: '1', word: 'covertly',    meaning: '密かに' },
      { key: '2', word: 'generously',  meaning: '寛大に' },
      { key: '3', word: 'brilliantly', meaning: '華やかに' },
      { key: '4', word: 'casually',    meaning: '何気なく' },
    ],
    answer: '1',
    explanation: 'ドキュメンタリーで「暴露された」という文脈から、不正行為が「密かに」行われていたことがわかるので、1 covertly が正解。2 generously「寛大に」3 brilliantly「華やかに」4 casually「何気なく」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000027000,
  },
  {
    id: 'seed-028', source: 'builtin', grade: 'grade1',
    dialogueLines: null,
    questionText: 'The company\'s attempt to (   ) the two rival brands under one corporate identity proved more difficult than expected.',
    questionJa: '2つのライバルブランドを一つの企業アイデンティティに統合しようとするその会社の試みは、予想以上に困難であることが判明した。',
    choices: [
      { key: '1', word: 'merge',     meaning: '統合する' },
      { key: '2', word: 'condemn',   meaning: '非難する' },
      { key: '3', word: 'paralyze',  meaning: '麻痺させる' },
      { key: '4', word: 'withstand', meaning: '耐える' },
    ],
    answer: '1',
    explanation: '2つのブランドを「一つの企業アイデンティティに統合する」ことだから、1 merge「統合する」が正解。2 condemn「非難する」3 paralyze「麻痺させる」4 withstand「耐える」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000028000,
  },
  {
    id: 'seed-029', source: 'builtin', grade: 'grade1',
    dialogueLines: [
      { speaker: 'A', text: 'The new tax policy has drawn (   ) criticism from economists across the political spectrum.' },
      { speaker: 'B', text: 'Yes, it seems rare for such a wide range of experts to agree on anything.' },
    ],
    questionText: null,
    questionJa: 'A：新しい税制は、政治的立場を超えた経済学者たちから幅広い批判を集めています。\nB：そうですね。これほど幅広い専門家が何かについて一致することはまれです。',
    choices: [
      { key: '1', word: 'widespread',  meaning: '広範な' },
      { key: '2', word: 'trivial',     meaning: '取るに足らない' },
      { key: '3', word: 'reluctant',   meaning: '気乗りのしない' },
      { key: '4', word: 'anonymous',   meaning: '匿名の' },
    ],
    answer: '1',
    explanation: '「政治的立場を超えた」幅広い批判という文脈から、1 widespread「広範な」が正解。2 trivial「取るに足らない」3 reluctant「気乗りのしない」4 anonymous「匿名の」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000029000,
  },
  {
    id: 'seed-030', source: 'builtin', grade: 'grade1',
    dialogueLines: null,
    questionText: 'Despite facing intense (   ) from larger companies, the startup managed to secure a loyal customer base through innovation.',
    questionJa: '大企業からの激しい競争にもかかわらず、そのスタートアップは革新によって忠実な顧客基盤を確保することに成功した。',
    choices: [
      { key: '1', word: 'competition', meaning: '競争' },
      { key: '2', word: 'affection',   meaning: '愛情' },
      { key: '3', word: 'obedience',   meaning: '服従' },
      { key: '4', word: 'sympathy',    meaning: '同情' },
    ],
    answer: '1',
    explanation: '大企業から受ける「競争」の中でも顧客を確保したという対比構造だから、1 competition「競争」が正解。2 affection「愛情」3 obedience「服従」4 sympathy「同情」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000030000,
  },
  // ---- 英検1級 追加10問（seed-031〜040） ----
  {
    id: 'seed-031', source: 'builtin', grade: 'grade1',
    dialogueLines: null,
    questionText: 'Despite the many obstacles, the scientists continued to (   ) to find a cure for the disease.',
    questionJa: '数多くの障害にもかかわらず、科学者たちはその病気の治療法を見つけようと努力し続けた。',
    choices: [
      { key: '1', word: 'endeavor',  meaning: '努力する' },
      { key: '2', word: 'surrender', meaning: '降参する' },
      { key: '3', word: 'confuse',   meaning: '混乱させる' },
      { key: '4', word: 'retreat',   meaning: '撤退する' },
    ],
    answer: '1',
    explanation: '「障害にもかかわらず続けた」という文脈から、1 endeavor「努力する」が正解。2 surrender「降参する」3 confuse「混乱させる」4 retreat「撤退する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000031000,
  },
  {
    id: 'seed-032', source: 'builtin', grade: 'grade1',
    dialogueLines: null,
    questionText: 'The auditors were asked to (   ) every financial record before issuing the annual report.',
    questionJa: '監査人は年次報告書を発行する前にすべての財務記録を精査するよう求められた。',
    choices: [
      { key: '1', word: 'scrutinize', meaning: '精査する' },
      { key: '2', word: 'overlook',   meaning: '見落とす' },
      { key: '3', word: 'fabricate',  meaning: '捏造する' },
      { key: '4', word: 'ignore',     meaning: '無視する' },
    ],
    answer: '1',
    explanation: '年次報告書発行前に財務記録をしっかり調べることだから、1 scrutinize「精査する」が正解。2 overlook「見落とす」3 fabricate「捏造する」4 ignore「無視する」はいずれも不適。',
    tags: [], addedAt: 1715000032000,
  },
  {
    id: 'seed-033', source: 'builtin', grade: 'grade1',
    dialogueLines: [
      { speaker: 'A', text: 'The senator was known for giving (   ) speeches that inspired the audience to take action.' },
      { speaker: 'B', text: 'Indeed. His words always moved people in a way that few politicians could.' },
    ],
    questionText: null,
    questionJa: 'A：その上院議員は、聴衆に行動を促す雄弁な演説で知られていた。\nB：まさに。彼の言葉はほとんどの政治家にはできない方法で人々を動かした。',
    choices: [
      { key: '1', word: 'eloquent',   meaning: '雄弁な' },
      { key: '2', word: 'monotonous', meaning: '単調な' },
      { key: '3', word: 'hostile',    meaning: '敵対的な' },
      { key: '4', word: 'ambiguous',  meaning: '曖昧な' },
    ],
    answer: '1',
    explanation: '聴衆を行動に駆り立てBも人々を動かしたと言っていることから、1 eloquent「雄弁な」が正解。2 monotonous「単調な」3 hostile「敵対的な」4 ambiguous「曖昧な」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000033000,
  },
  {
    id: 'seed-034', source: 'builtin', grade: 'grade1',
    dialogueLines: null,
    questionText: 'The rapid rise of social media has brought about (   ) changes in the way people communicate.',
    questionJa: 'ソーシャルメディアの急速な台頭は、人々のコミュニケーション方法に前例のない変化をもたらした。',
    choices: [
      { key: '1', word: 'unprecedented', meaning: '前例のない' },
      { key: '2', word: 'predictable',   meaning: '予測可能な' },
      { key: '3', word: 'conventional',  meaning: '従来の' },
      { key: '4', word: 'negligible',    meaning: '取るに足らない' },
    ],
    answer: '1',
    explanation: '「急速な台頭」という文脈で変化の大きさを強調しているから、1 unprecedented「前例のない」が正解。2 predictable「予測可能な」3 conventional「従来の」4 negligible「取るに足らない」はいずれも不適。',
    tags: [], addedAt: 1715000034000,
  },
  {
    id: 'seed-035', source: 'builtin', grade: 'grade1',
    dialogueLines: [
      { speaker: 'A', text: 'The mediator worked hard to (   ) the two feuding parties after months of dispute.' },
      { speaker: 'B', text: 'Yes, it took a lot of patience and compromise on both sides.' },
    ],
    questionText: null,
    questionJa: 'A：調停者は、数か月の紛争の後、対立する両者を和解させようと懸命に取り組んだ。\nB：そうですね。双方に多くの忍耐と妥協が必要でした。',
    choices: [
      { key: '1', word: 'reconcile',  meaning: '和解させる' },
      { key: '2', word: 'provoke',    meaning: '挑発する' },
      { key: '3', word: 'alienate',   meaning: '遠ざける' },
      { key: '4', word: 'intimidate', meaning: '脅す' },
    ],
    answer: '1',
    explanation: '調停者が対立する両者に働きかけBも妥協が必要と言っていることから、1 reconcile「和解させる」が正解。2 provoke「挑発する」3 alienate「遠ざける」4 intimidate「脅す」はいずれも対立を深める意味で不適。',
    tags: [], addedAt: 1715000035000,
  },
  {
    id: 'seed-036', source: 'builtin', grade: 'grade1',
    dialogueLines: null,
    questionText: 'Excessive consumption of processed foods is (   ) to long-term health, according to recent studies.',
    questionJa: '最近の研究によると、加工食品の過剰摂取は長期的な健康に有害である。',
    choices: [
      { key: '1', word: 'detrimental', meaning: '有害な' },
      { key: '2', word: 'beneficial',  meaning: '有益な' },
      { key: '3', word: 'indifferent', meaning: '無関係な' },
      { key: '4', word: 'essential',   meaning: '不可欠な' },
    ],
    answer: '1',
    explanation: '「過剰摂取が健康に」という文脈と研究の結論から、1 detrimental「有害な」が正解。2 beneficial「有益な」3 indifferent「無関係な」4 essential「不可欠な」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000036000,
  },
  {
    id: 'seed-037', source: 'builtin', grade: 'grade1',
    dialogueLines: [
      { speaker: 'A', text: 'The new CEO is known for taking a (   ) approach, focusing on what actually works rather than ideals.' },
      { speaker: 'B', text: 'That\'s refreshing. Theory is important, but results matter most in business.' },
    ],
    questionText: null,
    questionJa: 'A：新CEOは理想よりも実際に機能することに焦点を当てた実用的なアプローチで知られている。\nB：それは新鮮ですね。理論は大切ですが、ビジネスでは結果が最も重要です。',
    choices: [
      { key: '1', word: 'pragmatic',  meaning: '実用的な' },
      { key: '2', word: 'idealistic', meaning: '理想主義的な' },
      { key: '3', word: 'reckless',   meaning: '無謀な' },
      { key: '4', word: 'passive',    meaning: '受動的な' },
    ],
    answer: '1',
    explanation: '「理想よりも実際に機能すること」に着目しているから、1 pragmatic「実用的な」が正解。2 idealistic「理想主義的な」は逆の意味。3 reckless「無謀な」4 passive「受動的な」も不適。',
    tags: [], addedAt: 1715000037000,
  },
  {
    id: 'seed-038', source: 'builtin', grade: 'grade1',
    dialogueLines: null,
    questionText: 'Given the aging population, an increase in healthcare costs seems (   ) in the coming decades.',
    questionJa: '高齢化社会を考えると、今後数十年で医療費の増加は避けられないように思われる。',
    choices: [
      { key: '1', word: 'inevitable',  meaning: '避けられない' },
      { key: '2', word: 'reversible',  meaning: '元に戻せる' },
      { key: '3', word: 'voluntary',   meaning: '自発的な' },
      { key: '4', word: 'negligible',  meaning: '取るに足らない' },
    ],
    answer: '1',
    explanation: '高齢化という構造的要因から医療費増加を「避けられない」と述べているから、1 inevitable が正解。2 reversible「元に戻せる」3 voluntary「自発的な」4 negligible「取るに足らない」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000038000,
  },
  {
    id: 'seed-039', source: 'builtin', grade: 'grade1',
    dialogueLines: null,
    questionText: 'Young children are particularly (   ) to the influence of advertising because they cannot yet distinguish it from regular content.',
    questionJa: '幼い子どもたちは通常のコンテンツと広告を区別できないため、広告の影響を特に受けやすい。',
    choices: [
      { key: '1', word: 'susceptible', meaning: '影響を受けやすい' },
      { key: '2', word: 'immune',      meaning: '免疫がある' },
      { key: '3', word: 'resistant',   meaning: '抵抗力のある' },
      { key: '4', word: 'indifferent', meaning: '無関心な' },
    ],
    answer: '1',
    explanation: '広告と通常コンテンツを区別できないため影響を受けやすいという文脈から、1 susceptible「影響を受けやすい」が正解。2 immune「免疫がある」3 resistant「抵抗力のある」4 indifferent「無関心な」はいずれも反対の意味。',
    tags: [], addedAt: 1715000039000,
  },
  {
    id: 'seed-040', source: 'builtin', grade: 'grade1',
    dialogueLines: [
      { speaker: 'A', text: 'The philosopher challenged the widely held (   ) that happiness can be achieved through material wealth.' },
      { speaker: 'B', text: 'That\'s a profound point. Many people equate money with fulfillment, but it\'s not that simple.' },
    ],
    questionText: null,
    questionJa: 'A：その哲学者は、幸福が物質的豊かさによって達成できるという広く信じられている概念に異議を唱えた。\nB：深い指摘ですね。多くの人がお金と充実感を結びつけますが、そう単純ではありません。',
    choices: [
      { key: '1', word: 'notion',      meaning: '概念' },
      { key: '2', word: 'regulation',  meaning: '規制' },
      { key: '3', word: 'transaction', meaning: '取引' },
      { key: '4', word: 'obstacle',    meaning: '障害' },
    ],
    answer: '1',
    explanation: '幸福に関する「広く信じられていること」を哲学者が疑問視しているから、1 notion「概念」が正解。2 regulation「規制」3 transaction「取引」4 obstacle「障害」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000040000,
  },
  // ---- 英検2級 追加10問（seed-041〜050） ----
  {
    id: 'seed-041', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'Did you know that many students (   ) at the local food bank every weekend?' },
      { speaker: 'B', text: 'Yes, it\'s a great way to help the community and gain experience at the same time.' },
    ],
    questionText: null,
    questionJa: 'A：多くの学生が毎週末、地域のフードバンクでボランティア活動をしているのを知っていましたか？\nB：はい、地域を助けながら経験を積む素晴らしい方法ですね。',
    choices: [
      { key: '1', word: 'volunteer',  meaning: 'ボランティアをする' },
      { key: '2', word: 'compete',    meaning: '競争する' },
      { key: '3', word: 'complain',   meaning: '不満を言う' },
      { key: '4', word: 'hesitate',   meaning: 'ためらう' },
    ],
    answer: '1',
    explanation: 'フードバンクで地域を助ける活動をしているという文脈から、1 volunteer「ボランティアをする」が正解。2 compete「競争する」3 complain「不満を言う」4 hesitate「ためらう」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000041000,
  },
  {
    id: 'seed-042', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'It is important to (   ) a healthy diet and regular exercise to stay in good shape.',
    questionJa: '体調を維持するためには、健康的な食事と定期的な運動を続けることが重要だ。',
    choices: [
      { key: '1', word: 'maintain',  meaning: '維持する' },
      { key: '2', word: 'abandon',   meaning: '放棄する' },
      { key: '3', word: 'delay',     meaning: '遅らせる' },
      { key: '4', word: 'hide',      meaning: '隠す' },
    ],
    answer: '1',
    explanation: '「体調を維持するために」食事と運動を「続ける」ことだから、1 maintain「維持する」が正解。2 abandon「放棄する」3 delay「遅らせる」4 hide「隠す」はいずれも不適。',
    tags: [], addedAt: 1715000042000,
  },
  {
    id: 'seed-043', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The company did not provide (   ) training for new employees, so many of them felt unprepared.',
    questionJa: 'その会社は新入社員に十分な研修を提供しなかったため、多くの人が準備不足を感じた。',
    choices: [
      { key: '1', word: 'adequate',    meaning: '十分な' },
      { key: '2', word: 'excessive',   meaning: '過度な' },
      { key: '3', word: 'unnecessary', meaning: '不要な' },
      { key: '4', word: 'dangerous',   meaning: '危険な' },
    ],
    answer: '1',
    explanation: '研修不足で「準備不足を感じた」という結果から、1 adequate「十分な」研修が提供されなかったことがわかる。2 excessive「過度な」3 unnecessary「不要な」4 dangerous「危険な」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000043000,
  },
  {
    id: 'seed-044', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'I tried to (   ) my parents to let me study abroad, but they were hesitant at first.' },
      { speaker: 'B', text: 'Did it work? I hope they agreed in the end.' },
    ],
    questionText: null,
    questionJa: 'A：両親を説得して留学させてもらおうとしましたが、最初はためらっていました。\nB：うまくいきましたか？最終的に同意してくれたといいですね。',
    choices: [
      { key: '1', word: 'persuade', meaning: '説得する' },
      { key: '2', word: 'deceive',  meaning: '欺く' },
      { key: '3', word: 'forbid',   meaning: '禁止する' },
      { key: '4', word: 'ignore',   meaning: '無視する' },
    ],
    answer: '1',
    explanation: '両親に留学を認めてもらおうとしたことから、1 persuade「説得する」が正解。2 deceive「欺く」3 forbid「禁止する」4 ignore「無視する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000044000,
  },
  {
    id: 'seed-045', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The city government is taking measures to (   ) traffic congestion in the downtown area.',
    questionJa: '市政府は都市中心部の交通渋滞を削減するための措置を取っている。',
    choices: [
      { key: '1', word: 'reduce',    meaning: '削減する' },
      { key: '2', word: 'increase',  meaning: '増加させる' },
      { key: '3', word: 'celebrate', meaning: '祝う' },
      { key: '4', word: 'spread',    meaning: '広げる' },
    ],
    answer: '1',
    explanation: '交通渋滞に対する「措置」という文脈から、1 reduce「削減する」が正解。2 increase「増加させる」は反対の意味。3 celebrate「祝う」4 spread「広げる」はいずれも不適。',
    tags: [], addedAt: 1715000045000,
  },
  {
    id: 'seed-046', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'I think everyone in the team should (   ) their ideas to improve the project.' },
      { speaker: 'B', text: 'Absolutely. Diverse perspectives usually lead to better outcomes.' },
    ],
    questionText: null,
    questionJa: 'A：チームの全員がプロジェクトを改善するためにアイデアを提供すべきだと思います。\nB：全くその通りです。多様な視点はたいていより良い結果につながります。',
    choices: [
      { key: '1', word: 'contribute', meaning: '貢献する' },
      { key: '2', word: 'withhold',   meaning: '差し控える' },
      { key: '3', word: 'criticize',  meaning: '批判する' },
      { key: '4', word: 'reject',     meaning: '拒否する' },
    ],
    answer: '1',
    explanation: 'プロジェクト改善のためにアイデアを出し合うことだから、1 contribute「貢献する」が正解。2 withhold「差し控える」3 criticize「批判する」4 reject「拒否する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000046000,
  },
  {
    id: 'seed-047', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The restaurant built a strong (   ) for its excellent service and delicious food over the years.',
    questionJa: 'そのレストランは長年にわたり、優れたサービスとおいしい料理で高い評判を築いてきた。',
    choices: [
      { key: '1', word: 'reputation', meaning: '評判' },
      { key: '2', word: 'confusion',  meaning: '混乱' },
      { key: '3', word: 'shortage',   meaning: '不足' },
      { key: '4', word: 'barrier',    meaning: '障壁' },
    ],
    answer: '1',
    explanation: 'サービスや料理への評価を「長年にわたって築いてきた」ことだから、1 reputation「評判」が正解。2 confusion「混乱」3 shortage「不足」4 barrier「障壁」はいずれも不適。',
    tags: [], addedAt: 1715000047000,
  },
  {
    id: 'seed-048', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'We need to install a security system to (   ) break-ins at the office.' },
      { speaker: 'B', text: 'Good idea. We\'ve had a few incidents recently, so it\'s better to be safe.' },
    ],
    questionText: null,
    questionJa: 'A：オフィスへの侵入を防ぐためにセキュリティシステムを設置する必要があります。\nB：いいですね。最近いくつかの事件があったので、安全を確保した方がいいです。',
    choices: [
      { key: '1', word: 'prevent',  meaning: '防ぐ' },
      { key: '2', word: 'allow',    meaning: '許可する' },
      { key: '3', word: 'promote',  meaning: '促進する' },
      { key: '4', word: 'enjoy',    meaning: '楽しむ' },
    ],
    answer: '1',
    explanation: 'セキュリティシステムで侵入を「防ぐ」ことだから、1 prevent「防ぐ」が正解。2 allow「許可する」は反対の意味。3 promote「促進する」4 enjoy「楽しむ」はいずれも不適。',
    tags: [], addedAt: 1715000048000,
  },
  {
    id: 'seed-049', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'I deeply (   ) your help during such a difficult time. I couldn\'t have managed without you.',
    questionJa: 'こんなに辛い時期に助けてくれて心から感謝しています。あなたなしでは乗り越えられませんでした。',
    choices: [
      { key: '1', word: 'appreciate', meaning: '感謝する' },
      { key: '2', word: 'regret',     meaning: '後悔する' },
      { key: '3', word: 'doubt',      meaning: '疑う' },
      { key: '4', word: 'avoid',      meaning: '避ける' },
    ],
    answer: '1',
    explanation: '「なしでは乗り越えられなかった」という感謝の文脈から、1 appreciate「感謝する」が正解。2 regret「後悔する」3 doubt「疑う」4 avoid「避ける」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000049000,
  },
  {
    id: 'seed-050', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'We need to (   ) the terms of the contract before we can sign it.' },
      { speaker: 'B', text: 'Agreed. There are a few conditions we want changed before we commit.' },
    ],
    questionText: null,
    questionJa: 'A：署名する前に契約条件について交渉する必要があります。\nB：同意します。確約する前に変更してほしい条件がいくつかあります。',
    choices: [
      { key: '1', word: 'negotiate', meaning: '交渉する' },
      { key: '2', word: 'finalize',  meaning: '確定する' },
      { key: '3', word: 'ignore',    meaning: '無視する' },
      { key: '4', word: 'celebrate', meaning: '祝う' },
    ],
    answer: '1',
    explanation: 'Bが「変更してほしい条件がある」と述べていることから、契約前に条件を「交渉する」必要があり、1 negotiate が正解。2 finalize「確定する」3 ignore「無視する」4 celebrate「祝う」はいずれも不適。',
    tags: [], addedAt: 1715000050000,
  },
  {
    id: 'seed-051', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'Thomas Edison is famous for having (   ) the light bulb and many other useful devices.',
    questionJa: 'トーマス・エジソンは電球や他の多くの便利な装置を発明したことで有名だ。',
    choices: [
      { key: '1', word: 'invented',   meaning: '発明した' },
      { key: '2', word: 'borrowed',   meaning: '借りた' },
      { key: '3', word: 'destroyed',  meaning: '破壊した' },
      { key: '4', word: 'forgotten',  meaning: '忘れた' },
    ],
    answer: '1',
    explanation: '電球などの装置を作り出したことで有名なのだから、1 invented「発明した」が正解。2 borrowed「借りた」3 destroyed「破壊した」4 forgotten「忘れた」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000051000,
  },
  {
    id: 'seed-052', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'Could you (   ) a good restaurant near the station?' },
      { speaker: 'B', text: 'Sure. There is a great Italian place just two minutes away.' },
    ],
    questionText: null,
    questionJa: 'A：駅の近くで良いレストランを勧めてもらえますか？\nB：もちろん。2分ほどのところに素晴らしいイタリア料理店がありますよ。',
    choices: [
      { key: '1', word: 'recommend', meaning: '勧める' },
      { key: '2', word: 'pollute',   meaning: '汚染する' },
      { key: '3', word: 'repair',    meaning: '修理する' },
      { key: '4', word: 'measure',   meaning: '測る' },
    ],
    answer: '1',
    explanation: 'Bが具体的な店を教えていることから、Aは良い店を「勧めて」もらおうとしているとわかるので、1 recommend「勧める」が正解。2 pollute「汚染する」3 repair「修理する」4 measure「測る」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000052000,
  },
  {
    id: 'seed-053', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The new employee was asked to (   ) the document from English into Japanese by tomorrow.',
    questionJa: '新入社員は明日までにその書類を英語から日本語に翻訳するよう頼まれた。',
    choices: [
      { key: '1', word: 'translate', meaning: '翻訳する' },
      { key: '2', word: 'pretend',   meaning: 'ふりをする' },
      { key: '3', word: 'frighten',  meaning: '怖がらせる' },
      { key: '4', word: 'decorate',  meaning: '飾る' },
    ],
    answer: '1',
    explanation: '「英語から日本語に」という語句から、書類を「翻訳する」ことだとわかるので、1 translate「翻訳する」が正解。2 pretend「ふりをする」3 frighten「怖がらせる」4 decorate「飾る」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000053000,
  },
  {
    id: 'seed-054', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: "I'm not sure which laptop to buy." },
      { speaker: 'B', text: 'You should (   ) the prices online before you decide.' },
    ],
    questionText: null,
    questionJa: 'A：どのノートパソコンを買えばいいか迷っているんだ。\nB：決める前にネットで価格を比較したほうがいいよ。',
    choices: [
      { key: '1', word: 'compare', meaning: '比較する' },
      { key: '2', word: 'waste',   meaning: '無駄にする' },
      { key: '3', word: 'hide',    meaning: '隠す' },
      { key: '4', word: 'melt',    meaning: '溶かす' },
    ],
    answer: '1',
    explanation: 'どれを買うか迷っている相手に、決める前に価格を「比較する」よう勧めているから、1 compare「比較する」が正解。2 waste「無駄にする」3 hide「隠す」4 melt「溶かす」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000054000,
  },
  {
    id: 'seed-055', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'My teacher always (   ) me to try new things and never gives up on her students.',
    questionJa: '私の先生はいつも私に新しいことに挑戦するよう励まし、決して生徒を見捨てない。',
    choices: [
      { key: '1', word: 'encourages', meaning: '励ます' },
      { key: '2', word: 'punishes',   meaning: '罰する' },
      { key: '3', word: 'ignores',    meaning: '無視する' },
      { key: '4', word: 'doubts',     meaning: '疑う' },
    ],
    answer: '1',
    explanation: '「決して生徒を見捨てない」という文脈から、新しい挑戦を「励ます」とわかるので、1 encourages「励ます」が正解。2 punishes「罰する」3 ignores「無視する」4 doubts「疑う」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000055000,
  },
  {
    id: 'seed-056', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'Why are you studying so hard these days?' },
      { speaker: 'B', text: 'I want to (   ) my dream of becoming a doctor.' },
    ],
    questionText: null,
    questionJa: 'A：最近どうしてそんなに一生懸命勉強しているの？\nB：医者になるという夢を達成したいんだ。',
    choices: [
      { key: '1', word: 'achieve', meaning: '達成する' },
      { key: '2', word: 'abandon', meaning: '捨てる' },
      { key: '3', word: 'waste',   meaning: '無駄にする' },
      { key: '4', word: 'delay',   meaning: '遅らせる' },
    ],
    answer: '1',
    explanation: '一生懸命勉強する理由として夢を「達成する」ことだから、1 achieve「達成する」が正解。2 abandon「捨てる」3 waste「無駄にする」4 delay「遅らせる」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000056000,
  },
  {
    id: 'seed-057', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The library will (   ) its opening hours during the exam period to help students study longer.',
    questionJa: '図書館は試験期間中、学生がより長く勉強できるように開館時間を延長する予定だ。',
    choices: [
      { key: '1', word: 'extend',  meaning: '延長する' },
      { key: '2', word: 'cancel',  meaning: '中止する' },
      { key: '3', word: 'forget',  meaning: '忘れる' },
      { key: '4', word: 'pollute', meaning: '汚染する' },
    ],
    answer: '1',
    explanation: '学生がより長く勉強できるように開館時間を「延長する」ことだから、1 extend「延長する」が正解。2 cancel「中止する」3 forget「忘れる」4 pollute「汚染する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000057000,
  },
  {
    id: 'seed-058', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'Did you hear that Tom got promoted to manager?' },
      { speaker: 'B', text: 'Yes! He really (   ) it after all his hard work.' },
    ],
    questionText: null,
    questionJa: 'A：トムがマネージャーに昇進したって聞いた？\nB：うん！あれだけ一生懸命働いたんだから、本当にそれに値するよ。',
    choices: [
      { key: '1', word: 'deserved', meaning: '値した' },
      { key: '2', word: 'refused',  meaning: '断った' },
      { key: '3', word: 'damaged',  meaning: '傷つけた' },
      { key: '4', word: 'borrowed', meaning: '借りた' },
    ],
    answer: '1',
    explanation: '「あれだけ努力したのだから」という文脈で昇進に「値する」ことだから、1 deserved「値した」が正解。2 refused「断った」3 damaged「傷つけた」4 borrowed「借りた」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000058000,
  },
  {
    id: 'seed-059', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'Thanks to the new highway, the (   ) between the two cities was greatly shortened.',
    questionJa: '新しい高速道路のおかげで、2つの都市間の距離が大幅に短縮された。',
    choices: [
      { key: '1', word: 'distance', meaning: '距離' },
      { key: '2', word: 'weather',  meaning: '天気' },
      { key: '3', word: 'culture',  meaning: '文化' },
      { key: '4', word: 'language', meaning: '言語' },
    ],
    answer: '1',
    explanation: '高速道路によって「短縮された」ものだから、1 distance「距離」が正解。2 weather「天気」3 culture「文化」4 language「言語」はいずれも「短縮される」対象として文意に合わない。',
    tags: [], addedAt: 1715000059000,
  },
  {
    id: 'seed-060', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'You look worried. What happened?' },
      { speaker: 'B', text: 'I need to (   ) to my friend for forgetting his birthday yesterday.' },
    ],
    questionText: null,
    questionJa: 'A：心配そうだね。何かあったの？\nB：昨日友達の誕生日を忘れてしまったから、謝らないといけないんだ。',
    choices: [
      { key: '1', word: 'apologize', meaning: '謝る' },
      { key: '2', word: 'celebrate', meaning: '祝う' },
      { key: '3', word: 'compete',   meaning: '競争する' },
      { key: '4', word: 'reply',     meaning: '返事する' },
    ],
    answer: '1',
    explanation: '誕生日を忘れてしまったことに対してすることだから、1 apologize「謝る」が正解。2 celebrate「祝う」3 compete「競争する」4 reply「返事する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000060000,
  },
  {
    id: 'seed-061', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The new highway will greatly (   ) the time it takes to travel between the two cities.',
    questionJa: '新しい高速道路は、2つの都市を移動するのにかかる時間を大幅に短縮するだろう。',
    choices: [
      { key: '1', word: 'reduce',   meaning: '減らす' },
      { key: '2', word: 'increase', meaning: '増やす' },
      { key: '3', word: 'measure',  meaning: '測る' },
      { key: '4', word: 'collect',  meaning: '集める' },
    ],
    answer: '1',
    explanation: '高速道路ができれば移動時間は短くなるので、1 reduce「減らす」が正解。2 increase「増やす」は逆の意味。3 measure「測る」4 collect「集める」は文意に合わない。',
    tags: [], addedAt: 1715000080000,
  },
  {
    id: 'seed-062', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'I heard you got a new job. Congratulations!' },
      { speaker: 'B', text: 'Thanks. The (   ) is higher, so I can save more money now.' },
    ],
    questionText: null,
    questionJa: 'A：新しい仕事に就いたって聞いたよ。おめでとう！\nB：ありがとう。給料が高いから、今はもっと貯金できるんだ。',
    choices: [
      { key: '1', word: 'distance', meaning: '距離' },
      { key: '2', word: 'salary',   meaning: '給料' },
      { key: '3', word: 'weather',  meaning: '天気' },
      { key: '4', word: 'schedule', meaning: '予定' },
    ],
    answer: '2',
    explanation: '「貯金できる」とあることからお金の話なので、2 salary「給料」が正解。1 distance「距離」3 weather「天気」4 schedule「予定」はいずれも貯金とつながらない。',
    tags: [], addedAt: 1715000079000,
  },
  {
    id: 'seed-063', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The doctor advised him to (   ) eating too much salt to keep his blood pressure low.',
    questionJa: '医者は血圧を低く保つために、塩分の取りすぎを避けるよう彼に助言した。',
    choices: [
      { key: '1', word: 'attend',  meaning: '出席する' },
      { key: '2', word: 'avoid',   meaning: '避ける' },
      { key: '3', word: 'prepare', meaning: '準備する' },
      { key: '4', word: 'admire',  meaning: '感心する' },
    ],
    answer: '2',
    explanation: '血圧を低く保つには塩分の取りすぎを「避ける」必要があるので、2 avoid が正解。avoid は動名詞を目的語にとる。1 attend 3 prepare 4 admire はいずれも文意に合わない。',
    tags: [], addedAt: 1715000078000,
  },
  {
    id: 'seed-064', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'Although the experiment failed several times, the scientist did not give up and finally (   ) in proving her theory.',
    questionJa: '実験は何度も失敗したが、その科学者はあきらめず、ついに自分の理論を証明することに成功した。',
    choices: [
      { key: '1', word: 'succeeded', meaning: '成功した' },
      { key: '2', word: 'refused',   meaning: '断った' },
      { key: '3', word: 'remained',  meaning: 'とどまった' },
      { key: '4', word: 'pretended', meaning: 'ふりをした' },
    ],
    answer: '1',
    explanation: 'あきらめなかった結果なので、1 succeeded「成功した」が正解。succeed in 〜ing で「〜に成功する」。2 refused 3 remained 4 pretended はいずれも文意に合わない。',
    tags: [], addedAt: 1715000077000,
  },
  {
    id: 'seed-065', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'Why are you studying so hard these days?' },
      { speaker: 'B', text: 'I have an important exam next week, so I cannot (   ) to waste any time.' },
    ],
    questionText: null,
    questionJa: 'A：最近どうしてそんなに一生懸命勉強しているの？\nB：来週大事な試験があるから、時間を無駄にする余裕がないんだ。',
    choices: [
      { key: '1', word: 'afford',  meaning: '〜する余裕がある' },
      { key: '2', word: 'decide',  meaning: '決める' },
      { key: '3', word: 'happen',  meaning: '起こる' },
      { key: '4', word: 'imagine', meaning: '想像する' },
    ],
    answer: '1',
    explanation: 'cannot afford to do で「〜する余裕がない」という熟語。時間を無駄にする余裕がない、という文意に合うので1 afford が正解。',
    tags: [], addedAt: 1715000076000,
  },
  {
    id: 'seed-066', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The company decided to (   ) its products to other countries in order to increase sales.',
    questionJa: 'その会社は売上を伸ばすために、製品を他国へ輸出することに決めた。',
    choices: [
      { key: '1', word: 'export',  meaning: '輸出する' },
      { key: '2', word: 'destroy', meaning: '破壊する' },
      { key: '3', word: 'borrow',  meaning: '借りる' },
      { key: '4', word: 'forgive', meaning: '許す' },
    ],
    answer: '1',
    explanation: '「他国へ」「売上を伸ばす」とあるので、1 export「輸出する」が正解。2 destroy「破壊する」3 borrow「借りる」4 forgive「許す」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000075000,
  },
  {
    id: 'seed-067', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The instructions were so (   ) that no one in the class could understand what to do.',
    questionJa: 'その指示はとても分かりにくかったので、クラスの誰も何をすればよいか理解できなかった。',
    choices: [
      { key: '1', word: 'confusing', meaning: '分かりにくい' },
      { key: '2', word: 'relaxing',  meaning: 'くつろがせる' },
      { key: '3', word: 'amusing',   meaning: '面白い' },
      { key: '4', word: 'exciting',  meaning: 'わくわくさせる' },
    ],
    answer: '1',
    explanation: '「誰も理解できなかった」とあるので、1 confusing「分かりにくい、混乱させる」が正解。2 relaxing 3 amusing 4 exciting はいずれも理解できない理由にならない。',
    tags: [], addedAt: 1715000074000,
  },
  {
    id: 'seed-068', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'Did you finish reading that long report?' },
      { speaker: 'B', text: 'Not yet. Could you give me a brief (   ) of the main points?' },
    ],
    questionText: null,
    questionJa: 'A：あの長い報告書は読み終わった？\nB：まだだよ。要点を手短に要約してくれない？',
    choices: [
      { key: '1', word: 'summary',  meaning: '要約' },
      { key: '2', word: 'mistake',  meaning: '間違い' },
      { key: '3', word: 'surface',  meaning: '表面' },
      { key: '4', word: 'audience', meaning: '観客' },
    ],
    answer: '1',
    explanation: '「要点を手短に」とあるので、1 summary「要約」が正解。a brief summary of 〜 で「〜の簡単な要約」。2 mistake 3 surface 4 audience はいずれも文意に合わない。',
    tags: [], addedAt: 1715000073000,
  },
  {
    id: 'seed-069', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'Since the meeting room was already (   ), we had to find another place to talk.',
    questionJa: '会議室はすでに使われていたので、私たちは話をする別の場所を探さなければならなかった。',
    choices: [
      { key: '1', word: 'occupied', meaning: '使用中の' },
      { key: '2', word: 'invited',  meaning: '招待された' },
      { key: '3', word: 'repaired', meaning: '修理された' },
      { key: '4', word: 'returned', meaning: '返された' },
    ],
    answer: '1',
    explanation: '別の場所を探さなければならなかったのは部屋が「使用中」だったから。1 occupied「使用中の、ふさがっている」が正解。2 invited 3 repaired 4 returned はいずれも文意に合わない。',
    tags: [], addedAt: 1715000072000,
  },
  {
    id: 'seed-070', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The teacher asked the students to (   ) their answers carefully before handing in the test.',
    questionJa: '先生は生徒たちに、テストを提出する前に答えを注意深く見直すように求めた。',
    choices: [
      { key: '1', word: 'review',   meaning: '見直す' },
      { key: '2', word: 'invent',   meaning: '発明する' },
      { key: '3', word: 'announce', meaning: '発表する' },
      { key: '4', word: 'replace',  meaning: '取り替える' },
    ],
    answer: '1',
    explanation: '「提出する前に答えを注意深く」とあるので、1 review「見直す」が正解。2 invent 3 announce 4 replace はいずれも文意に合わない。',
    tags: [], addedAt: 1715000071000,
  },
  {
    id: 'seed-071', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'How was your trip to the mountains?' },
      { speaker: 'B', text: 'Wonderful. The view from the top was absolutely (   ).' },
    ],
    questionText: null,
    questionJa: 'A：山への旅行はどうだった？\nB：素晴らしかったよ。頂上からの眺めは本当に見事だった。',
    choices: [
      { key: '1', word: 'breathtaking', meaning: '息をのむような' },
      { key: '2', word: 'disappointing', meaning: 'がっかりさせる' },
      { key: '3', word: 'ordinary',     meaning: '普通の' },
      { key: '4', word: 'available',    meaning: '入手できる' },
    ],
    answer: '1',
    explanation: '「Wonderful」「本当に」とあるので、1 breathtaking「息をのむような、見事な」が正解。2 disappointing は逆の意味。3 ordinary「普通の」4 available「入手できる」も文意に合わない。',
    tags: [], addedAt: 1715000070000,
  },
  {
    id: 'seed-072', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The volunteers worked hard to (   ) money for the children who lost their homes in the flood.',
    questionJa: 'ボランティアたちは、洪水で家を失った子どもたちのためにお金を集めようと懸命に働いた。',
    choices: [
      { key: '1', word: 'raise',    meaning: '集める・募る' },
      { key: '2', word: 'waste',    meaning: '浪費する' },
      { key: '3', word: 'spend',    meaning: '使う' },
      { key: '4', word: 'lend',     meaning: '貸す' },
    ],
    answer: '1',
    explanation: 'raise money で「お金を集める、募金する」という意味。困っている子どもたちのために募金する文意に合うので1 raise が正解。2 waste 3 spend 4 lend はいずれも合わない。',
    tags: [], addedAt: 1715000069000,
  },
  {
    id: 'seed-073', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'My grandfather has a large (   ) of old coins that he has collected over fifty years.',
    questionJa: '祖父は50年以上かけて集めた古いコインの大きなコレクションを持っている。',
    choices: [
      { key: '1', word: 'collection', meaning: '収集物' },
      { key: '2', word: 'direction',  meaning: '方向' },
      { key: '3', word: 'invitation', meaning: '招待' },
      { key: '4', word: 'reaction',   meaning: '反応' },
    ],
    answer: '1',
    explanation: '「集めた古いコイン」とあるので、1 collection「収集物、コレクション」が正解。2 direction 3 invitation 4 reaction はいずれも文意に合わない。',
    tags: [], addedAt: 1715000068000,
  },
  {
    id: 'seed-074', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'I am thinking of buying this smartphone, but it is quite expensive.' },
      { speaker: 'B', text: 'You should (   ) the prices at a few different shops before deciding.' },
    ],
    questionText: null,
    questionJa: 'A：このスマートフォンを買おうと思っているんだけど、かなり高いんだ。\nB：決める前にいくつかの店で値段を比較した方がいいよ。',
    choices: [
      { key: '1', word: 'compare', meaning: '比較する' },
      { key: '2', word: 'repeat',  meaning: '繰り返す' },
      { key: '3', word: 'forget',  meaning: '忘れる' },
      { key: '4', word: 'enter',   meaning: '入る' },
    ],
    answer: '1',
    explanation: '「いくつかの店で値段を」とあるので、1 compare「比較する」が正解。compare A at different shops。2 repeat 3 forget 4 enter はいずれも文意に合わない。',
    tags: [], addedAt: 1715000067000,
  },
  {
    id: 'seed-075', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The firefighters managed to (   ) everyone from the burning building before it collapsed.',
    questionJa: '消防士たちは、燃えている建物が崩れる前に全員を救助することができた。',
    choices: [
      { key: '1', word: 'rescue',   meaning: '救助する' },
      { key: '2', word: 'discover', meaning: '発見する' },
      { key: '3', word: 'arrange',  meaning: '手配する' },
      { key: '4', word: 'provide',  meaning: '提供する' },
    ],
    answer: '1',
    explanation: '燃えている建物から全員を、とあるので1 rescue「救助する」が正解。2 discover 3 arrange 4 provide はいずれも文意に合わない。',
    tags: [], addedAt: 1715000066000,
  },
  {
    id: 'seed-076', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'Reading books in English every day will help you (   ) your vocabulary.',
    questionJa: '毎日英語の本を読むことは、語彙を増やすのに役立つだろう。',
    choices: [
      { key: '1', word: 'expand',  meaning: '拡大する・増やす' },
      { key: '2', word: 'remove',  meaning: '取り除く' },
      { key: '3', word: 'delay',   meaning: '遅らせる' },
      { key: '4', word: 'repair',  meaning: '修理する' },
    ],
    answer: '1',
    explanation: '英語の本を読むことで語彙を「増やす」ので、1 expand「拡大する、増やす」が正解。2 remove 3 delay 4 repair はいずれも文意に合わない。',
    tags: [], addedAt: 1715000065000,
  },
  {
    id: 'seed-077', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'I am sorry, but I cannot come to your party on Saturday.' },
      { speaker: 'B', text: 'That is too bad. Maybe we can (   ) it for another day.' },
    ],
    questionText: null,
    questionJa: 'A：ごめん、土曜日のパーティーには行けないんだ。\nB：残念だね。別の日に予定を変更できるかもしれないよ。',
    choices: [
      { key: '1', word: 'reschedule', meaning: '予定を変更する' },
      { key: '2', word: 'recognize',  meaning: '認識する' },
      { key: '3', word: 'recommend',  meaning: '勧める' },
      { key: '4', word: 'recover',    meaning: '回復する' },
    ],
    answer: '1',
    explanation: '「別の日に」とあるので、1 reschedule「予定を変更する」が正解。2 recognize 3 recommend 4 recover はいずれも文意に合わない。',
    tags: [], addedAt: 1715000064000,
  },
  {
    id: 'seed-078', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The new law was introduced to (   ) the environment from further pollution.',
    questionJa: 'その新しい法律は、環境をさらなる汚染から守るために導入された。',
    choices: [
      { key: '1', word: 'protect', meaning: '守る' },
      { key: '2', word: 'pollute', meaning: '汚染する' },
      { key: '3', word: 'produce', meaning: '生産する' },
      { key: '4', word: 'promote', meaning: '促進する' },
    ],
    answer: '1',
    explanation: '「汚染から」環境を、とあるので1 protect「守る」が正解。protect A from B で「BからAを守る」。2 pollute は逆の意味。3 produce 4 promote も文意に合わない。',
    tags: [], addedAt: 1715000063000,
  },
  {
    id: 'seed-079', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'She felt very (   ) when she received the award in front of all her classmates.',
    questionJa: 'クラスメート全員の前で賞を受け取ったとき、彼女はとても誇らしく感じた。',
    choices: [
      { key: '1', word: 'proud',    meaning: '誇らしい' },
      { key: '2', word: 'bored',    meaning: '退屈した' },
      { key: '3', word: 'nervous',  meaning: '緊張した' },
      { key: '4', word: 'jealous',  meaning: 'うらやんだ' },
    ],
    answer: '1',
    explanation: '賞を受け取ったときの気持ちなので、1 proud「誇らしい」が正解。2 bored 3 nervous 4 jealous はいずれも受賞時の前向きな気持ちとして合わない。',
    tags: [], addedAt: 1715000062000,
  },
  {
    id: 'seed-080', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'This math problem is really difficult. I have no idea how to solve it.' },
      { speaker: 'B', text: 'Do not worry. If you ask the teacher, she will (   ) it to you.' },
    ],
    questionText: null,
    questionJa: 'A：この数学の問題は本当に難しい。どう解けばいいか全然分からないよ。\nB：心配しないで。先生に聞けば、説明してくれるよ。',
    choices: [
      { key: '1', word: 'explain',  meaning: '説明する' },
      { key: '2', word: 'complain', meaning: '不平を言う' },
      { key: '3', word: 'contain',  meaning: '含む' },
      { key: '4', word: 'remain',   meaning: 'とどまる' },
    ],
    answer: '1',
    explanation: '解き方が分からない問題について先生がしてくれることなので、1 explain「説明する」が正解。2 complain 3 contain 4 remain はいずれも文意に合わない。',
    tags: [], addedAt: 1715000061000,
  },
  {
    id: 'seed-081', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The new highway will greatly (   ) the traffic problems in the city center.',
    questionJa: '新しい高速道路は都心部の交通問題を大いに軽減するだろう。',
    choices: [
      { key: '1', word: 'reduce',   meaning: '減らす' },
      { key: '2', word: 'produce',  meaning: '生産する' },
      { key: '3', word: 'announce', meaning: '発表する' },
      { key: '4', word: 'arrange',  meaning: '手配する' },
    ],
    answer: '1',
    explanation: '交通問題に対して高速道路がもたらす効果なので、1 reduce「減らす」が正解。2 produce「生産する」3 announce「発表する」4 arrange「手配する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000081000,
  },
  {
    id: 'seed-082', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'I cannot decide which smartphone to buy.' },
      { speaker: 'B', text: 'You should (   ) the prices and features before choosing.' },
    ],
    questionText: null,
    questionJa: 'A：どのスマートフォンを買うか決められないよ。\nB：選ぶ前に価格と機能を比較するべきだよ。',
    choices: [
      { key: '1', word: 'compare',  meaning: '比較する' },
      { key: '2', word: 'repair',   meaning: '修理する' },
      { key: '3', word: 'prepare',  meaning: '準備する' },
      { key: '4', word: 'declare',  meaning: '宣言する' },
    ],
    answer: '1',
    explanation: '選ぶ前に価格や機能についてすることなので、1 compare「比較する」が正解。2 repair「修理する」3 prepare「準備する」4 declare「宣言する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000082000,
  },
  {
    id: 'seed-083', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The doctor advised him to (   ) eating too much salt to lower his blood pressure.',
    questionJa: '医者は血圧を下げるために塩分の取りすぎを避けるよう彼に助言した。',
    choices: [
      { key: '1', word: 'avoid',    meaning: '避ける' },
      { key: '2', word: 'enjoy',    meaning: '楽しむ' },
      { key: '3', word: 'continue', meaning: '続ける' },
      { key: '4', word: 'increase', meaning: '増やす' },
    ],
    answer: '1',
    explanation: '血圧を下げるために塩分の取りすぎについてすることなので、1 avoid「避ける」が正解。2 enjoy「楽しむ」3 continue「続ける」4 increase「増やす」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000083000,
  },
  {
    id: 'seed-084', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'Please make sure to (   ) the report by Friday, or the project will be delayed.',
    questionJa: '金曜日までに必ず報告書を提出してください。さもないとプロジェクトが遅れます。',
    choices: [
      { key: '1', word: 'submit',   meaning: '提出する' },
      { key: '2', word: 'admit',    meaning: '認める' },
      { key: '3', word: 'permit',   meaning: '許可する' },
      { key: '4', word: 'commit',   meaning: '委ねる' },
    ],
    answer: '1',
    explanation: '報告書を金曜日までにすることなので、1 submit「提出する」が正解。2 admit「認める」3 permit「許可する」4 commit「委ねる」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000084000,
  },
  {
    id: 'seed-085', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'Why were you late for the meeting this morning?' },
      { speaker: 'B', text: 'There was a heavy traffic (   ) on the way to the office.' },
    ],
    questionText: null,
    questionJa: 'A：今朝はなぜ会議に遅れたの？\nB：会社に来る途中でひどい渋滞があったんだ。',
    choices: [
      { key: '1', word: 'jam',      meaning: '混雑' },
      { key: '2', word: 'signal',   meaning: '信号' },
      { key: '3', word: 'accident', meaning: '事故' },
      { key: '4', word: 'route',    meaning: '経路' },
    ],
    answer: '1',
    explanation: 'traffic jam「交通渋滞」という表現を作る1 jam「混雑」が正解。2 signal「信号」3 accident「事故」4 route「経路」では traffic と結びついて「渋滞」の意味にならない。',
    tags: [], addedAt: 1715000085000,
  },
  {
    id: 'seed-086', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The teacher (   ) the students to study hard for the entrance examination.',
    questionJa: '先生は生徒たちに入学試験に向けて一生懸命勉強するよう励ました。',
    choices: [
      { key: '1', word: 'encouraged', meaning: '励ました' },
      { key: '2', word: 'discovered', meaning: '発見した' },
      { key: '3', word: 'imagined',   meaning: '想像した' },
      { key: '4', word: 'collected',  meaning: '集めた' },
    ],
    answer: '1',
    explanation: '生徒に勉強するよう先生がしたことなので、1 encouraged「励ました」が正解。2 discovered「発見した」3 imagined「想像した」4 collected「集めた」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000086000,
  },
  {
    id: 'seed-087', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'This medicine has a strong (   ) on reducing pain, so take only one tablet.',
    questionJa: 'この薬は痛みを和らげる強い効果があるので、1錠だけ服用してください。',
    choices: [
      { key: '1', word: 'effect',  meaning: '効果' },
      { key: '2', word: 'subject', meaning: '主題' },
      { key: '3', word: 'object',  meaning: '物体' },
      { key: '4', word: 'project', meaning: '計画' },
    ],
    answer: '1',
    explanation: '薬が痛みを和らげる「効き目」を表すので、1 effect「効果」が正解。2 subject「主題」3 object「物体」4 project「計画」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000087000,
  },
  {
    id: 'seed-088', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'Do you think the new policy will work well?' },
      { speaker: 'B', text: 'It is hard to say. We will have to (   ) the results carefully.' },
    ],
    questionText: null,
    questionJa: 'A：新しい方針はうまくいくと思う？\nB：何とも言えないね。結果を注意深く評価しないといけないよ。',
    choices: [
      { key: '1', word: 'evaluate',  meaning: '評価する' },
      { key: '2', word: 'celebrate', meaning: '祝う' },
      { key: '3', word: 'decorate',  meaning: '飾る' },
      { key: '4', word: 'translate', meaning: '翻訳する' },
    ],
    answer: '1',
    explanation: '結果を注意深くすることなので、1 evaluate「評価する」が正解。2 celebrate「祝う」3 decorate「飾る」4 translate「翻訳する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000088000,
  },
  {
    id: 'seed-089', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The company decided to (   ) its business into Asian markets next year.',
    questionJa: 'その会社は来年アジア市場へ事業を拡大することに決めた。',
    choices: [
      { key: '1', word: 'expand',   meaning: '拡大する' },
      { key: '2', word: 'expect',   meaning: '期待する' },
      { key: '3', word: 'express',  meaning: '表現する' },
      { key: '4', word: 'explore',  meaning: '探検する' },
    ],
    answer: '1',
    explanation: '事業をアジア市場へ広げることなので、1 expand「拡大する」が正解。2 expect「期待する」3 express「表現する」4 explore「探検する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000089000,
  },
  {
    id: 'seed-090', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'He could not (   ) between the twin brothers because they looked exactly alike.',
    questionJa: '彼は双子の兄弟がまったく同じに見えたので、二人を区別することができなかった。',
    choices: [
      { key: '1', word: 'distinguish', meaning: '区別する' },
      { key: '2', word: 'establish',   meaning: '設立する' },
      { key: '3', word: 'publish',     meaning: '出版する' },
      { key: '4', word: 'finish',      meaning: '終える' },
    ],
    answer: '1',
    explanation: 'そっくりな双子について「見分ける」ことなので、1 distinguish「区別する」が正解。2 establish「設立する」3 publish「出版する」4 finish「終える」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000090000,
  },
  {
    id: 'seed-091', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'I heard you are moving to a new apartment.' },
      { speaker: 'B', text: 'Yes, the (   ) is much lower than my current place.' },
    ],
    questionText: null,
    questionJa: 'A：新しいアパートに引っ越すんだってね。\nB：うん、家賃が今の場所よりずっと安いんだ。',
    choices: [
      { key: '1', word: 'rent',    meaning: '家賃' },
      { key: '2', word: 'salary',  meaning: '給料' },
      { key: '3', word: 'fare',    meaning: '運賃' },
      { key: '4', word: 'fee',     meaning: '料金' },
    ],
    answer: '1',
    explanation: 'アパートに対して払うお金なので、1 rent「家賃」が正解。2 salary「給料」3 fare「運賃」4 fee「料金」はいずれもアパートの賃料を表さない。',
    tags: [], addedAt: 1715000091000,
  },
  {
    id: 'seed-092', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The scientists conducted several (   ) to test their new theory.',
    questionJa: '科学者たちは新しい理論を検証するためにいくつかの実験を行った。',
    choices: [
      { key: '1', word: 'experiments', meaning: '実験' },
      { key: '2', word: 'instruments', meaning: '器具' },
      { key: '3', word: 'arguments',   meaning: '議論' },
      { key: '4', word: 'documents',   meaning: '書類' },
    ],
    answer: '1',
    explanation: '理論を検証するために行うものなので、1 experiments「実験」が正解。2 instruments「器具」3 arguments「議論」4 documents「書類」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000092000,
  },
  {
    id: 'seed-093', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'You should (   ) your password regularly to keep your account safe.',
    questionJa: 'アカウントを安全に保つために、定期的にパスワードを変更するべきだ。',
    choices: [
      { key: '1', word: 'change',  meaning: '変更する' },
      { key: '2', word: 'charge',  meaning: '請求する' },
      { key: '3', word: 'choose',  meaning: '選ぶ' },
      { key: '4', word: 'chase',   meaning: '追いかける' },
    ],
    answer: '1',
    explanation: 'アカウントを安全に保つためにパスワードにすることなので、1 change「変更する」が正解。2 charge「請求する」3 choose「選ぶ」4 chase「追いかける」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000093000,
  },
  {
    id: 'seed-094', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'This restaurant is always crowded.' },
      { speaker: 'B', text: 'We should make a (   ) in advance next time.' },
    ],
    questionText: null,
    questionJa: 'A：このレストランはいつも混んでいるね。\nB：次回は前もって予約をするべきだね。',
    choices: [
      { key: '1', word: 'reservation', meaning: '予約' },
      { key: '2', word: 'reputation',  meaning: '評判' },
      { key: '3', word: 'celebration', meaning: '祝賀' },
      { key: '4', word: 'conversation', meaning: '会話' },
    ],
    answer: '1',
    explanation: '混んでいるレストランに前もってするものなので、1 reservation「予約」が正解。2 reputation「評判」3 celebration「祝賀」4 conversation「会話」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000094000,
  },
  {
    id: 'seed-095', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The museum is free, but (   ) are welcome to support its activities.',
    questionJa: 'その博物館は無料だが、活動を支援するための寄付は歓迎される。',
    choices: [
      { key: '1', word: 'donations',  meaning: '寄付' },
      { key: '2', word: 'directions', meaning: '指示' },
      { key: '3', word: 'decisions',  meaning: '決定' },
      { key: '4', word: 'discussions', meaning: '議論' },
    ],
    answer: '1',
    explanation: '活動を支援するために歓迎されるものなので、1 donations「寄付」が正解。2 directions「指示」3 decisions「決定」4 discussions「議論」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000095000,
  },
  {
    id: 'seed-096', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'Although he was nervous, he managed to give his speech with (   ).',
    questionJa: '緊張していたが、彼はなんとか自信を持ってスピーチをすることができた。',
    choices: [
      { key: '1', word: 'confidence', meaning: '自信' },
      { key: '2', word: 'difference', meaning: '違い' },
      { key: '3', word: 'experience', meaning: '経験' },
      { key: '4', word: 'audience',   meaning: '聴衆' },
    ],
    answer: '1',
    explanation: '緊張しながらもスピーチをやり遂げた様子を表すので、1 confidence「自信」が正解。2 difference「違い」3 experience「経験」4 audience「聴衆」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000096000,
  },
  {
    id: 'seed-097', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'I am worried about the test results.' },
      { speaker: 'B', text: 'Do not (   ). I am sure you did your best.' },
    ],
    questionText: null,
    questionJa: 'A：テストの結果が心配だよ。\nB：心配しないで。きっと全力を尽くしたんだから。',
    choices: [
      { key: '1', word: 'worry',  meaning: '心配する' },
      { key: '2', word: 'hurry',  meaning: '急ぐ' },
      { key: '3', word: 'carry',  meaning: '運ぶ' },
      { key: '4', word: 'marry',  meaning: '結婚する' },
    ],
    answer: '1',
    explanation: '心配しているAを励ます言葉なので、1 worry「心配する」が正解。2 hurry「急ぐ」3 carry「運ぶ」4 marry「結婚する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000097000,
  },
  {
    id: 'seed-098', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The factory was built in a (   ) area where few people live.',
    questionJa: 'その工場はほとんど人が住んでいない人里離れた地域に建てられた。',
    choices: [
      { key: '1', word: 'remote',  meaning: '人里離れた' },
      { key: '2', word: 'crowded', meaning: '混雑した' },
      { key: '3', word: 'narrow',  meaning: '狭い' },
      { key: '4', word: 'modern',  meaning: '現代の' },
    ],
    answer: '1',
    explanation: 'ほとんど人が住んでいない地域を表すので、1 remote「人里離れた」が正解。2 crowded「混雑した」3 narrow「狭い」4 modern「現代の」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000098000,
  },
  {
    id: 'seed-099', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The airline apologized and offered a full (   ) for the canceled flight.',
    questionJa: 'その航空会社は謝罪し、欠航した便に対して全額返金を申し出た。',
    choices: [
      { key: '1', word: 'refund',  meaning: '返金' },
      { key: '2', word: 'result',  meaning: '結果' },
      { key: '3', word: 'reform',  meaning: '改革' },
      { key: '4', word: 'request', meaning: '要求' },
    ],
    answer: '1',
    explanation: '欠航した便に対して申し出るものなので、1 refund「返金」が正解。2 result「結果」3 reform「改革」4 request「要求」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000099000,
  },
  {
    id: 'seed-100', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'How was your job interview?' },
      { speaker: 'B', text: 'I think it went well. The manager seemed (   ) with my answers.' },
    ],
    questionText: null,
    questionJa: 'A：就職の面接はどうだった？\nB：うまくいったと思う。部長は私の回答に満足しているようだった。',
    choices: [
      { key: '1', word: 'satisfied', meaning: '満足した' },
      { key: '2', word: 'surprised', meaning: '驚いた' },
      { key: '3', word: 'confused',  meaning: '混乱した' },
      { key: '4', word: 'bored',     meaning: '退屈した' },
    ],
    answer: '1',
    explanation: '面接がうまくいったという文脈なので、1 satisfied「満足した」が正解。2 surprised「驚いた」3 confused「混乱した」4 bored「退屈した」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000100000,
  },
  {
    id: 'seed-101', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The volunteers worked hard to (   ) the river after the flood.',
    questionJa: 'ボランティアたちは洪水の後、川をきれいにするために懸命に働いた。',
    choices: [
      { key: '1', word: 'clean',   meaning: 'きれいにする' },
      { key: '2', word: 'climb',   meaning: '登る' },
      { key: '3', word: 'close',   meaning: '閉じる' },
      { key: '4', word: 'cross',   meaning: '横切る' },
    ],
    answer: '1',
    explanation: '洪水の後に川に対してすることなので、1 clean「きれいにする」が正解。2 climb「登る」3 close「閉じる」4 cross「横切る」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000101000,
  },
  {
    id: 'seed-102', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'It is important to (   ) electricity in order to protect the environment.',
    questionJa: '環境を守るために電気を節約することが大切だ。',
    choices: [
      { key: '1', word: 'save',   meaning: '節約する' },
      { key: '2', word: 'waste',  meaning: '浪費する' },
      { key: '3', word: 'spend',  meaning: '費やす' },
      { key: '4', word: 'borrow', meaning: '借りる' },
    ],
    answer: '1',
    explanation: '環境を守るために電気に対してすべきことなので、1 save「節約する」が正解。2 waste「浪費する」3 spend「費やす」4 borrow「借りる」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000102000,
  },
  {
    id: 'seed-103', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'Did you understand the math lesson today?' },
      { speaker: 'B', text: 'Not really. The explanation was too (   ) for me.' },
    ],
    questionText: null,
    questionJa: 'A：今日の数学の授業は理解できた？\nB：あまり。説明が私には難しすぎたよ。',
    choices: [
      { key: '1', word: 'complicated', meaning: '複雑な' },
      { key: '2', word: 'comfortable', meaning: '快適な' },
      { key: '3', word: 'convenient',  meaning: '便利な' },
      { key: '4', word: 'confident',   meaning: '自信のある' },
    ],
    answer: '1',
    explanation: '理解できなかった説明の様子を表すので、1 complicated「複雑な」が正解。2 comfortable「快適な」3 convenient「便利な」4 confident「自信のある」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000103000,
  },
  {
    id: 'seed-104', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The new employee made a good (   ) on his boss during the first week.',
    questionJa: '新入社員は最初の1週間で上司に良い印象を与えた。',
    choices: [
      { key: '1', word: 'impression', meaning: '印象' },
      { key: '2', word: 'instruction', meaning: '指示' },
      { key: '3', word: 'invitation',  meaning: '招待' },
      { key: '4', word: 'information', meaning: '情報' },
    ],
    answer: '1',
    explanation: 'make a good impression「良い印象を与える」という表現を作る1 impression「印象」が正解。2 instruction「指示」3 invitation「招待」4 information「情報」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000104000,
  },
  {
    id: 'seed-105', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The train was delayed (   ) the heavy snow this morning.',
    questionJa: '今朝は大雪のせいで電車が遅れた。',
    choices: [
      { key: '1', word: 'due to',  meaning: '〜のために' },
      { key: '2', word: 'instead of', meaning: '〜の代わりに' },
      { key: '3', word: 'thanks',  meaning: 'ありがとう' },
      { key: '4', word: 'apart',   meaning: '離れて' },
    ],
    answer: '1',
    explanation: '電車が遅れた原因を表すので、1 due to「〜のために」が正解。2 instead of「〜の代わりに」3 thanks「ありがとう」4 apart「離れて」はいずれも原因を表さず文意に合わない。',
    tags: [], addedAt: 1715000105000,
  },
  {
    id: 'seed-106', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'Your English has improved a lot!' },
      { speaker: 'B', text: 'Thank you. Daily (   ) really makes a difference.' },
    ],
    questionText: null,
    questionJa: 'A：あなたの英語はずいぶん上達したね！\nB：ありがとう。毎日の練習が本当に違いを生むんだ。',
    choices: [
      { key: '1', word: 'practice', meaning: '練習' },
      { key: '2', word: 'service',  meaning: '奉仕' },
      { key: '3', word: 'notice',   meaning: '通知' },
      { key: '4', word: 'advice',   meaning: '助言' },
    ],
    answer: '1',
    explanation: '英語の上達につながる毎日の行いなので、1 practice「練習」が正解。2 service「奉仕」3 notice「通知」4 advice「助言」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000106000,
  },
  {
    id: 'seed-107', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The hikers had to (   ) their plans because of the sudden storm.',
    questionJa: 'ハイカーたちは突然の嵐のために計画を変更しなければならなかった。',
    choices: [
      { key: '1', word: 'alter',  meaning: '変更する' },
      { key: '2', word: 'alarm',  meaning: '驚かす' },
      { key: '3', word: 'allow',  meaning: '許す' },
      { key: '4', word: 'apply',  meaning: '適用する' },
    ],
    answer: '1',
    explanation: '突然の嵐のために計画に対してすることなので、1 alter「変更する」が正解。2 alarm「驚かす」3 allow「許す」4 apply「適用する」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000107000,
  },
  {
    id: 'seed-108', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'She has a natural (   ) for music and started playing the piano at the age of three.',
    questionJa: '彼女は音楽の生まれ持った才能があり、3歳でピアノを弾き始めた。',
    choices: [
      { key: '1', word: 'talent', meaning: '才能' },
      { key: '2', word: 'target', meaning: '標的' },
      { key: '3', word: 'temper', meaning: '気性' },
      { key: '4', word: 'tax',    meaning: '税金' },
    ],
    answer: '1',
    explanation: '幼くしてピアノを弾き始めた素質を表すので、1 talent「才能」が正解。2 target「標的」3 temper「気性」4 tax「税金」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000108000,
  },
  {
    id: 'seed-109', source: 'builtin', grade: 'grade2',
    dialogueLines: [
      { speaker: 'A', text: 'I am thinking of buying this used car.' },
      { speaker: 'B', text: 'Be careful. You should check its (   ) before paying.' },
    ],
    questionText: null,
    questionJa: 'A：この中古車を買おうと思っているんだ。\nB：気をつけて。支払う前に状態を確認するべきだよ。',
    choices: [
      { key: '1', word: 'condition', meaning: '状態' },
      { key: '2', word: 'collection', meaning: '収集' },
      { key: '3', word: 'correction', meaning: '訂正' },
      { key: '4', word: 'connection', meaning: '接続' },
    ],
    answer: '1',
    explanation: '中古車について支払う前に確認するものなので、1 condition「状態」が正解。2 collection「収集」3 correction「訂正」4 connection「接続」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000109000,
  },
  {
    id: 'seed-110', source: 'builtin', grade: 'grade2',
    dialogueLines: null,
    questionText: 'The government announced a new (   ) to reduce plastic waste across the country.',
    questionJa: '政府は全国でプラスチックごみを減らすための新しい政策を発表した。',
    choices: [
      { key: '1', word: 'policy',  meaning: '政策' },
      { key: '2', word: 'penalty', meaning: '罰則' },
      { key: '3', word: 'pattern', meaning: '型' },
      { key: '4', word: 'package', meaning: '小包' },
    ],
    answer: '1',
    explanation: 'プラスチックごみを減らすために政府が発表するものなので、1 policy「政策」が正解。2 penalty「罰則」3 pattern「型」4 package「小包」はいずれも文意に合わない。',
    tags: [], addedAt: 1715000110000,
  },
];

// ============================================================
// ユーティリティ
// ============================================================
function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function saveLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function gradeLabel(grade) {
  if (grade === 'grade1') return '1級';

  return '2級';
}
function gradeStyle(grade) {
  if (grade === 'grade1') return { backgroundColor: C.g1Bg, color: C.g1Text };

  return { backgroundColor: C.g2Bg, color: C.g2Text };
}

// ============================================================
// Groq API 呼び出し
// ============================================================
async function callGroq({ apiKey, messages, maxTokens = 2000, model = GROQ_MODEL }) {
  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function extractFromImage({ base64, mediaType, apiKey }) {
  const prompt = `画像内の英語4択問題を全て見つけて、以下のJSON配列として返してください。

各問題のフォーマット:
{
  "dialogueLines": [{"speaker":"A","text":"..."}, {"speaker":"B","text":"..."}] または null（単文の場合）,
  "questionText": "単文の英文（dialogueLinesがnullの場合）" または null,
  "questionJa": "日本語訳（全話者分を\\nで区切る）",
  "choices": [{"key":"1","word":"英単語","meaning":"日本語意味"},{"key":"2",...},{"key":"3",...},{"key":"4",...}],
  "answer": "正解の番号（\"1\"〜\"4\"の文字列）",
  "explanation": "解説文（日本語）",
  "grade": "grade2"
}

注意:
- A/B対話形式はdialogueLines配列に、単文はquestionTextに入れる
- 空欄は (   ) のまま残す
- JSONのみ返答してください（コードブロック不要）`;

  const raw = await callGroq({
    apiKey,
    model: GROQ_VISION_MODEL,
    maxTokens: 3000,
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}` } },
        { type: 'text', text: prompt },
      ],
    }],
  });
  return JSON.parse(raw.replace(/```json\n?|```/g, '').trim());
}

async function generateQuestions({ topic, grade, count, apiKey }) {
  const gl = gradeLabel(grade);
  const prompt = `英検${gl}レベルの英語4択語彙問題を${count}問作成してください。

テーマ: ${topic}

以下のJSON配列フォーマットで返してください:
[
  {
    "dialogueLines": [{"speaker":"A","text":"..."},{"speaker":"B","text":"..."}] または null,
    "questionText": "単文の場合のみ。空欄は (   ) で表記" または null,
    "questionJa": "日本語訳（\\nで行区切り）",
    "choices": [{"key":"1","word":"英単語","meaning":"日本語意味"},{"key":"2",...},{"key":"3",...},{"key":"4",...}],
    "answer": "1"〜"4"の正解番号,
    "explanation": "解説（日本語、なぜ正解かと各選択肢の意味）",
    "grade": "${grade}"
  }
]

- 対話形式と単文を混ぜて作成してください
- 選択肢は紛らわしいものを選んでください
- JSONのみ返答してください`;

  const raw = await callGroq({ apiKey, maxTokens: 3000, messages: [{ role: 'user', content: prompt }] });
  return JSON.parse(raw.replace(/```json\n?|```/g, '').trim());
}

// ============================================================
// APIキー設定モーダル
// ============================================================
function ApiKeyModal({ onClose, onSave }) {
  const [key, setKey] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ backgroundColor: C.card, boxShadow: SH }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.aiBg }}>
            <KeyRound size={20} style={{ color: C.ai }} />
          </div>
          <div>
            <div className="font-bold" style={{ color: C.text }}>Groq APIキー設定</div>
            <div className="text-xs" style={{ color: C.textMuted }}>画像抽出・AI生成に必要です</div>
          </div>
          <button onClick={onClose} className="ml-auto p-1 rounded-lg" style={{ color: C.textMuted }}>
            <X size={18} />
          </button>
        </div>
        <input
          type="password" value={key} onChange={e => setKey(e.target.value)}
          placeholder="gsk_..."
          className="w-full rounded-xl px-4 py-3 text-sm mb-3 outline-none"
          style={{ border: `1px solid ${C.border}`, color: C.text }} />
        <p className="text-xs mb-4" style={{ color: C.textMuted }}>
          キーはこのデバイスのみに保存されます。<a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: C.ai }}>Groq Console</a>で取得できます。
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ border: `1px solid ${C.border}`, color: C.textSub }}>キャンセル</button>
          <button onClick={() => { onSave(key.trim()); onClose(); }}
            disabled={!key.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: key.trim() ? C.ai : C.textMuted }}>保存</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// クロスアプリナビゲーション
// ============================================================
function AppNav({ onKeyClick, hasKey }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const LINKS = [
    { href: 'https://kantanapp.github.io/eiken-portal/', label: '🎓 TOP', current: false },
    { href: 'https://eiken-vocab2026423.web.app', label: '📚 単語', current: false },
    { href: 'https://kantanapp.github.io/long-passage/', label: '📝 長文', current: false },
    { href: 'https://kantanapp.github.io/summary/', label: '✍️ 要約', current: false },
    { href: '#', label: '🔤 単語クイズ', current: true },
  ];
  return (
    <header className="sticky top-0 z-20 px-4 sm:px-6 py-3 flex items-center gap-3 relative"
      style={{ backgroundColor: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e2e8f0' }}>
      <button onClick={() => setMenuOpen(v => !v)} className="p-1.5 rounded-lg transition-colors"
        style={{ color: C.textMuted }}>
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: C.primary }}>英</div>
      <span className="text-base font-bold" style={{ color: C.text }}>単語クイズ</span>
      <button onClick={onKeyClick} className="ml-auto p-2 rounded-xl transition-colors"
        style={{ color: hasKey ? C.ai : C.textMuted, backgroundColor: hasKey ? C.aiBg : 'transparent' }}
        title="APIキー設定">
        <KeyRound size={18} />
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-48 rounded-xl shadow-lg z-20 overflow-hidden"
            style={{ backgroundColor: C.card, border: `1px solid ${C.borderLight}` }}>
            {LINKS.map(({ href, label, current }) =>
              current ? (
                <span key={label} className="flex items-center px-4 py-3 text-sm font-bold"
                  style={{ color: '#6366f1', background: '#eef2ff' }}>{label}</span>
              ) : (
                <a key={label} href={href} target="_self"
                  className="flex items-center px-4 py-3 text-sm transition-colors"
                  style={{ color: C.text, textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => setMenuOpen(false)}>
                  {label}
                </a>
              )
            )}
          </div>
        </>
      )}
    </header>
  );
}

// ============================================================
// 級バッジ
// ============================================================
function GradeBadge({ grade }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
      style={gradeStyle(grade)}>
      {gradeLabel(grade)}
    </span>
  );
}

// ============================================================
// 問題カード（一覧用）
// ============================================================
function QuizCard({ q, hist, onClick }) {
  const h = hist[q.id] || { attempts: 0, correct: 0 };
  const rate = h.attempts > 0 ? Math.round((h.correct / h.attempts) * 100) : null;
  const preview = q.dialogueLines
    ? q.dialogueLines[0].text.replace('(   )', '___')
    : q.questionText.replace('(   )', '___');

  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl p-4 mb-3 flex items-start gap-3 transition-all active:scale-[0.98]"
      style={{ backgroundColor: C.card, boxShadow: SH, border: `1px solid ${C.borderLight}` }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <GradeBadge grade={q.grade} />
          {q.dialogueLines && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: C.primaryBg, color: C.primary }}>対話</span>
          )}
          {rate !== null && (
            <span className="text-[10px] font-bold ml-auto"
              style={{ color: rate >= 70 ? C.ok : rate >= 40 ? '#D97706' : C.ng }}>
              {h.correct}/{h.attempts} 正解
            </span>
          )}
        </div>
        <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: C.text }}>
          {preview}
        </p>
      </div>
      <ChevronRight size={18} style={{ color: C.textMuted, flexShrink: 0, marginTop: 2 }} />
    </button>
  );
}

// ============================================================
// 問題画面
// ============================================================
function QuizScreen({ q, onAnswer, onBack }) {
  const [showJa, setShowJa] = useState(false);
  const [selected, setSelected] = useState(null);

  function handleSelect(key) {
    if (selected !== null) return;
    setSelected(key);
    onAnswer(key);
  }

  function choiceState(key) {
    if (selected === null) return 'idle';
    if (key === q.answer) return 'correct';
    if (key === selected) return 'wrong';
    return 'idle';
  }

  function choiceStyle(state) {
    if (state === 'correct') return { backgroundColor: C.okBg, borderColor: C.ok, color: C.ok };
    if (state === 'wrong') return { backgroundColor: C.ngBg, borderColor: C.ng, color: C.ng };
    return { backgroundColor: C.card, borderColor: C.border, color: C.text };
  }

  return (
    <div className="flex-1 px-4 sm:px-6 py-4 max-w-2xl mx-auto w-full">
      <button onClick={onBack} className="flex items-center gap-1 text-sm mb-4"
        style={{ color: C.textMuted }}>
        <ArrowLeft size={16} /> 問題一覧
      </button>

      {/* 問題文 */}
      <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: C.card, boxShadow: SH }}>
        <div className="flex items-center gap-2 mb-3">
          <GradeBadge grade={q.grade} />
          {q.dialogueLines && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: C.primaryBg, color: C.primary }}>対話形式</span>
          )}
        </div>

        {q.dialogueLines ? (
          <div className="space-y-2">
            {q.dialogueLines.map((line, i) => (
              <div key={i} className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: C.primaryBg, color: C.primary }}>
                  {line.speaker}
                </span>
                <p className="text-sm leading-relaxed pt-0.5" style={{ color: C.text }}>
                  {line.text.replace('(   )', '（　　　）')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: C.text }}>
            {q.questionText.replace('(   )', '（　　　）')}
          </p>
        )}

        {/* 日本語訳 */}
        <button onClick={() => setShowJa(v => !v)}
          className="flex items-center gap-1 text-xs mt-3"
          style={{ color: C.textMuted }}>
          {showJa ? <EyeOff size={13} /> : <Eye size={13} />}
          日本語訳を{showJa ? '隠す' : '見る'}
        </button>
        {showJa && (
          <div className="mt-2 pt-2 text-xs leading-relaxed whitespace-pre-line"
            style={{ color: C.textSub, borderTop: `1px solid ${C.borderLight}` }}>
            {q.questionJa}
          </div>
        )}
      </div>

      {/* 選択肢 */}
      <div className="space-y-3">
        {q.choices.map(ch => {
          const state = choiceState(ch.key);
          return (
            <button key={ch.key} onClick={() => handleSelect(ch.key)}
              className="w-full rounded-2xl p-4 text-left flex items-center gap-3 transition-all active:scale-[0.98]"
              style={{ border: `2px solid`, ...choiceStyle(state), boxShadow: SH }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: state === 'idle' ? C.primaryBg : 'transparent',
                         color: state === 'idle' ? C.primary : 'inherit' }}>
                {ch.key}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-sm">{ch.word}</div>
                {(selected !== null) && (
                  <div className="text-xs mt-0.5" style={{ color: state === 'idle' ? C.textMuted : 'inherit', opacity: 0.8 }}>
                    {ch.meaning}
                  </div>
                )}
              </div>
              {state === 'correct' && <CheckCircle size={20} style={{ color: C.ok, flexShrink: 0 }} />}
              {state === 'wrong' && <XCircle size={20} style={{ color: C.ng, flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>

      {/* 解説（回答後） */}
      {selected !== null && (
        <div className="mt-4 rounded-2xl p-4"
          style={{ backgroundColor: selected === q.answer ? C.okBg : C.ngBg,
                   border: `1px solid ${selected === q.answer ? C.ok : C.ng}` }}>
          <div className="flex items-center gap-2 mb-2">
            {selected === q.answer
              ? <CheckCircle size={18} style={{ color: C.ok }} />
              : <XCircle size={18} style={{ color: C.ng }} />}
            <span className="font-bold text-sm"
              style={{ color: selected === q.answer ? C.ok : C.ng }}>
              {selected === q.answer ? '正解！' : `不正解（正解: ${q.answer}）`}
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: C.text }}>
            {q.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 進捗画面
// ============================================================
function StatsView({ questions, hist }) {
  const grades = [
    { key: 'all', label: '全て' },
    { key: 'grade2', label: '2級' },
    { key: 'grade1', label: '1級' },
  ];

  function statsFor(qs) {
    const attempted = qs.filter(q => hist[q.id]?.attempts > 0);
    const correct = attempted.reduce((s, q) => s + (hist[q.id]?.correct || 0), 0);
    const total = attempted.reduce((s, q) => s + (hist[q.id]?.attempts || 0), 0);
    return { total: qs.length, attempted: attempted.length, correct, totalAttempts: total };
  }

  const weakQuestions = questions
    .filter(q => {
      const h = hist[q.id];
      return h && h.attempts >= 2 && h.correct / h.attempts < 0.6;
    })
    .sort((a, b) => {
      const ra = hist[a.id].correct / hist[a.id].attempts;
      const rb = hist[b.id].correct / hist[b.id].attempts;
      return ra - rb;
    })
    .slice(0, 10);

  return (
    <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-3 mb-6">
        {grades.map(g => {
          const qs = g.key === 'all' ? questions : questions.filter(q => q.grade === g.key);
          const s = statsFor(qs);
          if (qs.length === 0) return null;
          const pct = s.totalAttempts > 0 ? Math.round((s.correct / s.totalAttempts) * 100) : 0;
          return (
            <div key={g.key} className="rounded-2xl p-4" style={{ backgroundColor: C.card, boxShadow: SH }}>
              <div className="text-xs font-medium mb-1" style={{ color: C.textSub }}>{g.label}</div>
              <div className="text-2xl font-bold mb-1" style={{ color: C.text }}>{pct}<span className="text-sm">%</span></div>
              <div className="w-full h-1.5 rounded-full mb-2" style={{ backgroundColor: C.borderLight }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? C.ok : pct >= 40 ? C.orange : C.ng }} />
              </div>
              <div className="text-[11px]" style={{ color: C.textMuted }}>
                {s.attempted}/{s.total}問 挑戦済み
              </div>
            </div>
          );
        })}
      </div>

      {weakQuestions.length > 0 && (
        <>
          <div className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: C.text }}>
            <AlertCircle size={16} style={{ color: C.ng }} /> 苦手問題（正解率60%未満）
          </div>
          <div className="space-y-2">
            {weakQuestions.map(q => {
              const h = hist[q.id];
              const rate = Math.round((h.correct / h.attempts) * 100);
              const preview = q.dialogueLines
                ? q.dialogueLines[0].text.replace('(   )', '___')
                : q.questionText.replace('(   )', '___');
              return (
                <div key={q.id} className="rounded-xl p-3 flex items-center gap-3"
                  style={{ backgroundColor: C.card, boxShadow: SH }}>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: C.ngBg, color: C.ng }}>{rate}%</span>
                  <p className="text-xs line-clamp-1 flex-1" style={{ color: C.textSub }}>{preview}</p>
                  <GradeBadge grade={q.grade} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {questions.length === 0 && (
        <div className="text-center py-16" style={{ color: C.textMuted }}>
          <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">まだ問題がありません</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 問題追加画面
// ============================================================
function AddView({ apiKey, onShowKeyModal, onQuestionsAdded }) {
  const [tab, setTab] = useState('image');
  const [imgFiles, setImgFiles] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState([]);
  const [extractErr, setExtractErr] = useState('');

  const [genTopic, setGenTopic] = useState('');
  const [genGrade, setGenGrade] = useState('grade2');
  const [genCount, setGenCount] = useState('5');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState([]);
  const [genErr, setGenErr] = useState('');

  const fileRef = useRef();
  const jsonRef = useRef();

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const url = e.target.result;
        const base64 = url.split(',')[1];
        const mediaType = file.type || 'image/jpeg';
        resolve({ base64, mediaType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleExtract() {
    if (!apiKey) { onShowKeyModal(); return; }
    if (imgFiles.length === 0) return;
    setExtracting(true);
    setExtractErr('');
    try {
      const all = [];
      for (const file of imgFiles) {
        const { base64, mediaType } = await readFileAsBase64(file);
        const qs = await extractFromImage({ base64, mediaType, apiKey });
        all.push(...qs);
      }
      setExtracted(all.map((q, i) => ({ ...q, _tmpId: `tmp-${Date.now()}-${i}` })));
    } catch (e) {
      setExtractErr(`抽出エラー: ${e.message}`);
    } finally {
      setExtracting(false);
    }
  }

  async function handleGenerate() {
    if (!apiKey) { onShowKeyModal(); return; }
    if (!genTopic.trim()) return;
    setGenerating(true);
    setGenErr('');
    try {
      const qs = await generateQuestions({ topic: genTopic.trim(), grade: genGrade, count: parseInt(genCount), apiKey });
      setGenerated(qs.map((q, i) => ({ ...q, _tmpId: `tmp-${Date.now()}-${i}` })));
    } catch (e) {
      setGenErr(`生成エラー: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  }

  function addQuestions(qs) {
    const newQs = qs.map(q => ({
      ...q,
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      source: q.source || 'user',
      tags: q.tags || [],
      addedAt: Date.now(),
    }));
    onQuestionsAdded(newQs);
    setExtracted([]);
    setGenerated([]);
    setImgFiles([]);
  }

  function handleJsonImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const qs = JSON.parse(ev.target.result);
        if (!Array.isArray(qs)) throw new Error('配列でありません');
        addQuestions(qs);
        alert(`${qs.length}問を追加しました`);
      } catch (err) {
        alert(`JSONエラー: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const TABS = [
    { k: 'image', label: '📸 画像から抽出' },
    { k: 'generate', label: '✨ AI生成' },
    { k: 'json', label: '📁 JSON' },
  ];

  function PreviewList({ qs, onConfirm }) {
    if (qs.length === 0) return null;
    return (
      <div className="mt-4">
        <div className="text-sm font-bold mb-3" style={{ color: C.text }}>
          抽出結果（{qs.length}問）
        </div>
        <div className="space-y-3 mb-4">
          {qs.map((q, i) => (
            <div key={q._tmpId} className="rounded-xl p-3" style={{ backgroundColor: C.primaryBg, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: C.primary }}>問{i + 1}</span>
                <GradeBadge grade={q.grade || 'grade2'} />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: C.text }}>
                {q.dialogueLines
                  ? q.dialogueLines.map(l => `${l.speaker}: ${l.text}`).join(' / ')
                  : q.questionText}
              </p>
              <p className="text-xs mt-1" style={{ color: C.ok }}>正解: {q.answer} ({q.choices?.find(c => c.key === q.answer)?.word})</p>
            </div>
          ))}
        </div>
        <button onClick={() => onConfirm(qs)}
          className="w-full py-3 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: C.primary }}>
          {qs.length}問を追加する
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto">
      {/* タブ */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              backgroundColor: tab === t.k ? C.primary : C.card,
              color: tab === t.k ? '#fff' : C.textSub,
              boxShadow: SH,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* タブ1: 画像抽出 */}
      {tab === 'image' && (
        <div>
          <p className="text-sm mb-4" style={{ color: C.textSub }}>
            Kindleのスクリーンショットをアップロードすると、AIが問題を自動で抽出します。
          </p>
          <button onClick={() => fileRef.current?.click()}
            className="w-full rounded-2xl p-6 flex flex-col items-center gap-3 mb-4 transition-all"
            style={{ border: `2px dashed ${C.border}`, backgroundColor: C.card }}>
            <Upload size={28} style={{ color: C.primary }} />
            <span className="text-sm font-medium" style={{ color: C.textSub }}>
              タップして画像を選択
            </span>
            {imgFiles.length > 0 && (
              <span className="text-xs" style={{ color: C.ok }}>{imgFiles.length}枚選択済み</span>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => setImgFiles(Array.from(e.target.files || []))} />

          {!apiKey && (
            <div className="rounded-xl p-3 mb-4 flex items-start gap-2"
              style={{ backgroundColor: C.aiBg, border: `1px solid ${C.ai}20` }}>
              <AlertCircle size={16} style={{ color: C.ai, flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs" style={{ color: C.ai }}>
                Claude APIキーが必要です。右上のキーアイコンから設定してください。
              </p>
            </div>
          )}

          <button onClick={handleExtract}
            disabled={imgFiles.length === 0 || extracting}
            className="w-full py-3 rounded-xl text-sm font-bold text-white mb-2 flex items-center justify-center gap-2"
            style={{ backgroundColor: imgFiles.length > 0 && !extracting ? C.ai : C.textMuted }}>
            <Sparkles size={16} />
            {extracting ? 'AIで抽出中...' : 'AIで問題を抽出'}
          </button>

          {extractErr && (
            <p className="text-xs p-3 rounded-xl mb-3" style={{ backgroundColor: C.ngBg, color: C.ng }}>{extractErr}</p>
          )}
          <PreviewList qs={extracted} onConfirm={addQuestions} />
        </div>
      )}

      {/* タブ2: AI生成 */}
      {tab === 'generate' && (
        <div>
          <p className="text-sm mb-4" style={{ color: C.textSub }}>
            テーマと級を指定すると、AIが新しい問題を生成します。
          </p>
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: C.textSub }}>テーマ</label>
              <input value={genTopic} onChange={e => setGenTopic(e.target.value)}
                placeholder="例: ビジネス英語、自然・環境、科学技術..."
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ border: `1px solid ${C.border}`, color: C.text }} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium block mb-1" style={{ color: C.textSub }}>級</label>
                <select value={genGrade} onChange={e => setGenGrade(e.target.value)}
                  className="w-full rounded-xl px-3 py-3 text-sm outline-none"
                  style={{ border: `1px solid ${C.border}`, color: C.text, backgroundColor: C.card }}>
                  <option value="grade2">2級</option>

                  <option value="grade1">1級</option>
                </select>
              </div>
              <div className="w-24">
                <label className="text-xs font-medium block mb-1" style={{ color: C.textSub }}>問題数</label>
                <select value={genCount} onChange={e => setGenCount(e.target.value)}
                  className="w-full rounded-xl px-3 py-3 text-sm outline-none"
                  style={{ border: `1px solid ${C.border}`, color: C.text, backgroundColor: C.card }}>
                  <option value="3">3問</option>
                  <option value="5">5問</option>
                  <option value="10">10問</option>
                </select>
              </div>
            </div>
          </div>

          {!apiKey && (
            <div className="rounded-xl p-3 mb-4 flex items-start gap-2"
              style={{ backgroundColor: C.aiBg, border: `1px solid ${C.ai}20` }}>
              <AlertCircle size={16} style={{ color: C.ai, flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs" style={{ color: C.ai }}>Claude APIキーが必要です。右上のキーアイコンから設定してください。</p>
            </div>
          )}

          <button onClick={handleGenerate}
            disabled={!genTopic.trim() || generating}
            className="w-full py-3 rounded-xl text-sm font-bold text-white mb-2 flex items-center justify-center gap-2"
            style={{ backgroundColor: genTopic.trim() && !generating ? C.ai : C.textMuted }}>
            <Sparkles size={16} />
            {generating ? 'AIで生成中...' : `${genCount}問を生成する`}
          </button>

          {genErr && (
            <p className="text-xs p-3 rounded-xl mb-3" style={{ backgroundColor: C.ngBg, color: C.ng }}>{genErr}</p>
          )}
          <PreviewList qs={generated} onConfirm={addQuestions} />
        </div>
      )}

      {/* タブ3: JSON */}
      {tab === 'json' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ backgroundColor: C.card, boxShadow: SH }}>
            <div className="flex items-center gap-2 mb-3">
              <Download size={18} style={{ color: C.primary }} />
              <span className="font-bold text-sm" style={{ color: C.text }}>エクスポート</span>
            </div>
            <p className="text-xs mb-3" style={{ color: C.textSub }}>
              追加した問題をJSONファイルとして保存します。他のデバイスでのインポートに使えます。
            </p>
            <button
              onClick={() => {
                const userQs = JSON.parse(localStorage.getItem('vocabquiz_questions') || '[]');
                const blob = new Blob([JSON.stringify(userQs, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `vocab-quiz-${Date.now()}.json`; a.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full py-2.5 rounded-xl text-sm font-medium"
              style={{ border: `1px solid ${C.border}`, color: C.textSub }}>
              <Download size={14} className="inline mr-1" />
              JSONをダウンロード
            </button>
          </div>

          <div className="rounded-2xl p-5" style={{ backgroundColor: C.card, boxShadow: SH }}>
            <div className="flex items-center gap-2 mb-3">
              <FileJson size={18} style={{ color: C.primary }} />
              <span className="font-bold text-sm" style={{ color: C.text }}>インポート</span>
            </div>
            <p className="text-xs mb-3" style={{ color: C.textSub }}>
              JSONファイルをアップロードして問題を追加します。
            </p>
            <button onClick={() => jsonRef.current?.click()}
              className="w-full py-2.5 rounded-xl text-sm font-medium"
              style={{ border: `1px solid ${C.border}`, color: C.textSub }}>
              <Upload size={14} className="inline mr-1" />
              JSONファイルを選択
            </button>
            <input ref={jsonRef} type="file" accept=".json,application/json" className="hidden"
              onChange={handleJsonImport} />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// メインアプリ
// ============================================================
// ============================================================
// 選択肢ランダム化（重要・恒久的に維持すること）
// 問題データ側で答えが特定の番号（特に「1」）に偏っていても、表示時には
// 各問題の選択肢を問題idで決定論的にシャッフルし、番号を振り直して
// 答えがランダムに分散するようにする。SEED_DATA・ユーザー追加・AI生成の
// すべての問題に自動適用されるので、今後問題を追加する際もデータ側の答えが
// 何番であっても、答えは自動的にランダム化される。
// idシードなので同じ問題は常に同じ並び＝リロードしても変わらない。
// ※「答えが全部1になる」バグの再発防止。このロジックは削除しないこと。
// ============================================================
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randomizeChoices(q) {
  if (!q || !Array.isArray(q.choices) || q.choices.length === 0) return q;
  const rand = mulberry32(hashStr(String(q.id)));
  // Fisher–Yates（idシードで決定論的にシャッフル）
  const shuffled = q.choices.map(c => ({ ...c }));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // 番号を1..4に振り直し、oldKey -> newKey の対応を作る
  const keyMap = {};
  const newChoices = shuffled.map((c, idx) => {
    const newKey = String(idx + 1);
    keyMap[c.key] = newKey;
    return { ...c, key: newKey };
  });
  const newAnswer = keyMap[q.answer] || q.answer;
  // 解説内の「<番号> <英単語>」の番号も新しい番号へ合わせる（英単語で位置を特定）
  let explanation = q.explanation || '';
  for (const c of q.choices) {
    const newKey = keyMap[c.key];
    if (!newKey || newKey === c.key || !c.word) continue;
    const esc = String(c.word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    explanation = explanation.replace(new RegExp(`${c.key}(\\s*)(${esc})`, 'g'), `${newKey}$1$2`);
  }
  return { ...q, choices: newChoices, answer: newAnswer, explanation };
}
function buildQuestions(userQs) {
  return [...SEED_DATA, ...userQs].map(randomizeChoices);
}

export default function App() {
  const [questions, setQuestions] = useState(() => {
    const userQs = loadLS('vocabquiz_questions', []);
    return buildQuestions(userQs);
  });
  const [hist, setHist] = useState(() => loadLS('vocabquiz_history', {}));
  const [apiKey, setApiKey] = useState(() => loadLS('vocabquiz_apikey', ''));
  const [showKeyModal, setShowKeyModal] = useState(false);

  const [navTab, setNavTab] = useState('list');
  const [view, setView] = useState('list');
  const [curId, setCurId] = useState(null);
  const [gf, setGf] = useState('all');

  const [nextQueue, setNextQueue] = useState([]);

  const filtered = (gf === 'all' ? questions : questions.filter(q => q.grade === gf))
    .slice().sort((a, b) => b.addedAt - a.addedAt);
  const cur = questions.find(q => q.id === curId);

  function saveApiKey(k) {
    setApiKey(k);
    saveLS('vocabquiz_apikey', k);
  }

  function recordAnswer(qId, isCorrect) {
    setHist(prev => {
      const h = prev[qId] || { attempts: 0, correct: 0, lastSeen: 0 };
      const next = { attempts: h.attempts + 1, correct: h.correct + (isCorrect ? 1 : 0), lastSeen: Date.now() };
      const updated = { ...prev, [qId]: next };
      saveLS('vocabquiz_history', updated);
      return updated;
    });
  }

  function goQuiz(id) {
    const pool = filtered.filter(q => q.id !== id);
    setNextQueue(pool.sort(() => Math.random() - 0.5).slice(0, 10).map(q => q.id));
    setCurId(id);
    setView('quiz');
  }

  function handleAnswer(key) {
    if (!cur) return;
    recordAnswer(cur.id, key === cur.answer);
  }

  function goNext() {
    if (nextQueue.length > 0) {
      const [next, ...rest] = nextQueue;
      setNextQueue(rest);
      setCurId(next);
    } else {
      setView('list');
      setCurId(null);
    }
  }

  function goBack() {
    setView('list');
    setCurId(null);
  }

  function handleQuestionsAdded(newQs) {
    const userQs = loadLS('vocabquiz_questions', []);
    const merged = [...userQs, ...newQs];
    saveLS('vocabquiz_questions', merged);
    setQuestions(buildQuestions(merged));
    setNavTab('list');
    alert(`${newQs.length}問を追加しました！`);
  }

  const GRADES = [
    { k: 'all', label: '全て' },
    { k: 'grade2', label: '2級' },
    { k: 'grade1', label: '1級' },
  ];

  const NAV = [
    { k: 'list', label: '問題一覧', I: BookOpen },
    { k: 'stats', label: '進捗', I: BarChart3 },
    { k: 'add', label: '問題追加', I: PlusCircle },
  ];

  return (
    <div className="min-h-screen pb-24"
      style={{
        backgroundColor: C.bg,
        fontFamily: '"Noto Sans JP",-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN",sans-serif',
        color: C.text,
      }}>

      <AppNav onKeyClick={() => setShowKeyModal(true)} hasKey={!!apiKey} />

      {showKeyModal && <ApiKeyModal onClose={() => setShowKeyModal(false)} onSave={saveApiKey} />}

      {/* グレードフィルター */}
      {view === 'list' && (
        <header className="sticky top-[60px] z-10 px-4 sm:px-6 py-3"
          style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.borderLight}` }}>
          {navTab === 'list' && (
            <div className="flex gap-2 overflow-x-auto">
              {GRADES.map(g => {
                const cnt = g.k === 'all' ? questions.length : questions.filter(q => q.grade === g.k).length;
                if (cnt === 0 && g.k !== 'all') return null;
                return (
                  <button key={g.k} onClick={() => setGf(g.k)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all"
                    style={{
                      backgroundColor: gf === g.k ? C.primary : C.card,
                      color: gf === g.k ? '#fff' : C.textSub,
                      boxShadow: SH,
                    }}>
                    {g.label} ({cnt})
                  </button>
                );
              })}
              <button onClick={() => {
                const pool = [...filtered].sort(() => Math.random() - 0.5);
                if (pool.length > 0) goQuiz(pool[0].id);
              }}
                className="ml-auto px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 flex items-center gap-1"
                style={{ backgroundColor: C.primaryBg, color: C.primary }}>
                <Shuffle size={12} /> ランダム
              </button>
            </div>
          )}
        </header>
      )}

      {/* メインコンテンツ */}
      {view === 'quiz' && cur ? (
        // key={cur.id} は必須。外すと QuizScreen が再マウントされず解答状態(selected)が
        // 次の問題に持ち越され、「次の問題が解答済みで表示される」「一覧で最後の問題の
        // バッジが出ない（記録されない）」バグが再発する。
        <QuizScreen key={cur.id} q={cur} onAnswer={handleAnswer} onBack={goBack} />
      ) : navTab === 'list' ? (
        <div className="px-4 sm:px-6 py-4 max-w-2xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16" style={{ color: C.textMuted }}>
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">問題がありません</p>
            </div>
          ) : (
            filtered.map(q => (
              <QuizCard key={q.id} q={q} hist={hist} onClick={() => goQuiz(q.id)} />
            ))
          )}
        </div>
      ) : navTab === 'stats' ? (
        <StatsView questions={questions} hist={hist} />
      ) : (
        <AddView apiKey={apiKey} onShowKeyModal={() => setShowKeyModal(true)} onQuestionsAdded={handleQuestionsAdded} />
      )}

      {/* 問題画面のフッターボタン */}
      {view === 'quiz' && (
        <div className="fixed bottom-0 left-0 right-0 px-4 py-3 flex gap-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', borderTop: `1px solid ${C.borderLight}` }}>
          <button onClick={goBack}
            className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ border: `1px solid ${C.border}`, color: C.textSub }}>
            一覧に戻る
          </button>
          <button onClick={goNext}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: C.primary }}>
            次の問題 <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ボトムナビ（クイズ中は非表示） */}
      {view !== 'quiz' && (
        <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-3"
          style={{ backgroundColor: C.card, borderTop: `1px solid ${C.borderLight}`, boxShadow: '0 -1px 3px rgba(15,23,42,0.03)' }}>
          {NAV.map(({ k, label, I }) => {
            const active = navTab === k;
            return (
              <button key={k} onClick={() => { setNavTab(k); if (view !== 'list') setView('list'); }}
                className="flex flex-col items-center justify-center py-3 transition-colors relative"
                style={{ color: active ? C.primary : C.textMuted }}>
                <I size={22} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[11px] font-medium mt-1">{label}</span>
                {active && <span className="absolute bottom-1 w-1 h-1 rounded-full" style={{ backgroundColor: C.primary }} />}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
