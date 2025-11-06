// app/api/questions/generate/route.ts
import { NextRequest } from 'next/server';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { saveQuestion } from '@/lib/db';

// ──────────────────────────────────────────────────────────────
// 1. ENGLISH GRAMMAR QUESTIONS
// ──────────────────────────────────────────────────────────────
const englishPatterns = [
  {
    stem: "The team _____ working on the project.",
    options: ["is", "are", "were", "have"],
    correct: 1,
  },
  {
    stem: "My family _____ dinner together every Sunday.",
    options: ["eat", "eats", "eating", "ate"],
    correct: 1,
  },
  {
    stem: "The cat _____ on the mat.",
    options: ["sleep", "sleeps", "sleeping", "slept"],
    correct: 1,
  },
  {
    stem: "Neither of the students _____ the answer.",
    options: ["know", "knows", "knowing", "known"],
    correct: 1,
  },
  {
    stem: "All the children _____ playing outside.",
    options: ["is", "are", "was", "has"],
    correct: 1,
  },
];

// ──────────────────────────────────────────────────────────────
// 2. LOGICAL REASONING QUESTIONS
// ──────────────────────────────────────────────────────────────
const logicalPatterns = [
  {
    stem: "If all cats are animals and some animals are dogs, then:",
    options: ["all cats are dogs", "some cats are dogs", "no cats are dogs", "cannot be determined"],
    correct: 3,
  },
  {
    stem: "Which number comes next: 2, 4, 8, 16, ?",
    options: ["20", "24", "32", "64"],
    correct: 2,
  },
  {
    stem: "If A is B's brother, B is C's sister, then A is C's:",
    options: ["brother", "sister", "uncle", "cousin"],
    correct: 0,
  },
  {
    stem: "All roses are flowers. Some flowers fade quickly. Therefore:",
    options: ["all roses fade quickly", "some roses fade quickly", "no roses fade quickly", "cannot be determined"],
    correct: 3,
  },
  {
    stem: "Find the odd one out:",
    options: ["Apple", "Banana", "Carrot", "Orange"],
    correct: 2,
  },
];

// ──────────────────────────────────────────────────────────────
// 3. COMPUTER SKILLS QUESTIONS
// ──────────────────────────────────────────────────────────────
const computerSkillQuestions = [
  {
    stem: "What is the shortcut to copy text in Windows?",
    options: ["Ctrl + V", "Ctrl + C", "Ctrl + X", "Ctrl + P"],
    correct: 1,
  },
  {
    stem: "Which of these is NOT an operating system?",
    options: ["Windows", "Linux", "Microsoft Word", "macOS"],
    correct: 2,
  },
  {
    stem: "In Excel, what function calculates the average of a range?",
    options: ["SUM()", "AVG()", "AVERAGE()", "MEAN()"],
    correct: 2,
  },
  {
    stem: "What does CPU stand for?",
    options: ["Central Processing Unit", "Computer Personal Unit", "Central Power Unit", "Control Processing Unit"],
    correct: 0,
  },
  {
    stem: "Which file extension is for a Microsoft Word document?",
    options: [".xls", ".docx", ".ppt", ".txt"],
    correct: 1,
  },
];

// ──────────────────────────────────────────────────────────────
// 6. CUSTOMER SERVICE QUESTIONS
// ──────────────────────────────────────────────────────────────
const customerServiceQuestions = [
  {
    stem: "A customer is upset because their order is late. What should you do first?",
    options: [
      "Tell them it's not your fault",
      "Apologize and ask for details",
      "Offer a refund immediately",
      "Transfer them to a manager"
    ],
    correct: 1
  },
  {
    stem: "Which of the following shows empathy?",
    options: [
      "I understand this is frustrating for you.",
      "You should have ordered earlier.",
      "That’s not my department.",
      "Please hold while I check."
    ],
    correct: 0
  },
  {
    stem: "A customer says: 'Your product broke after one day!' You should:",
    options: [
      "Say 'That’s impossible.'",
      "Ask: 'How did you use it?'",
      "Blame the manufacturer",
      "Ignore the complaint"
    ],
    correct: 1
  },
  {
    stem: "What is the best closing phrase after resolving an issue?",
    options: [
      "Is there anything else?",
      "We’re done here.",
      "Next time be more careful.",
      "Call back if it happens again."
    ],
    correct: 0
  },
  {
    stem: "When a customer is yelling, you should:",
    options: [
      "Yell back to assert dominance",
      "Stay calm and listen actively",
      "Hang up the call",
      "Put them on hold indefinitely"
    ],
    correct: 1
  },
];

// ──────────────────────────────────────────────────────────────
// 6. MAIN POST HANDLER (updated)
// ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const token = await getAuthCookie();
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload?.id) return Response.json({ error: 'Invalid token' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'english';

  const newQs: any[] = [];
  const count = 5;

  let pool: any[] = [];

  // Select correct question pool
  if (category === 'customerservice') {
    pool = customerServiceQuestions;
  } else if (category === 'computerskill') {
    pool = computerSkillQuestions;
  } else if (category === 'logical') {
    pool = logicalPatterns;
  } else {
    pool = englishPatterns; // default
  }

  // Shuffle and pick 5
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);

  for (const q of shuffled) {
    const id = await saveQuestion(
      payload.id,
      {
        question: q.stem,
        options: q.options,
        correctAnswer: q.correct,
      },
      category
    );
    newQs.push({
      id,
      question: q.stem,
      options: q.options,
      correctAnswer: q.correct,
    });
  }

  return Response.json({ questions: newQs });
}