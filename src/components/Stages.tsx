"use client";
import { type CSSProperties, type DragEvent, type MouseEvent, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/Refresh";
import { KEYS, PUB_COLOR, SYM_COLOR, type KeyId } from "@/lib/keys";
import { CIPHER_COLOR, EVE_COLOR, PLAIN_COLOR, type SortSpec } from "@/lib/model";
import { useDoneWhen } from "./hooks";
import PeekStage from "./PeekStage";
import { Feedback } from "./Quizzes";

// ---------- 共通部品：ドラッグでもタップでも置けるカード ----------

function dragCard(id: string, picked: string | null, setPicked: (v: string | null) => void) {
  return {
    draggable: true,
    onDragStart: (e: DragEvent) => {
      e.dataTransfer.setData("text/plain", id);
      setPicked(id);
    },
    onClick: (e: MouseEvent) => {
      e.stopPropagation();
      setPicked(picked === id ? null : id);
    },
  };
}

function dropTarget(onPut: (id: string) => void, picked: string | null) {
  return {
    onDragOver: (e: DragEvent) => e.preventDefault(),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      onPut(e.dataTransfer.getData("text/plain"));
    },
    onClick: (e: MouseEvent) => {
      e.stopPropagation();
      if (picked) onPut(picked);
    },
  };
}

/** 鍵の札（ドラッグできる） */
function KeyCard({ id, picked, setPicked, disabled }: { id: KeyId; picked: string | null; setPicked: (v: string | null) => void; disabled?: boolean }) {
  const k = KEYS[id];
  const on = picked === id;
  return (
    <Box
      {...(disabled ? {} : dragCard(id, picked, setPicked))}
      role="button"
      aria-pressed={on}
      data-key={id}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.25,
        py: 0.5,
        borderRadius: 5,
        fontWeight: 700,
        fontSize: "0.9rem",
        cursor: disabled ? "default" : "grab",
        userSelect: "none",
        border: `2.5px solid ${k.color}`,
        bgcolor: on ? k.color : "#fff",
        color: on ? "#fff" : k.color,
        opacity: disabled ? 0.4 : 1,
        boxShadow: disabled ? 0 : 2,
      }}
    >
      <span>{k.icon}</span>
      {k.label}
    </Box>
  );
}

// ---------- 第1章：HTTP と HTTPS をのぞく ----------

const PEEK_ITEMS = {
  http: [
    { label: "名前：山田花子", color: PLAIN_COLOR },
    { label: "住所：東京都…", color: PLAIN_COLOR },
    { label: "電話：090-…", color: PLAIN_COLOR },
  ],
  https: [
    { label: "🔒 x9#Kq2!", color: CIPHER_COLOR },
    { label: "🔒 7f@Lw0$", color: CIPHER_COLOR },
    { label: "🔒 Qz%3m&8", color: CIPHER_COLOR },
  ],
};

export function PeekHttp({ mode, onDone }: { mode: "http" | "https"; onDone?: () => void }) {
  return (
    <Stack spacing={1}>
      <Typography variant="body2" fontWeight={700} textAlign="center" sx={{ color: mode === "http" ? EVE_COLOR : "#2e7d32" }}>
        {mode === "http" ? "⚠️ http://shop.example/order から送信" : "🔒 https://shop.example/order から送信"}
      </Typography>
      <PeekStage
        items={PEEK_ITEMS[mode]}
        summary={
          mode === "http"
            ? "名前も住所も電話番号も、全部読めてしまった！ HTTP では、入力した内容がそのままの形で流れます。"
            : "のぞき見ることはできたけれど、暗号化されていて読めない！ HTTPS では通信が暗号化されています。"
        }
        onDone={onDone}
      />
    </Stack>
  );
}

// ---------- 第1章：アドレスバーと鍵マーク ----------

type Tab = "http" | "https";

