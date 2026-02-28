import { useState } from "react";

const GENRES = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Animation", "Documentary", "Fantasy"];
const MOODS = ["Feel-good", "Thought-provoking", "Edge-of-seat", "Emotional", "Light & fun", "Dark & intense"];
const ERAS = ["Any", "Classic (pre-1980)", "80s & 90s", "2000s", "2010s", "Recent (2020+)"];

const themes = {
  dark: {
    accentColor: "#e63946",
    cardBg: "#1a1a2e",
    surfaceBg: "#16213e",
    deepBg: "#0f0f1a",
    text: "#f0f0f0",
    subText: "#aaa",
    border: "#ffffff11",
    inputBorder: "#333",
    yearColor: "#666",
    synopsisColor: "#bbb",
    matchBg: "#1a1a2e",
    matchBorder: "#7b5ea7",
    matchText: "#c9a8f0",
  },
  light: {
    accentColor: "#e63946",
    cardBg: "#f0f0f5",
    surfaceBg: "#ffffff",
    deepBg: "#f5f5f5",
    text: "#111111",
    subText: "#555",
    border: "#00000011",
    inputBorder: "#ccc",
    yearColor: "#999",
    synopsisColor: "#444",
    matchBg: "#ede9f7",
    matchBorder: "#7b5ea7",
    matchText: "#5a3d8a",
  }
};

