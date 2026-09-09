/*
 * RGB Editorial Lounge — page-level styling reminder:
 * authentic photography, near-black surfaces, Nest Cyan, lime light,
 * gold review stars, strong display typography, and restrained motion.
 */
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Gamepad2,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Play,
  Quote,
  Star,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { SkiperUnderlineLink } from "@/components/ui/skiper-ui/skiper40";
import { Carousel_002 } from "@/components/ui/skiper-ui/skiper48";
import { CardCarousel } from "@/components/ui/card-carousel";
import {
  CONSOLES,
  ConsoleId,
  EXPERIENCES,
  INVENTORY,
  calculateOfficialPrice,
  formatTime12h,
  getConsolesForExperience,
  getMaxPlayers,
  getTimeSlots,
  isValidTimeRange,
  isWithinStoreHours,
  type AvailabilityResult,
  type Experience,
} from "@/lib/booking";
import { checkAvailabilityRemote, createBooking } from "@/lib/booking-data";
import { BookingSelect } from "@/components/ui/booking-select";
import { GamerCharacterWalk } from "@/components/GamerCharacterWalk";
import { TournamentMysteryCard } from "@/components/TournamentMysteryCard";
import { PLAYABLE_GAMES, PLAYABLE_GAME_TITLES } from "@/lib/games-data";
import { FutureGamesSection } from "@/components/FutureGamesSection";
import { ConsoleSlotGrid } from "@/components/ConsoleSlotGrid";


const photos = {
  hero: "https://res.cloudinary.com/awaaiqbl/image/upload/v1788163422/home.webp",
  location: "https://res.cloudinary.com/awaaiqbl/image/upload/v1788163423/adress.webp",
  one: "https://res.cloudinary.com/awaaiqbl/image/upload/v1788163422/1.webp",
  two: "https://res.cloudinary.com/awaaiqbl/image/upload/v1788163422/2.webp",
  three: "https://res.cloudinary.com/awaaiqbl/image/upload/v1788163422/3.webp",
  four: "https://res.cloudinary.com/awaaiqbl/image/upload/v1788163422/4.webp",
};

const logoMark = "/logo.png";
const reviewAtmosphere =
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80";

const phoneTel = "tel:+919159588666";
const whatsappLink =
  "https://wa.me/919159588666?text=Hi%20Gamers%20Nest!%20I%20would%20like%20to%20enquire%20about%20a%20gaming%20session.";
const directionsLink =
  "https://www.google.com/maps/search/?api=1&query=Gamers%20Nest%2C%20Shop%20No.%202%2C%20First%20Floor%2C%20MIG%20No.%202165%2C%20TNHB%2C%204th%20Main%20Road%2C%20Ayappakkam%2C%20Chennai%20600077";

const experiences = [
  {
    title: "PS2 GAMING",
    formValue: "PS2",
    description: "Relive classic gaming experiences with your friends.",
    price: "From ₹70 / player / hour",
    photo: "/images/games/ps2.webp",
    tint: "cyan",
  },
  {
    title: "PS4 GAMING",
    formValue: "PS4",
    description: "Jump into your favourite competitive and action titles.",
    price: "From ₹90 / player / hour",
    photo: "/images/games/ps4.webp",
    tint: "lime",
  },
  {
    title: "PS5 GAMING",
    formValue: "PS5",
    description: "Experience modern gaming on a premium setup.",
    price: "From ₹90 / player / hour",
    photo: "/images/games/ps5.webp",
    tint: "cyan",
  },
  {
    title: "STEERING SIMULATOR",
    formValue: "Steering simulator 1",
    description: "Get behind the wheel and experience high-speed racing.",
    price: "₹150 / hour",
    photo: "/images/games/steering.webp",
    tint: "lime",
  },
  {
    title: "VR GAMING",
    formValue: "VR GAMING",
    description: "Step beyond the screen and into an immersive virtual world.",
    price: "₹100 / 30 mins",
    photo: "/images/games/vr.webp",
    tint: "cyan",
  },
];

const games = PLAYABLE_GAMES;

const pricing = [
  { title: "PS2", accent: "Classic", price: "₹80", detail: "/ hour", note: "Retro classics on the big screen — per-player rates drop to ₹70/hr for multiplayer." },
  {
    title: "PS4 & PS5",
    accent: "Squad play",
    note: "Bring the crew — per-player rates drop the more of you play together.",
    tiers: [
      ["1 Player", "₹100 / hour"],
      ["2 Players", "₹90 / player / hour"],
      ["3 Players", "₹90 / player / hour"],
      ["4 Players", "₹90 / player / hour"],
    ],
  },
  { title: "Steering simulator 1", accent: "Take the wheel", price: "₹150", detail: "/ hour", note: "Full racing rig with wheel and pedals for high-speed track battles." },
  { title: "VR GAMING", accent: "Beyond the screen", price: "₹100", detail: "/ 30 mins", note: "Step inside the game with a fully immersive virtual-reality setup (₹200/hr)." },
];

const reasons = [
  { icon: Users, title: "PLAY WITH YOUR SQUAD", description: "Bring your friends and compete together." },
  { icon: Gamepad2, title: "MULTIPLE GAMING EXPERIENCES", description: "PS2, PS4, PS5, Steering simulator 1 and VR." },
  { icon: Play, title: "BIG-SCREEN GAMING", description: "Enjoy an immersive gaming environment." },
  { icon: Trophy, title: "STEERING SIMULATOR 1", description: "Get behind the wheel and experience high-speed racing." },
  { icon: Zap, title: "VR ADVENTURE", description: "Step beyond the screen." },
];

const reviews = [
  {
    name: "Alwin Samson",
    time: "5 months ago",
    initials: "AS",
    text: "Great gaming experience with smooth playstation setup. Perfect place to chill and play with friends 😍",
  },
  {
    name: "Mathi M",
    time: "4 months ago",
    initials: "MM",
    text: "Cool place for all latest games. Explore the games with please environment.",
  },
  {
    name: "Elangaroshni07",
    time: "5 months ago",
    initials: "E7",
    text: "We had a great experience, good ambience, best place to hangout with friends and family for better gaming experience.",
  },
  {
    name: "Ramesh r",
    time: "3 months ago",
    initials: "RR",
    text: "Very fun to play and clean and snacks with no (extra charges)",
  },
];

const galleryItems = [
  { src: photos.one, alt: "Gaming setup inside Gamers Nest", size: "gallery-large" },
  { src: photos.two, alt: "PlayStation gaming area inside Gamers Nest", size: "gallery-tall" },
  { src: photos.three, alt: "Gaming lounge interior at Gamers Nest", size: "gallery-small" },
  { src: photos.four, alt: "Gaming experience area inside Gamers Nest", size: "gallery-wide" },
];

function Stars({ label = "5 out of 5 stars" }: { label?: string }) {
  return (
    <span className="stars" role="img" aria-label={label}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Star key={index} size={15} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
      ))}
    </span>
  );
}

