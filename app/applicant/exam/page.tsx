'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Question = {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  category: 'english' | 'logical' | 'computerskill' | 'customerservice' | 'typing';
};

type AnswerMap = Record<string, string>;

const CATEGORY_ORDER = ['english', 'logical', 'computerskill', 'customerservice', 'typing'] as const;
const CATEGORY_LABEL: Record<string, string> = {
  english: 'English',
  logical: 'Logical',
  computerskill: 'Computer Skill',
  customerservice: 'Customer Service',
  typing: 'Typing Test',
};

const TIME_PER_CATEGORY = 5 * 60;
const TYPING_TIME = 30;
const POST_TYPING_DELAY = 3000; // 3 seconds

// === RANDOM WORD LIST (500+ common English words) ===
const WORD_LIST = [
  'the', 'be', 'to', 'of', 'and', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
  'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will',
  'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
  'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look',
  'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work',
  'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'is', 'are', 'was', 'were', 'been', 'has', 'had', 'did', 'does', 'said', 'says', 'made', 'make', 'may',
  'very', 'much', 'more', 'many', 'few', 'little', 'big', 'small', 'large', 'long', 'short', 'old', 'young',
  'high', 'low', 'great', 'best', 'better', 'good', 'bad', 'same', 'different', 'next', 'last', 'new', 'old',
  'fast', 'slow', 'early', 'late', 'hot', 'cold', 'warm', 'cool', 'bright', 'dark', 'light', 'heavy', 'easy',
  'hard', 'soft', 'strong', 'weak', 'clean', 'dirty', 'safe', 'dangerous', 'happy', 'sad', 'angry', 'calm',
  'beautiful', 'ugly', 'rich', 'poor', 'smart', 'stupid', 'kind', 'mean', 'funny', 'serious', 'quiet', 'loud',
  'open', 'closed', 'full', 'empty', 'true', 'false', 'right', 'wrong', 'yes', 'no', 'maybe', 'always', 'never',
  'sometimes', 'often', 'rarely', 'usually', 'today', 'tomorrow', 'yesterday', 'morning', 'afternoon', 'evening',
  'night', 'week', 'month', 'year', 'hour', 'minute', 'second', 'now', 'soon', 'later', 'before', 'after',
  'here', 'there', 'near', 'far', 'left', 'right', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
  'behind', 'front', 'next', 'between', 'among', 'with', 'without', 'about', 'around', 'through', 'during',
  'until', 'since', 'from', 'into', 'onto', 'within', 'outside', 'inside', 'above', 'below', 'beside', 'against',
  'across', 'along', 'toward', 'away', 'back', 'forward', 'home', 'work', 'school', 'office', 'store', 'park',
  'city', 'country', 'world', 'life', 'love', 'family', 'friend', 'person', 'man', 'woman', 'child', 'boy',
  'girl', 'dog', 'cat', 'bird', 'fish', 'car', 'bus', 'train', 'plane', 'bike', 'book', 'phone', 'computer',
  'internet', 'music', 'movie', 'game', 'food', 'water', 'coffee', 'tea', 'milk', 'bread', 'rice', 'meat',
  'fruit', 'vegetable', 'apple', 'banana', 'orange', 'grape', 'lemon', 'potato', 'tomato', 'carrot', 'onion',
  'house', 'room', 'door', 'window', 'table', 'chair', 'bed', 'light', 'lamp', 'clock', 'watch', 'phone',
  'television', 'radio', 'camera', 'picture', 'photo', 'art', 'color', 'red', 'blue', 'green', 'yellow',
  'black', 'white', 'gray', 'brown', 'pink', 'purple', 'orange', 'gold', 'silver', 'bronze', 'wood', 'metal',
  'glass', 'paper', 'plastic', 'cloth', 'cotton', 'wool', 'silk', 'leather', 'rubber', 'stone', 'sand', 'water',
  'fire', 'air', 'earth', 'sun', 'moon', 'star', 'sky', 'cloud', 'rain', 'snow', 'wind', 'storm', 'tree',
  'flower', 'grass', 'mountain', 'river', 'lake', 'ocean', 'beach', 'island', 'road', 'street', 'path', 'bridge',
  'building', 'factory', 'farm', 'garden', 'field', 'forest', 'desert', 'jungle', 'valley', 'hill', 'cave', 'rock',
  'money', 'bank', 'job', 'business', 'company', 'market', 'shop', 'price', 'cost', 'value', 'free', 'cheap',
  'expensive', 'rich', 'poor', 'happy', 'sad', 'love', 'hate', 'like', 'dislike', 'want', 'need', 'have', 'give',
  'take', 'buy', 'sell', 'pay', 'earn', 'spend', 'save', 'lose', 'win', 'play', 'work', 'rest', 'sleep', 'wake',
  'eat', 'drink', 'cook', 'read', 'write', 'speak', 'listen', 'see', 'hear', 'touch', 'smell', 'taste', 'think',
  'feel', 'know', 'learn', 'teach', 'study', 'practice', 'try', 'start', 'stop', 'continue', 'finish', 'help',
  'ask', 'answer', 'tell', 'show', 'find', 'search', 'look', 'watch', 'wait', 'run', 'walk', 'jump', 'sit',
  'stand', 'lie', 'move', 'stay', 'come', 'go', 'arrive', 'leave', 'enter', 'exit', 'open', 'close', 'turn',
  'push', 'pull', 'carry', 'hold', 'drop', 'pick', 'throw', 'catch', 'kick', 'hit', 'cut', 'break', 'fix',
  'build', 'create', 'destroy', 'change', 'grow', 'shrink', 'increase', 'decrease', 'add', 'remove', 'join',
  'separate', 'connect', 'disconnect', 'begin', 'end', 'live', 'die', 'born', 'grow', 'age', 'young', 'old',
  'new', 'old', 'modern', 'ancient', 'future', 'past', 'present', 'history', 'science', 'art', 'sport', 'game',
  'music', 'dance', 'sing', 'draw', 'paint', 'write', 'read', 'think', 'imagine', 'dream', 'hope', 'wish',
  'believe', 'doubt', 'trust', 'fear', 'courage', 'brave', 'scared', 'strong', 'weak', 'power', 'energy', 'force',
  'speed', 'time', 'space', 'distance', 'direction', 'path', 'goal', 'plan', 'idea', 'question', 'answer', 'problem',
  'solution', 'cause', 'effect', 'reason', 'result', 'chance', 'luck', 'fate', 'destiny', 'choice', 'decision',
  'freedom', 'rule', 'law', 'order', 'chaos', 'peace', 'war', 'friend', 'enemy', 'love', 'hate', 'kindness', 'cruelty'
];

