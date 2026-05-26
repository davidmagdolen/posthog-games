"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import posthog from "posthog-js";

const questions = [
  {
    question: "What does NDR stand for in SaaS?",
    options: ["Net Dollar Retention", "New Deal Revenue", "Net Data Rate", "Nominal Dollar Return"],
    correct: 0,
  },
  {
    question: "What is a feature flag used for?",
    options: ["Marking bugs in code", "Gradually rolling out features to users", "Flagging security issues", "Tagging customer feedback"],
    correct: 1,
  },
  {
    question: "What does TTV stand for?",
    options: ["Total Transaction Volume", "Time-to-Value", "Technical Testing Validation", "Throughput-to-Velocity"],
    correct: 1,
  },
  {
    question: "In PostHog, what is a 'cohort'?",
    options: ["A type of dashboard", "A group of users sharing a common trait", "A billing tier", "An API endpoint"],
    correct: 1,
  },
  {
    question: "What is product-led growth (PLG)?",
    options: ["Growth driven by sales teams", "Growth where the product itself drives acquisition and retention", "Growth through paid advertising", "Growth through partnerships"],
    correct: 1,
  },
  {
    question: "What does an A/B test measure?",
    options: ["Server uptime", "The performance difference between two variants", "Database query speed", "API response time"],
    correct: 1,
  },
  {
    question: "What is churn rate?",
    options: ["The rate of new signups", "The percentage of customers who stop using a product", "The speed of data processing", "The rate of feature releases"],
    correct: 1,
  },
  {
    question: "What does GDR measure that NDR doesn't?",
    options: ["GDR includes expansion revenue", "GDR caps each customer at their base amount — only downgrades and churn", "GDR measures new customer acquisition", "GDR tracks feature adoption"],
    correct: 1,
  },
  {
    question: "What is session replay?",
    options: ["Replaying a database session", "Recording and watching real user sessions on your site", "Restarting a server session", "Copying session cookies"],
    correct: 1,
  },
  {
    question: "What is the AARRR framework?",
    options: ["A pirate's favorite metric", "Acquisition, Activation, Retention, Referral, Revenue", "Analyze, Act, Report, Repeat, Review", "Authentication, Authorization, Rate-limiting, Routing, Rendering"],
    correct: 1,
  },
];

export default function DataQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    posthog.capture("quiz_started", { total_questions: questions.length });
  }, []);

  const handleAnswer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setShowResult(true);
    const isCorrect = index === questions[currentQ].correct;
    if (isCorrect) {
      setScore((s) => s + 1);
    }
    posthog.capture("quiz_answer_submitted", {
      question_index: currentQ,
      is_correct: isCorrect,
      selected_option: index,
    });
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setGameOver(true);
      posthog.capture("quiz_completed", {
        score,
        total: questions.length,
      });
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-zinc-900 text-white p-8">
        <Link href="/" className="absolute top-6 left-6 text-zinc-400 hover:text-white transition-colors">&larr; Back</Link>
        <div className="text-8xl mb-4">🧠</div>
        <h1 className="text-4xl font-bold mb-4">Quiz Complete!</h1>
        <p className="text-3xl mb-2">
          {score} / {questions.length}
        </p>
        <p className="text-xl text-zinc-400 mb-8">
          {score === questions.length ? "🏆 Perfect score!" : score >= 7 ? "🔥 Data wizard!" : score >= 5 ? "👏 Solid knowledge!" : "📚 Keep learning!"}
        </p>
        <button
          onClick={restart}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold py-4 px-8 rounded-full transition-colors"
        >
          Play Again
        </button>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-zinc-900 text-white p-8">
      <Link href="/" className="absolute top-6 left-6 text-zinc-400 hover:text-white transition-colors">&larr; Back</Link>

      <h1 className="text-4xl font-bold mb-8">🧠 Data Quiz</h1>

      <div className="w-full max-w-xl">
        <div className="flex justify-between text-zinc-400 mb-4">
          <span>Question {currentQ + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>

        <h2 className="text-2xl font-semibold mb-6">{q.question}</h2>

        <div className="flex flex-col gap-3">
          {q.options.map((option, i) => {
            let bg = "bg-zinc-700/50 hover:bg-zinc-700 border-zinc-600/50";
            if (showResult) {
              if (i === q.correct) bg = "bg-green-700/50 border-green-500";
              else if (i === selected) bg = "bg-red-700/50 border-red-500";
              else bg = "bg-zinc-800/50 border-zinc-700/50";
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selected !== null}
                className={`text-left p-4 rounded-xl border transition-all ${bg} ${selected === null ? "cursor-pointer" : "cursor-default"}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {showResult && (
          <button
            onClick={nextQuestion}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-3 px-6 rounded-full transition-colors"
          >
            {currentQ + 1 >= questions.length ? "See Results" : "Next Question"}
          </button>
        )}
      </div>
    </div>
  );
}
