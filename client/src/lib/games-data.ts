/**
 * GamersNest — Game library (single source of truth).
 *
 * `PLAYABLE_GAMES` is the authoritative list of games currently available at
 * the lounge. It drives BOTH the Games section carousel and the booking form's
 * Game-preference field, so the two never drift apart.
 *
 * `FUTURE_GAMES` are announced-but-not-yet-playable titles shown in the
 * COMING TO THE NEST section. They are intentionally NOT bookable and are kept
 * out of the booking form's game select.
 *
 * Categories are constrained to the set the Games section filter supports.
 * The list is shaped to be admin-manageable later (name/image/category/status
 * per game) without changing consumers.
 */

export type GameCategory =
  | "ALL"
  | "SPORTS"
  | "FIGHTING"
  | "OPEN WORLD"
  | "ACTION"
  | "RACING"
  | "VR";

export interface Game {
  id: string;
  title: string;
  genre: string;
  category: Exclude<GameCategory, "ALL">;
  photo: string;
  isPopular?: boolean;
}

export interface FutureGame {
  id: string;
  title: string;
  genre: string;
  category: Exclude<GameCategory, "ALL">;
  photo: string;
  /** Free-form availability label. Use "TBA" when no date is known. */
  expectedDate: string;
  status: "COMING SOON" | "ANNOUNCED" | "IN DEVELOPMENT";
  badgeText?: string;
  description?: string;
}

const IMG = (file: string) => `/images/games/${file}`;

/**
 * The ONLY currently-available games (client authoritative list, 36 titles).
 * Order preserved from the client's list. `genre` is the display label; the
 * `category` union powers the Games section filter.
 */
export const PLAYABLE_GAMES: Game[] = [
  { id: "gta-5", title: "GTA 5", genre: "OPEN WORLD", category: "OPEN WORLD", photo: IMG("grand-theft-auto-v.webp"), isPopular: true },
  { id: "wwe-2k26", title: "WWE 2K26", genre: "SPORTS", category: "SPORTS", photo: IMG("wwe-2k26.jpg") },
  { id: "wwe-2k25", title: "WWE 2K25", genre: "SPORTS", category: "SPORTS", photo: IMG("wwe-2k25.webp") },
  { id: "fc-26", title: "FC 26", genre: "SPORTS", category: "SPORTS", photo: IMG("fc-26.jpg"), isPopular: true },
  { id: "black-myth-wukong", title: "Black Myth: Wukong", genre: "ACTION RPG", category: "ACTION", photo: IMG("black-myth-wukong.jpg"), isPopular: true },
  { id: "mortal-kombat-1", title: "Mortal Kombat 1", genre: "FIGHTING", category: "FIGHTING", photo: IMG("mortal-kombat-1.webp"), isPopular: true },
  { id: "mortal-kombat-11", title: "Mortal Kombat 11", genre: "FIGHTING", category: "FIGHTING", photo: IMG("mortal-kombat-11.jpg") },
  { id: "need-for-speed", title: "Need for Speed", genre: "RACING", category: "RACING", photo: IMG("need-for-speed.jpg") },
  { id: "spider-man-1", title: "Spider-Man 1", genre: "ACTION", category: "ACTION", photo: IMG("spider-man-1.jpg"), isPopular: true },
  { id: "spider-man-2", title: "Spider-Man 2", genre: "ACTION", category: "ACTION", photo: IMG("spider-man-2.jpg") },
  { id: "god-of-war", title: "God of War", genre: "ACTION", category: "ACTION", photo: IMG("god-of-war.webp"), isPopular: true },
  { id: "mafia-1", title: "Mafia 1", genre: "ACTION", category: "ACTION", photo: IMG("mafia-1.jpg") },
  { id: "mafia-2", title: "Mafia 2", genre: "ACTION", category: "ACTION", photo: IMG("mafia-2.jpg") },
  { id: "mafia-3", title: "Mafia 3", genre: "ACTION", category: "ACTION", photo: IMG("mafia-3.jpg") },
  { id: "the-last-of-us-1", title: "The Last of Us 1", genre: "ACTION", category: "ACTION", photo: IMG("the-last-of-us-1.jpg") },
  { id: "the-last-of-us-2", title: "The Last of Us 2", genre: "ACTION", category: "ACTION", photo: IMG("the-last-of-us-2.jpg") },
  { id: "resident-evil-2", title: "Resident Evil 2", genre: "SURVIVAL HORROR", category: "ACTION", photo: IMG("resident-evil-2.jpg") },
  { id: "resident-evil-3", title: "Resident Evil 3", genre: "SURVIVAL HORROR", category: "ACTION", photo: IMG("resident-evil-3.jpg") },
  { id: "resident-evil-4", title: "Resident Evil 4", genre: "SURVIVAL HORROR", category: "ACTION", photo: IMG("resident-evil-4.jpg") },
  { id: "resident-evil-4-remake", title: "Resident Evil 4 Remake", genre: "SURVIVAL HORROR", category: "ACTION", photo: IMG("resident-evil-4-remake.jpg") },
  { id: "resident-evil-5", title: "Resident Evil 5", genre: "SURVIVAL HORROR", category: "ACTION", photo: IMG("resident-evil-5.jpg") },
  { id: "resident-evil-6", title: "Resident Evil 6", genre: "SURVIVAL HORROR", category: "ACTION", photo: IMG("resident-evil-6.jpg") },
  { id: "resident-evil-9", title: "Resident Evil 9", genre: "SURVIVAL HORROR", category: "ACTION", photo: IMG("resident-evil-9.jpg") },
  { id: "batman", title: "Batman", genre: "ACTION", category: "ACTION", photo: IMG("batman.jpg") },
  { id: "a-way-out", title: "A Way Out", genre: "CO-OP ADVENTURE", category: "ACTION", photo: IMG("a-way-out.jpg") },
  { id: "gran-turismo", title: "Gran Turismo", genre: "RACING", category: "RACING", photo: IMG("gran-turismo.jpg") },
  { id: "far-cry-3", title: "Far Cry 3", genre: "ACTION", category: "ACTION", photo: IMG("far-cry-3.jpg") },
  { id: "it-takes-two", title: "It Takes Two", genre: "CO-OP ADVENTURE", category: "ACTION", photo: IMG("it-takes-two.jpg") },
  { id: "days-gone", title: "Days Gone", genre: "ACTION", category: "ACTION", photo: IMG("days-gone.jpg") },
  { id: "asphalt", title: "Asphalt", genre: "RACING", category: "RACING", photo: IMG("asphalt.jpg") },
  { id: "tomb-raider", title: "Tomb Raider", genre: "ACTION ADVENTURE", category: "ACTION", photo: IMG("tomb-raider.jpg") },
  { id: "injustice-2", title: "Injustice 2", genre: "FIGHTING", category: "FIGHTING", photo: IMG("injustice-2.jpg") },
  { id: "the-witcher-3", title: "The Witcher 3", genre: "OPEN WORLD RPG", category: "OPEN WORLD", photo: IMG("the-witcher-3.jpg"), isPopular: true },
  { id: "red-dead-redemption-2", title: "Red Dead Redemption 2", genre: "OPEN WORLD", category: "OPEN WORLD", photo: IMG("red-dead-redemption-2.webp"), isPopular: true },
  { id: "ghost-of-tsushima", title: "Ghost of Tsushima", genre: "OPEN WORLD", category: "OPEN WORLD", photo: IMG("ghost-of-tsushima.jpg") },
  { id: "cricket-24", title: "Cricket 24", genre: "SPORTS", category: "SPORTS", photo: IMG("cricket-24.jpg") },
];

