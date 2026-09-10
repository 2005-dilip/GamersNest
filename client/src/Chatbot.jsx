import { useState, useRef, useEffect } from "react";
import { Gamepad2, Send, X, Sparkles, RefreshCw, ExternalLink, Bot, User, Paperclip, ChevronRight, Calendar, Tag, MapPin } from "lucide-react";

const GAMERSNEST_SYSTEM_PROMPT = {
  role: "system",
  content: `You are the official AI Assistant for GamersNest - Chennai's premier gaming lounge and console store.
Your goal is to assist gamers with exact pricing, console availability, booking details, game inventory, and store location in a friendly, enthusiastic gamer tone.

Official GamersNest Information:
- Location: Shop No. 2, First Floor, MIG No. 2165, TNHB, 4th Main Road, Ayappakkam, Chennai 600077.
- Contact Phone / WhatsApp: +91 9159588666
- Operating Hours: 11:00 AM – 11:00 PM Daily
- Operating Consoles:
  • 3 x PS5 Consoles (PS5 #1, PS5 #2, PS5 #3) - up to 4 players per console (12 total seats)
  • 1 x PS4 Console (PS4 #1) - up to 4 players
  • 1 x Steering Simulator / Racing Rig
  • 1 x PS2 Retro gaming setup
  • 1 x VR Gaming setup

Official Pricing Matrix (ALWAYS USE THESE EXACT RATES FROM OUR STORE CARDS):
- PS5 Gaming:
  • Single Player (1 player): ₹100 / hour
  • Multiplayer (2 to 4 players): ₹90 / player / hour
- PS4 Gaming:
  • Single Player (1 player): ₹100 / hour
  • Multiplayer (2 to 4 players): ₹90 / player / hour
- PS2 Retro Gaming:
  • Single Player (1 player): ₹80 / hour
  • Multiplayer: ₹70 / player / hour
- Steering Simulator (Racing Rig):
  • Single Player (1 player only): ₹150 / hour
- VR Gaming:
  • Single Player (1 player only): ₹100 / 30 minutes (Which equals ₹200 / 1 hour!)

Calculation Rule for VR Gaming:
If a user asks for VR Gaming for 30 minutes, it is ₹100.
If a user asks for VR Gaming for 1 hour (60 minutes), calculate 2 x ₹100 = ₹200 for 1 hour.

Official Game Inventory (SINGLE SOURCE OF TRUTH - STRICTLY ANSWER FROM THIS LIST ALONE):
• Total Currently Playable Games (36 Titles):
  1. GTA 5
  2. WWE 2K26
  3. WWE 2K25
  4. FC 26
  5. Black Myth: Wukong
  6. Mortal Kombat 1
  7. Mortal Kombat 11
  8. Need for Speed
  9. Spider-Man 1
  10. Spider-Man 2
  11. God of War
  12. Mafia 1
  13. Mafia 2
  14. Mafia 3
  15. The Last of Us 1
  16. The Last of Us 2
  17. Resident Evil 2
  18. Resident Evil 3
  19. Resident Evil 4
  20. Resident Evil 4 Remake
  21. Resident Evil 5
  22. Resident Evil 6
  23. Resident Evil 9
  24. Batman
  25. A Way Out
  26. Gran Turismo
  27. Far Cry 3
  28. It Takes Two
  29. Days Gone
  30. Asphalt
  31. Tomb Raider
  32. Injustice 2
  33. The Witcher 3
  34. Red Dead Redemption 2
  35. Ghost of Tsushima
  36. Cricket 24

• Official Future / Upcoming Games (3 Titles Announced - Coming Soon):
  1. GTA VI (Most Anticipated Open World)
  2. Wolverine (PS5 Exclusive Action)
  3. FC 27 (Sports)

STRICT RULE FOR GAME INQUIRIES:
When users ask how many games GamersNest offers or ask about game availability:
- Always state that GamersNest offers 36 currently playable games across PS5, PS4, PS2, VR, and Steering Rig, plus 3 announced future games (GTA VI, Wolverine, FC 27).
- Answer game questions STRICTLY and ONLY from this list above. Do NOT invent, assume, or hallucinate titles outside this official list.

STRICT RULE FOR TOURNAMENTS & ESPORTS EVENTS:
When users ask about tournaments, esports cups, local competitions, or cash prize events at GamersNest:
- State with HIGH ENTHUSIASM and hype that GamersNest Esports local tournaments (featuring EA FC 25, Mortal Kombat 1, Tekken 8, Cash Prizes & Trophies) are COMING SOON!
- Explain that the GamersNest Esports Cup is currently announcing soon and the waiting list is open!
- Encourage them to stay tuned and join the waiting list on WhatsApp to get notified when tournament dates drop.

STRICT RULE FOR SHARED SESSIONS (JOINING EXISTING BOOKED SLOTS):
- When a gamer books remaining seats on a console slot that already has active players booked (shared session), they join the existing session and play the same game currently active on that screen.
- In this case, the website displays a mandatory agreement box ("I understand that I will join the existing session and play the same game") that must be checked before submitting.

CRITICAL FORMATTING INSTRUCTIONS FOR MOBILE DISPLAY:
- DO NOT output Markdown tables (e.g. |---|---|). Markdown tables look clumsy and broken on mobile screens.
- ALWAYS use clean bullet points with bold headers (e.g. • **Single Player (1 player)**: ₹100 / hour).
- Keep lists concise, mobile-scannable, and clean.

IMPORTANT ROUTE / LINKING INSTRUCTIONS:
Always include the relevant Markdown action button at the end of your response to help the user navigate immediately:
- For booking/appointments: include [📅 Book Session Now](#book)
- For pricing/rates: include [💰 View Full Pricing Table](#pricing)
- For games list: include [🎮 Browse Games Catalog](#games)
- For tournaments: include [🏆 View Esports Tournaments](#tournaments) and [💬 Join Waiting List on WhatsApp](https://wa.me/919159588666?text=Hi%20GamersNest!%20I%20want%20to%20join%20the%20tournament%20waiting%20list!%20🏆)
- For location/address/hours: include [📍 View Store Location](#location) and [💬 Chat on WhatsApp](https://wa.me/919159588666)
- For consoles setup: include [🕹️ View Gaming Setup](#experiences)
- Do NOT mention or share any admin portal, admin login, staff URLs, or backend links under any circumstances.

Keep responses helpful, precise, concise, and formatted with friendly gaming vibes!`
};

