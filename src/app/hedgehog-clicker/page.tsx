"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import posthog from "posthog-js";

export default function HedgehogClicker() {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameState, setGameState] = useState<"idle" | "playing" | "done">("idle");
  const [hedgehogSize, setHedgehogSize] = useState(1);

  const altEmoji = posthog.getFeatureFlag('alt-emoji');
  const emojiMap: Record<string, string> = { hedgehog: '🦔', cat: '🐱', dog: '🐶', hamster: '🐹' };
  const emoji = emojiMap[altEmoji as string] || '🦔';
  const nameMap: Record<string, string> = { hedgehog: 'Hedgehog', cat: 'Cat', dog: 'Dog', hamster: 'Hamster' };
  const animalName = nameMap[altEmoji as string] || 'Hedgehog';
  const gameName = `${emoji} ${animalName} Clicker`;
  const clicksRef = useRef(0);

  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      setGameState("done");
      const finalClicks = clicksRef.current;
      posthog.capture("hedgehog_game_completed", {
        clicks: finalClicks,
        clicks_per_second: parseFloat((finalClicks / 10).toFixed(1)),
      });
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  const startGame = () => {
    setClicks(0);
    clicksRef.current = 0;
    setTimeLeft(10);
    setGameState("playing");
    setHedgehogSize(1);
    posthog.capture("hedgehog_game_started");
  };

  const handleClick = useCallback(() => {
    if (gameState !== "playing") return;
    clicksRef.current += 1;
    setClicks((c) => c + 1);
    setHedgehogSize((s) => Math.min(s + 0.05, 3));
    setTimeout(() => setHedgehogSize((s) => Math.max(s - 0.03, 1)), 100);
  }, [gameState]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-950 to-zinc-900 text-white p-8">
      <Link href="/" className="absolute top-6 left-6 text-zinc-400 hover:text-white transition-colors">&larr; Back</Link>

      <h1 className="text-4xl font-bold mb-2">{gameName}</h1>
      <p className="text-zinc-400 mb-8">Click the {animalName.toLowerCase()} as fast as you can!</p>

      {gameState === "idle" && (
        <button
          onClick={startGame}
          className="bg-orange-600 hover:bg-orange-500 text-white text-xl font-bold py-4 px-8 rounded-full transition-colors"
        >
          Start Game
        </button>
      )}

      {gameState === "playing" && (
        <>
          <div className="flex gap-12 mb-8 text-2xl">
            <div>
              <span className="text-zinc-400">Time: </span>
              <span className={timeLeft <= 3 ? "text-red-400 font-bold" : "font-bold"}>{timeLeft}s</span>
            </div>
            <div>
              <span className="text-zinc-400">Clicks: </span>
              <span className="font-bold">{clicks}</span>
            </div>
          </div>

          <button
            onClick={handleClick}
            className="select-none active:scale-95 transition-transform cursor-pointer"
            style={{ transform: `scale(${hedgehogSize})`, fontSize: "8rem" }}
          >
            {emoji}
          </button>
        </>
      )}

      {gameState === "done" && (
        <div className="text-center">
          <div className="text-8xl mb-4">{emoji}</div>
          <p className="text-3xl font-bold mb-2">
            {clicks} clicks!
          </p>
          <p className="text-zinc-400 mb-2">
            That&apos;s {(clicks / 10).toFixed(1)} clicks per second
          </p>
          <p className="text-lg mb-8">
            {clicks >= 80 ? "🏆 Legendary!" : clicks >= 60 ? "🔥 Amazing!" : clicks >= 40 ? "👏 Great job!" : clicks >= 20 ? "👍 Not bad!" : "🐌 Try again!"}
          </p>
          <button
            onClick={startGame}
            className="bg-orange-600 hover:bg-orange-500 text-white text-xl font-bold py-4 px-8 rounded-full transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
