"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import posthog from "posthog-js";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const GROUND_Y = 160;
const DINO_WIDTH = 40;
const DINO_HEIGHT = 44;
const OBSTACLE_WIDTH = 20;
const OBSTACLE_MIN_HEIGHT = 30;
const OBSTACLE_MAX_HEIGHT = 50;
const GRAVITY = 0.6;
const JUMP_FORCE = -11;
const MIN_OBSTACLE_GAP = 80;

interface Obstacle {
  x: number;
  height: number;
}

export default function DinoRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"idle" | "playing" | "dead">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const gameRef = useRef({
    dinoY: GROUND_Y - DINO_HEIGHT,
    dinoVelocity: 0,
    isJumping: false,
    obstacles: [] as Obstacle[],
    speed: 4,
    score: 0,
    frameCount: 0,
  });

  const animFrameRef = useRef<number>(0);

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (!g.isJumping) {
      g.dinoVelocity = JUMP_FORCE;
      g.isJumping = true;
    }
  }, []);

  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.dinoY = GROUND_Y - DINO_HEIGHT;
    g.dinoVelocity = 0;
    g.isJumping = false;
    g.obstacles = [];
    g.speed = 4;
    g.score = 0;
    g.frameCount = 0;
    setScore(0);
    setGameState("playing");
    posthog.capture("dino_game_started");
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (gameState === "idle" || gameState === "dead") {
          startGame();
        } else if (gameState === "playing") {
          jump();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, jump, startGame]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameLoop = () => {
      const g = gameRef.current;

      g.dinoVelocity += GRAVITY;
      g.dinoY += g.dinoVelocity;
      if (g.dinoY >= GROUND_Y - DINO_HEIGHT) {
        g.dinoY = GROUND_Y - DINO_HEIGHT;
        g.dinoVelocity = 0;
        g.isJumping = false;
      }

      g.frameCount++;
      if (g.frameCount % Math.max(30, 60 - Math.floor(g.score / 5)) === 0) {
        const lastObstacle = g.obstacles[g.obstacles.length - 1];
        if (!lastObstacle || GAME_WIDTH - lastObstacle.x > MIN_OBSTACLE_GAP + Math.random() * 200) {
          g.obstacles.push({
            x: GAME_WIDTH,
            height: OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT),
          });
        }
      }

      g.obstacles = g.obstacles
        .map((o) => ({ ...o, x: o.x - g.speed }))
        .filter((o) => o.x > -OBSTACLE_WIDTH);

      for (const o of g.obstacles) {
        const dinoLeft = 50;
        const dinoRight = 50 + DINO_WIDTH;
        const dinoTop = g.dinoY;
        const oLeft = o.x;
        const oRight = o.x + OBSTACLE_WIDTH;
        const oTop = GROUND_Y - o.height;

        if (dinoRight > oLeft && dinoLeft < oRight && dinoTop + DINO_HEIGHT > oTop) {
          setGameState("dead");
          setHighScore((h) => Math.max(h, g.score));
          posthog.capture("dino_game_over", { score: g.score });
          return;
        }
      }

      if (g.frameCount % 6 === 0) {
        g.score++;
        setScore(g.score);
      }

      g.speed = 4 + g.score * 0.02;

      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = "#333";
      ctx.fillRect(0, GROUND_Y, GAME_WIDTH, 2);

      ctx.fillStyle = "#4ade80";
      ctx.fillRect(50, g.dinoY, DINO_WIDTH, DINO_HEIGHT);
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(50 + DINO_WIDTH - 8, g.dinoY + 6, 4, 4);
      ctx.fillRect(50, g.dinoY + DINO_HEIGHT - 8, 8, 8);
      ctx.fillRect(50 + 16, g.dinoY + DINO_HEIGHT - 8, 8, 8);

      ctx.fillStyle = "#ef4444";
      for (const o of g.obstacles) {
        ctx.fillRect(o.x, GROUND_Y - o.height, OBSTACLE_WIDTH, o.height);
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(o.x + 2, GROUND_Y - o.height, OBSTACLE_WIDTH - 4, 4);
        ctx.fillStyle = "#ef4444";
      }

      ctx.fillStyle = "#fff";
      ctx.font = "16px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`Score: ${g.score}`, GAME_WIDTH - 10, 25);

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState]);

  const handleCanvasClick = () => {
    if (gameState === "idle" || gameState === "dead") {
      startGame();
    } else if (gameState === "playing") {
      jump();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-950 to-zinc-900 text-white p-8">
      <Link href="/" className="absolute top-6 left-6 text-zinc-400 hover:text-white transition-colors">&larr; Back</Link>

      <h1 className="text-4xl font-bold mb-2">🦕 Dino Run</h1>
      <p className="text-zinc-400 mb-6">Press Space / tap to jump!</p>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          onClick={handleCanvasClick}
          className="rounded-xl border border-zinc-700 cursor-pointer"
          style={{ maxWidth: "100%", height: "auto" }}
        />

        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl">
            <p className="text-2xl font-bold mb-2">Press Space or Tap to Start</p>
          </div>
        )}

        {gameState === "dead" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl">
            <p className="text-3xl font-bold mb-2">Game Over!</p>
            <p className="text-xl mb-1">Score: {score}</p>
            <p className="text-zinc-400 mb-4">High Score: {highScore}</p>
            <p className="text-lg">Press Space or Tap to Retry</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-8 text-lg">
        <span className="text-zinc-400">Score: <span className="text-white font-bold">{score}</span></span>
        <span className="text-zinc-400">High Score: <span className="text-yellow-400 font-bold">{highScore}</span></span>
      </div>
    </div>
  );
}
