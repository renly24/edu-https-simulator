// ---------- モデル（スライドの内容） ----------

import type { SceneId } from "./transfer";

export const PLAIN_COLOR = "#37474f";
export const CIPHER_COLOR = "#6a1b9a";
export const EVE_COLOR = "#c62828";

export const CHAPTERS = [
  { id: 1, name: "HTTP と HTTPS", color: "#455a64" },
  { id: 2, name: "ハイブリッド暗号方式", color: "#1565c0" },
  { id: 3, name: "まとめ", color: "#2e7d32" },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];

// ---------- 問題 ----------

export interface ChoiceQuiz {
  kind: "choice";
  question: string;
  options: string[];
  answer: number;
  ok: string;
  ng: string;
  /** true の予想問題は、答えるまで次のスライドへ進めない */
  gate?: boolean;
}

export type Quiz = ChoiceQuiz | { kind: "task" } | { kind: "test" };

export type QuizLabel = "予想問題" | "体験問題" | "確認問題";

export function quizLabel(quiz: Quiz | undefined): QuizLabel | null {
  if (!quiz) return null;
  if (quiz.kind === "choice") return quiz.gate ? "予想問題" : "確認問題";
  if (quiz.kind === "test") return "確認問題";
  return "体験問題";
}

export const QUIZ_COLOR: Record<QuizLabel, string> = {
  予想問題: "#1565c0",
  体験問題: "#ef6c00",
  確認問題: "#2e7d32",
};

// ---------- スライド ----------

export type Stage =
  /** Web ブラウザ ⇄ Web サーバの送受信。札をドラッグして送る */
  | { kind: "transfer"; scene: SceneId }
  /** 盗聴者になって、通信路の上を虫めがねでのぞく */
  | { kind: "peek"; mode: "http" | "https" }
  /** ブラウザのアドレスバーと鍵マークを調べる */
  | { kind: "browser" }
  /** 共通鍵暗号方式・公開鍵暗号方式のよいところ */
  | { kind: "recap" }
  /** どちらの暗号方式を何に使うかを仕分ける */
  | { kind: "hybrid" }
  /** 共通鍵を暗号化する鍵を選ぶ */
  | { kind: "pick" }
  /** ページを開き直すたびに、共通鍵が新しくなる */
  | { kind: "reconnect" }
  /** 手順を並べる */
  | { kind: "order" }
  /** HTTP と HTTPS に仕分ける */
  | { kind: "compare" }
  | { kind: "test" };

export interface Slide {
  id?: string;
  chapter: ChapterId;
  title: string;
  description: string;
  stage: Stage;
  /** 説明の下に出す要点 */
  points?: string[];
  quiz?: Quiz;
  /** やってみよう（操作の課題）。クリアするまで次のスライドへ進めない */
  mission?: string;
}