export function BrowserStage({ onDone }: { onDone?: () => void }) {
  const [tab, setTab] = useState<Tab>("https");
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Tab[]>([]);
  useDoneWhen(checked.length === 2, onDone);

  const secure = tab === "https";
  const clickIcon = () => {
    setOpen(!open);
    if (!checked.includes(tab)) setChecked([...checked, tab]);
  };

  return (
    <Stack spacing={1.5}>
      <Box sx={{ border: "2px solid #90a4ae", borderRadius: 2, overflow: "hidden", bgcolor: "#fff" }}>
        {/* タブ */}
        <Stack direction="row" sx={{ bgcolor: "#eceff1", px: 1, pt: 0.75, gap: 0.5 }}>
          {(["https", "http"] as Tab[]).map((t) => (
            <Box
              key={t}
              role="button"
              data-tab={t}
              onClick={(e) => {
                e.stopPropagation();
                setTab(t);
                setOpen(false);
              }}
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: "8px 8px 0 0",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                bgcolor: tab === t ? "#fff" : "transparent",
                color: tab === t ? "text.primary" : "text.secondary",
              }}
            >
              {t === "https" ? "ご注文（Aショップ）" : "ご注文（Bショップ）"}
              {checked.includes(t) && " ✓"}
            </Box>
          ))}
        </Stack>
        {/* アドレスバー */}
        <Box sx={{ position: "relative", px: 1, py: 0.75, borderBottom: "1px solid #cfd8dc" }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ bgcolor: "#f1f3f4", borderRadius: 5, px: 1, py: 0.5 }}>
            <Box
              role="button"
              data-icon
              aria-label="保護の状態を表示"
              onClick={(e) => {
                e.stopPropagation();
                clickIcon();
              }}
              sx={{ cursor: "pointer", borderRadius: 2, px: 0.5, fontSize: "1rem", bgcolor: open ? "#dfe3e6" : "transparent", "&:hover": { bgcolor: "#dfe3e6" } }}
            >
              {secure ? "🔒" : "⚠️"}
            </Box>
            <Typography sx={{ fontFamily: "monospace", fontSize: { xs: "0.8rem", sm: "0.95rem" } }}>
              <Box component="span" sx={{ color: secure ? "#2e7d32" : EVE_COLOR, fontWeight: 700 }}>
                {secure ? "https://" : "http://"}
              </Box>
              {secure ? "a-shop.example/order" : "b-shop.example/order"}
            </Typography>
          </Stack>
          {open && (
            <Paper elevation={6} sx={{ position: "absolute", left: 16, top: 44, zIndex: 2, p: 1.5, maxWidth: 280, border: `2px solid ${secure ? "#2e7d32" : EVE_COLOR}` }}>
              <Typography fontWeight={700} sx={{ color: secure ? "#2e7d32" : EVE_COLOR }}>
                {secure ? "🔒 この接続は保護されています" : "⚠️ 保護されていない通信"}
              </Typography>
              <Typography variant="body2" mt={0.5}>
                {secure ? "入力した情報は暗号化されて送られます。" : "入力した情報が、のぞかれたり盗まれたりするおそれがあります。"}
              </Typography>
            </Paper>
          )}
        </Box>
        {/* ページ */}
        <Box sx={{ p: 2, bgcolor: "#fffde7", minHeight: 150 }}>
          <Typography fontWeight={700} textAlign="center" mb={1}>
            お届け先の入力
          </Typography>
          {["お名前", "ご住所"].map((f) => (
            <Stack key={f} direction="row" spacing={1} alignItems="center" mb={1}>
              <Typography sx={{ width: 64, fontSize: "0.9rem" }}>{f}</Typography>
              <Box sx={{ flex: 1, height: 26, border: "1px solid #b0bec5", borderRadius: 1, bgcolor: "#fff" }} />
            </Stack>
          ))}
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        確かめたタブ：{checked.length} / 2（アドレスバーのいちばん左のマークをクリック）
      </Typography>
    </Stack>
  );
}

// ---------- 第2章：2つの暗号方式のふり返り ----------

const RECAP = [
  { title: "🔑 共通鍵暗号方式", color: SYM_COLOR, good: "処理が速い", bad: "共通鍵を相手に安全に渡す方法が問題" },
  { title: "🔑🗝️ 公開鍵暗号方式", color: PUB_COLOR, good: "秘密鍵は受信者だけが持つので、鍵が盗まれるリスクが低い", bad: "処理が遅い" },
];

