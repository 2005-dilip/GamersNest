import React, { useEffect, useRef, useState } from "react";
import { Gamepad2, Sparkles, Trophy, Star, Zap } from "lucide-react";

interface GamerCharacterWalkProps {
  className?: string;
}

const QUOTES = [
  "Ready for PS5 gaming? 🎮",
  "Let's squad up! ⚔️",
  "Ayappakkam's #1 Gaming Zone 🔥",
  "Level Up at GamersNest! 🏆",
  "VR & Racing Simulators Ready! 🏎️",
  "Click me to book your session! ⚡",
];

export const GamerCharacterWalk: React.FC<GamerCharacterWalkProps> = ({
  className = "",
}) => {
  const [progress, setProgress] = useState(0);
  const [facingRight, setFacingRight] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Interactive Hover & Toast States (Smart Unobscured UX)
  const [isHovered, setIsHovered] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [toastActive, setToastActive] = useState(false);
  const [currentSectionTag, setCurrentSectionTag] = useState("HERO ZONE");

  const lastScrollYRef = useRef(0);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  useEffect(() => {
    if (isReducedMotion) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const totalScrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (totalScrollableHeight > 0) {
        // Full website scroll progress: 0 at top of page, 1 at bottom of page
        const fullPageProgress = Math.min(1, Math.max(0, currentScrollY / totalScrollableHeight));
        setProgress(fullPageProgress);
      }

      // Determine facing direction: facing right when scrolling down, left when scrolling up
      const delta = currentScrollY - lastScrollYRef.current;
      if (Math.abs(delta) > 1) {
        if (delta > 0) {
          setFacingRight(true);
        } else if (delta < 0) {
          setFacingRight(false);
        }
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isReducedMotion]);

  // Section-Aware Info & Section Change Detection
  const getSectionBadgeInfo = (p: number) => {
    if (p < 0.15) {
      return {
        label: "Welcome to GamersNest! 🎮",
        tag: "HERO ZONE",
        color: "from-[#00f2fe] to-cyan-500",
        icon: Gamepad2,
      };
    } else if (p < 0.32) {
      return {
        label: "5 Setups: PS5, PS4, PS2, Sim & VR! 🕹️",
        tag: "CONSOLES",
        color: "from-[#a3e635] to-emerald-400",
        icon: Sparkles,
      };
    } else if (p < 0.45) {
      return {
        label: "Future Esports Events & Tournaments! 🏆",
        tag: "FUTURE EVENTS",
        color: "from-[#00f2fe] to-[#a3e635]",
        icon: Trophy,
      };

    } else if (p < 0.60) {
      return {
        label: "EA FC 25, GTA V, Mortal Kombat! ⚽🔥",
        tag: "GAME LIBRARY",
        color: "from-cyan-400 to-[#00f2fe]",
        icon: Trophy,
      };

    } else if (p < 0.72) {
      return {
        label: "From ₹70 / player / hour! 💰",
        tag: "PRICING",
        color: "from-[#a3e635] to-lime-300",
        icon: Zap,
      };
    } else if (p < 0.85) {
      return {
        label: "5.0 ⭐ Google Rating in Ayappakkam! 🌟",
        tag: "REVIEWS",
        color: "from-amber-400 to-yellow-300",
        icon: Star,
      };
    } else {
      return {
        label: "Book Your Gaming Session Now! ⚡",
        tag: "BOOKING ZONE",
        color: "from-[#00f2fe] to-[#a3e635]",
        icon: Gamepad2,
      };
    }
  };

  const sectionInfo = getSectionBadgeInfo(progress);
  const SectionIcon = sectionInfo.icon;

  // Trigger a temporary 1.8s toast pop-up ONLY when transitioning into a new section
  useEffect(() => {
    if (sectionInfo.tag !== currentSectionTag) {
      setCurrentSectionTag(sectionInfo.tag);
      setToastActive(true);

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

      toastTimeoutRef.current = setTimeout(() => {
        setToastActive(false);
      }, 1800);
    }
  }, [sectionInfo.tag, currentSectionTag]);

  if (isReducedMotion) {
    return null;
  }

  // 8 horizontal frames in sprite sheet (2048 x 682)
  const TOTAL_STEPS = 120;
  const TOTAL_FRAMES = 8;

  const currentStep = Math.floor(progress * TOTAL_STEPS);
  const frameIndex = Math.abs(currentStep) % TOTAL_FRAMES;

  // Character X position: travels from 2% to 90% as page is scrolled
  const leftPercent = 2 + progress * 88;

  // Background position for current frame out of 8 frames
  const bgPositionX = `${(frameIndex / 7) * 100}%`;

  const handleCharacterClick = () => {
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    setToastActive(true);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setToastActive(false);
    }, 2500);

    if (progress > 0.8) {
      document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Badge is visible ONLY when user hovers over character or when entering a new section brief toast
  const shouldShowBadge = isHovered || toastActive;

  return (
    <div
      className={`fixed bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none overflow-visible h-16 sm:h-20 md:h-24 shell-width ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute bottom-0 w-8 sm:w-10 md:w-12 h-16 sm:h-20 md:h-24 pointer-events-auto cursor-pointer group"
        style={{
          left: `${leftPercent}%`,
          transform: `scaleX(${facingRight ? 1 : -1})`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCharacterClick}
        title="Click to interact with GamersNest Gamer!"
      >
        {/* Smart Unobscured Speech Bubble / Badge (Fades out when scrolling, shows on hover or brief section toast) */}
        <div
          className={`absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300 z-50 whitespace-nowrap ${
            shouldShowBadge
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-90 translate-y-2"
          }`}
          style={{
            transform: `translateX(-50%) scaleX(${facingRight ? 1 : -1})`, // Unflip text so speech bubble is always readable
          }}
        >
          <div className="bg-[#0f1117]/95 border border-[#00f2fe]/40 rounded-xl px-3 py-1.5 shadow-xl shadow-[#00f2fe]/20 backdrop-blur-md flex items-center space-x-2">
            <div className={`p-1 rounded-md bg-gradient-to-r ${sectionInfo.color} text-black font-bold`}>
              <SectionIcon className="h-3 w-3" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#00f2fe]">
                {sectionInfo.tag}
              </span>
              <span className="text-xs font-bold text-white font-sans">
                {isHovered ? QUOTES[quoteIndex] : sectionInfo.label}
              </span>
            </div>
          </div>
          {/* Speech Bubble Pointer Arrow */}
          <div className="w-2.5 h-2.5 bg-[#0f1117] border-r border-b border-[#00f2fe]/40 rotate-45 mx-auto -mt-1" />
        </div>

        {/* Character Sprite Sheet Render */}
        <div
          className="w-full h-full bg-no-repeat transition-all group-hover:drop-shadow-[0_0_20px_rgba(0,242,254,0.8)] drop-shadow-[0_4px_16px_rgba(73,232,255,0.5)]"
          style={{
            backgroundImage: "url('/images/character/gamersnest-gamer-walk.png')",
            backgroundSize: "800% 100%",
            backgroundPosition: `${bgPositionX} 0%`,
            imageRendering: "pixelated",
          }}
        />
      </div>
    </div>
  );
};