export const SLIDES: Slide[] = [
  // ---- 第1章 HTTP と HTTPS ----
  {
    id: "http",
    chapter: 1,
    title: "HTTP で送ると",
    description:
      "ネットショップのお届け先の入力画面で、名前や住所を送信します。http:// で始まるページ（HTTP）では、入力した内容がそのままの形でインターネットを流れます。盗聴者になって、通信路をのぞいてみよう。",
    stage: { kind: "peek", mode: "http" },
    mission: "カーソル（指）を通信路の上で動かして、流れてくるデータを3つのぞき見よう",
  },
  {
    chapter: 1,
    title: "HTTPS で送ると？",
    description: "同じ入力画面を、https:// で始まるページ（HTTPS）で送信したらどう見えるでしょう。",
    stage: { kind: "peek", mode: "http" },
    quiz: {
      kind: "choice",
      gate: true,
      question: "HTTPS で送ると、盗聴者からはどう見えると思う？",
      options: ["HTTP と同じように、そのまま読める", "データが届かなくなる", "暗号化されていて、読めない"],
      answer: 2,
      ok: "正解！ HTTPS では、Web ブラウザと Web サーバの間の通信を暗号化します。次のスライドで確かめよう。",
      ng: "HTTPS では、Web ブラウザと Web サーバの間の通信を暗号化するので、のぞかれても読めません。次のスライドで確かめよう。",
    },
  },
  {
    id: "https",
    chapter: 1,
    title: "HTTPS で送ると",
    description:
      "HTTPS では、Web ブラウザと Web サーバの間の通信を、TLS というしくみで暗号化しています。もう一度、盗聴者になってのぞいてみよう。",
    stage: { kind: "peek", mode: "https" },
    mission: "カーソル（指）を通信路の上で動かして、流れてくるデータを3つのぞき見よう",
    points: ["HTTPS：通信を TLS で暗号化する", "TLS は、はじめ SSL と呼ばれていた（SSL/TLS と書くこともある）"],
  },
  {
    id: "browser",
    chapter: 1,
    title: "HTTPS のページの見分け方",
    description:
      "HTTPS のページは、アドレスバーの URL が https:// で始まり、鍵マークが表示されます。鍵マークをクリックすると、接続が保護されているかを確かめられます。スマートフォンのアプリの中にも、同じしくみで暗号化通信をしているものがあります。",
    stage: { kind: "browser" },
    mission: "2つのタブを切りかえて、それぞれのアドレスバーの左のマークをクリックし、保護の状態を確かめよう",
    points: ["https:// で始まり、鍵マークが表示される", "鍵マークをクリックすると、保護の状態がわかる"],
  },

  // ---- 第2章 ハイブリッド暗号方式 ----
  {
    chapter: 2,
    title: "2つの暗号方式をふり返ろう",
    description: "共通鍵暗号方式と公開鍵暗号方式には、それぞれよいところと課題がありました。カードをクリックして、裏に書かれた課題も確かめよう。",
    stage: { kind: "recap" },
    quiz: {
      kind: "choice",
      gate: true,
      question: "TLS では、どの暗号方式を使っていると思う？",
      options: ["共通鍵暗号方式だけ", "共通鍵暗号方式と公開鍵暗号方式を組み合わせて使う", "公開鍵暗号方式だけ"],
      answer: 1,
      ok: "正解！ TLS は、2つの方式のよいところを組み合わせた「ハイブリッド暗号方式」です。",
      ng: "TLS は、共通鍵暗号方式と公開鍵暗号方式のよいところを組み合わせた「ハイブリッド暗号方式」です。",
    },
  },
  {
    id: "hybrid",
    chapter: 2,
    title: "ハイブリッド暗号方式",
    description:
      "ハイブリッド暗号方式では、Web ブラウザと Web サーバがデータをやりとりするときは、処理が速い共通鍵暗号方式を使います。問題は、その共通鍵をどうやって安全に共有するかです。そこで、共通鍵を送るときだけ公開鍵暗号方式を使います。",
    stage: { kind: "hybrid" },
    quiz: { kind: "task" },
    mission: "それぞれの場面のカードを、使う暗号方式の箱へドラッグして仕分けよう",
    points: ["データのやりとり → 処理が速い共通鍵暗号方式", "共通鍵を送る → 公開鍵暗号方式"],
  },
  {
    id: "flow",
    chapter: 2,
    title: "共通鍵を共有するまで",
    description:
      "Web ブラウザと Web サーバが、共通鍵を安全に共有して暗号化通信を始めるまでの流れです。札をドラッグして、順番に送ってみよう。公開鍵はサーバからブラウザへ流れます。",
    stage: { kind: "transfer", scene: "tls" },
    mission: "札をドラッグして送り、①〜⑥の最後の場面まで進めよう",
    points: ["共通鍵は、サーバの公開鍵で暗号化して送る", "サーバは、自分の秘密鍵で共通鍵を取り出す"],
  },
  {
    id: "pick",
    chapter: 2,
    title: "共通鍵を暗号化する鍵は？",
    description: "Web ブラウザが作った共通鍵を、Web サーバへ安全に送りたいとき、どの鍵で暗号化すればよいでしょう。鍵の札を共通鍵にドラッグしてください。",
    stage: { kind: "pick" },
    quiz: { kind: "task" },
    mission: "正しい鍵を、送りたい共通鍵にドラッグして暗号化しよう",
  },
  {
    id: "order",
    chapter: 2,
    title: "手順を並べよう",
    description: "ハイブリッド暗号方式で、Web ブラウザと Web サーバが暗号化通信を始めるまでの手順を、正しい順番にタップしてください。",
    stage: { kind: "order" },
    quiz: { kind: "task" },
    mission: "6つの手順を、正しい順番に全部並べよう",
  },
  {
    id: "reconnect",
    chapter: 2,
    title: "共通鍵は使い捨て",
    description:
      "このとき使う共通鍵は、通信をしている間だけの使い捨てです。ページを開き直すと、新しい共通鍵が作られます。そのため、共通鍵が解読される可能性は低くなります。",
    stage: { kind: "reconnect" },
    mission: "ページを 3 回開き直して、そのたびに共通鍵が変わることを確かめよう",
    points: ["共通鍵は通信をしている間だけの使い捨て", "そのため、解読される可能性は低い"],
  },

  // ---- 第3章 まとめ ----
  {
    id: "compare",
    chapter: 3,
    title: "HTTP と HTTPS の違い",
    description: "ここまでの体験をふり返って、HTTP と HTTPS の特徴を仕分けよう。",
    stage: { kind: "compare" },
    quiz: { kind: "task" },
    mission: "特徴のカードを「HTTP」「HTTPS」の箱へドラッグして仕分けよう",
  },
  {
    chapter: 3,
    title: "まとめテスト",
    description:
      "ここまでの内容から8問です。全部答えたら「採点する」を押してください。間違えた問題は、説明のスライドに戻って確認できます。最後の結果画面をスクリーンショットして提出しましょう。",
    stage: { kind: "test" },
    quiz: { kind: "test" },
  },
];

export function slideIndexOf(id: string) {
  return SLIDES.findIndex((s) => s.id === id);
}

