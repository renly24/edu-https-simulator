// ---------- 送受信の場面（Web ブラウザ ⇄ Web サーバ、間で盗聴者がのぞき見る） ----------

import type { KeyId } from "./keys";

export type Who = "a" | "b" | "eve";
export type PacketKind = "plain" | "cipher" | "pubkey" | "sym";

export interface Bubble {
  text: string;
  /** 困ったこと（読まれた）を赤で表示する */
  alert?: boolean;
}

export type KeyRing = Partial<Record<Who, KeyId[]>>;

export interface TransferStep {
  /** 下に出す説明 */
  text: string;
  /** このステップで流れるもの（dir が "toA" ならサーバ → ブラウザ、ふだんはブラウザ → サーバ） */
  packet?: { label: string; kind: PacketKind; dir?: "toA" };
  /** 盗聴者が流れたものをコピーする */
  tapped?: boolean;
  bubbles?: Partial<Record<Who, Bubble>>;
  /** このステップの時点で、だれがどの鍵を持っているか */
  keys?: KeyRing;
}

export interface TransferScene {
  caption: string;
  intro: string;
  /** はじめにだれがどの鍵を持っているか */
  keys: KeyRing;
  steps: TransferStep[];
}

export type SceneId = "tls";

const SERVER: KeyId[] = ["Spub", "Spriv"];

export const SCENES: Record<SceneId, TransferScene> = {
  tls: {
    caption: "ハイブリッド暗号方式（TLS）",
    intro: "Web サーバは、あらかじめ公開鍵と秘密鍵のペアを用意しています。Web ブラウザから、HTTPS のページを開いてみよう。",
    keys: { b: SERVER },
    steps: [
      {
        text: "① Web ブラウザが、Web サーバに通信要求を送りました。",
        packet: { label: "通信要求", kind: "plain" },
        keys: { b: SERVER },
        bubbles: { b: { text: "要求が届いた" } },
      },
      {
        text: "② Web サーバは、公開鍵を Web ブラウザへ送りました。公開鍵は、盗聴者にコピーされても困りません。",
        packet: { label: "🔑 公開鍵", kind: "pubkey", dir: "toA" },
        tapped: true,
        keys: { a: ["Spub"], b: SERVER, eve: ["Spub"] },
        bubbles: { a: { text: "公開鍵を受け取った" } },
      },
      {
        text: "③ Web ブラウザは、共通鍵を作り、受け取った公開鍵でその共通鍵を暗号化しました。",
        keys: { a: ["Spub", "sym"], b: SERVER, eve: ["Spub"] },
        bubbles: { a: { text: "共通鍵を公開鍵で暗号化" } },
      },
      {
        text: "④ Web ブラウザは、公開鍵で暗号化した共通鍵を Web サーバへ送りました。盗聴者はコピーしましたが、秘密鍵がないので中の共通鍵を取り出せません。",
        packet: { label: "🔒 共通鍵", kind: "cipher" },
        tapped: true,
        keys: { a: ["Spub", "sym"], b: SERVER, eve: ["Spub"] },
        bubbles: { eve: { text: "共通鍵を取り出せない…" } },
      },
      {
        text: "⑤ Web サーバは、秘密鍵を使って復号し、共通鍵を取り出しました。これで、ブラウザとサーバが同じ共通鍵を持てました。",
        packet: { label: "🔒 共通鍵", kind: "cipher" },
        tapped: true,
        keys: { a: ["Spub", "sym"], b: [...SERVER, "sym"], eve: ["Spub"] },
        bubbles: { b: { text: "秘密鍵で共通鍵を取り出した" }, eve: { text: "共通鍵を取り出せない…" } },
      },
      {
        text: "⑥ ここからは、処理が速い共通鍵で暗号化して通信します。盗聴者がコピーしても、共通鍵を持っていないので読めません。",
        packet: { label: "🔒 データ", kind: "cipher" },
        tapped: true,
        keys: { a: ["Spub", "sym"], b: [...SERVER, "sym"], eve: ["Spub"] },
        bubbles: { b: { text: "共通鍵で復号できた" }, eve: { text: "読めない…" } },
      },
    ],
  },
};
