import React, { useEffect, useRef, useState } from "react";

/**
 * BT18 Arcade Zone
 * Five non-wagering mini-games. Scores are for play feedback only:
 * no stakes, coin deductions, prizes, cash value, deposits, or withdrawals.
 */

const css = `
  .bt18-arcade{min-height:100vh;padding:24px 16px 48px;box-sizing:border-box;color:#f7f5ff;background:radial-gradient(ellipse at 20% 0%,#30235d 0%,transparent 42%),linear-gradient(145deg,#090914,#17132b 55%,#0c1728);font-family:Inter,system-ui,Arial,sans-serif}
  .bt18-wrap{max-width:1100px;margin:0 auto}
  .bt18-hero{text-align:center;padding:20px 0 26px}
  .bt18-kicker{display:inline-flex;padding:7px 13px;border:1px solid #6e5cc9;border-radius:999px;background:#6e5cc922;color:#d8ceff;font-size:12px;letter-spacing:2px;font-weight:800}
  .bt18-title{font-size:clamp(30px,6vw,54px);line-height:1.05;margin:15px 0 9px;font-weight:950;letter-spacing:-1.5px;background:linear-gradient(90deg,#fff,#c9b8ff,#75e7ff);background-clip:text;-webkit-background-clip:text;color:transparent}
  .bt18-sub{color:#bcb7d5;margin:0 auto;max-width:650px;line-height:1.6}
  .bt18-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,310px),1fr));gap:16px}
  .bt18-card{position:relative;overflow:hidden;border:1px solid #ffffff1b;border-radius:22px;padding:20px;background:linear-gradient(145deg,#211b3cdd,#12182bdd);box-shadow:0 14px 36px #0006;transition:transform .2s,border-color .2s}
  .bt18-card:hover{transform:translateY(-3px);border-color:#9c83ff88}
  .bt18-card h2{margin:0 0 6px;font-size:20px;color:#fff}
  .bt18-desc{margin:0 0 16px;color:#aaa5c8;font-size:13px;line-height:1.5}
  .bt18-stage{min-height:116px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin:12px 0;padding:16px;border-radius:16px;background:#090b18aa;border:1px solid #ffffff12}
  .bt18-btn{border:0;border-radius:12px;padding:11px 16px;font-weight:850;color:#151025;background:linear-gradient(100deg,#ffe27a,#ffad55);cursor:pointer;box-shadow:0 5px 18px #ffbd5630;transition:transform .15s,filter .15s}
  .bt18-btn:hover{filter:brightness(1.08);transform:translateY(-1px)}
  .bt18-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
  .bt18-result{min-height:24px;margin:12px 0 0;text-align:center;color:#d8d2f4;font-weight:750}
  .bt18-pill{font-size:12px;color:#a9e9ff;background:#56cfff16;border:1px solid #56cfff44;border-radius:999px;padding:6px 10px}
  .bt18-big{font-size:42px;font-weight:950;color:#ffe27a;text-shadow:0 0 24px #ffcf5c55}
  .bt18-colors{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:100%;max-width:300px}
  .bt18-color{height:54px;border:2px solid #ffffff22;border-radius:12px;cursor:pointer;transition:transform .12s,filter .12s}
  .bt18-color:active{transform:scale(.94)}
  .bt18-memory{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;width:100%;max-width:300px}
  .bt18-memory button{aspect-ratio:1;border:1px solid #9e8cff55;border-radius:12px;background:linear-gradient(145deg,#4b3c80,#211b3e);font-size:26px;cursor:pointer;color:#fff}
  .bt18-memory button:disabled{cursor:default;opacity:.88}
  .bt18-number{font-size:clamp(42px,9vw,62px);font-weight:950;color:#8feaff;text-shadow:0 0 22px #5adfff55}
  .bt18-input{width:90px;padding:12px;border-radius:10px;border:1px solid #8b7acb;background:#0b0c1a;color:white;font-size:18px;text-align:center}
  .bt18-footer{text-align:center;color:#827c9f;font-size:12px;margin-top:24px}
  .bt18-pop{animation:bt18-pop .35s ease}
  .bt18-glow{animation:bt18-glow .8s ease}
  @keyframes bt18-pop{0%{transform:scale(.8);opacity:.4}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
  @keyframes bt18-glow{0%,100%{box-shadow:0 0 0 #8d7aff00}50%{box-shadow:0 0 28px #8d7aff66}}
  @media(max-width:480px){.bt18-arcade{padding:16px 12px 32px}.bt18-card{padding:16px}}
`;