// ---------- 手順の並べ替え ----------

export const ORDER_STEPS = [
  "Web ブラウザが、Web サーバに通信要求を送る",
  "Web サーバが、公開鍵を Web ブラウザへ送る",
  "Web ブラウザが共通鍵を作り、受け取った公開鍵で共通鍵を暗号化する",
  "Web ブラウザが、暗号化した共通鍵を Web サーバへ送る",
  "Web サーバが、秘密鍵で復号して共通鍵を取り出す",
  "共通鍵を使って、暗号化通信を行う",
];
/** 選択肢を並べる順番（正しい順番とは変えておく） */
export const ORDER_SHOWN = [4, 1, 5, 0, 3, 2];
export const ORDER_HINT = [
  "最初は、ページを見たいブラウザから話しかけます。",
  "共通鍵を暗号化するための鍵を、サーバがブラウザに渡します。",
  "公開鍵を受け取ったら、ブラウザは共通鍵を作って暗号化します。",
  "暗号化した共通鍵を、サーバへ送ります。",
  "受け取ったサーバは、自分だけが持つ鍵で共通鍵を取り出します。",
  "最後に、共有できた共通鍵でやりとりを始めます。",
];
export const ORDER_DONE =
  "正解！ 公開鍵暗号方式は共通鍵を送るときだけに使い、そのあとのデータのやりとりは処理が速い共通鍵暗号方式で行います。";

// ---------- 仕分け ----------

export interface SortSpec<B extends string> {
  bins: { bin: B; title: string; color: string; bg: string }[];
  items: { label: string; answer: B }[];
}

export const HYBRID_SORT: SortSpec<"sym" | "pub"> = {
  bins: [
    { bin: "sym", title: "🔑 共通鍵暗号方式を使う", color: "#ef6c00", bg: "#fff3e0" },
    { bin: "pub", title: "🔑🗝️ 公開鍵暗号方式を使う", color: "#1565c0", bg: "#e3f2fd" },
  ],
  items: [
    { label: "入力した名前や住所を送る", answer: "sym" },
    { label: "共通鍵をサーバへ安全に送る", answer: "pub" },
    { label: "Web ページの内容を受け取る", answer: "sym" },
  ],
};

export const COMPARE_SORT: SortSpec<"http" | "https"> = {
  bins: [
    { bin: "http", title: "HTTP", color: "#c62828", bg: "#ffebee" },
    { bin: "https", title: "🔒 HTTPS", color: "#2e7d32", bg: "#e8f5e9" },
  ],
  items: [
    { label: "URL が http:// で始まる", answer: "http" },
    { label: "URL が https:// で始まり、鍵マークが表示される", answer: "https" },
    { label: "入力した内容がそのままの形で流れる", answer: "http" },
    { label: "通信が TLS で暗号化される", answer: "https" },
    { label: "のぞかれると中身を読まれてしまう", answer: "http" },
    { label: "のぞかれても中身は読めない", answer: "https" },
  ],
};

// ---------- まとめテスト ----------

export const TEST_QUESTIONS: { question: string; options: string[]; answer: number; review: string }[] = [
  {
    question: "HTTPS で、Web ブラウザと Web サーバ間の通信を暗号化するしくみは？",
    options: ["HTTP", "TLS", "AES"],
    answer: 1,
    review: "https",
  },
  {
    question: "TLS は、はじめ何と呼ばれていた？",
    options: ["SSL", "RSA", "LAN"],
    answer: 0,
    review: "https",
  },
  {
    question: "HTTPS のページで、アドレスバーに表示されるものは？",
    options: ["http:// と 注意マーク", "ftp:// と 星マーク", "https:// と 鍵マーク"],
    answer: 2,
    review: "browser",
  },
  {
    question: "TLS のように、共通鍵暗号方式と公開鍵暗号方式を組み合わせた方式を何という？",
    options: ["対称鍵暗号", "ハイブリッド暗号方式", "電子署名"],
    answer: 1,
    review: "hybrid",
  },
  {
    question: "ハイブリッド暗号方式で、データをやりとりするときに使う方式は？",
    options: ["処理が速い共通鍵暗号方式", "公開鍵暗号方式", "暗号化しない"],
    answer: 0,
    review: "hybrid",
  },
  {
    question: "Web ブラウザは、作った共通鍵を何で暗号化して送る？",
    options: ["サーバの秘密鍵", "共通鍵そのもの", "サーバの公開鍵"],
    answer: 2,
    review: "pick",
  },
  {
    question: "暗号化された共通鍵を受け取った Web サーバは、何を使って共通鍵を取り出す？",
    options: ["自分の秘密鍵", "自分の公開鍵", "ブラウザの共通鍵"],
    answer: 0,
    review: "flow",
  },
  {
    question: "通信で使う共通鍵が、解読される可能性が低いのはなぜ？",
    options: ["共通鍵が公開されているから", "通信をしている間だけの使い捨てだから", "共通鍵を使わないから"],
    answer: 1,
    review: "reconnect",
  },
];
