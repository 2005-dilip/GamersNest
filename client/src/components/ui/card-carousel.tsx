"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight, Gamepad2, ArrowUpRight, Sparkles } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export interface CarouselItem {
  indexTag?: string; // e.g. "01 / 05"
  src: string;
  alt: string;
  title?: string;
  badge?: string;
  price?: string;
  subtitle?: string;
  onClick?: () => void;
}

export interface CarouselProps {
  images: CarouselItem[];
  autoplayDelay?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
  badgeText?: string;
  title?: string;
  subtitle?: string;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export const CardCarousel: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 3500,
  showPagination = true,
  showNavigation = true,
  badgeText = "CHOOSE YOUR CONSOLE",
  title = "GAMING CONSOLES & SETUPS",
  subtitle = "Swipe through our five immersive setups. Click any card to book.",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const allowAutoplay = !prefersReducedMotion();

  return (
    <div className="w-full relative bg-[#060a0e] border border-[#00f2fe]/20 rounded-3xl p-4 sm:p-8 md:p-10 shadow-2xl overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00f2fe]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#c4ff3d]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Section */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#00f2fe] tracking-widest uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse" />
            <span>OUR SETUPS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase font-display tracking-tight leading-none">
            GAMING <span className="text-[#c4ff3d]">CONSOLES &amp; SETUPS</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* Right Badges / Accents */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#c4ff3d]/10 border border-[#c4ff3d]/30 text-[#c4ff3d] text-xs font-mono font-bold tracking-wider uppercase shadow-md">
            <Gamepad2 className="h-4 w-4" />
            <span>{badgeText}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
          <span className="hidden lg:inline text-xs font-serif italic text-[#c4ff3d] tracking-wide">
            Play. Compete. Conquer.
          </span>
        </div>
      </div>

      {/* Swiper Carousel Container with Custom Navigation */}
      <div className="relative z-10 group/carousel">
        {/* Custom Navigation Arrows */}
        {showNavigation && (
          <>
            <button
              className="swiper-prev-btn absolute left-1 sm:left-0 top-1/2 -translate-y-1/2 sm:-translate-x-5 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#090e13]/95 border border-[#00f2fe]/40 text-[#00f2fe] hover:border-[#c4ff3d] hover:text-[#c4ff3d] flex items-center justify-center backdrop-blur-md shadow-xl transition-all hover:scale-110 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous Setup"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              className="swiper-next-btn absolute right-1 sm:right-0 top-1/2 -translate-y-1/2 sm:translate-x-5 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#090e13]/95 border border-[#00f2fe]/40 text-[#00f2fe] hover:border-[#c4ff3d] hover:text-[#c4ff3d] flex items-center justify-center backdrop-blur-md shadow-xl transition-all hover:scale-110 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next Setup"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}

        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          centeredSlides={false}
          loop={true}
          loopAdditionalSlides={2}
          speed={650}
          autoplay={
            allowAutoplay
              ? {
                  delay: autoplayDelay,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          navigation={
            showNavigation
              ? {
                  prevEl: ".swiper-prev-btn",
                  nextEl: ".swiper-next-btn",
                }
              : false
          }
          pagination={
            showPagination
              ? {
                  clickable: true,
                  el: ".custom-swiper-pagination",
                }
              : false
          }
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 16 },
          }}
          className="pb-10 pt-2"
        >
          {images.map((item, index) => {
            const isActive = activeIndex === index;
            const indexStr = item.indexTag || `0${index + 1} / 05`;

            return (
              <SwiperSlide key={index} className="h-auto">
                <div
                  onClick={item.onClick}
                  className={`group relative h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between border ${
                    isActive
                      ? "bg-[#0c1218] border-[#c4ff3d] shadow-[0_0_25px_rgba(196,255,61,0.22)] z-20"
                      : "bg-[#080d12] border-slate-800/90 hover:border-[#00f2fe]/60 hover:shadow-[0_0_20px_rgba(0,242,254,0.15)]"
                  }`}
                >
                  {/* Top Image Container (Fixed Height across all cards) */}
                  <div className="relative h-[170px] w-full overflow-hidden bg-slate-950 shrink-0">
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c1218] via-transparent to-black/40" />

                    {/* Top Index Tag e.g. 01 / 05 */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-slate-700/80 text-[10px] font-mono font-bold text-white tracking-widest">
                      {indexStr}
                    </div>

                    {/* Setup Badge e.g. PS4, PS5 */}
                    {item.badge && (
                      <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#000000]/85 backdrop-blur-md border border-[#00f2fe]/40 text-[#00f2fe] text-[11px] font-mono font-bold uppercase tracking-wider">
                        <Gamepad2 className="h-3.5 w-3.5 text-[#00f2fe]" />
                        <span>{item.badge}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content Body (Fixed-Height Elements to Guarantee 100% Equal Card Lengths) */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Price Label (Fixed height) */}
                      <div className="h-5 flex items-center mb-1">
                        {item.price && (
                          <span className="text-[11px] font-mono font-bold text-[#c4ff3d] uppercase tracking-wider truncate">
                            {item.price}
                          </span>
                        )}
                      </div>

                      {/* Setup Name (Fixed 2.75rem height to handle 1-line or 2-line title alignment) */}
                      <div className="h-[2.75rem] flex items-center">
                        <h3 className="text-base sm:text-lg font-black text-white uppercase font-display tracking-tight leading-tight line-clamp-2">
                          {item.title}
                        </h3>
                      </div>

                      {/* Short Description (Fixed 2.5rem height) */}
                      <div className="h-[2.5rem] flex items-center mt-1">
                        {item.subtitle && (
                          <p className="text-xs text-slate-300 line-clamp-2 leading-snug">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Book Now Button (Refined Sleek Style across all cards) */}
                    <button
                      type="button"
                      className={`w-full mt-4 py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#c4ff3d]/15 border border-[#c4ff3d] text-[#c4ff3d] hover:bg-[#c4ff3d] hover:text-black shadow-md shadow-[#c4ff3d]/10"
                          : "bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:border-[#00f2fe] hover:text-[#00f2fe]"
                      }`}
                    >
                      <span>BOOK NOW</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Footer Navigation Controls & Clear Character Path */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 pt-4 border-t border-slate-800/80">
        {/* Left Side: Badge positioned cleanly above walking character path */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300">
          <Sparkles className="h-3.5 w-3.5 text-[#c4ff3d]" />
          <span>DIFFERENT SETUPS, SAME PASSION.</span>
        </div>

        {/* Center: Custom Pagination Dots */}
        {showPagination && (
          <div className="custom-swiper-pagination flex items-center justify-center space-x-2" />
        )}

        {/* Right Side: Level Up Slogan */}
        <div className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
          LEVEL UP TOGETHER
        </div>
      </div>
    </div>
  );
};