const rand = (max) => Math.floor(Math.random() * max);
const COLORS = ["#ff5d83", "#4dd9c4", "#ffc857", "#8c7bff"];

function useSound() {
  const audio = useRef(null);
  return (frequency = 520) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audio.current ||= new AudioContextClass();
      const ctx = audio.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.17);
    } catch (_) { /* Audio is optional; the games work without it. */ }
  };
}

function GameCard({ title, description, children }) {
  return <section className="bt18-card"><h2>{title}</h2><p className="bt18-desc">{description}</p>{children}</section>;
}

function ColorReflex() {
  const [target, setTarget] = useState(-1);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Start a round and tap the matching colour.");
  const [active, setActive] = useState(false);
  const sound = useSound();
  const start = () => { setTarget(rand(4)); setActive(true); setMessage("Find the glowing colour!"); };
  const choose = (i) => {
    if (!active) return;
    sound(420 + i * 100);
    if (i === target) { setScore(v => v + 1); setMessage("Great reflex! +1 score"); setTarget(rand(4)); }
    else setMessage("Not that one — try again.");
  };
  return <GameCard title="🎨 Color Reflex" description="Find the target colour as quickly as you can. Build your personal high score.">
    <div className="bt18-stage"><div className="bt18-colors">{COLORS.map((c,i)=><button key={c} aria-label={"Colour "+(i+1)} onClick={()=>choose(i)} className="bt18-color" style={{background:c,boxShadow:active&&target===i?"0 0 24px 7px "+c:"none",transform:active&&target===i?"scale(1.06)":"none"}} />)}</div></div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span className="bt18-pill">Score: {score}</span><button className="bt18-btn" onClick={start}>New Round</button></div>
    <p className="bt18-result" aria-live="polite">{message}</p>
  </GameCard>;
}

function MemoryFlip() {
  const icons = ["🌙","🚀","🌈","⚡","🎧","🪐","🦋","💎"];
  const [deck,setDeck] = useState(()=>[...icons,...icons].sort(()=>Math.random()-.5).map((v,i)=>({id:i,v})));
  const [open,setOpen] = useState([]);
  const [matched,setMatched] = useState([]);
  const [moves,setMoves] = useState(0);
  const sound=useSound();
  const reset=()=>{setDeck([...icons,...icons].sort(()=>Math.random()-.5).map((v,i)=>({id:i,v})));setOpen([]);setMatched([]);setMoves(0);};
  const flip=(id)=>{
    if(open.length===2||open.includes(id)||matched.includes(id))return;
    sound(600);
    const next=[...open,id];setOpen(next);
    if(next.length===2){setMoves(m=>m+1);const [a,b]=next.map(n=>deck[n]);if(a.v===b.v){setMatched(m=>[...m,...next]);setOpen([]);}else window.setTimeout(()=>setOpen([]),650);}
  };
  return <GameCard title="🧠 Memory Flip" description="Turn over cards and match all eight pairs using as few moves as possible.">
    <div className="bt18-stage"><div className="bt18-memory">{deck.map(card=><button key={card.id} onClick={()=>flip(card.id)} disabled={matched.includes(card.id)} aria-label={open.includes(card.id)||matched.includes(card.id)?card.v:"Hidden card"}>{open.includes(card.id)||matched.includes(card.id)?card.v:"✦"}</button>)}</div></div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span className="bt18-pill">Pairs: {matched.length/2}/8 · Moves: {moves}</span><button className="bt18-btn" onClick={reset}>Restart</button></div>
    <p className="bt18-result">{matched.length===16?"🏆 Perfect! All pairs matched.":"Find the matching pairs!"}</p>
  </GameCard>;
}

function DiceDuel() {
  const [dice,setDice]=useState([1,1]);
  const [rolls,setRolls]=useState(0);
  const [message,setMessage]=useState("Roll two dice and compare their total.");
  const sound=useSound();
  const roll=()=>{const a=rand(6)+1,b=rand(6)+1;setDice([a,b]);setRolls(r=>r+1);sound(380+a*55);setMessage(a+b>7?"High total!":a+b<7?"Low total!":"Exactly seven!");};
  return <GameCard title="🎲 Double Dice" description="A simple number game. Roll two dice and see how the total changes each round.">
    <div className="bt18-stage"><div className="bt18-big bt18-pop">{["⚀","⚁","⚂","⚃","⚄","⚅"][dice[0]-1]}</div><div style={{fontSize:24,color:"#a69bd3"}}>+</div><div className="bt18-big bt18-pop">{["⚀","⚁","⚂","⚃","⚄","⚅"][dice[1]-1]}</div><div className="bt18-pill">Total {dice[0]+dice[1]}</div></div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span className="bt18-pill">Rounds: {rolls}</span><button className="bt18-btn" onClick={roll}>Roll Dice</button></div>
    <p className="bt18-result" aria-live="polite">{message}</p>
  </GameCard>;
}

