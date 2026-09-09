import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";
import type { Swiper as SwiperClass } from "swiper";
import { Autoplay, EffectCards, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { cn } from "@/lib/utils";

/**
 * Skiper 48 Carousel_002 — React + Swiper
 * Built with Swiper.js — https://swiperjs.com/
 * Illustrations by AarzooAly — https://x.com/AarzooAly
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.me
 * Twitter: https://x.com/Gur__vi
 *
 * NOTE: Adapted for this project — the original shipped with `"use client"`
 * (Next.js) and hardcoded /images/... paths. This project is Vite, so the
 * directive is removed and the deck is fully props-driven. An optional caption
 * overlay (genre + title) and a themed, keyboard-accessible navigation layer
 * were added to fit the GamersNest game cards. Autoplay is disabled when the
 * user prefers reduced motion.
 */

export type DeckCard = {
  src: string;
  alt: string;
  genre?: string;
  title?: string;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const pad = (n: number) => String(n).padStart(2, "0");

const Carousel_002 = ({
  images,
  className,
  showPagination = false,
  showNavigation = true,
  showCounter = true,
  loop = true,
  autoplay = false,
  spaceBetween = 40,
  cardsEffect,
}: {
  images: DeckCard[];
  className?: string;
  showPagination?: boolean;
  showNavigation?: boolean;
  showCounter?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  spaceBetween?: number;
  /**
   * Native Swiper EffectCards tuning. Larger perSlideOffset reveals more of the
   * neighbouring cards; perSlideRotate adds the 3D tilt/depth. Defaults spread
   * the stack wider than Swiper's stock values so the sides no longer feel empty
   * while the centre card stays dominant.
   */
  cardsEffect?: {
    perSlideOffset?: number;
    perSlideRotate?: number;
    rotate?: boolean;
    slideShadows?: boolean;
  };
}) => {
  const allowAutoplay = autoplay && !prefersReducedMotion();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const swiperRef = React.useRef<SwiperClass | null>(null);

  const resolvedCardsEffect = {
    perSlideOffset: 13,
    perSlideRotate: 4,
    rotate: true,
    slideShadows: true,
    ...cardsEffect,
  };

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={cn("skiper48 relative w-full", className)}
    >
      <div className="skiper48-stage">
        <span className="skiper48-glow" aria-hidden="true" />
        <Swiper
          spaceBetween={spaceBetween}
          autoplay={
            allowAutoplay
              ? { delay: 2600, disableOnInteraction: false }
              : false
          }
          effect="cards"
          cardsEffect={resolvedCardsEffect}
          grabCursor={true}
          loop={loop}
          pagination={showPagination ? { clickable: true } : false}
          className="skiper48-swiper"
          modules={[EffectCards, Autoplay, Pagination, Navigation]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        >
          {images.map((image, index) => (
            <SwiperSlide key={`${image.src}-${index}`} className="skiper48-slide">
              <img
                className="skiper48-img"
                src={image.src}
                alt={image.alt}
                loading="lazy"
                draggable={false}
              />
              {(image.genre || image.title) && (
                <div className="skiper48-caption">
                  {image.genre && <span className="skiper48-genre">{image.genre}</span>}
                  {image.title && <h3 className="skiper48-title">{image.title}</h3>}
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {(showNavigation || (showCounter && images.length > 1)) && (
        <div className="skiper48-controls">
          {showNavigation && (
            <button
              type="button"
              className="skiper48-prev"
              aria-label="Previous game"
              onClick={() => swiperRef.current?.slidePrev()}
            >
              <ChevronLeftIcon size={20} />
            </button>
          )}
          {showCounter && images.length > 1 && (
            <span className="skiper48-counter" aria-live="polite">
              <span className="skiper48-counter-current">{pad(activeIndex + 1)}</span>
              <span className="skiper48-counter-sep">/</span>
              <span className="skiper48-counter-total">{pad(images.length)}</span>
            </span>
          )}
          {showNavigation && (
            <button
              type="button"
              className="skiper48-next"
              aria-label="Next game"
              onClick={() => swiperRef.current?.slideNext()}
            >
              <ChevronRightIcon size={20} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export { Carousel_002 };