function SectionLabel({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="section-heading">
      <span className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</span>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

type BookingExperience = Experience;

function normalizeBookingExperience(value: string): BookingExperience | "" {
  if (value.includes("PS2")) return "PS2";
  if (value.includes("PS4")) return "PS4";
  if (value.includes("PS5")) return "PS5";
  if (value.toLowerCase().includes("steering")) return "Steering simulator 1";
  if (value.includes("CAR")) return "Steering simulator 1";
  if (value.includes("RACING")) return "Steering simulator 1";
  if (value.includes("VR")) return "VR GAMING";
  return "";
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [selectedGallery, setSelectedGallery] = useState<number | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<BookingExperience | "">("");
  const [selectedConsoleId, setSelectedConsoleId] = useState<ConsoleId | "">("");
  const [selectedGame, setSelectedGame] = useState("");
  const [activeSessionGame, setActiveSessionGame] = useState<string | undefined>(undefined);
  const [isSharedSession, setIsSharedSession] = useState<boolean>(false);
  const [isSharedSessionConfirmed, setIsSharedSessionConfirmed] = useState<boolean>(false);
  const [players, setPlayers] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [bookingDetails, setBookingDetails] = useState<{
    name: string;
    phone: string;
    experience: string;
    consoleId?: string;
    players: string;
    date: string;
    startTime: string;
    endTime: string;
    game?: string;
    price?: number;
    message?: string;
  } | null>(null);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Default booking date to today if empty
  useEffect(() => {
    if (!bookingDate) setBookingDate(today);
  }, [today, bookingDate]);

  // Max selectable players depends on the chosen experience's physical capacity.
  const maxPlayers = selectedExperience ? getMaxPlayers(selectedExperience) : 1;
  const playerOptions = useMemo(
    () => Array.from({ length: Math.max(1, maxPlayers) }, (_, i) => i + 1),
    [maxPlayers],
  );

  // Keep the player count valid whenever the experience changes.
  useEffect(() => {
    setPlayers((current) => Math.min(Math.max(1, current), Math.max(1, maxPlayers)));
  }, [maxPlayers]);

  // Reset console and slot when experience changes
  useEffect(() => {
    if (selectedExperience) {
      const defaultConsole = getConsolesForExperience(selectedExperience)[0]?.id || "";
      setSelectedConsoleId(defaultConsole);
      setStartTime("");
      setEndTime("");
      setIsSharedSession(false);
      setIsSharedSessionConfirmed(false);
      setActiveSessionGame(undefined);
    }
  }, [selectedExperience]);

  // Selectable time slots
  const timeSlots = useMemo(() => getTimeSlots(selectedExperience === "VR GAMING" ? 30 : 60), [selectedExperience]);
  const startSlots = useMemo(() => timeSlots.slice(0, -1), [timeSlots]);
  const endSlots = useMemo(
    () => (startTime ? timeSlots.filter((slot) => slot.value > startTime) : timeSlots.slice(1)),
    [timeSlots, startTime],
  );

  // Clear end time if start changes to after end
  useEffect(() => {
    if (startTime && endTime && endTime <= startTime) setEndTime("");
  }, [startTime, endTime]);

  // Live calculated price matching official rules
  const calculatedPrice = useMemo(() => {
    if (!selectedExperience || !startTime || !endTime) return 0;
    return calculateOfficialPrice(selectedExperience, players, startTime, endTime);
  }, [selectedExperience, players, startTime, endTime]);

  // Live availability status, backed by Supabase data.
  const timeRangeValid = isValidTimeRange(startTime, endTime);
  const withinStoreHours = isWithinStoreHours(startTime, endTime);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const canCheck = Boolean(
    selectedExperience && bookingDate && startTime && endTime && timeRangeValid && withinStoreHours,
  );

  // Debounced availability query
  useEffect(() => {
    if (!canCheck || !selectedExperience) {
      setAvailability(null);
      setCheckingAvailability(false);
      return;
    }

    let cancelled = false;
    setCheckingAvailability(true);

    const handle = window.setTimeout(async () => {
      try {
        const result = await checkAvailabilityRemote(
          selectedExperience,
          players,
          bookingDate,
          startTime,
          endTime,
          selectedConsoleId || undefined,
          selectedGame || undefined,
        );
        if (!cancelled) {
          setAvailability(result);
          setBookingError(null);

          if (result.existingGame) {
            setActiveSessionGame(result.existingGame);
            setSelectedGame(result.existingGame);
            setIsSharedSession(true);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setAvailability(null);
          setBookingError(error instanceof Error ? error.message : "Could not check availability.");
        }
      } finally {
        if (!cancelled) setCheckingAvailability(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [canCheck, selectedExperience, players, bookingDate, startTime, endTime, selectedConsoleId, selectedGame]);

  const canSubmitBooking = Boolean(
    availability?.available &&
    (!isSharedSession || isSharedSessionConfirmed) &&
    !submitting
  );

  const handleSlotSelectFromGrid = (
    consoleId: ConsoleId,
    start: string,
    end: string,
    existingGame?: string,
    shared?: boolean,
  ) => {
    setSelectedConsoleId(consoleId);
    setStartTime(start);
    setEndTime(end);

    if (existingGame) {
      setActiveSessionGame(existingGame);
      setSelectedGame(existingGame);
      setIsSharedSession(true);
      setIsSharedSessionConfirmed(false);
    } else {
      setActiveSessionGame(undefined);
      setIsSharedSession(false);
      setIsSharedSessionConfirmed(true);
    }
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 32);
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / totalHeight)));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleBookingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedExperience || !timeRangeValid || !withinStoreHours || !availability?.available) return;
    if (isSharedSession && !isSharedSessionConfirmed) return;
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const name = (formData.get("name") as string) || "";
    const phone = (formData.get("phone") as string) || "";
    const game = selectedGame || undefined;
    const message = (formData.get("message") as string) || undefined;

    setSubmitting(true);
    setBookingError(null);

    try {
      const { ok, availability: latest, price } = await createBooking({
        name,
        phone,
        experience: selectedExperience,
        consoleId: selectedConsoleId || undefined,
        players,
        date: bookingDate,
        startTime,
        endTime,
        game,
        message,
      });

      if (!ok) {
        setAvailability(latest);
        setBookingError(latest.message);
        return;
      }

      setBookingDetails({
        name,
        phone,
        experience: selectedExperience,
        consoleId: selectedConsoleId || undefined,
        players: String(players),
        date: bookingDate,
        startTime,
        endTime,
        game,
        price,
        message,
      });
      setSubmitted(true);

      setTimeout(() => {
        document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmationWhatsappLink = useMemo(() => {
    if (!bookingDetails) return whatsappLink;
    const lines = [
      `Hi Gamers Nest! I would like to confirm my booking request:`,
      `• Name: ${bookingDetails.name}`,
      `• Experience: ${bookingDetails.experience}`,
      `• Players: ${bookingDetails.players}`,
      `• Date: ${bookingDetails.date}`,
      `• Time: ${formatTime12h(bookingDetails.startTime)} – ${formatTime12h(bookingDetails.endTime)}`,
    ];
    if (bookingDetails.game) lines.push(`• Game: ${bookingDetails.game}`);
    if (bookingDetails.message) lines.push(`• Note: ${bookingDetails.message}`);
    return `https://wa.me/919159588666?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [bookingDetails]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedGallery(null);
      if (selectedGallery !== null && event.key === "ArrowRight") {
        setSelectedGallery((selectedGallery + 1) % galleryItems.length);
      }
      if (selectedGallery !== null && event.key === "ArrowLeft") {
        setSelectedGallery((selectedGallery - 1 + galleryItems.length) % galleryItems.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedGallery]);

  // Lock body scroll cleanly on mobile without resetting window scroll position
  useEffect(() => {
    if (mobileOpen) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  const visibleGames = useMemo(
    () => (activeCategory === "ALL" ? games : games.filter((game) => game.category === activeCategory)),
    [activeCategory],
  );

  const scrollToId = (id: string) => {
    setMobileOpen(false);
    document.documentElement.style.overflow = "";

    const doScroll = () => {
      if (id === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const el = document.getElementById(id);
        if (el) {
          const navHeight = window.innerWidth <= 760 ? 72 : 86;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navHeight;

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: "smooth"
          });
        }
      }
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        doScroll();
      });
    });
  };

  const chooseExperience = (experience: string) => {
    setSelectedExperience(normalizeBookingExperience(experience));
    scrollToId("book");
    window.setTimeout(() => document.getElementById("booking-name")?.focus(), 450);
  };

  return (
    <div className="site-shell">
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})`, transformOrigin: "left" }}
        aria-hidden="true"
      />
      <GamerCharacterWalk />
      <header className={`site-nav ${scrolled ? "site-nav-scrolled" : ""} ${mobileOpen ? "site-nav-mobile-open" : ""}`}>

        <a href="#home" className="brand-lockup" onClick={() => scrollToId("home")} aria-label="Gamers Nest home">
          <img src={logoMark} alt="" className="brand-mark" />
          <span className="brand-wordmark"><strong>GAMERS</strong><em>NEST</em></span>
        </a>
        <nav className={`nav-links ${mobileOpen ? "nav-links-open" : ""}`} aria-label="Primary navigation">
          {[
            ["HOME", "home"], ["CONSOLES", "experiences"], ["GAMES", "games"], ["PRICING", "pricing"],
            ["GALLERY", "gallery"], ["REVIEWS", "reviews"], ["LOCATION", "location"],
          ].map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToId(id);
              }}
            >
              {label}
            </a>
          ))}
          <button className="nav-book mobile-nav-book" onClick={() => chooseExperience("")}>BOOK NOW <ArrowUpRight size={15} /></button>
        </nav>
        <button className="nav-book desktop-nav-book" onClick={() => chooseExperience("")}>BOOK NOW <ArrowUpRight size={15} /></button>
        <button className="menu-toggle" onClick={() => setMobileOpen((value) => !value)} aria-expanded={mobileOpen} aria-label={mobileOpen ? "Close menu" : "Open menu"}>
          {mobileOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </header>

      <main>
        <section id="home" className="hero-section" style={{ backgroundImage: `url(${photos.hero})` }}>
          <div className="hero-overlay" />
          <div className="hero-orb hero-orb-cyan" />
          <div className="hero-orb hero-orb-lime" />
          <div className="hero-content shell-width">
            <div className="hero-copy reveal-up">
              <span className="hero-kicker"><span className="status-dot" /> GAMERS NEST / AYAPPAKKAM</span>
              <p className="hero-overline">PREMIUM E-GAMING LOUNGE</p>
              <h1>PLAY.<br /><span>COMPETE.</span><br />CONQUER.</h1>
              <p className="hero-subtitle">Your gaming zone in Ayappakkam.</p>
              <div className="hero-actions">
                <button className="button button-primary" onClick={() => chooseExperience("")}>BOOK YOUR SESSION <ArrowUpRight size={17} /></button>
                <button className="button button-ghost" onClick={() => scrollToId("games")}>EXPLORE GAMES <Play size={16} fill="currentColor" /></button>
              </div>
              <div className="hero-meta"><span><MapPin size={14} /> AYAPPAKKAM, CHENNAI</span><span><Clock3 size={14} /> 11:00 AM – 11:00 PM</span></div>
            </div>
            <div className="hero-side-note"><span className="vertical-rule" /><span>REAL SPACE.<br />REAL PLAY.</span></div>
          </div>
          <div className="hero-bottom-bar shell-width"><span>01 / 06</span><span className="hero-line" /><span>SCROLL TO EXPLORE <ArrowUpRight size={14} /></span></div>
        </section>



        <section className="intro-section section-pad shell-width">
          <div className="intro-copy reveal-up">
            <SectionLabel eyebrow="THE NEST" title="WELCOME TO THE NEST" />
            <p className="intro-lead">A place where gamers come to play, compete, race and experience their favourite games with friends.</p>
            <SkiperUnderlineLink renderAs="button" className="text-link" onClick={() => scrollToId("experiences")}>SEE OUR CONSOLES</SkiperUnderlineLink>
          </div>
          <div className="intro-photo photo-frame reveal-up"><img src={photos.one} alt="Real gaming interior at Gamers Nest" loading="lazy" /><span className="photo-tag">01 / THE SPACE</span></div>
        </section>

        <section id="experiences" className="experiences-section section-pad shell-width">
          <SectionLabel eyebrow="GAMING CONSOLES" title="CHOOSE YOUR CONSOLE SETUP" copy="One lounge. Premium gaming setups & consoles. Swipe or click to book your setup." />
          <div className="mt-10">
            <CardCarousel
              title="GAMING CONSOLES & SETUPS"
              subtitle="Swipe through our five immersive setups. Click any card to book."
              badgeText="CHOOSE YOUR CONSOLE"
              autoplayDelay={2500}
              showPagination={true}
              showNavigation={true}
              images={experiences.map((experience, idx) => ({
                indexTag: `0${idx + 1} / 05`,
                badge: experience.formValue === "Steering simulator 1" ? "RACING" : experience.formValue,
                src: experience.photo,
                alt: `${experience.title} at Gamers Nest`,
                title: experience.title,
                subtitle: experience.description,
                price: experience.price,
                onClick: () => chooseExperience(experience.formValue),
              }))}
            />
          </div>

          {/* TOURNAMENT CARD / FEATURE SECTION */}
          <TournamentMysteryCard>
            <div className="bg-gradient-to-br from-[#0f151c] via-[#12191f] to-[#080d10] border border-[#00f2fe]/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-[#00f2fe]/60 transition-all">
              {/* Background Glows */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#00f2fe]/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#c4ff3d]/10 rounded-full blur-[90px] pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Trophy & Badge */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#00f2fe]/15 border border-[#00f2fe]/30 text-[#00f2fe] text-xs font-mono font-bold tracking-widest uppercase">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span>GAMERSNEST ESPORTS TOURNAMENTS</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase font-display leading-none">
                    JOIN LOCAL <br /><span className="text-[#c4ff3d]">TOURNAMENTS</span> &amp; WIN
                  </h2>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                    Compete against the best local gamers in Chennai! Test your skills in EA SPORTS FC 25, FIFA, Mortal Kombat 1, and Tekken 8 tournaments. Cash prizes, trophies, and gaming glory await.
                  </p>

                  {/* Feature Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-[#080c10]/90 p-3.5 rounded-xl border border-slate-800 text-center">
                      <Trophy className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                      <span className="text-xs font-bold text-white block">Cash Prizes</span>
                      <span className="text-[10px] text-slate-400 font-mono">🏆 Trophies</span>
                    </div>

                    <div className="bg-[#080c10]/90 p-3.5 rounded-xl border border-slate-800 text-center">
                      <Gamepad2 className="h-5 w-5 text-[#00f2fe] mx-auto mb-1" />
                      <span className="text-xs font-bold text-white block">EA FC &amp; Fighting</span>
                      <span className="text-[10px] text-slate-400 font-mono">⚽ FC 25 / MK1</span>
                    </div>

                    <div className="bg-[#080c10]/90 p-3.5 rounded-xl border border-slate-800 text-center">
                      <Zap className="h-5 w-5 text-[#c4ff3d] mx-auto mb-1" />
                      <span className="text-xs font-bold text-white block">Weekend Events</span>
                      <span className="text-[10px] text-slate-400 font-mono">⚡ Knockout</span>
                    </div>

                    <div className="bg-[#080c10]/90 p-3.5 rounded-xl border border-slate-800 text-center">
                      <Users className="h-5 w-5 text-cyan-300 mx-auto mb-1" />
                      <span className="text-xs font-bold text-white block">Solo &amp; Squads</span>
                      <span className="text-[10px] text-slate-400 font-mono">👥 1v1 / 2v2</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Event Details Card & WhatsApp Registration Button */}
                <div className="lg:col-span-5 bg-[#080c10]/95 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono text-[#c4ff3d] font-bold uppercase tracking-wider">FUTURE EVENTS</span>
                    <span className="text-[10px] font-mono bg-[#00f2fe]/10 text-[#00f2fe] px-2 py-0.5 rounded border border-[#00f2fe]/20">COMING SOON</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-white font-display">GAMERSNEST ESPORTS CUP</h3>
                    <p className="text-xs text-slate-400 mt-1">GET READY FOR UPCOMING EA FC 25 &amp; MORTAL KOMBAT TOURNAMENTS</p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 font-mono bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Next Tournament:</span>
                      <span className="text-[#c4ff3d] font-bold">Announcing Soon</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tournament Games:</span>
                      <span className="text-white font-bold">EA FC 25 &amp; MK1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-[#00f2fe] font-bold">Waiting List Open</span>
                    </div>
                  </div>

                  <a
                    href="https://wa.me/919159588666?text=Hi%20GamersNest!%20Please%20notify%20me%20when%20the%20next%20Esports%20Tournament%20opens%20for%20registration!%20🏆"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#00f2fe] via-cyan-400 to-[#c4ff3d] hover:from-[#c4ff3d] hover:to-[#00f2fe] text-black font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-[#00f2fe]/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4 fill-black text-black" />
                    <span>GET NOTIFIED ON WHATSAPP FOR FUTURE EVENTS</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>

              </div>
            </div>
          </TournamentMysteryCard>

        </section>


        <section id="games" className="games-section section-pad shell-width">
          <div className="section-heading-row"><SectionLabel eyebrow="GAME LIBRARY" title="CHOOSE YOUR BATTLE" copy="A selection of games and experiences available at the lounge." /><div className="library-note">SELECT YOUR<br /><span>PLAYLIST</span></div></div>
          <div className="category-row" role="tablist" aria-label="Game categories">
            {["ALL", "ACTION", "OPEN WORLD", "FIGHTING", "RACING", "SPORTS"].map((category) => (
              <button key={category} role="tab" aria-selected={activeCategory === category} className={activeCategory === category ? "category-active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>
            ))}
          </div>
          <div className="games-showcase">
            <aside className="games-side games-side-left">
              <span className="card-kicker">THE NEST IN NUMBERS</span>
              <h3 className="games-side-title">GET READY<br />TO PLAY</h3>
              <ul className="games-stats">
                <li><Gamepad2 size={18} strokeWidth={1.5} /><div><strong>5</strong><span>Ways to play</span></div></li>
                <li><Play size={18} strokeWidth={1.5} fill="currentColor" /><div><strong>{PLAYABLE_GAMES.length}+</strong><span>Game titles</span></div></li>
                <li><Star size={18} strokeWidth={1.5} fill="currentColor" /><div><strong>5.0</strong><span>Google rating</span></div></li>
                <li><Clock3 size={18} strokeWidth={1.5} /><div><strong>11–11</strong><span>Open daily</span></div></li>
              </ul>
            </aside>

            <div className="games-deck-wrap">
              <Carousel_002
                key={activeCategory}
                className="games-deck"
                images={visibleGames.map((game) => ({
                  src: game.photo,
                  alt: `${game.title} — ${game.genre}`,
                  genre: game.genre,
                  title: game.title,
                }))}
                loop={visibleGames.length >= 3}
                autoplay={visibleGames.length >= 3}
                showNavigation={visibleGames.length > 1}
                cardsEffect={{ perSlideOffset: 22, perSlideRotate: 5 }}
              />
              <p className="games-deck-hint" aria-hidden="true">DRAG OR SWIPE TO EXPLORE</p>
            </div>

            <aside className="games-side games-side-right">
              <div className="games-join">
                <span className="games-join-icon"><Users size={20} strokeWidth={1.6} /></span>
                <h3 className="games-join-title">JOIN THE<br />SQUAD</h3>
                <p className="games-join-copy">Book a slot, bring your crew, and make it your table.</p>
                <SkiperUnderlineLink renderAs="button" className="card-link" onClick={() => chooseExperience("")}>BOOK A SLOT</SkiperUnderlineLink>
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="games-join-whatsapp"><MessageCircle size={14} /> ASK ON WHATSAPP</a>
              </div>
            </aside>
          </div>

          <FutureGamesSection activeCategory={activeCategory} />
        </section>

        <section id="pricing" className="pricing-section section-pad relative overflow-hidden">
          <div className="shell-width relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[#00f2fe] text-xs font-mono font-bold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe] animate-pulse" />
                <span>OUR PRICING</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase font-display">
                CHOOSE YOUR <span className="inline-block px-1 bg-gradient-to-r from-[#00f2fe] via-cyan-300 to-purple-400 bg-clip-text text-transparent">ARENA</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Next-gen consoles, racing thrills and immersive VR — Fun for everyone!
              </p>
            </div>

            {/* 5-Card Pricing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-stretch">
              {/* 1. PS5 Card */}
              <div className="bg-[#0b1219]/90 border border-[#00f2fe]/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative group hover:-translate-y-1.5 transition-all duration-300 shadow-[0_0_20px_rgba(0,242,254,0.12)] hover:shadow-[0_0_30px_rgba(0,242,254,0.25)] hover:border-[#00f2fe]/80 backdrop-blur-sm">
                <div className="space-y-4">
                  {/* Visual Header */}
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gradient-to-b from-slate-900 to-[#080d12] border border-slate-800/80">
                    <img src="/images/games/ps5.webp" alt="PS5" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-[#00f2fe]/20 backdrop-blur-md border border-[#00f2fe]/40 text-[#00f2fe] text-[10px] font-mono font-bold tracking-wider">
                      3 UNITS
                    </div>
                  </div>

                  {/* Title & Subtitle (Fixed Height) */}
                  <div className="h-[64px] flex flex-col justify-center">
                    <h3 className="text-2xl font-black text-white tracking-tight font-display leading-tight">PS5</h3>
                    <p className="text-xs text-slate-400 font-medium">Next-Gen Gaming</p>
                  </div>

                  {/* Capacity Container (Fixed Height) */}
                  <div className="h-[54px] flex flex-col justify-center items-center bg-[#080d12]/90 border border-slate-800 rounded-xl px-2 text-center">
                    <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-cyan-300">
                      <Users className="w-3.5 h-3.5 text-[#00f2fe]" />
                      <span>Up to 4 Players</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">per console</span>
                  </div>

                  {/* Pricing Grid (Fixed Height, Uniform 2-Cols) */}
                  <div className="grid grid-cols-2 gap-2 h-[82px]">
                    <div className="bg-[#080d12]/90 border border-slate-800/80 rounded-xl p-1.5 flex flex-col justify-center items-center text-center">
                      <div className="text-base sm:text-lg font-black text-[#c4ff3d] font-mono leading-none">₹100</div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">/hour</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">Single Player</span>
                    </div>
                    <div className="bg-[#080d12]/90 border border-slate-800/80 rounded-xl p-1.5 flex flex-col justify-center items-center text-center">
                      <div className="text-base sm:text-lg font-black text-[#00f2fe] font-mono leading-none">₹90</div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">/player/hour</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">Multiplayer</span>
                    </div>
                  </div>

                  {/* Feature Bullets (Fixed Min Height) */}
                  <ul className="min-h-[110px] space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-[#00f2fe]/15 text-[#00f2fe] flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">3 High-Performance Consoles</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-[#00f2fe]/15 text-[#00f2fe] flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">4 Controllers per Console</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-[#00f2fe]/15 text-[#00f2fe] flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">Latest AAA Titles</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-[#00f2fe]/15 text-[#00f2fe] flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">4K Gaming Experience</span>
                    </li>
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => chooseExperience("PS5")}
                  className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-[#00f2fe] to-cyan-500 hover:from-cyan-400 hover:to-[#00f2fe] text-black font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-[#00f2fe]/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Book Now</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              {/* 2. PS4 Card */}
              <div className="bg-[#0b1219]/90 border border-sky-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative group hover:-translate-y-1.5 transition-all duration-300 shadow-[0_0_20px_rgba(14,165,233,0.12)] hover:shadow-[0_0_30px_rgba(14,165,233,0.25)] hover:border-sky-400/80 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gradient-to-b from-slate-900 to-[#080d12] border border-slate-800/80">
                    <img src="/images/games/ps4.webp" alt="PS4" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-sky-500/20 backdrop-blur-md border border-sky-500/40 text-sky-400 text-[10px] font-mono font-bold tracking-wider">
                      1 UNIT
                    </div>
                  </div>

                  <div className="h-[64px] flex flex-col justify-center">
                    <h3 className="text-2xl font-black text-white tracking-tight font-display leading-tight">PS4</h3>
                    <p className="text-xs text-slate-400 font-medium">Great Classics</p>
                  </div>

                  <div className="h-[54px] flex flex-col justify-center items-center bg-[#080d12]/90 border border-slate-800 rounded-xl px-2 text-center">
                    <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-sky-300">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      <span>Up to 4 Players</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">per console</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 h-[82px]">
                    <div className="bg-[#080d12]/90 border border-slate-800/80 rounded-xl p-1.5 flex flex-col justify-center items-center text-center">
                      <div className="text-base sm:text-lg font-black text-[#c4ff3d] font-mono leading-none">₹100</div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">/hour</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">Single Player</span>
                    </div>
                    <div className="bg-[#080d12]/90 border border-slate-800/80 rounded-xl p-1.5 flex flex-col justify-center items-center text-center">
                      <div className="text-base sm:text-lg font-black text-sky-300 font-mono leading-none">₹90</div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">/player/hour</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">Multiplayer</span>
                    </div>
                  </div>

                  <ul className="min-h-[110px] space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-sky-500/15 text-sky-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">1 Console</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-sky-500/15 text-sky-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">4 Controllers</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-sky-500/15 text-sky-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">Wide Game Library</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-sky-500/15 text-sky-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">Multiplayer Fun</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => chooseExperience("PS4")}
                  className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-[#00f2fe] hover:from-[#00f2fe] hover:to-sky-400 text-black font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Book Now</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              {/* 3. PS2 Card */}
              <div className="bg-[#0b1219]/90 border border-purple-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative group hover:-translate-y-1.5 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.12)] hover:shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:border-purple-400/80 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gradient-to-b from-slate-900 to-[#080d12] border border-slate-800/80">
                    <img src="/images/games/ps2.webp" alt="PS2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-purple-500/20 backdrop-blur-md border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold tracking-wider">
                      1 UNIT
                    </div>
                  </div>

                  <div className="h-[64px] flex flex-col justify-center">
                    <h3 className="text-2xl font-black text-white tracking-tight font-display leading-tight">PS2</h3>
                    <p className="text-xs text-slate-400 font-medium">Retro Gaming</p>
                  </div>

                  <div className="h-[54px] flex flex-col justify-center items-center bg-[#080d12]/90 border border-slate-800 rounded-xl px-2 text-center">
                    <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-purple-300">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>Up to 2 Players</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">per console</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 h-[82px]">
                    <div className="bg-[#080d12]/90 border border-slate-800/80 rounded-xl p-1.5 flex flex-col justify-center items-center text-center">
                      <div className="text-base sm:text-lg font-black text-[#c4ff3d] font-mono leading-none">₹80</div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">/hour</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">Single Player</span>
                    </div>
                    <div className="bg-[#080d12]/90 border border-slate-800/80 rounded-xl p-1.5 flex flex-col justify-center items-center text-center">
                      <div className="text-base sm:text-lg font-black text-purple-300 font-mono leading-none">₹70</div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">/player/hour</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">Multiplayer</span>
                    </div>
                  </div>

                  <ul className="min-h-[110px] space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">1 Console</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">2 Controllers</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">Classic Titles</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">Nostalgic Experience</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => chooseExperience("PS2")}
                  className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Book Now</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              {/* 4. Steering Simulator Card */}
              <div className="bg-[#0b1219]/90 border border-amber-400/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative group hover:-translate-y-1.5 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.12)] hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:border-amber-300/80 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gradient-to-b from-slate-900 to-[#080d12] border border-slate-800/80">
                    <img src="/images/games/steering.webp" alt="Steering Simulator" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold tracking-wider">
                      1 UNIT
                    </div>
                  </div>

                  <div className="h-[64px] flex flex-col justify-center">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display leading-tight">Steering Simulator</h3>
                    <p className="text-xs text-slate-400 font-medium">Feel the Real Drive</p>
                  </div>

                  <div className="h-[54px] flex flex-col justify-center items-center bg-[#080d12]/90 border border-slate-800 rounded-xl px-2 text-center">
                    <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-amber-300">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>1 Player Only</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">racing setup</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 h-[82px]">
                    <div className="bg-[#080d12]/90 border border-slate-800/80 rounded-xl p-1.5 flex flex-col justify-center items-center text-center">
                      <div className="text-base sm:text-lg font-black text-amber-400 font-mono leading-none">₹150</div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">/hour</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">Single Player</span>
                    </div>
                    <div className="bg-[#080d12]/90 border border-slate-800/80 rounded-xl p-1.5 flex flex-col justify-center items-center text-center">
                      <div className="text-base sm:text-lg font-black text-slate-500 font-mono leading-none">—</div>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">N/A</span>
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5">Multiplayer</span>
                    </div>
                  </div>

                  <ul className="min-h-[110px] space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">Racing Seat</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">Steering Wheel Setup</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">Realistic Experience</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">Popular Racing Titles</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => chooseExperience("Steering simulator 1")}
                  className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-[#c4ff3d] hover:from-[#c4ff3d] hover:to-amber-400 text-black font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-amber-400/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Book Now</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

              {/* 5. VR Gaming Card */}
              <div className="bg-[#0b1219]/90 border border-fuchsia-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative group hover:-translate-y-1.5 transition-all duration-300 shadow-[0_0_20px_rgba(217,70,239,0.12)] hover:shadow-[0_0_30px_rgba(217,70,239,0.25)] hover:border-fuchsia-400/80 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-gradient-to-b from-slate-900 to-[#080d12] border border-slate-800/80">
                    <img src="/images/games/vr.webp" alt="VR Gaming" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-fuchsia-500/20 backdrop-blur-md border border-fuchsia-500/40 text-fuchsia-300 text-[10px] font-mono font-bold tracking-wider">
                      1 UNIT
                    </div>
                  </div>

                  <div className="h-[64px] flex flex-col justify-center">
                    <h3 className="text-2xl font-black text-white tracking-tight font-display leading-tight">VR Gaming</h3>
                    <p className="text-xs text-slate-400 font-medium">Step into Another World</p>
                  </div>

                  <div className="h-[54px] flex flex-col justify-center items-center bg-[#080d12]/90 border border-slate-800 rounded-xl px-2 text-center">
                    <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-fuchsia-300">
                      <Users className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span>1 Player Only</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">VR headset</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 h-[82px]">
                    <div className="bg-[#080d12]/90 border border-slate-800/80 rounded-xl p-1.5 flex flex-col justify-center items-center text-center">
                      <div className="text-base sm:text-lg font-black text-fuchsia-400 font-mono leading-none">₹100</div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">/30 min</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">Single Player</span>
                    </div>
                    <div className="bg-[#080d12]/90 border border-slate-800/80 rounded-xl p-1.5 flex flex-col justify-center items-center text-center">
                      <div className="text-base sm:text-lg font-black text-slate-500 font-mono leading-none">—</div>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">N/A</span>
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5">Multiplayer</span>
                    </div>
                  </div>

                  <ul className="min-h-[110px] space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">Immersive Experience</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">Popular VR Titles</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">Next-Gen Fun</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-4 h-4 rounded-full bg-fuchsia-500/15 text-fuchsia-400 flex items-center justify-center flex-shrink-0 text-[10px]">✓</span>
                      <span className="text-[11px]">A Whole New Reality</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => chooseExperience("VR GAMING")}
                  className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:from-fuchsia-500 hover:to-pink-400 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-fuchsia-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Book Now</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bottom Footer Feature Bar */}
            <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                <Gamepad2 className="w-4 h-4 text-[#00f2fe]" />
                <span>PREMIUM GAMING SETUP</span>
              </div>
              <span className="hidden md:inline text-slate-700">•</span>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>FRIENDS &amp; FAMILY</span>
              </div>
              <span className="hidden md:inline text-slate-700">•</span>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>LATEST GAMES</span>
              </div>
              <span className="hidden md:inline text-slate-700">•</span>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-[#c4ff3d]" />
                <span>SAFE &amp; CLEAN ENVIRONMENT</span>
              </div>
              <span className="hidden md:inline text-slate-700">•</span>
              <div className="flex items-center space-x-2 text-pink-400 font-bold">
                <span>PLAY · RELAX · REPEAT</span>
              </div>
            </div>
          </div>
        </section>

        <section className="reasons-section section-pad shell-width"><SectionLabel eyebrow="THE DIFFERENCE" title="WHY GAMERS NEST?" /><div className="reasons-grid">{reasons.map(({ icon: Icon, title, description }, index) => <article className="reason-card" key={title}><span className="reason-index">0{index + 1}</span><Icon size={23} strokeWidth={1.5} /><h3>{title}</h3><p>{description}</p></article>)}</div></section>

        <section id="gallery" className="gallery-section section-pad shell-width"><div className="section-heading-row"><SectionLabel eyebrow="REAL PHOTO GALLERY" title="INSIDE THE NEST" copy="See where the games happen." /><span className="gallery-caption">THE LOUNGE /<br />AS IT IS</span></div><div className="gallery-grid">{galleryItems.map((item, index) => <button className={`gallery-item ${item.size}`} key={item.src} onClick={() => setSelectedGallery(index)} aria-label={`Open ${item.alt}`}><img src={item.src} alt={item.alt} loading="lazy" /><span className="gallery-overlay"><span>VIEW / 0{index + 1}</span><ArrowUpRight size={16} /></span></button>)}</div></section>

        <section id="reviews" className="reviews-section section-pad" style={{ backgroundImage: `linear-gradient(110deg, rgba(6, 10, 14, .98) 2%, rgba(6, 10, 14, .93) 50%, rgba(6, 10, 14, .79) 100%), url(${reviewAtmosphere})` }}>
          <div className="shell-width"><div className="reviews-intro"><SectionLabel eyebrow="REAL WORDS / REAL PLAY" title="WHAT GAMERS SAY" copy="Real experiences from gamers who visited Gamers Nest." /><div className="rating-highlight"><Stars /><strong>5.0</strong><span>Loved by gamers in Ayappakkam</span></div></div><div className="reviews-grid">{reviews.map((review, index) => <article className="review-card reveal-up" key={review.name} style={{ animationDelay: `${index * 70}ms` }}><div className="review-card-top"><div className="initials-avatar" aria-hidden="true">{review.initials}</div><div><h3>{review.name}</h3><time>{review.time}</time></div><Quote className="quote-mark" size={24} /></div><Stars /><p>{review.text}</p><div className="review-card-foot"><span>GOOGLE CUSTOMER REVIEW</span><Check size={14} /></div></article>)}</div></div>
        </section>

        <section id="book" className="booking-section section-pad shell-width">
          <div className="booking-intro">
            <SectionLabel eyebrow="MAKE IT YOURS" title="READY TO PLAY?" copy="Choose your setup, view time slot availability, and request a booking." />
            <div className="booking-contact">
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="button button-primary"><MessageCircle size={17} /> CHAT ON WHATSAPP</a>
              <p>Prefer to message? We will help you find your setup.</p>
            </div>
            <div className="booking-steps" aria-label="Booking steps">
              <span><strong>01</strong> PICK SETUP &amp; DATE</span>
              <span><strong>02</strong> CHOOSE TIME SLOT</span>
              <span><strong>03</strong> CONFIRM &amp; PLAY</span>
            </div>
          </div>

          <div className="booking-panel">
            {submitted ? (
              <div className="confirmation-state" key="confirmation" aria-live="polite">
                <span className="confirmation-icon"><Check size={27} /></span>
                <span className="eyebrow"><span className="eyebrow-dot" /> REQUEST RECEIVED</span>
                <h3>Your booking request has been received.</h3>
                <p>Gamers Nest will contact you to confirm your session.</p>
                {bookingDetails && (
                  <div className="booking-summary-card p-4 rounded-xl border border-[#00f2fe]/30 bg-[#080d12]/95 w-full max-w-md text-xs text-slate-300 space-y-2.5 my-3 font-mono shadow-2xl">
                    <div className="flex justify-between border-b border-slate-800 pb-2 font-semibold text-white">
                      <span>{bookingDetails.name}</span>
                      <span className="text-[#c4ff3d]">{bookingDetails.consoleId || bookingDetails.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date &amp; Time:</span>
                      <span className="text-white">{bookingDetails.date} · {formatTime12h(bookingDetails.startTime)} – {formatTime12h(bookingDetails.endTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Players:</span>
                      <span className="text-white">{bookingDetails.players} player(s)</span>
                    </div>
                    {bookingDetails.game && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Game:</span>
                        <span className="text-[#00f2fe] font-bold">🎮 {bookingDetails.game}</span>
                      </div>
                    )}
                    {bookingDetails.price !== undefined && (
                      <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm">
                        <span className="text-slate-400">Calculated Price:</span>
                        <span className="text-[#c4ff3d]">₹{bookingDetails.price}</span>
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      Tap below to send these exact details to our WhatsApp for instant confirmation.
                    </div>
                  </div>
                )}
                <div className="confirmation-actions">
                  <a href={confirmationWhatsappLink} target="_blank" rel="noreferrer" className="button button-primary"><MessageCircle size={16} /> CHAT ON WHATSAPP</a>
                  <SkiperUnderlineLink renderAs="button" className="text-link" onClick={() => { setSubmitted(false); setSelectedGame(""); }}>SEND ANOTHER REQUEST</SkiperUnderlineLink>
                </div>
              </div>
            ) : (
              <form key="booking-form" onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="form-header"><span>BOOK YOUR GAMING SESSION</span><span>REQUEST / 01</span></div>
                
                {/* Customer Explanation Banner for Shared Console Gaming */}
                <div className="p-4 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-xs text-slate-300 space-y-1 font-mono">
                  <div className="flex items-center space-x-2 font-bold text-[#00f2fe] uppercase">
                    <Zap className="h-4 w-4 text-[#c4ff3d]" />
                    <span>Shared Console Gaming</span>
                  </div>
                  <p>
                    PS5, PS4, and PS2 consoles can be shared by multiple players during the same time slot. If seats are available in an existing session, you can join that session. All players sharing the same console during that time slot will play the same game.
                  </p>
                </div>

                <div className="form-section">
                  <div className="form-section-header"><span className="form-step">01</span><div><strong>YOUR DETAILS</strong><small>How can we reach you?</small></div></div>
                  <div className="form-grid">
                    <label><span>FULL NAME <b>*</b></span><input id="booking-name" name="name" autoComplete="name" required placeholder="Your name" /></label>
                    <label><span>PHONE / WHATSAPP NUMBER <b>*</b></span><input name="phone" type="tel" autoComplete="tel" inputMode="tel" required placeholder="+91 91595 88666" /></label>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-header"><span className="form-step">02</span><div><strong>YOUR SETUP &amp; TIME SLOT</strong><small>Select gaming type, date, then pick a console slot.</small></div></div>
                  
                  <div className="form-grid">
                    <label className="gn-field">
                      <span>GAMING SETUP <b>*</b></span>
                      <BookingSelect
                        id="booking-experience"
                        ariaLabel="Experience"
                        value={selectedExperience}
                        onValueChange={(value) => setSelectedExperience(normalizeBookingExperience(value))}
                        placeholder="Select an experience"
                        options={EXPERIENCES.map((experience) => ({ value: experience, label: INVENTORY[experience].label }))}
                      />
                    </label>

                    <label>
                      <span>PREFERRED DATE <b>*</b></span>
                      <input
                        name="date"
                        type="date"
                        min={today}
                        value={bookingDate}
                        onChange={(event) => setBookingDate(event.target.value)}
                        required
                      />
                    </label>
                  </div>

                  {/* Interactive Console & Time Slot Availability Grid */}
                  {selectedExperience && bookingDate && (
                    <ConsoleSlotGrid
                      experience={selectedExperience}
                      date={bookingDate}
                      selectedConsoleId={selectedConsoleId}
                      selectedStartTime={startTime}
                      selectedEndTime={endTime}
                      onSelectSlot={handleSlotSelectFromGrid}
                    />
                  )}

                  {/* Selected Slot Time Details & Player Count */}
                  <div className="form-subgroup">
                    <span className="form-subgroup-label">SELECTED TIME &amp; PARTY SIZE</span>
                    <div className="form-grid form-grid-three">
                      <label className="gn-field">
                        <span>CONSOLE <b>*</b></span>
                        <BookingSelect
                          id="booking-console-id"
                          ariaLabel="Console ID"
                          value={selectedConsoleId}
                          onValueChange={(val) => setSelectedConsoleId(val as ConsoleId)}
                          disabled={!selectedExperience}
                          placeholder="Select console"
                          options={selectedExperience ? getConsolesForExperience(selectedExperience).map((c) => ({ value: c.id, label: c.label })) : []}
                        />
                      </label>
                      
                      <label className="gn-field">
                        <span>START TIME <b>*</b></span>
                        <BookingSelect
                          id="booking-start-time"
                          ariaLabel="Start time"
                          value={startTime}
                          onValueChange={setStartTime}
                          placeholder="Select start time"
                          options={startSlots}
                        />
                      </label>

                      <label className="gn-field">
                        <span>END TIME <b>*</b></span>
                        <BookingSelect
                          id="booking-end-time"
                          ariaLabel="End time"
                          value={endTime}
                          onValueChange={setEndTime}
                          disabled={!startTime}
                          placeholder={startTime ? "Select end time" : "Pick start time first"}
                          options={endSlots}
                        />
                      </label>
                    </div>

                    <div className="mt-3">
                      <label className="gn-field">
                        <span>NUMBER OF PLAYERS <b>*</b></span>
                        <BookingSelect
                          id="booking-players"
                          ariaLabel="Number of players"
                          value={selectedExperience ? String(players) : ""}
                          onValueChange={(value) => setPlayers(Number(value))}
                          disabled={!selectedExperience}
                          placeholder={selectedExperience ? "Select players" : "Choose an experience first"}
                          options={playerOptions.map((count) => ({ value: String(count), label: `${count} ${count > 1 ? "players" : "player"}` }))}
                        />
                      </label>
                    </div>

                    <input type="hidden" name="experience" value={selectedExperience} />
                    <input type="hidden" name="consoleId" value={selectedConsoleId} />
                    <input type="hidden" name="players" value={players} />
                    <input type="hidden" name="startTime" value={startTime} />
                    <input type="hidden" name="endTime" value={endTime} />
                  </div>

                  {/* Shared Session Warning Card & Mandatory Acknowledgement Checkbox */}
                  {isSharedSession && activeSessionGame && (
                    <div className="p-4 rounded-xl border border-amber-500/50 bg-amber-950/30 text-amber-200 text-xs space-y-3 font-mono my-4 shadow-xl">
                      <div className="flex items-center space-x-2 font-bold text-amber-400 text-sm">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-400" />
                        <span>⚠️ Shared Gaming Session</span>
                      </div>
                      <p className="leading-relaxed">
                        This console ({selectedConsoleId}) already has players booked for this time slot.
                        By booking the remaining seats, you will join the existing gaming session and play the same game.
                      </p>
                      <div className="p-3 bg-slate-900/90 rounded-lg border border-amber-500/30 space-y-1 text-slate-200">
                        <div><strong>Console:</strong> <span className="text-white">{selectedConsoleId}</span></div>
                        <div><strong>Current Game:</strong> <span className="text-[#00f2fe] font-bold">🎮 {activeSessionGame}</span></div>
                        <div><strong>Time Slot:</strong> {formatTime12h(startTime)} – {formatTime12h(endTime)}</div>
                      </div>
                      <label className="flex items-start space-x-2.5 cursor-pointer pt-2 text-white font-sans text-xs">
                        <input
                          type="checkbox"
                          checked={isSharedSessionConfirmed}
                          onChange={(e) => setIsSharedSessionConfirmed(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-amber-500 text-[#00f2fe] focus:ring-[#00f2fe] cursor-pointer"
                          required
                        />
                        <span className="font-semibold">I understand that I will join the existing session and play the same game.</span>
                      </label>
                    </div>
                  )}

                  {/* Price Calculation Card */}
                  {selectedExperience && startTime && endTime && calculatedPrice > 0 && (
                    <div className="p-4 rounded-xl border border-[#c4ff3d]/40 bg-[#c4ff3d]/10 flex items-center justify-between my-4 font-mono shadow-lg">
                      <div>
                        <span className="text-[#c4ff3d] font-bold uppercase tracking-wider block text-[10px]">TOTAL CALCULATED PRICE</span>
                        <span className="text-slate-300 text-xs">
                          {selectedConsoleId || selectedExperience} · {players} player(s) · {formatTime12h(startTime)} - {formatTime12h(endTime)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-white font-display">₹{calculatedPrice}</span>
                      </div>
                    </div>
                  )}

                  <p className="form-hint">Open daily 11:00 AM – 11:00 PM. Please book within store hours.</p>
                  {startTime && endTime && !timeRangeValid && (
                    <p className="availability-status availability-invalid" role="alert">End time must be later than start time.</p>
                  )}
                  {startTime && endTime && timeRangeValid && !withinStoreHours && (
                    <p className="availability-status availability-invalid" role="alert">Bookings are only available between 11:00 AM and 11:00 PM.</p>
                  )}
                  {canCheck && checkingAvailability && !availability && (
                    <p className="availability-status" role="status" aria-live="polite"><span className="availability-badge">CHECKING</span>Checking availability…</p>
                  )}
                  {availability && canCheck && (
                    <p className={`availability-status ${availability.available ? "availability-ok" : "availability-blocked"}`} role="status" aria-live="polite">
                      <span className="availability-badge">{availability.available ? "AVAILABLE" : "NOT AVAILABLE"}</span>
                      {availability.message}
                    </p>
                  )}
                  {bookingError && (
                    <p className="availability-status availability-invalid" role="alert">{bookingError}</p>
                  )}
                </div>

                <div className="form-section">
                  <div className="form-section-header"><span className="form-step">03</span><div><strong>GAME PREFERENCE</strong><small>Choose your title (fixed if joining shared session).</small></div></div>
                  <div className="form-grid">
                    <label className="form-wide gn-field">
                      <span>GAME TITLE {isSharedSession ? " (LOCKED FOR SHARED SESSION)" : " (OPTIONAL)"}</span>
                      <BookingSelect
                        id="booking-game"
                        ariaLabel="Game preference"
                        value={selectedGame}
                        onValueChange={setSelectedGame}
                        disabled={Boolean(isSharedSession && activeSessionGame)}
                        placeholder={isSharedSession && activeSessionGame ? `Locked to ${activeSessionGame}` : "Select a game (optional)"}
                        options={PLAYABLE_GAME_TITLES.map((title) => ({ value: title, label: title }))}
                      />
                    </label>
                    <label className="form-wide"><span>MESSAGE <i>OPTIONAL</i></span><textarea name="message" rows={3} placeholder="Anything we should know?" /></label>
                  </div>
                </div>

                <div className="form-footer">
                  <p><b>*</b> Required fields. Sending a request does not automatically confirm a slot.</p>
                  <button
                    className="button button-primary"
                    type="submit"
                    disabled={!canSubmitBooking}
                    aria-disabled={!canSubmitBooking}
                  >
                    {submitting ? "SENDING…" : "REQUEST BOOKING"} <ArrowUpRight size={17} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        <section id="location" className="location-section section-pad shell-width"><div className="location-photo photo-frame"><img src={photos.location} alt="Exterior location photo for Gamers Nest in Ayappakkam" loading="lazy" /><span className="photo-tag">FIND THE NEST / 01</span></div><div className="location-copy"><SectionLabel eyebrow="AYAPPAKKAM / CHENNAI" title="FIND THE NEST" copy="Your gaming zone in Ayappakkam." /><div className="address-block"><strong>GAMERS NEST</strong><span>E-Gaming Lounge</span><p>Shop No. 2, First Floor,<br />MIG No. 2165,<br />TNHB, 4th Main Road,<br />Ayappakkam,<br />Chennai – 600077</p></div><div className="contact-rows"><a href={phoneTel}><Phone size={16} /> +91 91595 88666</a><a href="mailto:gamersnest.chennai@gmail.com"><ArrowUpRight size={16} /> gamersnest.chennai@gmail.com</a><span><Clock3 size={16} /> 11:00 AM – 11:00 PM</span></div><div className="location-actions"><a href={directionsLink} target="_blank" rel="noreferrer" className="button button-primary">GET DIRECTIONS <ArrowUpRight size={16} /></a><a href={phoneTel} className="button button-ghost">CALL NOW <Phone size={16} /></a><a href={whatsappLink} target="_blank" rel="noreferrer" className="button button-ghost">WHATSAPP <MessageCircle size={16} /></a></div></div></section>

        <section className="instagram-section section-pad shell-width"><div><span className="eyebrow"><span className="eyebrow-dot" /> SOCIAL / @GAMERSNEST.CHENNAI</span><h2>FOLLOW<br /><span>THE NEST.</span></h2><p>Gaming nights. New games. New challenges.</p></div><a href="https://www.instagram.com/gamersnest.chennai/" target="_blank" rel="noreferrer" className="instagram-link"><Instagram size={26} /><span>FOLLOW ON INSTAGRAM</span><ArrowUpRight size={18} /></a></section>
      </main>

      <footer className="site-footer"><div className="shell-width footer-top"><div className="footer-brand"><a href="#home" className="brand-lockup"><img src={logoMark} alt="" className="brand-mark" /><span className="brand-wordmark"><strong>GAMERS</strong><em>NEST</em></span></a><p>Premium E-Gaming Lounge<br />Ayappakkam, Chennai</p></div><div className="footer-col"><span className="footer-label">EXPLORE</span><a href="#experiences">Experiences</a><a href="#games">Games</a><a href="#pricing">Pricing</a><a href="#gallery">Gallery</a></div><div className="footer-col"><span className="footer-label">CONNECT</span><a href="#reviews">Reviews</a><a href="#location">Location</a><a href="#book">Book Now</a><a href="https://www.instagram.com/gamersnest.chennai/" target="_blank" rel="noreferrer">Instagram</a></div><div className="footer-col footer-contact"><span className="footer-label">CONTACT</span><a href={phoneTel}>+91 91595 88666</a><a href="mailto:gamersnest.chennai@gmail.com">gamersnest.chennai@gmail.com</a><span>11:00 AM – 11:00 PM</span></div></div><div className="shell-width footer-bottom"><span>© {new Date().getFullYear()} GAMERS NEST</span><span>PREMIUM E-GAMING LOUNGE / AYAPPAKKAM</span><button onClick={() => scrollToId("book")}>READY TO PLAY? <ArrowUpRight size={15} /></button></div></footer>

      <a className="floating-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Chat with Gamers Nest on WhatsApp"><MessageCircle size={21} /></a>
      <div className="mobile-bottom-bar"><button onClick={() => chooseExperience("")}><CalendarDays size={16} /> BOOK NOW</button><a href={whatsappLink} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WHATSAPP</a><a href={phoneTel}><Phone size={16} /> CALL</a></div>

      {selectedGallery !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setSelectedGallery(null)}><button className="lightbox-close" onClick={() => setSelectedGallery(null)} aria-label="Close photo viewer"><X /></button><button className="lightbox-nav lightbox-prev" onClick={(event) => { event.stopPropagation(); setSelectedGallery((selectedGallery - 1 + galleryItems.length) % galleryItems.length); }} aria-label="Previous photo"><ChevronLeft /></button><img src={galleryItems[selectedGallery].src} alt={galleryItems[selectedGallery].alt} onClick={(event) => event.stopPropagation()} /><button className="lightbox-nav lightbox-next" onClick={(event) => { event.stopPropagation(); setSelectedGallery((selectedGallery + 1) % galleryItems.length); }} aria-label="Next photo"><ChevronRight /></button><span className="lightbox-count">0{selectedGallery + 1} / 0{galleryItems.length}</span></div>}
    </div>
  );
}
