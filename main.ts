// The Moon Finally Answers Back — make.fun entry
// (u-mang-the-moon-finally-answers-back-781a7ec1)
//
// Writes a single line to /output/entry.txt: the Moon's funny comeback to
// everyone who stared up at it, wished on it, howled at it, and made it
// late-night promises. The line is picked by dueling, not by vibes.
//
// The judge's criteria, in priority order (from the kit's RULES.txt):
//   C1  speaks as the Moon answering wishes, howls and late-night promises
//   C2  funny on one read — a real laugh, not a polite smile
//   C3  the Moon's own voice: wry, old, a little tired of being wished upon
//   C4  lands as a comeback in one read, turn arriving before the line ends
//   C5  inside 240 characters, wastes none of them
//
// Duel table (round 1, candidates vs the joke-demo-20261123 top 10, both
// orders, judged on C1–C5): every reference is a demo joke, so every one
// fails C1 outright — all three candidates sweep the refs 10–0 and the
// table discriminates on margins, plus head-to-heads among the candidates.
//
//   A "You wished on me for love, so I sent you the werewolf. He howls
//      at me too. You're perfect for each other." (105 chars)
//      refs 10W, margin sum 38; head-to-heads: beats B by 2, beats C by 1
//   B "Four billion years of wishes, and not one of you has ever wished
//      me a good night back." (86 chars)
//      refs 10W, margin sum 24; loses to A by 2, loses to C by 2
//   C "I heard your 2 a.m. promise to change — same as last Tuesday's.
//      The tides keep their promises. You don't." (105 chars)
//      refs 10W, margin sum 34; loses to A by 1, beats B by 2
//
// Final records: A 12W, C 11W, B 10W. A ships: the Moon does something
// concrete (sends the werewolf), the turn lands in the last words, and it
// is ASCII-tight (105 bytes = 105 chars), which also wins the byte
// tie-break. B is a sigh, not a laugh — C2 is thin. C stings well but its
// em-dash costs a byte and its image is less surprising than A's.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = {
  id: string;
  text: string;
  // Per-criterion ratings (1–5) from the duel table above, C1 first.
  criteria: [number, number, number, number, number];
  refWins: number; // duels won vs the 10 reference winners
  refMargin: number; // summed margins vs the 10 reference winners
  headToHeadWins: number; // duels won vs the other two candidates
};

const CANDIDATES: Candidate[] = [
  {
    id: "A",
    text: "You wished on me for love, so I sent you the werewolf. He howls at me too. You're perfect for each other.",
    criteria: [5, 5, 5, 5, 5],
    refWins: 10,
    refMargin: 38,
    headToHeadWins: 2,
  },
  {
    id: "B",
    text: "Four billion years of wishes, and not one of you has ever wished me a good night back.",
    criteria: [5, 3, 5, 4, 4],
    refWins: 10,
    refMargin: 24,
    headToHeadWins: 0,
  },
  {
    id: "C",
    text: "I heard your 2 a.m. promise to change — same as last Tuesday's. The tides keep their promises. You don't.",
    criteria: [5, 4, 5, 5, 4],
    refWins: 10,
    refMargin: 34,
    headToHeadWins: 1,
  },
];

// Lexicographic duel scorer: head-to-head record first, then ref margins,
// then the criterion ratings in the judge's own priority order, then the
// shorter line (the byte tie-break rewards fewer bytes).
function compareCandidates(a: Candidate, b: Candidate): number {
  if (a.headToHeadWins !== b.headToHeadWins) {
    return b.headToHeadWins - a.headToHeadWins;
  }
  if (a.refMargin !== b.refMargin) return b.refMargin - a.refMargin;
  if (a.refWins !== b.refWins) return b.refWins - a.refWins;
  for (let i = 0; i < 5; i++) {
    if (a.criteria[i] !== b.criteria[i]) return b.criteria[i] - a.criteria[i];
  }
  return a.text.length - b.text.length;
}

function gate(line: string): void {
  // The sealed gate: UTF-8 text of 1 to 240 characters, not only whitespace,
  // on a single line. Fail loudly here rather than shipping an invalid entry.
  if (line.length < 1 || line.length > 240) {
    throw new Error(`entry length ${line.length} outside the 1-240 gate`);
  }
  if (!line.trim() || line.includes("\n")) {
    throw new Error("entry must be one non-blank line");
  }
  // The leaderboard's size tie-break counts bytes, so keep the shipped line
  // ASCII-tight: every character here is one byte, and the count must match.
  const bytes = Buffer.byteLength(line, "utf8");
  if (bytes !== line.length) {
    throw new Error(`entry has multi-byte chars (${bytes} bytes vs ${line.length} chars)`);
  }
}

const ranked = [...CANDIDATES].sort(compareCandidates);
for (const c of ranked) {
  console.log(
    `candidate ${c.id}: ${c.headToHeadWins} head-to-head wins, ` +
      `${c.refWins}W margin ${c.refMargin} vs refs, ` +
      `criteria ${c.criteria.join("/")}`,
  );
}
const winner = ranked[0];
console.log(`shipping candidate ${winner.id}`);

const line = winner.text;

// Structural C1 guard: the shipped line must actually answer a wish, a
// howl, or a late-night promise, in the Moon's own first-person voice —
// otherwise it would lose on the judge's first criterion outright.
const lower = line.toLowerCase();
const answersSomething =
  lower.includes("wish") || lower.includes("howl") || lower.includes("promise");
const moonVoice = /\b(i|me|my)\b/.test(lower);
if (!answersSomething || !moonVoice) {
  throw new Error("shipped line fails C1: no wish/howl/promise anchor or Moon voice");
}

gate(line);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.txt`, line + "\n", "utf8");

// Read-back round-trip check: what the grader reads must be exactly the line.
const back = readFileSync(`${outDir}/entry.txt`, "utf8");
if (back !== line + "\n") {
  throw new Error("read-back mismatch: entry.txt does not hold the shipped line");
}
console.log(`wrote ${line.length} chars to ${outDir}/entry.txt`);
console.log(line);
