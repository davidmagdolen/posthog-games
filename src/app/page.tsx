"use client";

import Link from "next/link";
import posthog from "posthog-js";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 text-white p-8">
      <h1 className="text-5xl font-bold mb-2">PostHog Games</h1>
      <p className="text-zinc-400 mb-12 text-lg">Three silly games. Fully instrumented.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <Link href="/hedgehog-clicker" className="group" onClick={() => posthog.capture("game_selected", { game_name: "hedgehog_clicker" })}>
          <div className="bg-zinc-700/50 rounded-2xl p-8 text-center hover:bg-zinc-700 transition-all hover:scale-105 border border-zinc-600/50">
            <div className="text-6xl mb-4">🦔</div>
            <h2 className="text-2xl font-bold mb-2">Hedgehog Clicker</h2>
            <p className="text-zinc-400">Click the hedgehog as many times as you can in 10 seconds!</p>
          </div>
        </Link>

        <Link href="/data-quiz" className="group" onClick={() => posthog.capture("game_selected", { game_name: "data_quiz" })}>
          <div className="bg-zinc-700/50 rounded-2xl p-8 text-center hover:bg-zinc-700 transition-all hover:scale-105 border border-zinc-600/50">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-2xl font-bold mb-2">Data Quiz</h2>
            <p className="text-zinc-400">Test your data & analytics knowledge with random trivia!</p>
          </div>
        </Link>

        <Link href="/dino-run" className="group" onClick={() => posthog.capture("game_selected", { game_name: "dino_run" })}>
          <div className="bg-zinc-700/50 rounded-2xl p-8 text-center hover:bg-zinc-700 transition-all hover:scale-105 border border-zinc-600/50">
            <div className="text-6xl mb-4">🦕</div>
            <h2 className="text-2xl font-bold mb-2">Dino Run</h2>
            <p className="text-zinc-400">Jump over obstacles and survive as long as you can!</p>
          </div>
        </Link>
      </div>

      <p className="mt-12 text-zinc-500 text-sm">Built with Next.js + PostHog by David Magdolen</p>
    </div>
  );
}
