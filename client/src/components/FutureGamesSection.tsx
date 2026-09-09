import React from "react";
import { Lock, MessageCircle, Hourglass, ArrowRight, Sparkles } from "lucide-react";
import {
  FUTURE_GAMES,
  type FutureGame,
  getFutureGameWhatsAppLink,
  getSuggestGameWhatsAppLink,
} from "@/lib/games-data";

interface FutureGamesSectionProps {
  activeCategory?: string;
}

export const FutureGamesSection: React.FC<FutureGamesSectionProps> = ({ activeCategory = "ALL" }) => {
  const filteredGames = React.useMemo(() => {
    if (!activeCategory || activeCategory === "ALL") return FUTURE_GAMES;
    return FUTURE_GAMES.filter((game) => game.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="mt-16 sm:mt-20 border-t border-slate-800/80 pt-12 relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#00f2fe]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Exploration Trajectory Bridge: AVAILABLE NOW -> COMING TO THE NEST */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-[#0b1016]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl">
        <div className="flex items-center space-x-3 text-xs font-mono tracking-wider">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c4ff3d] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c4ff3d]" />
          </span>
          <span className="text-slate-400 font-bold uppercase">AVAILABLE NOW</span>
          <div className="hidden md:flex items-center space-x-1 text-[#00f2fe]/60">
            <span className="w-8 border-b border-dashed border-[#00f2fe]/40" />
            <ArrowRight className="h-3.5 w-3.5 text-[#00f2fe] animate-pulse" />
          </div>
          <span className="text-[#00f2fe] font-bold uppercase">EXPLORING UPCOMING TITLES</span>
        </div>

        {/* Character exploration quote */}
        <div className="flex items-center space-x-2 text-center sm:text-right">
          <Sparkles className="h-4 w-4 text-[#c4ff3d] animate-bounce shrink-0" />
          <p className="text-xs sm:text-sm font-semibold text-slate-200">
            <span className="text-[#c4ff3d] font-display uppercase font-bold">&ldquo;MORE GAMES. MORE MEMORIES.&rdquo;</span>
            <span className="text-slate-400 block sm:inline sm:ml-2 text-[11px] font-mono">&mdash; COMING SOON TO GAMERSNEST &mdash;</span>
          </p>
        </div>
      </div>

      {/* Header Row for Future Games */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#c4ff3d]/10 border border-[#c4ff3d]/30 text-[#c4ff3d] text-xs font-mono font-bold tracking-widest uppercase mb-2">
            <Hourglass className="h-3.5 w-3.5 animate-spin-slow text-[#c4ff3d]" />
            <span>COMING TO THE NEST</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase font-display">
            UPCOMING &amp; <span className="text-[#00f2fe]">FUTURE GAMES</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Get an exclusive sneak peek at upcoming game releases planned for our PS5, steering simulator, and VR setups.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-800 self-start md:self-auto">
          🔒 NOT YET PLAYABLE &bull; REGISTER FOR NOTIFICATIONS
        </span>
      </div>

      {/* Future Games Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGames.map((game: FutureGame) => (
            <article
              key={game.id}
              className="group relative bg-[#090e13] border border-slate-800/90 rounded-2xl overflow-hidden hover:border-[#00f2fe]/60 transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-[0_0_30px_rgba(0,242,254,0.18)] flex flex-col justify-between"
            >
              {/* Top Media Container */}
              <div className="relative aspect-[16/11] overflow-hidden bg-slate-950">
                {/* Desaturated Image with Hover Brighten Effect */}
                <img
                  src={game.photo}
                  alt={`${game.title} artwork coming to GamersNest`}
                  loading="lazy"
                  className="w-full h-full object-cover filter grayscale-[45%] brightness-[65%] contrast-[95%] group-hover:filter-none group-hover:scale-105 transition-all duration-500"
                />

                {/* Gradient Overlay for Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090e13] via-[#090e13]/50 to-transparent" />

                {/* Status Pill Badge (Top Left) */}
                <div className="absolute top-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#000000]/80 backdrop-blur-md border border-[#00f2fe]/40 text-[#00f2fe] text-[10px] font-mono font-bold tracking-wider uppercase shadow-md">
                  <Lock className="h-3 w-3 text-[#c4ff3d]" />
                  <span>{game.status}</span>
                </div>

                {/* Optional Tag (Top Right) */}
                {game.badgeText && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-[#c4ff3d]/20 border border-[#c4ff3d]/40 text-[#c4ff3d] text-[9px] font-mono font-bold tracking-wider uppercase">
                    {game.badgeText}
                  </div>
                )}

                {/* Centered Glowing Lock Icon */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-[#000000]/70 backdrop-blur-md border border-[#00f2fe]/50 flex items-center justify-center text-[#c4ff3d] shadow-[0_0_20px_rgba(0,242,254,0.4)] group-hover:scale-110 group-hover:border-[#c4ff3d] group-hover:shadow-[0_0_30px_rgba(196,255,61,0.6)] transition-all duration-300">
                    <Lock className="h-6 w-6 text-[#c4ff3d] group-hover:animate-bounce" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span className="text-[#00f2fe] font-bold uppercase">{game.genre}</span>
                    <span className="text-slate-400 font-medium">{game.expectedDate}</span>
                  </div>

                  <h4 className="text-lg font-black text-white uppercase font-display tracking-wide group-hover:text-[#c4ff3d] transition-colors">
                    {game.title}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {game.description || "Coming soon to the GamersNest lounge. Stay tuned for release and booking updates."}
                  </p>
                </div>

                {/* WhatsApp Notification CTA Button */}
                <a
                  href={getFutureGameWhatsAppLink(game.title)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-slate-900 to-slate-900/90 hover:from-[#00f2fe]/20 hover:to-[#c4ff3d]/20 border border-slate-700 group-hover:border-[#00f2fe]/60 rounded-xl text-xs font-mono font-bold text-slate-200 group-hover:text-white flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
                  aria-label={`Get notified on WhatsApp when ${game.title} is available`}
                >
                  <MessageCircle className="h-4 w-4 text-[#00f2fe] group-hover:text-[#c4ff3d] transition-colors" />
                  <span>GET NOTIFIED</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-[#090e13] border border-slate-800 rounded-2xl">
          <p className="text-sm font-mono text-slate-400">No upcoming games found for this category filter.</p>
        </div>
      )}

      {/* Suggest A Game Footer Banner */}
      <div className="mt-10 bg-gradient-to-r from-[#0c1218] via-[#0e1720] to-[#0c1218] border border-slate-800/90 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe] shrink-0">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h5 className="text-sm font-extrabold text-white uppercase font-display">WANT A GAME THAT IS NOT HERE?</h5>
            <p className="text-xs text-slate-400">Suggest your favourite titles on WhatsApp &amp; we&apos;ll consider adding them to the lounge!</p>
          </div>
        </div>

        <a
          href={getSuggestGameWhatsAppLink()}
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 bg-[#c4ff3d] hover:bg-[#b0f020] text-black font-extrabold text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg shadow-[#c4ff3d]/15 flex items-center space-x-2 transition-all shrink-0 cursor-pointer"
        >
          <span>SUGGEST A GAME</span>
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};