// Generate random typing text (100 words)
const generateRandomText = () => {
  const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 100).join(' ') + '.';
};

function ExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('id');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentCategoryIdx, setCurrentCategoryIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_CATEGORY);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  // Typing state
  const [typingInput, setTypingInput] = useState('');
  const [typingStartTime, setTypingStartTime] = useState<number | null>(null);
  const [typingEndTime, setTypingEndTime] = useState<number | null>(null);
  const [typingFinished, setTypingFinished] = useState(false);
  const [showPostTyping, setShowPostTyping] = useState(false);
  const [typeText, setTypeText] = useState(''); // Random text

  const typingInputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate random text on mount
  useEffect(() => {
    setTypeText(generateRandomText());
  }, []);

  // Load questions
  useEffect(() => {
    if (!examId) {
      router.replace('/');
      return;
    }

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/load-questions');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load questions');
        setQuestions(data.questions);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [examId, router]);

  // Timer
  useEffect(() => {
    if (loading || submitting || showPostTyping) return;

    const category = CATEGORY_ORDER[currentCategoryIdx];
    const maxTime = category === 'typing' ? TYPING_TIME : TIME_PER_CATEGORY;
    setTimeLeft(maxTime);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentCategoryIdx, loading, submitting, showPostTyping]);

  // Reset typing state
  useEffect(() => {
    if (CATEGORY_ORDER[currentCategoryIdx] === 'typing') {
      setTypingInput('');
      setTypingStartTime(null);
      setTypingEndTime(null);
      setTypingFinished(false);
      setShowPostTyping(false);
    }
  }, [currentCategoryIdx]);

  const handleTimeUp = () => {
    if (CATEGORY_ORDER[currentCategoryIdx] === 'typing') {
      setTypingFinished(true);
      setTypingEndTime(Date.now());
      setShowPostTyping(true);
    } else if (currentCategoryIdx < CATEGORY_ORDER.length - 1) {
      setCurrentCategoryIdx(i => i + 1);
    } else {
      submitExam();
    }
  };

  // Auto-submit after 3 seconds
  useEffect(() => {
    if (showPostTyping && currentCategoryIdx === CATEGORY_ORDER.length - 1) {
      const timer = setTimeout(() => {
        submitExam();
      }, POST_TYPING_DELAY);
      return () => clearTimeout(timer);
    }
  }, [showPostTyping, currentCategoryIdx]);

  // Auto-focus
  useEffect(() => {
    if (CATEGORY_ORDER[currentCategoryIdx] === 'typing' && typingInputRef.current && !showPostTyping) {
      typingInputRef.current.focus();
    }
  }, [currentCategoryIdx, showPostTyping]);

  // Auto-scroll to top on category change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentCategoryIdx]);

  const grouped = questions.reduce((acc: Record<string, Question[]>, q: Question) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  const currentCategory = CATEGORY_ORDER[currentCategoryIdx];
  const currentQuestions = grouped[currentCategory] || [];
  const isLastCategory = currentCategoryIdx === CATEGORY_ORDER.length - 1;

  const goNext = () => {
    if (currentCategoryIdx < CATEGORY_ORDER.length - 1) {
      setCurrentCategoryIdx(i => i + 1);
    }
  };

  // WPM
  const calculateWPM = () => {
    if (!typingStartTime) return 0;
    const end = typingEndTime || Date.now();
    const elapsedMinutes = (end - typingStartTime) / 60000;
    if (elapsedMinutes <= 0) return 0;
    const grossWords = typingInput.trim().split(/\s+/).filter(w => w).length;
    return Math.round(grossWords / elapsedMinutes) || 0;
  };

  // Accuracy
  const calculateAccuracy = () => {
    if (!typingInput) return 100;
    let correct = 0;
    const len = Math.min(typingInput.length, typeText.length);
    for (let i = 0; i < len; i++) {
      if (typingInput[i] === typeText[i]) correct++;
    }
    return Math.round((correct / typingInput.length) * 100) || 0;
  };

  // Split text
  const words = typeText.split(/\s+/);
  const typedWords = typingInput.trim().split(/\s+/).filter(w => w);
  const currentWordIndex = typedWords.length - 1;
  const isCurrentWordComplete = typingInput.endsWith(' ');

  // Auto-jump on space
  const handleTypingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (typingFinished || timeLeft === 0 || showPostTyping) return;

    const value = e.target.value;

    if (!typingStartTime && value.length > 0) {
      setTypingStartTime(Date.now());
    }

    // Allow space to jump (even if word incomplete)
    if (value.endsWith(' ') && !typingInput.endsWith(' ')) {
      setTypingInput(value);
      return;
    }

    // Block deleting space
    if (value.length < typingInput.length && typingInput.endsWith(' ')) {
      return;
    }

    setTypingInput(value);
  };

  const submitExam = async () => {
    setSubmitting(true);
    setError('');

    try {
      const scores = { english: 0, logical: 0, computerskill: 0, customerservice: 0 };
      questions.forEach(q => {
        if (q.category !== 'typing') {
          const upholstery = answers[q.id];
          const correct = q.correct_answer;
          if (upholstery != null && parseInt(upholstery, 10) === correct) {
            scores[q.category as keyof typeof scores] += 1;
          }
        }
      });

      const storedId = localStorage.getItem('exam_examination_id');
      if (!storedId) throw new Error('Exam ID missing');

      if (!typingEndTime) {
        setTypingEndTime(Date.now());
      }

      const wpm = calculateWPM();
      const accuracy = calculateAccuracy();

      console.log('SUBMITTING → WPM:', wpm, 'Accuracy:', accuracy);

      const res = await fetch('/api/submit-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examination_id: storedId,
          english: scores.english,
          logical: scores.logical,
          computerskill: scores.computerskill,
          customerservice: scores.customerservice,
          typing_wpm: wpm,
          typing_accuracy: accuracy,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submit failed');

      localStorage.removeItem('exam_examination_id');
      setShowThankYou(true);

      setTimeout(() => {
        router.push(`/applicant/result?id=${storedId}`);
      }, 3000);

    } catch (e: any) {
      setError(e.message);
      console.error('SUBMIT ERROR:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s: number) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-lg">Loading…</div>;
  if (error) return <div className="flex min-h-screen items-center justify-center text-red-600">{error}</div>;

  // 3-SECOND RESULT SCREEN
  if (showPostTyping) {
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-6 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="w-full max-w-md text-center">
          <h2 className="mb-8 text-4xl font-bold text-indigo-700 dark:text-indigo-300">Typing Complete!</h2>

          <div className="space-y-6 rounded-2xl bg-white p-10 shadow-2xl dark:bg-zinc-900">
            <div>
              <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">Words Per Minute</p>
              <p className="text-7xl font-bold text-indigo-600 dark:text-indigo-400">{wpm}</p>
            </div>
            <div>
              <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">Accuracy</p>
              <p className="text-7xl font-bold text-green-600 dark:text-green-400">{accuracy}%</p>
            </div>
          </div>

          <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
            Submitting in <span className="font-bold text-indigo-700 dark:text-indigo-300">3 seconds</span>...
          </p>
        </div>
      </div>
    );
  }

  // THANK YOU
  if (showThankYou) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-6 dark:from-green-900/20 dark:to-blue-900/20">
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold text-green-700 dark:text-green-400">Thank You!</h1>
          <p className="mb-2 text-xl text-zinc-700 dark:text-zinc-300">
            You have successfully completed the ADON Assessment.
          </p>
          <p className="mb-4 text-lg text-zinc-600 dark:text-zinc-400">
            Your results have been submitted. The HR team will review your performance.
          </p>
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Examination ID: <span className="font-mono">{examId}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-zinc-50 p-6 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-center text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          ADON Assessment
        </h1>

        <div className="mb-6 text-center">
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            {CATEGORY_LABEL[currentCategory]} (
            {currentCategory === 'typing' ? '30 seconds' : `${currentQuestions.length} questions`})
          </p>

          <div className={`mt-3 inline-block rounded-full px-6 py-2 text-xl font-bold transition-all
            ${currentCategory === 'typing' && timeLeft <= 10 ? 'bg-red-600 text-white animate-pulse' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
            Time Left: {formatTime(timeLeft)}
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {CATEGORY_ORDER.map((c, i) => (
              <div
                key={c}
                className={`h-2 w-12 rounded-full transition-all ${
                  i === currentCategoryIdx
                    ? 'bg-black dark:bg-white'
                    : i < currentCategoryIdx
                    ? 'bg-green-500'
                    : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900">
          {currentCategory !== 'typing' ? (
            currentQuestions.map((q: Question, idx: number) => (
              <div key={q.id} className="border-b pb-6 last:border-0 dark:border-zinc-700">
                <p className="mb-4 text-lg font-medium text-zinc-700 dark:text-zinc-300">
                  Q{idx + 1}. {q.question}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {q.options.map((opt: string, i: number) => {
                    const selected = answers[q.id] === String(i);
                    return (
                      <label
                        key={i}
                        className={`flex cursor-pointer items-center rounded-lg border p-4 transition-all
                          ${selected
                            ? 'border-black bg-black/5 dark:border-white dark:bg-white/10'
                            : 'border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
                          }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={i}
                          checked={selected}
                          onChange={() => setAnswers({ ...answers, [q.id]: String(i) })}
                          className="sr-only"
                        />
                        <span className="ml-3 text-base text-zinc-700 dark:text-zinc-300">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">30-Second Typing Test</h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Press <kbd className="mx-1 rounded bg-zinc-200 px-2 py-1 text-xs font-mono dark:bg-zinc-700">Space</kbd> to jump to next word
                </p>
              </div>

              {/* Live Stats */}
              {typingStartTime && (
                <div className="flex justify-center gap-8 text-sm font-medium">
                  <div className="text-center">
                    <p className="text-zinc-500 dark:text-zinc-400">WPM</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{calculateWPM()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-500 dark:text-zinc-400">Accuracy</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{calculateAccuracy()}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-500 dark:text-zinc-400">Time</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{timeLeft}s</p>
                  </div>
                </div>
              )}

              {/* Typing Area */}
              <div className="rounded-xl bg-zinc-50 p-8 dark:bg-zinc-800">
                <div className="mb-6 overflow-hidden font-mono text-xl leading-relaxed tracking-wide">
                  {words.map((word, wordIdx) => {
                    const typedWord = typedWords[wordIdx] || '';
                    const isCurrent = wordIdx === currentWordIndex;
                    const isNext = wordIdx === currentWordIndex + 1;
                    const isPast = wordIdx < currentWordIndex;

                    return (
                      <span
                        key={wordIdx}
                        className={`inline-block mr-3 transition-all duration-200
                          ${isCurrent ? 'font-bold underline decoration-2 underline-offset-4 decoration-indigo-500 scale-105' : ''}
                          ${isNext ? 'text-zinc-400 dark:text-zinc-600' : ''}
                          ${isPast ? 'opacity-50' : ''}
                        `}
                      >
                        {word.split('').map((char, charIdx) => {
                          const typedChar = typedWord[charIdx];
                          let className = '';
                          if (typedChar !== undefined) {
                            className = typedChar === char
                              ? 'text-green-600'
                              : 'text-red-600 bg-red-100 dark:bg-red-900';
                          } else if (isCurrent && charIdx === typedWord.length) {
                            className = 'animate-pulse bg-yellow-200 dark:bg-yellow-900';
                          }
                          return <span key={charIdx} className={className}>{char}</span>;
                        })}
                        {isCurrent && typedWord.length > word.length && (
                          <span className="text-red-600"> {typedWord.slice(word.length)}</span>
                        )}
                      </span>
                    );
                  })}
                </div>

                <textarea
                  ref={typingInputRef}
                  value={typingInput}
                  onChange={handleTypingChange}
                  onPaste={(e) => e.preventDefault()}
                  placeholder="Click here and start typing..."
                  className="h-20 w-full resize-none rounded-lg border-2 border-dashed border-zinc-300 bg-transparent p-4 font-mono text-lg text-transparent caret-indigo-600 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:caret-indigo-400"
                  disabled={typingFinished || timeLeft === 0}
                  style={{ caretColor: '#6366f1' }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentCategoryIdx(i => Math.max(0, i - 1))}
            disabled={currentCategoryIdx === 0}
            className="rounded-full bg-zinc-200 px-6 py-3 text-base font-medium text-zinc-800 transition-all hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Previous
          </button>

          {!isLastCategory ? (
            <button
              onClick={goNext}
              className="rounded-full bg-black px-8 py-3 text-base font-medium text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Next Category
            </button>
          ) : (
            <button
              onClick={submitExam}
              disabled={submitting || showPostTyping}
              className="rounded-full bg-black px-8 py-3 text-base font-medium text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {submitting ? 'Submitting…' : 'Submit Exam'}
            </button>
          )}
        </div>

        {timeLeft <= 5 && timeLeft > 0 && currentCategory === 'typing' && !showPostTyping && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="animate-bounce rounded-full bg-red-600 px-10 py-6 text-5xl font-bold text-white shadow-2xl">
              {timeLeft}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-lg">Loading exam…</div>}>
      <ExamContent />
    </Suspense>
  );
}