import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Sparkles, Trophy, RotateCcw } from "lucide-react";

interface TournamentMysteryCardProps {
  children: React.ReactNode;
}

type SequenceState = "locked" | "unlocking" | "countdown" | "celebration" | "revealed";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  vRot: number;
}

export const TournamentMysteryCard: React.FC<TournamentMysteryCardProps> = ({ children }) => {
  const [state, setState] = useState<SequenceState>("locked");
  const [count, setCount] = useState<number>(3);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Check sessionStorage on mount so unlocked state persists for current session
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("gamersnest_tournament_unlocked");
      if (saved === "true") {
        setState("revealed");
      }
    } catch {
      // Fallback
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  // Canvas Confetti Celebration Animation
  useEffect(() => {
    if (state !== "celebration") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ["#00f2fe", "#c4ff3d", "#ffd34d", "#ffffff", "#38bdf8", "#a855f7"];
    const particles: Particle[] = [];
    const particleCount = isReducedMotion ? 15 : 60;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 40,
        y: canvas.height / 2 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.7) * 14,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let aliveCount = 0;
      particles.forEach((p) => {
        if (p.alpha <= 0) return;
        aliveCount++;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // Gravity
        p.alpha -= 0.015;
        p.rotation += p.vRot;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        // Render glowing confetti rectangles / circles
        if (Math.random() > 0.5) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (aliveCount > 0) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [state, isReducedMotion]);

  // Handle Initial Unlock Trigger
  const handleStartUnlock = () => {
    if (state !== "locked") return; // Prevent double trigger

    if (isReducedMotion) {
      // Bypasses countdown/particles for reduced-motion users
      setState("revealed");
      try {
        sessionStorage.setItem("gamersnest_tournament_unlocked", "true");
      } catch {}
      return;
    }

    setState("unlocking");

    // Phase 2: Unlocking transition -> Phase 3: Countdown
    setTimeout(() => {
      setState("countdown");
      setCount(3);
    }, 700);
  };

  // Handle 3 -> 2 -> 1 Countdown Sequence
  useEffect(() => {
    if (state !== "countdown") return;

    if (count > 1) {
      const timer = setTimeout(() => {
        setCount((prev) => prev - 1);
      }, 750);
      return () => clearTimeout(timer);
    } else {
      // After "1", transition to Phase 4: Celebration
      const timer = setTimeout(() => {
        setState("celebration");
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [state, count]);

  // Handle Celebration -> Smooth Reveal Transition
  useEffect(() => {
    if (state !== "celebration") return;

    const timer = setTimeout(() => {
      setState("revealed");
      try {
        sessionStorage.setItem("gamersnest_tournament_unlocked", "true");
      } catch {}
    }, 1400);

    return () => clearTimeout(timer);
  }, [state]);

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      sessionStorage.removeItem("gamersnest_tournament_unlocked");
    } catch {}
    setState("locked");
    setCount(3);
  };

  const isRevealed = state === "revealed";

  return (
    <div className="relative group/mystery rounded-3xl overflow-hidden isolation-auto">
      {/* 1. Underlying Tournament Card Content */}
      <motion.div
        animate={{
          filter: isRevealed ? "blur(0px)" : "blur(14px)",
          scale: state === "unlocking" ? 1.02 : 1,
          opacity: isRevealed ? 1 : 0.45,
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={isRevealed ? "" : "pointer-events-none select-none"}
      >
        {children}
      </motion.div>

      {/* 2. Interactive Mystery Overlay & Sequences */}
      <AnimatePresence>
        {!isRevealed && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            onClick={handleStartUnlock}
            className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#080c10]/80 backdrop-blur-md cursor-pointer select-none transition-colors ${
              state === "locked" ? "hover:bg-[#080c10]/70" : ""
            }`}
          >
            {/* Canvas overlay for celebratory neon confetti */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />

            {/* PHASE 1 & 2: LOCKED / UNLOCKING OVERLAY */}
            {(state === "locked" || state === "unlocking") && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="flex flex-col items-center text-center p-6 space-y-4"
              >
                {/* Glowing Lock Ring */}
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: state === "unlocking" ? [1, 1.25, 1] : [1, 1.08, 1],
                      boxShadow:
                        state === "unlocking"
                          ? "0 0 35px rgba(196,255,61,0.8)"
                          : "0 0 25px rgba(0,242,254,0.4)",
                    }}
                    transition={{ repeat: state === "locked" ? Infinity : 0, duration: 2, ease: "easeInOut" }}
                    className={`h-20 w-20 rounded-full border flex items-center justify-center backdrop-blur-xl transition-colors ${
                      state === "unlocking"
                        ? "bg-[#c4ff3d]/20 border-[#c4ff3d] text-[#c4ff3d]"
                        : "bg-[#00f2fe]/10 border-[#00f2fe]/40 text-[#00f2fe]"
                    }`}
                  >
                    {state === "unlocking" ? (
                      <Unlock className="h-9 w-9 animate-bounce text-[#c4ff3d]" />
                    ) : (
                      <Lock className="h-9 w-9 text-[#00f2fe]" />
                    )}
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#00f2fe] font-bold flex items-center justify-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#c4ff3d]" />
                    {state === "unlocking" ? "UNLOCKING MYSTERY..." : "MYSTERY EVENT"}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase font-display tracking-tight">
                    {state === "unlocking" ? "PREPARING REVEAL" : "A SURPRISE AWAITS..."}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono pt-1">
                    {state === "unlocking" ? "Get Ready!" : "CLICK TO UNLOCK MYSTERY"}
                  </p>
                </div>
              </motion.div>
            )}

            {/* PHASE 3: COUNTDOWN (3 -> 2 -> 1) */}
            {state === "countdown" && (
              <div className="flex flex-col items-center justify-center relative">
                {/* Outer Pulsating Energy Ring */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                  className="absolute h-36 w-36 rounded-full border border-[#c4ff3d]/50 bg-[#c4ff3d]/10 blur-sm"
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={count}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 20 }}
                    className="relative z-10 font-black font-display text-7xl sm:text-8xl text-white drop-shadow-[0_0_30px_rgba(196,255,61,0.8)]"
                  >
                    <span className="bg-gradient-to-b from-[#ffffff] via-[#c4ff3d] to-[#00f2fe] bg-clip-text text-transparent">
                      {count}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {/* Countdown Step Indicators (3, 2, 1) */}
                <div className="flex items-center space-x-3 mt-8 z-10">
                  {[3, 2, 1].map((step) => (
                    <div
                      key={step}
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                        count === step
                          ? "bg-[#c4ff3d] text-black scale-125 shadow-lg shadow-[#c4ff3d]/50"
                          : count < step
                          ? "bg-[#00f2fe]/30 text-[#00f2fe] border border-[#00f2fe]/50"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PHASE 4: CELEBRATION (Surprise Unlocked!) */}
            {state === "celebration" && (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center p-6 space-y-3 z-30"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#c4ff3d] to-[#00f2fe] p-0.5 shadow-2xl shadow-[#c4ff3d]/40">
                  <div className="h-full w-full bg-[#080c10] rounded-[14px] flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-[#c4ff3d] animate-pulse" />
                  </div>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-white uppercase font-display tracking-tight bg-gradient-to-r from-[#c4ff3d] via-white to-[#00f2fe] bg-clip-text text-transparent">
                  Surprise Unlocked!
                </h2>
                <p className="text-xs font-mono uppercase tracking-widest text-[#00f2fe]">
                  SOMETHING SPECIAL FOR YOU 🏆
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Replay Unlock Option (Only visible when fully revealed) */}
      {isRevealed && (
        <button
          onClick={handleReplay}
          className="absolute top-4 right-4 z-40 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 hover:text-[#00f2fe] flex items-center space-x-1 backdrop-blur-md transition-all cursor-pointer opacity-70 hover:opacity-100"
          title="Replay Mystery Unlock Animation"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Replay Unlock</span>
        </button>
      )}
    </div>
  );
};
