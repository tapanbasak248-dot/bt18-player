import React, { useState } from "react";

// BT18 - Casino Fun Zone
// Free practice arcade only: no cash, deposits, withdrawals, bets,
// coin deductions, prizes, or balance changes.

const styles = {
  page: {
    minHeight: "100vh",
    boxSizing: "border-box",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "linear-gradient(160deg, #0f0c29, #302b63, #24243e)",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  header: { textAlign: "center", marginBottom: 12 },
  title: { margin: 0, color: "#ffd700", fontSize: 28 },
  badge: {
    display: "inline-block",
    marginTop: 9,
    padding: "5px 13px",
    borderRadius: 20,
    background: "#00c853",
    color: "#061b0d",
    fontWeight: 700,
    fontSize: 13,
  },
  warning: {
    maxWidth: 480,
    padding: 12,
    margin: "8px 0 14px",
    border: "1px solid #ffb74d",
    borderRadius: 10,
    background: "rgba(255,152,0,.12)",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 1.5,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    boxSizing: "border-box",
    padding: 20,
    margin: "12px 0",
    border: "1px solid #6256a8",
    borderRadius: 16,
    background: "#1a1633",
    textAlign: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,.3)",
  },
  gameTitle: { margin: "0 0 14px", color: "#ffd700", fontSize: 20 },
  reels: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    margin: "16px 0",
  },
  reel: {
    width: 72,
    height: 72,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    background: "#fff",
    color: "#111",
    fontSize: 39,
  },
  button: {
    width: "100%",
    marginTop: 10,
    padding: "12px 20px",
    border: 0,
    borderRadius: 10,
    background: "linear-gradient(90deg, #ffd700, #ff9800)",
    color: "#171000",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  disabled: { opacity: 0.55, cursor: "not-allowed" },
  result: { minHeight: 25, marginTop: 12, fontWeight: 700, lineHeight: 1.5 },
  muted: { marginTop: 12, color: "#b0aee0", fontSize: 13, lineHeight: 1.5 },
  diceRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 22,
    margin: "18px 0",
  },
  diceCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  dice: {
    width: 72,
    height: 72,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    background: "#fff",
    color: "#171717",
    fontSize: 40,
  },
  vs: { color: "#ffd700", fontSize: 22, fontWeight: 800 },
};

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function SlotMachine() {
  const symbols = ["🍒", "🍋", "🔔", "⭐", "7️⃣", "💎"];
  const [reels, setReels] = useState(["🍒", "🔔", "⭐"]);
  const [message, setMessage] = useState("");
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setMessage("");

    window.setTimeout(() => {
      const next = [
        symbols[randomInt(0, symbols.length - 1)],
        symbols[randomInt(0, symbols.length - 1)],
        symbols[randomInt(0, symbols.length - 1)],
      ];
      setReels(next);
      if (next[0] === next[1] && next[1] === next[2]) {
        setMessage("🎉 তিনটি প্রতীক মিলে গেছে! দারুণ!");
      } else if (
        next[0] === next[1] ||
        next[1] === next[2] ||
        next[0] === next[2]
      ) {
        setMessage("😊 দুটি প্রতীক মিলে গেছে!");
      } else {
        setMessage("😄 এবার মেলেনি। চাইলে আবার খেলতে পারো!");
      }
      setSpinning(false);
    }, 650);
  };

  return (
    <section style={styles.card}>
      <h2 style={styles.gameTitle}>🎰 Slot Machine</h2>
      <div style={styles.reels} aria-live="polite">
        {reels.map((symbol, index) => (
          <div style={styles.reel} key={index}>{symbol}</div>
        ))}
      </div>
      <button
        type="button"
        style={{ ...styles.button, ...(spinning ? styles.disabled : {}) }}
        onClick={spin}
        disabled={spinning}
      >
        {spinning ? "ঘুরছে..." : "🎰 Spin"}
      </button>
      <div style={styles.result} aria-live="polite">{message}</div>
      <p style={styles.muted}>শুধুই ফ্রি প্র্যাকটিস—কোনো কয়েন বা পুরস্কার নেই।</p>
    </section>
  );
}

function DiceBattle() {
  const [playerDice, setPlayerDice] = useState(1);
  const [computerDice, setComputerDice] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState("ডাইস রোল করে দেখো কার সংখ্যা বেশি!");

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setResult("ডাইস রোল হচ্ছে...");
    window.setTimeout(() => {
      const player = randomInt(1, 6);
      const computer = randomInt(1, 6);
      setPlayerDice(player);
      setComputerDice(computer);
      if (player > computer) setResult("🎉 এই রাউন্ডে তুমি জিতেছ!");
      else if (player < computer) setResult("🙂 Computer এই রাউন্ডে জিতেছে!");
      else setResult("🤝 ড্র! দুজনের সংখ্যাই সমান।");
      setRolling(false);
    }, 500);
  };

  return (
    <section style={styles.card}>
      <h2 style={styles.gameTitle}>🎲 Dice Challenge</h2>
      <p style={styles.muted}>তুমি বনাম Computer Opponent</p>
      <div style={styles.diceRow}>
        <div style={styles.diceCol}>
          <strong>তুমি</strong>
          <div style={styles.dice} aria-label={`তোমার ডাইস ${playerDice}`}>{["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][playerDice - 1]}</div>
        </div>
        <div style={styles.vs}>VS</div>
        <div style={styles.diceCol}>
          <strong>Computer 🤖</strong>
          <div style={styles.dice} aria-label={`কম্পিউটারের ডাইস ${computerDice}`}>{["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][computerDice - 1]}</div>
        </div>
      </div>
      <button
        type="button"
        style={{ ...styles.button, ...(rolling ? styles.disabled : {}) }}
        onClick={roll}
        disabled={rolling}
      >
        {rolling ? "রোল হচ্ছে..." : "🎲 Roll Dice"}
      </button>
      <div style={styles.result} aria-live="polite">{result}</div>
      <p style={styles.muted}>Computer-এর ফলাফলও স্বয়ংক্রিয়ভাবে তৈরি হয়। কোনো বাজি বা পুরস্কার নেই।</p>
    </section>
  );
}

export default function CasinoFunZone() {
  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>🎮 BT18 Fun Zone</h1>
        <span style={styles.badge}>FREE PRACTICE MODE</span>
      </header>
      <div style={styles.warning}>
        এটি শুধু বিনোদনের জন্য একটি ফ্রি প্র্যাকটিস আর্কেড।
        এখানে কোনো বাস্তব টাকা, ডিপোজিট, উইথড্র, বাজি, কয়েন লেনদেন
        বা পুরস্কার নেই। Computer opponent স্পষ্টভাবে চিহ্নিত।
      </div>
      <SlotMachine />
      <DiceBattle />
    </main>
  );
}