function NumberSprint() {
  const [target,setTarget]=useState(()=>rand(20)+1);
  const [guess,setGuess]=useState("");
  const [tries,setTries]=useState(0);
  const [message,setMessage]=useState("Guess a number from 1 to 20.");
  const [done,setDone]=useState(false);
  const sound=useSound();
  const submit=()=>{
    const n=Number(guess);if(!Number.isInteger(n)||n<1||n>20){setMessage("Enter a whole number from 1 to 20.");return;}
    const count=tries+1;setTries(count);sound(520);
    if(n===target){setMessage("🎉 Correct! You solved it in "+count+" tries.");setDone(true);}
    else setMessage(n<target?"Try a higher number.":"Try a lower number.");
    setGuess("");
  };
  const reset=()=>{setTarget(rand(20)+1);setGuess("");setTries(0);setDone(false);setMessage("New number ready. Good luck!");};
  return <GameCard title="🔢 Number Sprint" description="Find the hidden number between 1 and 20. Use the hints to solve it.">
    <div className="bt18-stage"><div className="bt18-number">{done?target:"?"}</div><span className="bt18-pill">{tries} attempts</span></div>
    <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}><input className="bt18-input" type="number" min="1" max="20" value={guess} onChange={e=>setGuess(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} disabled={done} aria-label="Your guess"/><button className="bt18-btn" onClick={submit} disabled={done}>Check</button><button className="bt18-btn" onClick={reset}>New</button></div>
    <p className="bt18-result" aria-live="polite">{message}</p>
  </GameCard>;
}

function TapBurst() {
  const [seconds,setSeconds]=useState(10);
  const [running,setRunning]=useState(false);
  const [taps,setTaps]=useState(0);
  const [best,setBest]=useState(0);
  const timer=useRef(null);
  const sound=useSound();
  useEffect(()=>()=>window.clearInterval(timer.current),[]);
  const start=()=>{
    window.clearInterval(timer.current);setTaps(0);setSeconds(10);setRunning(true);
    let left=10;
    timer.current=window.setInterval(()=>{left-=1;setSeconds(left);if(left<=0){window.clearInterval(timer.current);setRunning(false);setBest(b=>Math.max(b,taps));}},1000);
  };
  const tap=()=>{if(!running)return;setTaps(v=>v+1);sound(700);};
  useEffect(()=>{if(!running)setBest(b=>Math.max(b,taps));},[running,taps]);
  return <GameCard title="⚡ Tap Burst" description="Tap the button as many times as possible before the ten-second timer ends.">
    <div className="bt18-stage" style={{flexDirection:"column"}}><div className="bt18-number">{seconds}s</div><div style={{fontSize:14,color:"#c3bddf"}}>Taps: <b>{taps}</b> · Best: <b>{best}</b></div><button className="bt18-btn" style={{fontSize:18,padding:"16px 30px"}} onClick={tap} disabled={!running}>TAP!</button></div>
    <div style={{textAlign:"center"}}><button className="bt18-btn" onClick={start}>{running?"Restart Timer":"Start 10-Second Round"}</button></div>
    <p className="bt18-result">{running?"Go, go, go!":seconds===0?"Round complete — great effort!":"Ready when you are."}</p>
  </GameCard>;
}

export default function BT18ArcadeZone() {
  return <main className="bt18-arcade"><style>{css}</style><div className="bt18-wrap">
    <header className="bt18-hero"><span className="bt18-kicker">BT18 · ARCADE COLLECTION</span><h1 className="bt18-title">Play. Focus. Have Fun.</h1><p className="bt18-sub">Five interactive mini-games with smooth motion, optional sound effects and score feedback.</p></header>
    <div className="bt18-grid"><ColorReflex/><MemoryFlip/><DiceDuel/><NumberSprint/><TapBurst/></div>
    <p className="bt18-footer">Scores are for personal play feedback only. No stakes, coin deductions, prizes or cash value.</p>
  </div></main>;
}
