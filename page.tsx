"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Page = "learn" | "practice" | "score";
type Level = "easy" | "medium" | "hard";
type Question = { answer: string; toDecimal: boolean; number: number };
type Stats = { answered: number; correct: number; lastLevel: string };

const levels: Record<Level, { label: string; max: number; stars: string; note: string }> = {
  easy: { label: "Easy", max: 15, stars: "★", note: "เลข 0–15" },
  medium: { label: "Medium", max: 63, stars: "★★", note: "เลข 0–63" },
  hard: { label: "Hard", max: 255, stars: "★★★", note: "เลข 0–255" },
};

function createQuestion(level: Level): Question {
  const number = Math.floor(Math.random() * (levels[level].max + 1));
  const toDecimal = Math.random() < 0.5;
  return { number, toDecimal, answer: toDecimal ? String(number) : number.toString(2) };
}

export default function Home() {
  const [page, setPage] = useState<Page>("learn");
  const [level, setLevel] = useState<Level>("easy");
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [round, setRound] = useState({ correct: 0, total: 0 });
  const [stats, setStats] = useState<Stats>({ answered: 0, correct: 0, lastLevel: "—" });

  useEffect(() => {
    setQuestion(createQuestion("easy"));
    const saved = localStorage.getItem("binaryLabStats");
    if (saved) setStats(JSON.parse(saved));
  }, []);

  const accuracy = useMemo(
    () => (stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0),
    [stats]
  );

  function go(next: Page) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextQuestion(selected = level) {
    setQuestion(createQuestion(selected));
    setAnswer("");
    setFeedback(null);
  }

  function chooseLevel(selected: Level) {
    setLevel(selected);
    nextQuestion(selected);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!question) return;
    const raw = answer.trim();
    const valid = question.toDecimal ? /^\d+$/.test(raw) : /^[01]+$/.test(raw);
    if (!valid) {
      setFeedback({
        ok: false,
        text: question.toDecimal ? "กรุณากรอกจำนวนเต็มตั้งแต่ 0 ขึ้นไป" : "เลขฐานสองใช้ได้เฉพาะ 0 และ 1",
      });
      return;
    }
    const normalized = question.toDecimal ? String(Number(raw)) : raw.replace(/^0+(?=\d)/, "");
    const ok = normalized === question.answer;
    setRound((r) => ({ correct: r.correct + (ok ? 1 : 0), total: r.total + 1 }));
    setStats((previous) => {
      const updated = {
        answered: previous.answered + 1,
        correct: previous.correct + (ok ? 1 : 0),
        lastLevel: levels[level].label,
      };
      localStorage.setItem("binaryLabStats", JSON.stringify(updated));
      return updated;
    });
    setFeedback({ ok, text: ok ? "✓ ถูกต้อง! เก่งมาก" : `✕ ยังไม่ถูก คำตอบที่ถูกต้องคือ ${question.answer}` });
    window.setTimeout(() => nextQuestion(), 1600);
  }

  function resetScore() {
    if (!window.confirm("ต้องการล้างคะแนนทั้งหมดใช่หรือไม่?")) return;
    const empty = { answered: 0, correct: 0, lastLevel: "—" };
    setStats(empty);
    setRound({ correct: 0, total: 0 });
    localStorage.setItem("binaryLabStats", JSON.stringify(empty));
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button onClick={() => go("learn")} className="flex items-center gap-3 font-extrabold text-navy">
            <span className="mono grid h-11 w-11 place-items-center rounded-xl bg-navy text-sm text-cyan">01</span>
            <span className="hidden sm:inline">Binary Lab</span>
          </button>
          <nav className="flex gap-1" aria-label="เมนูหลัก">
            {([["learn", "เรียนรู้"], ["practice", "แบบฝึกหัด"], ["score", "คะแนน"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => go(id)} className={`rounded-xl px-3 py-2 text-sm font-semibold transition sm:px-4 ${page === id ? "bg-cyan text-teal" : "text-slate-500 hover:bg-slate-100"}`}>{label}</button>
            ))}
          </nav>
        </div>
      </header>

      <main className="page-enter mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
        {page === "learn" && (
          <>
            <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="mb-2 text-xs font-extrabold uppercase tracking-[.18em] text-teal">เริ่มจากศูนย์ เข้าใจได้จริง</p>
                <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-navy sm:text-7xl">เรียนรู้เลขฐาน 2<br/><span className="text-teal">ทีละบิต</span></h1>
                <p className="my-6 max-w-xl text-lg leading-8 text-slate-500">เลขฐานสองใช้เพียง 0 และ 1 แต่เป็นภาษาพื้นฐานที่คอมพิวเตอร์ใช้เก็บและประมวลผลข้อมูลทุกชนิด</p>
                <button onClick={() => go("practice")} className="rounded-xl bg-navy px-6 py-4 font-bold text-white shadow-[0_7px_0_#020c19] transition hover:-translate-y-0.5">เริ่มทำแบบฝึกหัด <span className="ml-2 text-cyan">→</span></button>
              </div>
              <div className="overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-card">
                <div className="mb-6 flex justify-between text-sm text-slate-300"><span>ค่าประจำหลัก</span><span className="mono rounded-full bg-teal/20 px-3 py-1 text-xs text-teal-300">LIVE</span></div>
                <div className="grid grid-cols-4 gap-2">
                  {[["1","2³ = 8"],["0","2² = 4"],["1","2¹ = 2"],["1","2⁰ = 1"]].map(([bit, value]) => (
                    <div key={value} className="rounded-xl border border-sky-900 bg-sky-950/50 py-5 text-center"><b className="mono block text-4xl text-cyan sm:text-5xl">{bit}</b><small className="text-xs text-slate-400">{value}</small></div>
                  ))}
                </div>
                <div className="mono mt-5 rounded-xl bg-white p-4 text-center text-navy">8 + 0 + 2 + 1 <strong className="text-teal">= 11₁₀</strong></div>
              </div>
            </section>
            <section className="mt-20">
              <div className="mb-5"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-teal">บทเรียนย่อ</p><h2 className="text-3xl font-extrabold text-navy">หลักการแปลงเลข</h2></div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ["01","เลขฐานสองคืออะไร?","ระบบตัวเลขที่มีเพียงเลข 0 และ 1 แต่ละตำแหน่งเรียกว่า “บิต” และมีค่าตามกำลังของ 2",""],
                  ["02","ฐาน 2 → ฐาน 10","คูณแต่ละหลักด้วย 2 ยกกำลังตามตำแหน่ง แล้วนำผลทั้งหมดมาบวกกัน","1010₂ = 8 + 0 + 2 + 0 = 10₁₀"],
                  ["03","ฐาน 10 → ฐาน 2","หารจำนวนนั้นด้วย 2 ต่อเนื่อง เก็บเศษแต่ละครั้ง แล้วอ่านเศษจากล่างขึ้นบน","13₁₀ = 1101₂"],
                ].map(([number,title,text,example]) => (
                  <article key={number} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><span className="mono font-semibold text-teal">{number}</span><h3 className="mb-2 mt-8 text-xl font-bold text-navy">{title}</h3><p className="leading-7 text-slate-500">{text}</p>{example && <div className="mono mt-5 rounded-lg bg-cyan p-3 text-xs font-semibold text-teal">{example}</div>}</article>
                ))}
              </div>
            </section>
          </>
        )}

        {page === "practice" && question && (
          <>
            <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-teal">ฝึกให้คล่อง</p><h1 className="text-5xl font-extrabold text-navy">แบบฝึกหัด</h1><p className="mt-2 text-slate-500">เลือกระดับ แล้วตอบคำถามทีละข้อ</p></div><div className="rounded-xl border bg-white px-4 py-3 text-right"><small className="block text-slate-500">คะแนนรอบนี้</small><strong className="mono text-xl text-teal">{round.correct} / {round.total}</strong></div></div>
            <div className="mb-5 grid gap-3 md:grid-cols-3">
              {(Object.keys(levels) as Level[]).map((id) => <button key={id} onClick={() => chooseLevel(id)} className={`flex items-center gap-4 rounded-2xl border bg-white p-4 text-left ${level === id ? "border-2 border-teal bg-cyan" : "border-slate-200"}`}><span className="text-amber-500">{levels[id].stars}</span><span><b className="block text-navy">{levels[id].label}</b><small className="text-slate-500">{levels[id].note}</small></span></button>)}
            </div>
            <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-12">
              <div className="flex justify-between"><span className="rounded-lg bg-cyan px-3 py-2 text-xs font-bold text-teal">{question.toDecimal ? "ฐาน 2 → ฐาน 10" : "ฐาน 10 → ฐาน 2"}</span><button onClick={() => nextQuestion()} className="text-sm text-slate-500">↻ สุ่มข้อใหม่</button></div>
              <p className="mt-9 text-center text-slate-500">จงหาคำตอบของ</p>
              <div className="mono mb-9 text-center text-4xl font-semibold text-navy sm:text-6xl">{question.toDecimal ? `${question.number.toString(2)}₂ = ?₁₀` : `${question.number}₁₀ = ?₂`}</div>
              <form onSubmit={submit}><label className="mb-2 block text-sm font-bold">คำตอบของคุณ</label><div className="flex flex-col gap-3 sm:flex-row"><input value={answer} onChange={(e) => setAnswer(e.target.value)} inputMode="numeric" autoFocus className="mono min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 outline-none focus:border-teal focus:ring-4 focus:ring-cyan" placeholder="พิมพ์คำตอบ" required/><button className="rounded-xl bg-navy px-6 py-3 font-bold text-white" type="submit">ตรวจคำตอบ</button></div></form>
              {feedback && <div role="status" className={`mt-5 rounded-xl p-4 font-semibold ${feedback.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{feedback.text}</div>}
            </section>
          </>
        )}

        {page === "score" && (
          <section className="grid gap-7 lg:grid-cols-2">
            <div className="rounded-3xl border bg-white p-8 shadow-card"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-teal">ผลการเรียนรู้</p><h1 className="text-5xl font-extrabold text-navy">คะแนนของคุณ</h1><div className="mx-auto my-10 grid h-52 w-52 place-items-center rounded-full" style={{background:`conic-gradient(#078a8d ${accuracy}%,#e8eef1 ${accuracy}%)`}}><div className="grid h-40 w-40 place-items-center rounded-full bg-white text-center"><div><strong className="mono block text-4xl text-navy">{accuracy}%</strong><span className="text-xs text-slate-500">ความแม่นยำ</span></div></div></div><p className="text-center text-slate-500">{stats.answered === 0 ? "เริ่มทำแบบฝึกหัดเพื่อบันทึกคะแนน" : accuracy >= 80 ? "ยอดเยี่ยม! คุณเข้าใจเลขฐานสองดีมาก" : accuracy >= 50 ? "ทำได้ดี ฝึกต่ออีกนิดจะแม่นยำขึ้น" : "ทบทวนบทเรียนแล้วลองอีกครั้งนะ"}</p></div>
            <div className="grid grid-cols-2 gap-4 rounded-3xl border bg-white p-8 shadow-card">{[["ตอบทั้งหมด",stats.answered],["ตอบถูก",stats.correct],["ตอบผิด",stats.answered-stats.correct],["ระดับล่าสุด",stats.lastLevel]].map(([label,value])=><article key={label} className="rounded-2xl border p-5"><small className="text-slate-500">{label}</small><strong className="mono mt-3 block text-3xl text-navy">{value}</strong></article>)}<button onClick={resetScore} className="rounded-xl border border-red-200 p-3 text-red-700">ล้างคะแนน</button><button onClick={()=>go("practice")} className="rounded-xl bg-navy p-3 font-bold text-white">ฝึกต่อ →</button></div>
          </section>
        )}
      </main>
      <footer className="mx-auto flex max-w-6xl justify-between border-t px-6 py-6 text-xs text-slate-500"><b className="text-navy">Binary Lab</b><span>เรียน • ฝึก • เข้าใจ</span></footer>
    </div>
  );
}
