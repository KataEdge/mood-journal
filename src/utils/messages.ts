import { Quote } from '../types';

/**
 * メンタルケア・セルフケア・前向きな気持ちになれる有名人・偉人の名言リスト（人物肩書付き）
 */
export const QUOTES: Quote[] = [
  {
    text: '下を向いていたら、虹を見つけることはできないよ。',
    author: 'チャールズ・チャップリン',
    authorTitle: '喜劇王 / 映画監督',
  },
  {
    text: '雲の向こうは、いつも青空。',
    author: 'ルイーザ・メイ・オルコット',
    authorTitle: '「若草物語」著者',
  },
  {
    text: '明日死ぬかのように生きよ。永久に生きるかのように学べ。',
    author: 'ガンジー',
    authorTitle: 'インド独立の父 / 思想家',
  },
  {
    text: 'どんなに暗くても、星は輝いている。',
    author: 'エマーソン',
    authorTitle: '思想家 / 詩人',
  },
  {
    text: '何も咲かない寒い日は、下へ下へと根を伸ばせ。',
    author: '高橋尚子',
    authorTitle: 'シドニー五輪マラソン金メダリスト',
  },
  {
    text: '自分自身を愛することが、生涯続くロマンスの始まりだ。',
    author: 'オスカー・ワイルド',
    authorTitle: '劇作家 / 詩人',
  },
  {
    text: '他人のものさしではなく、自分の心に従って生きよう。',
    author: 'ヘレン・ケラー',
    authorTitle: '社会運動家 / 著述家',
  },
  {
    text: '問題は未来ではない。今この瞬間をどう生きるかだ。',
    author: 'サン＝テグジュペリ',
    authorTitle: '「星の王子さま」著者 / 飛行士',
  },
  {
    text: '小さなことを重ねることが、とんでもないところへ行く唯一の道。',
    author: 'イチロー',
    authorTitle: '元プロ野球選手',
  },
  {
    text: '咲く花にも、それぞれの時期がある。あせらなくていい。',
    author: '相田みつを',
    authorTitle: '詩人 / 書家',
  },
  {
    text: '今日という日は、残りの人生の最初の一日である。',
    author: 'チャールズ・ディードリッヒ',
    authorTitle: '実業家',
  },
  {
    text: '過去の自分と比較して、一歩でも進んでいればそれで十分。',
    author: 'アーネスト・ヘミングウェイ',
    authorTitle: 'ノーベル文学賞作家',
  },
  {
    text: '幸せとは、目的地の選択ではなく、旅の歩み方のことである。',
    author: 'マーガレット・リー・ランバック',
    authorTitle: '作家',
  },
  {
    text: '完璧を目指すより、まず前進することを楽しもう。',
    author: 'ネルソン・マンデラ',
    authorTitle: '元南アフリカ大統領 / ノーベル平和賞受賞者',
  },
  {
    text: '自分を信じよう。あなたの内に秘められた力は無限大だ。',
    author: 'ジャン＝ジャック・ルソー',
    authorTitle: '哲学者 / 思想家',
  },
  {
    text: '心が変われば行動が変わる。行動が変われば未来が変わる。',
    author: 'ウィリアム・ジェームズ',
    authorTitle: '心理学者 / 哲学者',
  },
  {
    text: '大切なのは、何度転んだかではなく、何度立ち上がったかだ。',
    author: 'マザー・テレサ',
    authorTitle: '修道女 / ノーベル平和賞受賞者',
  },
  {
    text: '自分のペースで大丈夫。歩み続けることに価値がある。',
    author: 'アルバート・アインシュタイン',
    authorTitle: '理論物理学者',
  },
  {
    text: '美しいものは、ただそこにあるだけで心を癒やしてくれる。',
    author: 'ゲーテ',
    authorTitle: '詩人 / 劇作家',
  },
  {
    text: '毎日の小さな肯定が、大きな幸せの土台になる。',
    author: 'マーク・トウェイン',
    authorTitle: '「トム・ソーヤーの冒険」著者',
  },
];

/**
 * ランダムな名言を取得する
 */
export function getRandomQuote(): Quote {
  const index = Math.floor(Math.random() * QUOTES.length);
  return QUOTES[index];
}