const BOT_SPEAKING_PHRASES = [
  "Book a Session 📅",
  "PS5 & VR Rates 💰",
  "Live Console Slots 🕹️",
  "Ask GamersNest AI 💬"
];

// Active Groq models in fallback order
const GROQ_MODELS = [
  "qwen/qwen3.8-27b",
  "groq/compound",
  "openai/gpt-oss-120b",
  "llama-3.3-70b-versatile"
];

function parseInlineMarkdown(text) {
  if (!text) return "";

  // 1. Normalize all 3+ asterisks to **
  let s = text.replace(/\*{3,}/g, "**");

  // 2. Fix mismatched boundary asterisks: '*Text**' -> '**Text**', '**Text*' -> '**Text**'
  s = s.replace(/(^|\s|\()\*\s*([^*]+)\*\*/g, "$1**$2**");
  s = s.replace(/(^|\s|\()\*\*([^*]+)\*(?!\*)/g, "$1**$2**");

  // 3. Extract valid paired **bold** text blocks
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const tokens = [];
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(s)) !== null) {
    // Add text before match (strip any remaining stray asterisks from plain text)
    if (match.index > lastIndex) {
      const plainText = s.slice(lastIndex, match.index).replace(/\*/g, "");
      if (plainText) tokens.push(plainText);
    }
    // Add bold token
    const boldContent = match[1].replace(/\*/g, "");
    if (boldContent) {
      tokens.push({ bold: true, content: boldContent });
    }
    lastIndex = boldRegex.lastIndex;
  }

  // Add remaining trailing text (strip any remaining stray asterisks)
  if (lastIndex < s.length) {
    const trailingText = s.slice(lastIndex).replace(/\*/g, "");
    if (trailingText) tokens.push(trailingText);
  }

  // 4. Render tokens as React elements
  return tokens.map((token, idx) => {
    if (typeof token === "object" && token.bold) {
      return (
        <strong key={idx} style={{ color: "#00f2fe", fontWeight: 700 }}>
          {token.content}
        </strong>
      );
    }
    return token;
  });
}