export function RecapStage() {
  const [flipped, setFlipped] = useState<number[]>([]);
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
      {RECAP.map((c, i) => {
        const back = flipped.includes(i);
        return (
          <Box
            key={c.title}
            role="button"
            data-card={i}
            onClick={(e) => {
              e.stopPropagation();
              setFlipped(back ? flipped.filter((x) => x !== i) : [...flipped, i]);
            }}
            sx={{ border: `3px solid ${c.color}`, borderRadius: 3, p: 2, minHeight: 150, cursor: "pointer", bgcolor: back ? "#fff8f8" : "#fff", userSelect: "none" }}
          >
            <Typography fontWeight={700} sx={{ color: c.color, fontSize: "1.1rem" }}>
              {c.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {back ? "課題（クリックで表にもどす）" : "よいところ（クリックで裏返す）"}
            </Typography>
            <Typography fontWeight={700} mt={1} sx={{ color: back ? EVE_COLOR : "#2e7d32" }}>
              {back ? `⚠️ ${c.bad}` : `👍 ${c.good}`}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

// ---------- 仕分け（ハイブリッド暗号方式・HTTP と HTTPS） ----------

export function SortStage<B extends string>({ spec, onDone }: { spec: SortSpec<B>; onDone?: () => void }) {
  const [box, setBox] = useState<Record<string, B | undefined>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [miss, setMiss] = useState<{ label: string; n: number } | null>(null);
  const done = spec.items.every((i) => box[i.label]);
  useDoneWhen(done, onDone);

  const put = (bin: B, label: string) => {
    const item = spec.items.find((i) => i.label === label);
    if (!item || box[label]) return;
    setPicked(null);
    if (item.answer === bin) {
      setBox({ ...box, [label]: bin });
      setMiss(null);
    } else setMiss({ label, n: (miss?.n ?? 0) + 1 });
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap justifyContent="center" sx={{ minHeight: 40 }}>
        {spec.items
          .filter((i) => !box[i.label])
          .map((i) => (
            <Box
              key={miss?.label === i.label ? `${i.label}-${miss.n}` : i.label}
              className={miss?.label === i.label ? "shake" : undefined}
              {...dragCard(i.label, picked, setPicked)}
              role="button"
              aria-pressed={picked === i.label}
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "grab",
                userSelect: "none",
                border: `2px solid ${miss?.label === i.label ? EVE_COLOR : "#455a64"}`,
                bgcolor: picked === i.label ? "#455a64" : "#fff",
                color: picked === i.label ? "#fff" : "#455a64",
                boxShadow: 2,
              }}
            >
              {i.label}
            </Box>
          ))}
        {done && <Typography fontWeight={700}>全部仕分けられました！</Typography>}
      </Stack>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
        {spec.bins.map((b) => (
          <Box
            key={b.bin}
            data-bin={b.bin}
            {...dropTarget((label) => put(b.bin, label), picked)}
            sx={{ border: `2px ${picked ? "dashed" : "solid"} ${b.color}`, bgcolor: b.bg, borderRadius: 3, p: 1.5, minHeight: 140, cursor: picked ? "pointer" : "default" }}
          >
            <Typography fontWeight={700} sx={{ color: b.color, fontSize: "1.05rem", mb: 0.75 }}>
              {b.title}
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
              {spec.items
                .filter((i) => box[i.label] === b.bin)
                .map((i) => (
                  <Typography key={i.label} component="li" variant="body2" fontWeight={600}>
                    {i.label}
                  </Typography>
                ))}
            </Stack>
          </Box>
        ))}
      </Box>
      {miss && !done && <Feedback ok={false}>「{miss.label}」は、そちらではありません。ここまでの体験を思い出してみよう。</Feedback>}
    </Stack>
  );
}

// ---------- 第2章：共通鍵を暗号化する鍵を選ぶ ----------

const PICK_KEYS: KeyId[] = ["sym", "Spriv", "Spub"];
const PICK_NG: Partial<Record<KeyId, string>> = {
  sym: "共通鍵を共通鍵で暗号化しても、サーバはまだ共通鍵を持っていないので取り出せません。",
  Spriv: "サーバの秘密鍵は、サーバだけが持っている鍵です。ブラウザは持っていません。",
};

export function PickStage({ onDone }: { onDone?: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [ng, setNg] = useState<KeyId | null>(null);
  const [shake, setShake] = useState(0);
  useDoneWhen(locked, onDone);

  const put = (id: string) => {
    if (!(id in KEYS) || locked) return;
    setPicked(null);
    if (id === "Spub") {
      setLocked(true);
      setNg(null);
    } else {
      setNg(id as KeyId);
      setShake(shake + 1);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography fontWeight={700} textAlign="center" sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}>
        💻 Web ブラウザ ➜ 🗄️ Web サーバ
      </Typography>
      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
        <Typography variant="body2" fontWeight={700} sx={{ alignSelf: "center" }}>
          ブラウザの手元にある鍵：
        </Typography>
        {PICK_KEYS.map((id) => (
          <KeyCard key={id} id={id} picked={picked} setPicked={setPicked} disabled={locked} />
        ))}
      </Stack>
      <Box
        key={shake}
        className={shake ? "shake" : undefined}
        data-message
        {...dropTarget(put, picked)}
        sx={{
          mx: "auto",
          width: "100%",
          maxWidth: 320,
          p: 1.5,
          borderRadius: 3,
          textAlign: "center",
          border: `3px ${picked ? "dashed" : "solid"} ${locked ? CIPHER_COLOR : SYM_COLOR}`,
          bgcolor: picked ? "#e3f2fd" : locked ? "#f3e5f5" : "#fff3e0",
          cursor: picked ? "pointer" : "default",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          サーバへ送りたい共通鍵（ここに鍵をドラッグ）
        </Typography>
        <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, color: locked ? CIPHER_COLOR : SYM_COLOR }}>{locked ? "🔒 共通鍵" : "🔑 共通鍵"}</Typography>
        <Typography variant="body2" fontWeight={700} sx={{ color: locked ? CIPHER_COLOR : SYM_COLOR }}>
          {locked ? "サーバの公開鍵で暗号化した" : "まだ暗号化していない"}
        </Typography>
      </Box>
      {locked ? (
        <Feedback ok>
          正解！ サーバの公開鍵で暗号化すれば、取り出せるのは対になる秘密鍵を持っているサーバだけです。盗聴者にコピーされても、共通鍵は取り出されません。
        </Feedback>
      ) : (
        ng && <Feedback ok={false}>{PICK_NG[ng]}</Feedback>
      )}
    </Stack>
  );
}

// ---------- 第2章：共通鍵は使い捨て ----------

function newKey() {
  return Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0"),
  ).join("-");
}

const RELOAD_GOAL = 3;

export function ReconnectStage({ onDone }: { onDone?: () => void }) {
  /** これまでに使った共通鍵（先頭が今の通信のもの） */
  const [keys, setKeys] = useState<string[]>([]);
  const reloads = Math.max(0, keys.length - 1);
  useDoneWhen(reloads >= RELOAD_GOAL, onDone);

  return (
    <Stack spacing={1.5}>
      <Box sx={{ border: "2px solid #90a4ae", borderRadius: 2, overflow: "hidden" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: "#eceff1", px: 1, py: 0.75 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<RefreshIcon />}
            data-reload
            onClick={() => setKeys([newKey(), ...keys])}
            sx={{ fontWeight: 700 }}
          >
            {keys.length === 0 ? "ページを開く" : "開き直す"}
          </Button>
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
            <Box component="span" sx={{ color: "#2e7d32", fontWeight: 700 }}>
              🔒 https://
            </Box>
            a-shop.example/order
          </Typography>
        </Stack>
        <Box sx={{ p: 1.5, minHeight: 170, bgcolor: "#fff" }}>
          {keys.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              「ページを開く」を押すと、ブラウザとサーバの間で共通鍵が作られます。
            </Typography>
          ) : (
            <Stack spacing={0.5}>
              {keys.slice(0, 6).map((k, i) => (
                <Stack key={keys.length - i} direction="row" spacing={1} alignItems="center" className={i === 0 ? "seq-anim" : undefined}>
                  <Box className={i === 0 ? "pop" : undefined} style={{ "--delay": "0s" } as CSSProperties} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography sx={{ fontFamily: "monospace", fontWeight: 700, color: i === 0 ? SYM_COLOR : "#b0bec5", textDecoration: i === 0 ? "none" : "line-through" }}>
                      🔑 {k}
                    </Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: i === 0 ? SYM_COLOR : "#90a4ae" }}>
                      {i === 0 ? "← 今の通信の共通鍵" : "使い終わって捨てた"}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        開き直した回数：{reloads} / {RELOAD_GOAL}
      </Typography>
      {reloads >= RELOAD_GOAL && (
        <Feedback ok>
          開き直すたびに、新しい共通鍵が作られました。共通鍵は通信している間だけの使い捨てなので、もし盗聴者が時間をかけて解読しようとしても、そのころにはもう使われていません。
        </Feedback>
      )}
    </Stack>
  );
}

