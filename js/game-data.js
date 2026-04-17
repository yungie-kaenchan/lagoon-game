// ── Game Question Data ──
export const LEVELS = {
  1: {
    label: "Level 1 — Say the Word",
    hint: "👆 Say this word clearly!",
    questions: [
      { img: "1", answer: "marine",  altAnswers: [] },
      { img: "2", answer: "lake",    altAnswers: [] },
      { img: "3", answer: "shell",   altAnswers: [] },
      { img: "4", answer: "shrimp",  altAnswers: [] },
      { img: "5", answer: "crab",    altAnswers: [] },
    ]
  },
  2: {
    label: "Level 2 — Say the Sentence",
    hint: "🗣️ Speak the full sentence!",
    questions: [
      { img: "6", text: "__________sees a _________",                          answer: "he sees a crab",              altAnswers: [] },
      { img: "7", text: "__________ buy a _________ at the __________.",       answer: "i buy a fish at the market",   altAnswers: ["i buy fish at the market"] },
      { img: "8", text: "__________ many ____________ in the lake.",           answer: "How many sea animals in the lake.", altAnswers: [] },
    ]
  },
  3: {
    label: "Level 3 — Answer the Question",
    hint: "💬 Answer the question by speaking!",
    questions: [
      { img: "9",  text: "How many shrimps are in the picture?",         answer: "there are five shrimps",   altAnswers: ["five shrimps","5 shrimps","there are 5 shrimps"] },
      { img: "10", text: "Which is bigger — the turtle or the fish?", answer: "the turtle is bigger",     altAnswers: ["turtle is bigger","the turtle","turtle"] },
      { img: "11", text: "How much does it cost?",                       answer: "it's two hundred baht",     altAnswers: ["200 baht","two hundred baht","its 200 baht","200","two hundred"] },
    ]
  }
};

export const TOTAL_QUESTIONS = 11; // 5 + 3 + 3