function FormattedMessage({ content, prevUserMsg, onActionClick }) {
  const links = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  // 1. Extract explicit markdown links
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({ text: match[1], url: match[2] });
  }

  // 2. Automatic safety net for key intents
  const combined = (content + " " + (prevUserMsg || "")).toLowerCase();
  if (combined.includes("book") || combined.includes("slot") || combined.includes("reserve") || combined.includes("appointment")) {
    links.push({ text: "📅 Book Session Now", url: "#book" });
  }
  if (combined.includes("price") || combined.includes("cost") || combined.includes("rate") || combined.includes("tariff") || combined.includes("rupee") || combined.includes("₹")) {
    links.push({ text: "💰 View Pricing Table", url: "#pricing" });
  }
  if (combined.includes("location") || combined.includes("address") || combined.includes("where") || combined.includes("contact") || combined.includes("whatsapp") || combined.includes("phone")) {
    links.push({ text: "📍 View Store Location", url: "#location" });
    links.push({ text: "💬 Chat on WhatsApp", url: "https://wa.me/919159588666" });
  }
  if (combined.includes("game") || combined.includes("fifa") || combined.includes("tekken") || combined.includes("gta") || combined.includes("mortal")) {
    links.push({ text: "🎮 Browse Games Catalog", url: "#games" });
  }
  if (combined.includes("tournament") || combined.includes("esports") || combined.includes("cup") || combined.includes("competition") || combined.includes("prize")) {
    links.push({ text: "🏆 View Esports Tournaments", url: "#tournaments" });
    links.push({ text: "💬 Join Waiting List on WhatsApp", url: "https://wa.me/919159588666?text=Hi%20GamersNest!%20I%20want%20to%20join%20the%20tournament%20waiting%20list!%20🏆" });
  }

  // De-duplicate links by URL
  const uniqueLinks = [];
  const seenUrls = new Set();
  for (const l of links) {
    if (!seenUrls.has(l.url)) {
      seenUrls.add(l.url);
      uniqueLinks.push(l);
    }
  }

  // Clean raw markdown links from body completely
  const cleanBody = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "").trim();

  // Split lines and parse blocks (tables, headers, dividers, bullets, text)
  const lines = cleanBody.split("\n");
  const blocks = [];
  let currentTableRows = [];

  const flushTable = () => {
    if (currentTableRows.length > 0) {
      blocks.push({ type: "table", rows: [...currentTableRows] });
      currentTableRows = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    // Table separator row like |---|---|
    if (/^\|?\s*[-:]+\s*\|[\s-:]*\|?/.test(trimmed)) {
      return;
    }

    // Table row like | Mode | Rate |
    if (trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length > 2) {
      const cells = trimmed
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0);

      if (cells.length > 0) {
        currentTableRows.push(cells);
        return;
      }
    }

    flushTable();

    if (!trimmed) {
      blocks.push({ type: "spacer" });
    } else if (/^(---|[*]{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "divider" });
    } else if (trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
      const headerText = trimmed.replace(/^#+\s*/, "");
      blocks.push({ type: "header", text: headerText });
    } else if (/^[\*\-•]\s*/.test(trimmed)) {
      let bulletText = trimmed.replace(/^[\*\-•]\s*/, "").trim();
      
      // Clean leading stray asterisk like *Pro Tip:** -> **Pro Tip:**
      if (bulletText.startsWith("*") && !bulletText.startsWith("**")) {
        bulletText = bulletText.replace(/^\*\s*/, "");
      }

      // Check if this bullet is actually an ALL-CAPS section header like "* **PS5 GAMING RATES**"
      const isHeaderBullet = /^\*\*([A-Z0-9\s&—\-\/]{3,})\*\*\s*$/.test(bulletText);
      if (isHeaderBullet) {
        const headerTitle = bulletText.replace(/\*\*/g, "");
        blocks.push({ type: "header", text: headerTitle });
      } else {
        blocks.push({ type: "bullet", text: bulletText });
      }
    } else {
      blocks.push({ type: "paragraph", text: trimmed });
    }
  });

  flushTable();

  const renderedElements = blocks.map((block, idx) => {
    if (block.type === "spacer") {
      return <div key={idx} style={{ height: "4px" }} />;
    }

    if (block.type === "divider") {
      return (
        <div
          key={idx}
          style={{
            height: "1px",
            background: "linear-gradient(90deg, rgba(0, 242, 254, 0.4), rgba(163, 230, 53, 0.2), transparent)",
            margin: "8px 0"
          }}
        />
      );
    }

    if (block.type === "header") {
      return (
        <div
          key={idx}
          style={{
            color: "#a3e635",
            fontWeight: 800,
            fontSize: "13px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginTop: "10px",
            marginBottom: "4px",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#a3e635", display: "inline-block" }} />
          {parseInlineMarkdown(block.text)}
        </div>
      );
    }

    if (block.type === "bullet") {
      return (
        <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", margin: "4px 0" }}>
          <span style={{ color: "#00f2fe", fontSize: "12px", lineHeight: "1.4" }}>•</span>
          <div style={{ flex: 1, lineHeight: "1.45" }}>{parseInlineMarkdown(block.text)}</div>
        </div>
      );
    }

    if (block.type === "table") {
      const rows = block.rows;
      if (rows.length === 0) return null;
      const isHeader = rows.length > 1;
      const dataRows = isHeader ? rows.slice(1) : rows;

      return (
        <div
          key={idx}
          style={{
            margin: "8px 0",
            padding: "8px 10px",
            borderRadius: "10px",
            background: "rgba(10, 16, 28, 0.8)",
            border: "1px solid rgba(0, 242, 254, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}
        >
          {dataRows.map((row, rIdx) => (
            <div
              key={rIdx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 6px",
                borderRadius: "6px",
                background: rIdx % 2 === 0 ? "rgba(255, 255, 255, 0.03)" : "transparent",
                fontSize: "12px"
              }}
            >
              <div style={{ fontWeight: 600, color: "#ffffff" }}>
                {parseInlineMarkdown(row[0] || "")}
              </div>
              {row.slice(1).map((cell, cIdx) => (
                <div key={cIdx} style={{ fontWeight: 700, color: "#00f2fe", fontFamily: "monospace" }}>
                  {parseInlineMarkdown(cell)}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    return (
      <p key={idx} style={{ margin: "4px 0", lineHeight: "1.45" }}>
        {parseInlineMarkdown(block.text)}
      </p>
    );
  });

  return (
    <div>
      <div style={{ fontSize: "13.5px", color: "#e2e8f0" }}>
        {renderedElements}
      </div>

      {/* Cyberpunk Action Route Cards */}
      {uniqueLinks.length > 0 && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginTop: "12px",
          paddingTop: "10px",
          borderTop: "1px dashed rgba(0, 242, 254, 0.25)"
        }}>
          <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#00f2fe", fontWeight: 700 }}>
            ⚡ Quick Navigation Actions
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {uniqueLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => onActionClick(link.url)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(79, 70, 229, 0.25) 100%)",
                  color: "#ffffff",
                  border: "1px solid rgba(0, 242, 254, 0.4)",
                  fontWeight: "600",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 12px rgba(0, 242, 254, 0.15)",
                  transition: "all 0.2s ease",
                  backdropFilter: "blur(4px)"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "#00f2fe";
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(0, 242, 254, 0.35)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.4)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 242, 254, 0.15)";
                }}
              >
                <span>{link.text}</span>
                <ExternalLink style={{ width: "13px", height: "13px", color: "#00f2fe" }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Chatbot({ inline = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome to GamersNest! 🎮\nI'm your AI Gaming Assistant.\n\nHow can I help you today with console bookings, games, or pricing?",
      timestamp: "10:24 AM"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);
  const messagesEndRef = useRef(null);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Rotate bot speaking phrases every 4.5 seconds when closed
  useEffect(() => {
    if (!isOpen && showSpeechBubble) {
      const interval = setInterval(() => {
        setPhraseIdx((prev) => (prev + 1) % BOT_SPEAKING_PHRASES.length);
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [isOpen, showSpeechBubble]);

  // Keyboard shortcut listener to close chatbot on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleActionClick = (url) => {
    if (url.startsWith("#")) {
      const elementId = url.slice(1);
      const elem = document.getElementById(elementId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (url.startsWith("/")) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const sendMessage = async (overrideText = null) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || loading) return;

    const userTime = getCurrentTime();
    const userMsg = { role: "user", content: textToSend, timestamp: userTime };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!overrideText) setInput("");
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey || apiKey === "paste_my_groq_key_here") {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: "⚠️ Groq API Key missing. Please set your VITE_GROQ_API_KEY in the .env file to enable AI responses.",
            timestamp: getCurrentTime()
          }
        ]);
        setLoading(false);
        return;
      }

      // Prepend System Prompt for Groq payload
      const apiPayloadMessages = [
        GAMERSNEST_SYSTEM_PROMPT,
        ...updatedMessages.map(m => ({ role: m.role, content: m.content }))
      ];

      let botReply = null;
      let lastError = null;

      // Try model fallback order
      for (const model of GROQ_MODELS) {
        try {
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
              model,
              messages: apiPayloadMessages,
              temperature: 0.7,
            }),
          });

          const data = await res.json();
          if (res.ok && data.choices && data.choices[0] && data.choices[0].message) {
            let content = data.choices[0].message.content || "";
            content = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
            if (content) {
              botReply = content;
              break;
            }
          } else {
            lastError = data?.error?.message || `API Error HTTP ${res.status}`;
          }
        } catch (err) {
          lastError = err.message || "Network Error";
        }
      }

      const botTime = getCurrentTime();
      if (botReply) {
        setMessages(prev => [...prev, { role: "assistant", content: botReply, timestamp: botTime }]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: `⚠️ Unable to connect to AI. Details: ${lastError || "Unknown error"}`, timestamp: botTime }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Error connecting to AI assistant. Please check your network connection.", timestamp: getCurrentTime() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Welcome to GamersNest! 🎮\nI'm your AI Gaming Assistant.\n\nHow can I help you today with console bookings, games, or pricing?",
        timestamp: getCurrentTime()
      }
    ]);
  };

  const renderChatContent = () => (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "linear-gradient(180deg, rgba(13, 21, 39, 0.97) 0%, rgba(8, 12, 20, 0.99) 100%)",
      color: "#f8fafc",
      fontFamily: "var(--font-body, 'DM Sans', system-ui, sans-serif)",
      borderRadius: "20px",
      border: "1px solid rgba(0, 242, 254, 0.35)",
      borderTop: "2px solid #a3e635",
      boxShadow: "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 242, 254, 0.2), 0 0 15px rgba(163, 230, 53, 0.15)",
      overflow: "hidden"
    }}>
      {/* Header matching Concept 1 (Modern Glass Chat) */}
      <div style={{
        padding: "16px 20px",
        background: "rgba(13, 21, 39, 0.96)",
        borderBottom: "1px solid rgba(0, 242, 254, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backdropFilter: "blur(14px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* AI Robot Avatar Icon */}
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: "#0d1527",
            border: "2px solid #a3e635",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 12px rgba(163, 230, 53, 0.4), 0 0 6px rgba(0, 242, 254, 0.3)",
            position: "relative"
          }}>
            <Bot style={{ width: "22px", height: "22px", color: "#00f2fe" }} />
          </div>
          <div>
            <div style={{
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: "0.5px",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-display, 'Space Grotesk', sans-serif)"
            }}>
              GamersNest AI <Sparkles style={{ width: "15px", height: "15px", color: "#00f2fe" }} />
            </div>
            <div style={{ fontSize: "11px", color: "#00f2fe", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", display: "inline-block" }}></span>
              Online • AI Gaming Concierge
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={clearChat}
            title="Reset Chat"
            aria-label="Reset Chat"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "7px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              transition: "all 0.2s ease"
            }}
          >
            <RefreshCw style={{ width: "16px", height: "16px" }} />
          </button>
          {!inline && (
            <button
              onClick={() => setIsOpen(false)}
              title="Close Chatbot"
              aria-label="Close GamersNest AI Chatbot"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "7px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s ease"
              }}
            >
              <X style={{ width: "18px", height: "18px" }} />
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Scroll Area */}
      <div style={{
        flex: 1,
        padding: "18px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        background: "radial-gradient(circle at 50% 0%, rgba(0, 242, 254, 0.04) 0%, transparent 80%)",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(0, 242, 254, 0.3) transparent"
      }}>
        {messages.map((msg, i) => {
          const prevUserMsg = i > 0 && messages[i - 1]?.role === "user" ? messages[i - 1].content : "";
          const isUser = msg.role === "user";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                gap: "8px",
                alignItems: "flex-start"
              }}
            >
              {!isUser && (
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "rgba(13, 21, 39, 0.9)",
                  border: "1px solid #00f2fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px",
                  boxShadow: "0 0 8px rgba(0, 242, 254, 0.3)"
                }}>
                  <Bot style={{ width: "15px", height: "15px", color: "#00f2fe" }} />
                </div>
              )}

              <div style={{
                maxWidth: "85%",
                padding: "12px 16px",
                borderRadius: isUser ? "18px 18px 2px 18px" : "4px 18px 18px 18px",
                background: isUser
                  ? "linear-gradient(135deg, rgba(0, 123, 255, 0.9) 0%, rgba(0, 242, 254, 0.85) 100%)"
                  : "rgba(18, 27, 46, 0.85)",
                color: "#ffffff",
                boxShadow: isUser
                  ? "0 4px 18px rgba(0, 242, 254, 0.3)"
                  : "0 4px 20px rgba(0, 0, 0, 0.35)",
                border: isUser ? "none" : "1px solid rgba(0, 242, 254, 0.2)",
                borderLeft: isUser ? "none" : "3px solid #00f2fe",
                backdropFilter: "blur(8px)",
                display: "flex",
                flexDirection: "column"
              }}>
                {isUser ? (
                  <div style={{ fontSize: "13.5px", lineHeight: "1.5", fontWeight: 500 }}>
                    {msg.content}
                  </div>
                ) : (
                  <FormattedMessage
                    content={msg.content}
                    prevUserMsg={prevUserMsg}
                    onActionClick={handleActionClick}
                  />
                )}
                <span style={{
                  fontSize: "10px",
                  color: isUser ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0.45)",
                  alignSelf: "flex-end",
                  marginTop: "6px",
                  fontFamily: "monospace"
                }}>
                  {msg.timestamp || "10:24 AM"}
                </span>
              </div>

              {isUser && (
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "rgba(0, 123, 255, 0.25)",
                  border: "1px solid rgba(0, 123, 255, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px"
                }}>
                  <User style={{ width: "15px", height: "15px", color: "#3b82f6" }} />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", gap: "8px", alignItems: "center" }}>
            <div style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "rgba(13, 21, 39, 0.9)",
              border: "1px solid #00f2fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <Bot style={{ width: "15px", height: "15px", color: "#00f2fe" }} />
            </div>
            <div style={{
              padding: "10px 16px",
              borderRadius: "4px 18px 18px 18px",
              background: "rgba(18, 27, 46, 0.85)",
              border: "1px solid rgba(0, 242, 254, 0.2)",
              borderLeft: "3px solid #00f2fe",
              color: "#00f2fe",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <Sparkles style={{ width: "14px", height: "14px", animation: "spin 2s linear infinite" }} />
              GamersNest AI is processing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ⚡ QUICK ACTIONS Grid Section matching Concept 1 */}
      <div style={{
        padding: "12px 16px",
        background: "rgba(10, 16, 28, 0.92)",
        borderTop: "1px solid rgba(0, 242, 254, 0.15)",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        <div style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#a3e635",
          letterSpacing: "0.8px",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          ⚡ QUICK ACTIONS
        </div>
        <div className="gn-quick-actions-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px"
        }}>
          <button
            className="gn-quick-btn"
            onClick={() => sendMessage("How can I book a PS5 session online at GamersNest?")}
            disabled={loading}
            style={{
              padding: "9px 12px",
              borderRadius: "10px",
              background: "rgba(18, 27, 46, 0.85)",
              border: "1px solid rgba(0, 242, 254, 0.3)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#00f2fe";
              e.currentTarget.style.boxShadow = "0 0 14px rgba(0, 242, 254, 0.3)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.3)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Calendar style={{ width: "13px", height: "13px", color: "#00f2fe" }} />
              Book a Session
            </span>
            <ChevronRight style={{ width: "14px", height: "14px", color: "#94a3b8" }} />
          </button>

          <button
            className="gn-quick-btn"
            onClick={() => sendMessage("What are the exact PS5 and PS4 pricing rates for solo and group play at GamersNest?")}
            disabled={loading}
            style={{
              padding: "9px 12px",
              borderRadius: "10px",
              background: "rgba(18, 27, 46, 0.85)",
              border: "1px solid rgba(0, 242, 254, 0.3)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#00f2fe";
              e.currentTarget.style.boxShadow = "0 0 14px rgba(0, 242, 254, 0.3)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.3)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Tag style={{ width: "13px", height: "13px", color: "#a3e635" }} />
              View Pricing
            </span>
            <ChevronRight style={{ width: "14px", height: "14px", color: "#94a3b8" }} />
          </button>

          <button
            className="gn-quick-btn"
            onClick={() => sendMessage("What multiplayer and popular games are available to play at GamersNest?")}
            disabled={loading}
            style={{
              padding: "9px 12px",
              borderRadius: "10px",
              background: "rgba(18, 27, 46, 0.85)",
              border: "1px solid rgba(0, 242, 254, 0.3)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#00f2fe";
              e.currentTarget.style.boxShadow = "0 0 14px rgba(0, 242, 254, 0.3)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.3)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Gamepad2 style={{ width: "13px", height: "13px", color: "#00f2fe" }} />
              Browse Games
            </span>
            <ChevronRight style={{ width: "14px", height: "14px", color: "#94a3b8" }} />
          </button>

          <button
            className="gn-quick-btn"
            onClick={() => sendMessage("Where is GamersNest located and what are the contact details?")}
            disabled={loading}
            style={{
              padding: "9px 12px",
              borderRadius: "10px",
              background: "rgba(18, 27, 46, 0.85)",
              border: "1px solid rgba(0, 242, 254, 0.3)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#00f2fe";
              e.currentTarget.style.boxShadow = "0 0 14px rgba(0, 242, 254, 0.3)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.3)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <MapPin style={{ width: "13px", height: "13px", color: "#a3e635" }} />
              Store Location
            </span>
            <ChevronRight style={{ width: "14px", height: "14px", color: "#94a3b8" }} />
          </button>
        </div>
      </div>

      {/* Input Section at Bottom matching Concept 1 */}
      <div style={{
        padding: "14px 16px",
        background: "rgba(10, 16, 28, 0.98)",
        borderTop: "1px solid rgba(0, 242, 254, 0.15)",
        display: "flex",
        gap: "10px",
        alignItems: "center"
      }}>
        {/* Paperclip attachment icon button */}
        <button
          title="Attach File"
          aria-label="Attach File"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(0, 242, 254, 0.2)",
            color: "#00f2fe",
            cursor: "pointer",
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <Paperclip style={{ width: "17px", height: "17px" }} />
        </button>

        {/* Input box */}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask GamersNest AI..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "11px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(0, 242, 254, 0.25)",
            background: "#080d19",
            color: "#ffffff",
            fontSize: "16px",
            outline: "none",
            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.5)"
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#00f2fe")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.25)")}
        />

        {/* Send button with GamersNest Neon Lime accent */}
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          aria-label="Send message"
          style={{
            width: "42px",
            height: "42px",
            background: input.trim() && !loading
              ? "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)"
              : "rgba(255, 255, 255, 0.08)",
            color: "#080c10",
            border: "none",
            borderRadius: "12px",
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: input.trim() && !loading ? "0 0 16px rgba(163, 230, 53, 0.5)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          <Send style={{ width: "18px", height: "18px", strokeWidth: 2.5 }} />
        </button>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div style={{ width: "100%", maxWidth: "680px", height: "560px", margin: "0 auto" }}>
        {renderChatContent()}
      </div>
    );
  }

  return (
    <>
      {/* Embedded CSS for Top Small AI Speech Bubble & Bot Avatar Launcher */}
      <style>{`
        @keyframes gnHudPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(0, 242, 254, 0.4), 0 0 10px rgba(163, 230, 53, 0.25), 0 8px 30px rgba(0, 0, 0, 0.85);
            border-color: rgba(0, 242, 254, 0.7);
          }
          50% {
            box-shadow: 0 0 32px rgba(0, 242, 254, 0.65), 0 0 16px rgba(163, 230, 53, 0.45), 0 12px 35px rgba(0, 0, 0, 0.95);
            border-color: rgba(163, 230, 53, 0.9);
          }
        }

        @keyframes gnHudExpand {
          0% {
            opacity: 0;
            transform: scale(0.88) translateY(24px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes gnSpeechPopTop {
          0% { opacity: 0; transform: scale(0.88) translateY(6px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes gnLedPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.85; }
        }

        .gn-hud-launcher-wrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .gn-bot-speech-bubble-top {
          position: relative;
          background: rgba(12, 18, 33, 0.94);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(0, 242, 254, 0.4);
          border-radius: 20px;
          padding: 5px 22px 5px 10px;
          color: #ffffff;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.75), 0 0 16px rgba(0, 242, 254, 0.25);
          cursor: pointer;
          animation: gnSpeechPopTop 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          transition: all 0.2s ease;
          user-select: none;
          white-space: nowrap;
        }

        .gn-bot-speech-bubble-top:hover {
          border-color: #00f2fe;
          box-shadow: 0 8px 25px rgba(0, 242, 254, 0.4);
          transform: translateY(-2px);
        }

        /* Speech bubble arrow pointer pointing DOWN directly at the circle trigger below */
        .gn-bot-speech-bubble-top::after {
          content: "";
          position: absolute;
          bottom: -6px;
          right: 22px;
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid rgba(0, 242, 254, 0.6);
        }

        .gn-speech-content-top {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-display, "Space Grotesk", sans-serif);
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.2px;
          color: #ffffff;
        }

        .gn-speech-dismiss-top {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 2px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .gn-speech-dismiss-top:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .gn-hud-circle-trigger {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #0f1c36 0%, #080d19 100%);
          border: 2px solid rgba(0, 242, 254, 0.7);
          animation: gnHudPulse 3s infinite ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          cursor: pointer;
          outline: none;
        }

        .gn-hud-circle-trigger::before {
          content: "";
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          border: 1px solid rgba(163, 230, 53, 0.3);
          pointer-events: none;
        }

        .gn-hud-circle-trigger:hover {
          transform: scale(1.08);
          border-color: #00f2fe;
          box-shadow: 0 0 35px rgba(0, 242, 254, 0.7), 0 0 20px rgba(163, 230, 53, 0.5), 0 12px 35px rgba(0, 0, 0, 0.95);
        }

        .gn-hud-led {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #22c55e;
          border: 2px solid #080d19;
          box-shadow: 0 0 10px #22c55e;
          animation: gnLedPulse 2s infinite ease-in-out;
        }

        .gn-hud-window {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: calc(100vw - 32px);
          max-width: 420px;
          height: 600px;
          max-height: calc(100vh - 100px);
          z-index: 999999;
          transform-origin: bottom right;
          animation: gnHudExpand 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (max-width: 768px) {
          .gn-hud-launcher-wrapper {
            bottom: calc(58px + max(12px, env(safe-area-inset-bottom)));
            right: 12px;
          }
          .gn-bot-speech-bubble-top {
            padding: 4px 18px 4px 8px;
            max-width: 220px;
          }
          .gn-speech-content-top {
            font-size: 11px;
          }
          .gn-hud-circle-trigger {
            width: 48px;
            height: 48px;
          }
          .gn-hud-window {
            bottom: calc(60px + max(8px, env(safe-area-inset-bottom)));
            right: 10px;
            left: 10px;
            width: calc(100vw - 20px);
            max-width: 100vw;
            height: calc(100dvh - 120px);
            max-height: calc(100dvh - 120px);
            border-radius: 16px;
          }
          .gn-quick-actions-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
          }
          .gn-quick-btn {
            padding: 7px 8px !important;
            font-size: 11px !important;
          }
        }

        @media (max-width: 380px) {
          .gn-hud-launcher-wrapper {
            bottom: calc(56px + max(8px, env(safe-area-inset-bottom)));
            right: 8px;
          }
          .gn-hud-window {
            bottom: calc(58px + max(6px, env(safe-area-inset-bottom)));
            right: 6px;
            left: 6px;
            width: calc(100vw - 12px);
            height: calc(100dvh - 110px);
            max-height: calc(100dvh - 110px);
          }
          .gn-quick-actions-grid {
            grid-template-columns: 1fr !important;
            gap: 6px !important;
          }
        }
      `}</style>

      {/* Top Small AI Speech Bubble + Circular Bot Avatar Launcher */}
      {!isOpen && (
        <div className="gn-hud-launcher-wrapper">
          {/* Small Speech Bubble Pop-up Positioned ON TOP */}
          {showSpeechBubble && (
            <div
              className="gn-bot-speech-bubble-top"
              onClick={() => setIsOpen(true)}
              title="Click to chat with GamersNest AI"
            >
              <button
                className="gn-speech-dismiss-top"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeechBubble(false);
                }}
                title="Dismiss message"
                aria-label="Dismiss speech bubble message"
              >
                <X style={{ width: "10px", height: "10px" }} />
              </button>
              <div className="gn-speech-content-top">
                <Sparkles style={{ width: "12px", height: "12px", color: "#00f2fe", flexShrink: 0 }} />
                <span>{BOT_SPEAKING_PHRASES[phraseIdx]}</span>
              </div>
            </div>
          )}

          {/* Circular HUD Bot Avatar Trigger */}
          <button
            className="gn-hud-circle-trigger"
            onClick={() => setIsOpen(true)}
            aria-label="Open GamersNest AI Chatbot"
            aria-expanded={false}
          >
            <Gamepad2 style={{ width: "22px", height: "22px", color: "#00f2fe", filter: "drop-shadow(0 0 6px rgba(0,242,254,0.6))" }} />
            <div className="gn-hud-led" title="AI Active" />
          </button>
        </div>
      )}

      {/* Floating Chat Window Modal */}
      {isOpen && (
        <div className="gn-hud-window" role="dialog" aria-label="GamersNest AI Chatbot Window">
          {renderChatContent()}
        </div>
      )}
    </>
  );
}

export default Chatbot;
