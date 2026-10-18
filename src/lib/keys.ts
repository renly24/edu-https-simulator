// ---------- 鍵（サーバの公開鍵・秘密鍵、共通鍵） ----------

export const PUB_COLOR = "#1565c0";
export const PRIV_COLOR = "#2e7d32";
export const SYM_COLOR = "#ef6c00";

export type KeyId = "Spub" | "Spriv" | "sym";

export interface KeyInfo {
  kind: "pub" | "priv" | "sym";
  label: string;
  short: string;
  icon: string;
  color: string;
}

export const KEYS: Record<KeyId, KeyInfo> = {
  Spub: { kind: "pub", label: "サーバの公開鍵", short: "公開鍵", icon: "🔑", color: PUB_COLOR },
  Spriv: { kind: "priv", label: "サーバの秘密鍵", short: "秘密鍵", icon: "🗝️", color: PRIV_COLOR },
  sym: { kind: "sym", label: "共通鍵", short: "共通鍵", icon: "🔑", color: SYM_COLOR },
};

/** lockedBy の鍵で暗号化したものを、key で復号できるか */
export function canDecrypt(lockedBy: KeyId, key: KeyId) {
  if (lockedBy === "sym") return key === "sym";
  return key !== "sym" && key !== lockedBy;
}