export default function App() {
  const [movies, setMovies] = useState("");
  const [genres, setGenres] = useState([]);
  const [mood, setMood] = useState("");
  const [era, setEra] = useState("Any");
  const [excludeGenres, setExcludeGenres] = useState([]);
  const [count, setCount] = useState(6);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(true);

  const t = isDark ? themes.dark : themes.light;

  const toggleGenre = (g, list, setList) => {
    setList(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const getRecommendations = async () => {
    if (!movies.trim() && genres.length === 0) {
      setError("Please enter at least one movie you enjoy or select a genre.");
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);

    const prompt = `You are a movie recommendation engine. Based on the user's preferences below, recommend exactly ${count} movies.

User preferences:
- Enjoyed movies: ${movies || "Not specified"}
- Favorite genres: ${genres.length ? genres.join(", ") : "Not specified"}
- Mood: ${mood || "Not specified"}
- Era preference: ${era}
- Genres to exclude: ${excludeGenres.length ? excludeGenres.join(", ") : "None"}

Respond ONLY with a valid JSON array (no markdown, no extra text) with exactly ${count} objects. Each object must have:
- title (string)
- year (number)
- genre (string, primary genre)
- synopsis (string, 2 sentences max)
- matchReason (string, 1 sentence explaining why it matches their taste)
- rating (string, e.g. "8.2/10")`;

    try {
      const apiKey = typeof import.meta !== 'undefined' ? import.meta.env.VITE_GROQ_API_KEY : "";
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      if (!res.ok) { setError("API Error: " + (data.error?.message || res.status)); return; }
      const text = data.choices[0].message.content;
      const clean = text.replace(/```json|```/g, "").trim();
      const resultsWithPosters = await Promise.all(
        JSON.parse(clean).map(async m => ({
          ...m,
          poster: await fetchPoster(m.title, m.year)
        }))
      );
      setResults(resultsWithPosters);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPoster = async (title, year) => {
    try {
      const apiKey = typeof import.meta !== 'undefined' ? import.meta.env.VITE_OMDB_API_KEY : "";
      const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year}&apikey=${apiKey}`);
      const data = await res.json();
      return data.Poster && data.Poster !== "N/A" ? data.Poster : null;
    } catch { return null; }
  };

  const Chip = ({ g, active, onClick, color }) => (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 20,
      border: `1.5px solid ${active ? color : t.inputBorder}`,
      background: active ? color + "22" : "transparent",
      color: active ? color : t.subText,
      cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, transition: "all 0.2s"
    }}>{g}</button>
  );

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: t.deepBg, color: t.text, fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{
        background: isDark ? `linear-gradient(135deg, ${t.cardBg}, ${t.surfaceBg})` : "#ffffff",
        borderBottom: `2px solid ${t.accentColor}33`,
        padding: "28px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>🎬</div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, background: `linear-gradient(90deg, ${t.text}, ${t.accentColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            CineMatch
          </h1>
          <p style={{ margin: "6px 0 0", color: t.subText, fontSize: 14 }}>AI-powered movie recommendations tailored to your taste</p>
        </div>
        {/* Theme Toggle */}
        <button onClick={() => setIsDark(!isDark)} style={{
          padding: "10px 18px", borderRadius: 24, border: `1.5px solid ${t.inputBorder}`,
          background: isDark ? "#ffffff11" : "#00000011", color: t.text,
          cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", gap: 8,
          fontWeight: 600, transition: "all 0.3s", whiteSpace: "nowrap"
        }}>
          {isDark ? "☀️" : "🌙"}
          <span style={{ fontSize: 13 }}>{isDark ? "Light" : "Dark"}</span>
        </button>
      </div>

      {/* Main Content */}
      <div style={{ width: "100%", padding: "32px 40px", boxSizing: "border-box" }}>
        {/* Preferences Card */}
        <div style={{ background: t.surfaceBg, borderRadius: 16, padding: 32, marginBottom: 28, border: `1px solid ${t.border}` }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 700, color: t.text }}>Your Preferences</h2>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: "block", fontSize: 12, color: t.subText, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Movies You've Enjoyed</label>
            <textarea value={movies} onChange={e => setMovies(e.target.value)}
              placeholder="e.g. Inception, The Dark Knight, Interstellar..."
              rows={2} style={{
                width: "100%", background: t.cardBg, border: `1.5px solid ${t.inputBorder}`,
                borderRadius: 10, padding: "12px 14px", color: t.text, fontSize: 14,
                resize: "vertical", outline: "none", boxSizing: "border-box"
              }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 22 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: t.subText, marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Favorite Genres</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {GENRES.map(g => <Chip key={g} g={g} active={genres.includes(g)} onClick={() => toggleGenre(g, genres, setGenres)} color={t.accentColor} />)}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: t.subText, marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Exclude Genres</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {GENRES.map(g => <Chip key={g} g={g} active={excludeGenres.includes(g)} onClick={() => toggleGenre(g, excludeGenres, setExcludeGenres)} color="#ff6b6b" />)}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 24 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: t.subText, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Mood</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MOODS.map(m => (
                  <button key={m} onClick={() => setMood(mood === m ? "" : m)} style={{
                    padding: "6px 14px", borderRadius: 20,
                    border: `1.5px solid ${mood === m ? "#7b5ea7" : t.inputBorder}`,
                    background: mood === m ? "#7b5ea722" : "transparent",
                    color: mood === m ? t.matchText : t.subText,
                    cursor: "pointer", fontSize: 13, fontWeight: mood === m ? 600 : 400
                  }}>{m}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: t.subText, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Era</label>
              <select value={era} onChange={e => setEra(e.target.value)} style={{
                background: t.cardBg, border: `1.5px solid ${t.inputBorder}`, borderRadius: 10,
                padding: "10px 14px", color: t.text, fontSize: 14, width: "100%", outline: "none"
              }}>
                {ERAS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ fontSize: 12, color: t.subText, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Results</label>
              {[3, 6, 9].map(n => (
                <button key={n} onClick={() => setCount(n)} style={{
                  width: 40, height: 40, borderRadius: 10,
                  border: `1.5px solid ${count === n ? t.accentColor : t.inputBorder}`,
                  background: count === n ? t.accentColor + "22" : "transparent",
                  color: count === n ? t.accentColor : t.subText,
                  cursor: "pointer", fontWeight: 700, fontSize: 15
                }}>{n}</button>
              ))}
            </div>
            <button onClick={getRecommendations} disabled={loading} style={{
              padding: "14px 40px", borderRadius: 12, border: "none",
              background: loading ? "#555" : `linear-gradient(135deg, ${t.accentColor}, #c1121f)`,
              color: "#fff", fontSize: 16, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : `0 4px 20px ${t.accentColor}44`, transition: "all 0.2s"
            }}>
              {loading ? "Finding matches..." : "🎬 Get Recommendations"}
            </button>
          </div>
          {error && <p style={{ color: "#ff6b6b", marginTop: 12, fontSize: 14 }}>{error}</p>}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: t.subText }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎥</div>
            <p style={{ fontSize: 18 }}>Analyzing your taste profile...</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: t.text }}>
              Your Recommendations <span style={{ color: t.accentColor }}>({results.length})</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {results.map((m, i) => (
                <div key={i}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                  style={{
                    background: t.surfaceBg, borderRadius: 14, padding: 24,
                    border: `1px solid ${t.border}`, borderTop: `3px solid ${t.accentColor}`,
                    transition: "transform 0.2s", cursor: "default"
                  }}>
                  {m.poster && (
                    <img src={m.poster} alt={m.title} style={{
                      width: "100%", height: 200, objectFit: "cover",
                      borderRadius: 10, marginBottom: 14
                    }} />
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ background: t.accentColor + "22", color: t.accentColor, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{m.genre}</span>
                    <span style={{ color: "#ffd700", fontSize: 13, fontWeight: 700 }}>⭐ {m.rating}</span>
                  </div>
                  <h3 style={{ margin: "10px 0 4px", fontSize: 18, fontWeight: 800, color: t.text, lineHeight: 1.3 }}>{m.title}</h3>
                  <p style={{ margin: "0 0 10px", color: t.yearColor, fontSize: 13 }}>{m.year}</p>
                  <p style={{ margin: "0 0 14px", color: t.synopsisColor, fontSize: 14, lineHeight: 1.6 }}>{m.synopsis}</p>
                  <div style={{ background: t.matchBg, borderRadius: 8, padding: "10px 12px", borderLeft: `3px solid ${t.matchBorder}` }}>
                    <p style={{ margin: 0, fontSize: 13, color: t.matchText, fontStyle: "italic" }}>💡 {m.matchReason}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button onClick={getRecommendations} style={{
                padding: "12px 32px", borderRadius: 12,
                border: `1.5px solid ${t.accentColor}`,
                background: "transparent", color: t.accentColor,
                fontSize: 15, fontWeight: 600, cursor: "pointer"
              }}>🔄 Regenerate</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}