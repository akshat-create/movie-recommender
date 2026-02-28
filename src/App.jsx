import { useState } from "react";

const GENRES = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Animation", "Documentary", "Fantasy"];
const MOODS = ["Feel-good", "Thought-provoking", "Edge-of-seat", "Emotional", "Light & fun", "Dark & intense"];
const ERAS = ["Any", "Classic (pre-1980)", "80s & 90s", "2000s", "2010s", "Recent (2020+)"];

const accentColor = "#e63946";
const cardBg = "#1a1a2e";
const surfaceBg = "#16213e";
const deepBg = "#0f0f1a";

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
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError("API Error: " + (data.error?.message || res.status));
        return;
      }
      const text = data.choices[0].message.content;
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResults(parsed);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const GenreChip = ({ g, active, onClick, color = accentColor }) => (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${active ? color : "#333"}`,
      background: active ? color + "22" : "transparent", color: active ? color : "#aaa",
      cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, transition: "all 0.2s"
    }}>{g}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: deepBg, color: "#f0f0f0", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${cardBg}, ${surfaceBg})`, borderBottom: `2px solid ${accentColor}33`, padding: "32px 24px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 4 }}>🎬</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, background: `linear-gradient(90deg, #fff, ${accentColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          CineMatch
        </h1>
        <p style={{ margin: "8px 0 0", color: "#888", fontSize: 15 }}>AI-powered movie recommendations tailored to your taste</p>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px" }}>
        {/* Input Section */}
        <div style={{ background: surfaceBg, borderRadius: 16, padding: 28, marginBottom: 24, border: "1px solid #ffffff11" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: "#fff" }}>Your Preferences</h2>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, color: "#aaa", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Movies You've Enjoyed</label>
            <textarea
              value={movies}
              onChange={e => setMovies(e.target.value)}
              placeholder="e.g. Inception, The Dark Knight, Interstellar..."
              rows={2}
              style={{ width: "100%", background: cardBg, border: "1.5px solid #333", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, color: "#aaa", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Favorite Genres</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {GENRES.map(g => <GenreChip key={g} g={g} active={genres.includes(g)} onClick={() => toggleGenre(g, genres, setGenres)} />)}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#aaa", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Mood</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MOODS.map(m => (
                  <button key={m} onClick={() => setMood(mood === m ? "" : m)} style={{
                    padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${mood === m ? "#7b5ea7" : "#333"}`,
                    background: mood === m ? "#7b5ea722" : "transparent", color: mood === m ? "#c9a8f0" : "#aaa",
                    cursor: "pointer", fontSize: 13, fontWeight: mood === m ? 600 : 400
                  }}>{m}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#aaa", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Era</label>
              <select value={era} onChange={e => setEra(e.target.value)} style={{
                background: cardBg, border: "1.5px solid #333", borderRadius: 10, padding: "10px 14px",
                color: "#fff", fontSize: 14, width: "100%", outline: "none"
              }}>
                {ERAS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, color: "#aaa", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Exclude Genres</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {GENRES.map(g => <GenreChip key={g} g={g} active={excludeGenres.includes(g)} onClick={() => toggleGenre(g, excludeGenres, setExcludeGenres)} color="#ff6b6b" />)}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label style={{ fontSize: 13, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Results</label>
              {[3, 6, 9].map(n => (
                <button key={n} onClick={() => setCount(n)} style={{
                  width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${count === n ? accentColor : "#333"}`,
                  background: count === n ? accentColor + "22" : "transparent", color: count === n ? accentColor : "#aaa",
                  cursor: "pointer", fontWeight: 700, fontSize: 15
                }}>{n}</button>
              ))}
            </div>
            <button onClick={getRecommendations} disabled={loading} style={{
              padding: "14px 36px", borderRadius: 12, border: "none",
              background: loading ? "#555" : `linear-gradient(135deg, ${accentColor}, #c1121f)`,
              color: "#fff", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : `0 4px 20px ${accentColor}44`, transition: "all 0.2s"
            }}>
              {loading ? "Finding matches..." : "🎬 Get Recommendations"}
            </button>
          </div>
          {error && <p style={{ color: "#ff6b6b", marginTop: 12, fontSize: 14 }}>{error}</p>}
        </div>

        {/* Results */}
        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: "#888" }}>
            <div style={{ fontSize: 48, marginBottom: 16, animation: "pulse 1s infinite" }}>🎥</div>
            <p style={{ fontSize: 18 }}>Analyzing your taste profile...</p>
          </div>
        )}

        {results && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#fff" }}>
              Your Recommendations <span style={{ color: accentColor }}>({results.length})</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {results.map((m, i) => (
                <div key={i} style={{
                  background: surfaceBg, borderRadius: 14, padding: 22, border: "1px solid #ffffff11",
                  borderTop: `3px solid ${accentColor}`, transition: "transform 0.2s",
                  cursor: "default"
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ background: accentColor + "22", color: accentColor, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{m.genre}</span>
                    <span style={{ color: "#ffd700", fontSize: 13, fontWeight: 700 }}>⭐ {m.rating}</span>
                  </div>
                  <h3 style={{ margin: "10px 0 4px", fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{m.title}</h3>
                  <p style={{ margin: "0 0 10px", color: "#666", fontSize: 13 }}>{m.year}</p>
                  <p style={{ margin: "0 0 14px", color: "#bbb", fontSize: 14, lineHeight: 1.6 }}>{m.synopsis}</p>
                  <div style={{ background: cardBg, borderRadius: 8, padding: "10px 12px", borderLeft: `3px solid #7b5ea7` }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#c9a8f0", fontStyle: "italic" }}>💡 {m.matchReason}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <button onClick={getRecommendations} style={{
                padding: "12px 32px", borderRadius: 12, border: `1.5px solid ${accentColor}`,
                background: "transparent", color: accentColor, fontSize: 15, fontWeight: 600, cursor: "pointer"
              }}>🔄 Regenerate</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}