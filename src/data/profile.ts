// Everything shown on the page that is not a work lives here, so wording can change without touching the layout.

// Skills on the pitch: [x, y] on a 780×780 board, shirt number, label
export const players: [number, number, string, string][] = [
  [390, 660, '1', 'Linux'], [150, 545, '2', 'Docker'], [300, 575, '4', 'AWS'], [480, 575, '5', 'Node.js'], [630, 545, '3', 'PHP'],
  [225, 400, '6', '要件整理'], [390, 435, '8', 'Python'], [555, 400, '10', '画面設計'],
  [175, 215, '7', 'HTML / CSS'], [390, 175, '9', 'JavaScript'], [605, 215, '11', 'Vue.js'],
];
export const bench: [string, string][] = [['12', 'Azure'], ['14', 'データ可視化'], ['16', '生成AI'], ['18', 'ワイヤーフレーム']];

export const likes = ['FOOTBALL ⚽', 'CATS 🐈', 'WRESTLING 🤼', 'BASEBALL ⚾', 'COMEDY 🎤'];
export const keywords = ['STADIUMS', 'CLOUD', 'TEAMWORK'];
export const now = ['6人でチーム開発', '応用情報', 'AWS SAA'];

// Who I am, shown first in PLAYER. Set age to a number to show it; null hides the row.
export const profile = {
  intro: 'サイバー大学で、クラウドとWebを学んでいる大学生です。',
  facts: [
    { k: 'STATUS', v: '大学生' },
    { k: 'AGE', v: null as string | null },
    { k: 'SCHOOL', v: 'サイバー大学' },
    { k: 'GRAD', v: '2028.03 卒業予定' },
    { k: 'FROM', v: '香川' },
  ],
};

// Career timeline (MATCH LOG): year, month, title, one line, highlighted
export const career: { year: string; month?: string; title: string; line: string; tags: string[]; fav?: boolean }[] = [
  { year: '2024', month: '04', title: 'サイバー大学 入学', line: 'IT・プログラミング・クラウドを学びはじめる', tags: ['大学'] },
  { year: '2026', title: '資格を取得', line: 'AWS CLF ・ 基本情報技術者', tags: ['AWS', '国家試験'] },
  { year: '2026', title: '6人でチーム開発', line: '機能整理と文書化を担当', tags: ['チーム開発'], fav: true },
  { year: 'NOW', title: '次の資格に挑戦中', line: '応用情報技術者 ・ AWS SAA', tags: ['勉強中'] },
  { year: '2028', month: '03', title: '卒業予定', line: 'クラウドと上流工程の仕事へ', tags: ['目標'] },
];

export const trophies: { label: 'GET' | 'NEXT'; name: string }[] = [
  { label: 'GET', name: 'AWS Cloud Practitioner' }, { label: 'GET', name: '基本情報技術者' },
  { label: 'GET', name: 'ITパスポート' }, { label: 'GET', name: '普通自動車免許' },
  { label: 'NEXT', name: '応用情報技術者' }, { label: 'NEXT', name: 'AWS Solutions Architect' },
];

export const stats: { to: number; suffix?: string; label: string }[] = [
  { to: 5, label: 'DRAFTS' }, { to: 90, suffix: "'", label: 'MINUTES' }, { to: 3, label: 'LIBRARIES' }, { to: 1, label: 'CAT' },
];
export const tech = ['GSAP ScrollTrigger', 'Lenis', 'Canvas 2D', 'Astro', 'GitHub Pages'];

export const accounts = [
  { name: 'GitHub', handle: '@fondadev', url: 'https://github.com/fondadev' },
  { name: 'AtCoder', handle: '@fondadev', url: 'https://atcoder.jp/users/fondadev' },
  { name: 'X', handle: '@fondadev', url: 'https://x.com/fondadev' },
];

// Table of contents for the menu: section id, number, scene name, plain name
export const sections = [
  { id: 'kickoff', no: '01', en: 'KICK OFF', ja: 'トップ' },
  { id: 'player', no: '02', en: 'PLAYER', ja: 'プロフィール' },
  { id: 'formation', no: '03', en: 'FORMATION', ja: 'スキル' },
  { id: 'matchlog', no: '04', en: 'MATCH LOG', ja: '経歴' },
  { id: 'trophies', no: '05', en: 'TROPHIES', ja: '資格' },
  { id: 'highlights', no: '06', en: 'HIGHLIGHTS', ja: '作品' },
  { id: 'postmatch', no: '07', en: 'POST-MATCH', ja: 'このサイトについて' },
  { id: 'fulltime', no: '08', en: 'FULL TIME', ja: 'アカウント' },
];
