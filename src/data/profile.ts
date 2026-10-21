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
export const now = ['6人でチーム開発', '基本情報', 'AWS CLF'];

// Match log cards: month, company, one line, tags, highlighted
export const matchLog: { month: string; who: string; line: string; tags: string[]; fav?: boolean }[] = [
  { month: '07', who: 'インテージ', line: 'データからアプリを企画', tags: ['企画', 'データ'] },
  { month: '08', who: 'インテージテクノスフィア', line: 'AWS × Python', tags: ['AWS', 'Python'] },
  { month: '08〜', who: 'インターン仲間 6人', line: '終わってからが、本番。', tags: ['チーム開発'], fav: true },
  { month: '09', who: 'NTT東日本', line: 'クラウドインフラ構築', tags: ['AWS'] },
  { month: '10', who: '日立製作所', line: 'インフラ提案ワーク', tags: ['提案'] },
];
export const otherMatches: [string, string][] = [
  ['08', 'NTTデータ先端技術'], ['08', 'NRIネットコム'], ['08', 'NTTデータ中国'], ['08', 'マイナビ'], ['08', '双日テックイノベーション'],
  ['09', 'NTTデータカスタマサービス'], ['09', '千葉銀行グループ関連'], ['10', 'オリックス・レンテック'],
];

export const trophies: { label: 'GET' | 'NEXT'; name: string }[] = [
  { label: 'GET', name: 'ITパスポート' }, { label: 'GET', name: '普通自動車免許' },
  { label: 'NEXT', name: '基本情報技術者' }, { label: 'NEXT', name: 'AWS Cloud Practitioner' },
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
