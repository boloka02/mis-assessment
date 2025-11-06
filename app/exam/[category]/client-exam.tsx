'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, RefreshCw } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Props {
  userId: string;
  category: string;
  initialQuestions: Question[];
}

const categoryTitles: Record<string, string> = {
  english: 'English Grammar',
  logical: 'Logical Reasoning',
  computerskill: 'Computer Skills',
  customerservice: 'Customer Service',
};

export default function ExamClient({ userId, category, initialQuestions }: Props) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Question>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  });

  const title = categoryTitles[category] || 'Exam';

  const resetForm = () => {
    setForm({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (q: Question) => {
    setForm({ ...q });
    setEditingId(q.id);
  };

  const saveQuestion = async () => {
    if (!form.question || form.options?.some((o) => !o)) return;

    const qData = {
      question: form.question!,
      options: form.options!,
      correctAnswer: form.correctAnswer!,
      userId,
      category,
    };

    const res = await fetch('/api/questions', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...qData, id: editingId }),
    });

    if (res.ok) {
      const saved = await res.json();
      if (editingId) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === editingId ? { ...q, ...qData } : q))
        );
      } else {
        setQuestions((prev) => [...prev, { id: saved.id, ...qData }]);
      }
      resetForm();
    }
  };

  const deleteQuestion = async (id: string) => {
    await fetch(`/api/questions?id=${id}`, { method: 'DELETE' });
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const generateMore = async () => {
    const res = await fetch(`/api/questions/generate?category=${category}`, {
      method: 'POST',
    });
    if (!res.ok) return;
    const { questions: newQs } = await res.json();
    setQuestions((prev) => [...prev, ...newQs]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {title} ({questions.length} questions)
        </h1>
        <div className="flex gap-3">
          <button
            onClick={generateMore}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <RefreshCw className="w-5 h-5" />
            Generate 5 More
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Manual
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg border">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Question' : 'Add Question'}
          </h2>
          <div className="space-y-4">
            {/* Question Input */}
            <input
              type="text"
              placeholder="Question"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg dark:bg-black"
            />

            {/* Options */}
            {form.options?.map((opt, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-medium w-8">{String.fromCharCode(65 + i)}.</span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const opts = [...(form.options || [])];
                    opts[i] = e.target.value;
                    setForm({ ...form, options: opts });
                  }}
                  className="flex-1 px-4 py-3 border rounded-lg dark:bg-black"
                />
              </div>
            ))}

            {/* Correct Answer */}
            <div className="flex items-center gap-4">
              <span className="font-medium">Correct:</span>
              {['A', 'B', 'C', 'D'].map((label, i) => (
                <label key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={form.correctAnswer === i}
                    onChange={() => setForm({ ...form, correctAnswer: i })}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={saveQuestion}
                className="px-5 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Save
              </button>
              <button
                onClick={resetForm}
                className="px-5 py-2 bg-zinc-500 text-white rounded-lg flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question List */}
      <div className="space-y-6">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border"
          >
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Question {i + 1}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(q)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteQuestion(q.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="text-lg mb-4">{q.question}</p>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((opt, j) => (
                <label
                  key={j}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer ${
                    q.correctAnswer === j
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : 'border-zinc-300'
                  }`}
                >
                  <input type="radio" disabled checked={q.correctAnswer === j} />
                  <span className="font-medium">{opt}</span>
                  {q.correctAnswer === j && (
                    <Check className="w-5 h-5 text-green-600 ml-auto" />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
