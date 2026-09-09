import { ArrowUpRight, Gamepad2, MapPin, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

const whatsappLink =
  "https://wa.me/919159588666?text=Hi%20Gamers%20Nest!%20I%20would%20like%20to%20enquire%20about%20a%20gaming%20session.";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <main className="notfound-shell">
      <div className="notfound-orb notfound-orb-cyan" aria-hidden="true" />
      <div className="notfound-orb notfound-orb-lime" aria-hidden="true" />

      <section className="notfound-content">
        <span className="eyebrow">
          <span className="eyebrow-dot" /> GAMERS NEST / AYAPPAKKAM
        </span>

        <p className="notfound-code" aria-hidden="true">404</p>
        <h1 className="notfound-title">THIS LEVEL DOESN'T EXIST.</h1>
        <p className="notfound-copy">
          The page you were looking for was moved or never made it out of the
          lobby. Head back and pick your game.
        </p>

        <div className="notfound-actions">
          <button className="button button-primary" onClick={() => setLocation("/")}>
            BACK TO THE NEST <Gamepad2 size={16} />
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="button button-ghost"
          >
            ASK US ON WHATSAPP <MessageCircle size={16} />
          </a>
        </div>

        <p className="notfound-meta">
          <MapPin size={13} /> Ayappakkam, Chennai
          <span className="notfound-dot" aria-hidden="true" />
          11:00 AM – 11:00 PM
          <ArrowUpRight size={13} className="notfound-meta-arrow" aria-hidden="true" />
        </p>
      </section>
    </main>
  );
}
