"use client";

import React from "react";

import { cn } from "@/lib/utils";

/**
 * Skiper 40 Animated Link — React
 * Inspired by and adapted from https://cursor.com/?from=home
 * We respect the original creators. This is an inspired rebuild with our own taste
 * and does not claim any ownership. These animations aren't associated with
 * cursor.com. They're independent recreations meant to study interaction design.
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
 * NOTE: Adapted for this project — the original shipped with a `next/link`
 * dependency (Link000). This project uses Vite + wouter and has no Next.js, so
 * every variant now renders a plain <a>/<button>. The hover animations are
 * unchanged. A `renderAs="button"` escape hatch was added so the same animated
 * markup can wrap the site's existing onClick-driven card CTAs.
 */

type SkiperLinkPolymorphicProps = {
  children: React.ReactNode;
  className?: string;
} & (
  | ({ renderAs?: "a" } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ renderAs: "button" } & React.ButtonHTMLAttributes<HTMLButtonElement>)
);

const Arrow = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 10 10"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
  </svg>
);

const Link000 = ({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) => {
  return (
    <a
      href={href}
      className={cn(
        "group relative flex items-center",
        className,
        "before:pointer-events-none before:absolute before:bottom-0 before:left-0 before:h-[0.05em] before:w-full before:bg-current before:content-['']",
        "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:origin-left hover:before:scale-x-100",
      )}
    >
      {children}
    </a>
  );
};

const Link001 = ({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) => {
  return (
    <a
      href={href}
      target="_blank"
      className={cn(
        "group relative flex items-center",
        "before:pointer-events-none before:absolute before:left-0 before:top-[1.5em] before:h-[0.05em] before:w-full before:bg-current before:content-['']",
        "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "hover:before:origin-left hover:before:scale-x-100",
        className,
      )}
    >
      {children}
      <Arrow className="ml-[0.3em] mt-[0em] size-[0.55em] translate-y-1 opacity-0 transition-all duration-300 [motion-reduce:transition-none] group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none" />
    </a>
  );
};

const Link002 = ({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) => {
  return (
    <a
      href={href}
      className={cn(
        "group relative flex items-center",
        className,
        "before:pointer-events-none before:absolute before:left-0 before:top-[1.5em] before:h-[0.05em] before:w-full before:bg-current before:content-['']",
        "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "before:origin-left",
        "hover:before:origin-right hover:before:scale-x-100",
      )}
    >
      {children}
      <Arrow className="ml-[0.3em] mt-[0em] size-[0.55em] translate-y-1 opacity-0 transition-all duration-300 [motion-reduce:transition-none] group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none" />
    </a>
  );
};

const Link003 = ({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) => {
  return (
    <a
      href={href}
      className={cn(
        "group relative flex items-center",
        className,
        "before:pointer-events-none before:absolute before:left-0 before:top-[1.5em] before:h-[0.05em] before:w-full before:bg-current before:content-['']",
        "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "before:origin-center",
        "hover:before:scale-x-100",
      )}
    >
      {children}
      <Arrow className="ml-[0.3em] mt-[0em] size-[0.55em] translate-y-1 opacity-0 transition-all duration-300 [motion-reduce:transition-none] group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none" />
    </a>
  );
};

const Link004 = ({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) => {
  return (
    <a
      href={href}
      className={cn(
        "group relative flex items-center",
        className,
        "before:pointer-events-none before:absolute before:left-0 before:w-full before:bg-white before:content-['']",
        "before:origin-right before:scale-x-0 before:transition-all before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "before:origin-center md:before:bottom-0",
        "before:z-1 px-2 before:h-0 before:scale-x-100 before:mix-blend-difference hover:before:h-[1.4em]",
      )}
    >
      {children}
      <Arrow className="z-0 ml-[0.6em] mt-[0em] size-[0.55em] translate-y-1 opacity-0 transition-all duration-300 [motion-reduce:transition-none] group-hover:translate-y-0 group-hover:rotate-45 group-hover:opacity-100 motion-reduce:transition-none" />
    </a>
  );
};

const Link005 = ({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) => {
  return (
    <a
      href={href}
      className={cn(
        className,
        "group relative flex items-center",
        "before:pointer-events-none before:absolute before:left-0 before:w-full before:bg-white before:content-['']",
        "before:scale-x-1 before:transition-all before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
        "before:origin-left md:before:top-0",
        "before:z-1 px-2 before:h-full before:scale-x-0 before:mix-blend-difference hover:before:scale-x-100",
      )}
    >
      {children}
      <Arrow className="z-0 ml-[0.6em] mt-[0em] size-[0.55em] -translate-x-1 rotate-45 opacity-0 transition-all duration-300 [motion-reduce:transition-none] group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none" />
    </a>
  );
};

/**
 * SkiperUnderlineLink — the Skiper40 "Link001" underline-reveal interaction
 * exposed as a polymorphic element so it can be an <a> (for real links) or a
 * <button> (for the site's onClick-driven CTAs) without recreating the effect.
 *
 * IMPORTANT: this project runs Tailwind CSS v4, where the `scale-x-*` /
 * `translate-*` utilities compose their transform through CSS variables that
 * are NOT emitted for arbitrary `::before` pseudo-elements — so the original
 * Skiper Tailwind classes set the variables but produced `transform: none`,
 * i.e. no visible animation. To make the effect reliable we drive it with a
 * small, self-contained CSS class (`.skiper-link`, defined in index.css) that
 * uses plain `transform: scaleX()` / `translate()`. The look is identical to
 * Skiper40's Link001 (right-to-left underline wipe + arrow slide up-right) and
 * it honours prefers-reduced-motion via the global media block.
 */
const SkiperUnderlineLink = ({
  children,
  className,
  renderAs = "a",
  ...rest
}: SkiperLinkPolymorphicProps) => {
  const classes = cn("skiper-link", className);

  const arrow = <Arrow className="skiper-link__arrow" />;

  if (renderAs === "button") {
    const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button type="button" {...buttonProps} className={classes}>
        <span className="skiper-link__label">{children}</span>
        {arrow}
      </button>
    );
  }

  const anchorProps = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
  return (
    <a {...anchorProps} className={classes}>
      <span className="skiper-link__label">{children}</span>
      {arrow}
    </a>
  );
};

const Skiper40 = () => {
  return (
    <section className="h-full snap-y snap-mandatory overflow-y-scroll">
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-5">
        <Link001 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link001>
        <Link002 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link002>
        <Link003 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link003>
        <Link004 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link004>
        <Link005 href="mailto:hi@skiper-ui.com">hi@skiper-ui.com</Link005>
      </div>
    </section>
  );
};

export {
  Link000,
  Link001,
  Link002,
  Link003,
  Link004,
  Link005,
  Skiper40,
  SkiperUnderlineLink,
};