/**
 * The ONLY future/announced games. Not bookable — kept out of the game select.
 * Use "TBA" where no release window is known (do not invent dates).
 */
export const FUTURE_GAMES: FutureGame[] = [
  {
    id: "gta-vi",
    title: "GTA VI",
    genre: "OPEN WORLD",
    category: "OPEN WORLD",
    photo: IMG("gta-vi.jpg"),
    expectedDate: "TBA",
    status: "COMING SOON",
    badgeText: "MOST ANTICIPATED",
    description: "The next generation of open-world gaming is headed to the Nest.",
  },
  {
    id: "marvel-wolverine",
    title: "Wolverine",
    genre: "ACTION",
    category: "ACTION",
    photo: IMG("wolverine.jpg"),
    expectedDate: "TBA",
    status: "COMING SOON",
    badgeText: "PS5 EXCLUSIVE",
    description: "Raw, brutal action from Marvel's Wolverine — coming soon to our PS5 lounge.",
  },
  {
    id: "fc-27",
    title: "FC 27",
    genre: "SPORTS",
    category: "SPORTS",
    photo: IMG("fc-27.jpg"),
    expectedDate: "TBA",
    status: "COMING SOON",
    description: "The world's game returns for another season. Squad up when it lands.",
  },
];

/** Titles available for booking — shared with the booking form's Game field. */
export const PLAYABLE_GAME_TITLES: string[] = PLAYABLE_GAMES.map((game) => game.title);

export function getFutureGameWhatsAppLink(gameTitle: string): string {
  const message = `Hi GamersNest! Please notify me when ${gameTitle} arrives at the lounge so I can book a slot! 🎮🔒`;
  return `https://wa.me/919159588666?text=${encodeURIComponent(message)}`;
}

export function getSuggestGameWhatsAppLink(): string {
  const message = `Hi GamersNest! I would like to suggest adding a game to your library: `;
  return `https://wa.me/919159588666?text=${encodeURIComponent(message)}`;
}
