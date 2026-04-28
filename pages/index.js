import Head from "next/head";
import { useState, useEffect, useRef } from "react";

const NICHES = [
  "FPS / Shooters","Battle Royale","RPG / Story","Survival / Sandbox",
  "MOBA / Strategy","Sports / Racing","Horror","Casual / Family",
  "Variety","Indie Games","Retro / Classic","Speedrunning"
];
const QUICK_CHIPS = [
  "Why this game specifically?","What days should I avoid?",
  "How do I stand out from competitors?","Should I change my niche?","What's the best stream length?"
];

function fmt(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function platformURL(platform, handle) {
  const u = handle.replace(/^@/, "");
  if (platform === "twitch") return `https://www.twitch.tv/${u}`;
  if (platform === "youtube") return `https://www.youtube.com/@${u}`;
  if (platform === "tiktok") return `https://www.tiktok.com/@${u}`;
  return "";
}

function TwitchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#9146ff">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#ff0000">
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#000">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.27 8.27 0 0 0 4.83 1.54V6.78a4.85 4.85 0 0 1-1.07-.09z"/>
    </svg>
  );
}

export default function Home() {
  const [platform, setPlatform] = useState("");
  const [handle, setHandle] = useState("");
  const [niche, setNiche] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [timeSlots, setTimeSlots] = useState([{ id: 1, start: "18:00", end: "22:00" }]);
  const [nextId, setNextId] = useState(2);
  const [phase, setPhase] = useState("form"); // form | loading | result
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  useEffect(() => {
    if (phase !== "loading") return;
    let i = 0;
    const tick = () => {
      if (i < 5) { setLoadingStep(i + 1); i++; setTimeout(tick, 2200); }
    };
    setTimeout(tick, 300);
  }, [phase]);

  const canSubmit = platform && handle.trim() && niche && timeSlots.some(s => s.start && s.end);

  function addSlot() {
    setTimeSlots(prev => [...prev, { id: nextId, start: "", end: "" }]);
    setNextId(n => n + 1);
  }
  function removeSlot(id) { setTimeSlots(prev => prev.filter(s => s.id !== id)); }
  function updateSlot(id, field, val) {
    setTimeSlots(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  }

  async function analyze() {
    setPhase("loading");
    setLoadingStep(0);
    const windows = timeSlots.filter(s => s.start && s.end).map(s => `${fmt(s.start)} to ${fmt(s.end)}`).join(", ");
    const cleanHandle = handle.replace(/^@/, "");
    const trackerURL = platform === "twitch" ? `https://twitchtracker.com/${cleanHandle}` : "";

    const urlInstructions = platform === "twitch"
      ? `You MUST perform these live web searches RIGHT NOW — do NOT use training memory:
1. Search: "${cleanHandle} twitch" and visit https://www.twitch.tv/${cleanHandle} — get CURRENT followers, what they stream now
2. Search: "twitchtracker ${cleanHandle}" and visit ${trackerURL} — get CURRENT avg viewers, peak, hours streamed
3. Search: "sullygnome ${cleanHandle}" — get more live stats
4. Search: "twitchtracker ${niche.toLowerCase()} trending games 2025" — find what's growing RIGHT NOW
5. Search: "best games to stream ${niche} low competition 2025 twitch"`
      : platform === "youtube"
      ? `You MUST perform these live web searches RIGHT NOW:
1. Search: "${cleanHandle} youtube channel" — get CURRENT subscribers and recent stream views
2. Search: "best games to stream youtube ${niche} 2025 low competition"
3. Search: "youtube gaming trending ${niche} 2025"`
      : `You MUST perform these live web searches RIGHT NOW:
1. Search: "${cleanHandle} tiktok gaming" — get CURRENT followers
2. Search: "tiktok gaming trending ${niche} 2025"
3. Search: "best games tiktok ${niche} 2025"`;

    const prompt = `You are a streaming growth analyst. Today's date is ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.

CRITICAL: You are FORBIDDEN from using training data memory for channel stats or game trends. ALL data MUST come from live web searches performed right now. If you cannot find live data, say "Not found" — never fabricate numbers.

Streamer:
- Platform: ${platform}
- Handle: ${cleanHandle}
- Channel URL: ${platformURL(platform, cleanHandle)}
- Niche: ${niche}
- Extra: ${extraInfo || "none"}
- Available stream times: ${windows}

${urlInstructions}

After ALL searches, return ONLY valid JSON (no markdown, no backticks):
{
  "channelInsight": "3-4 sentences based ONLY on live data fetched. Start with what you found live, e.g. 'Live data from TwitchTracker shows...' Be honest if data was unavailable.",
  "channelStats": [
    {"val":"X","key":"Current Followers"},
    {"val":"X","key":"Avg Viewers"},
    {"val":"X","key":"Peak Viewers"},
    {"val":"X","key":"Channel Age"}
  ],
  "dataSources": ["list of sites you actually pulled live data from"],
  "game": "Game Name",
  "gameReason": "3-4 sentences with ONLY live data — viewer counts, growth %, fit for their channel size",
  "gameStats": [
    {"val":"X","key":"Avg Viewers"},
    {"val":"X","key":"Viewer:Streamer Ratio"},
    {"val":"X","key":"30-Day Growth"},
    {"val":"X","key":"Active Streamers"},
    {"val":"X","key":"Discoverability"},
    {"val":"X","key":"Avg Session"}
  ],
  "dayData":[
    {"day":"Mon","v":38},{"day":"Tue","v":42},{"day":"Wed","v":45},
    {"day":"Thu","v":41},{"day":"Fri","v":68},{"day":"Sat","v":82},{"day":"Sun","v":74}
  ],
  "competitors":[
    {"name":"Real streamer from search","viewers":"~X avg","sat":false},
    {"name":"Real streamer from search","viewers":"~X avg","sat":true},
    {"name":"Real streamer from search","viewers":"~X avg","sat":false}
  ],
  "backupGame":"Game from live search",
  "backupReason":"Short reason from live data",
  "bestTime":"e.g. 8:00 PM – 11:00 PM",
  "timeReason":"2-3 sentences on why this window beats the others based on live viewer peak data",
  "tips":[
    "Tip with <strong>key point</strong> based on their actual live channel data",
    "Tip 2 personalised to their size and niche",
    "Tip 3",
    "Tip 4"
  ]
}`;

    try {
      const resp = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2500,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(`API error ${resp.status}: ${JSON.stringify(errData)}`);
      }

      const data = await resp.json();

      // Extract all text blocks — web search responses have multiple content blocks
      const text = (data.content || [])
        .filter(b => b.type === "text")
        .map(b => b.text || "")
        .join("");

      if (!text) throw new Error("No text response received from Claude.");

      // Find the outermost JSON object in the response
      const si = text.indexOf("{");
      const ei = text.lastIndexOf("}");
      if (si === -1 || ei === -1) throw new Error("Claude didn't return JSON. Raw: " + text.slice(0, 200));

      const parsed = JSON.parse(text.slice(si, ei + 1));

      // Ensure all array fields exist so .map() never crashes
      const safe = {
        channelInsight: parsed.channelInsight || "Analysis complete — see recommendations below.",
        channelStats: Array.isArray(parsed.channelStats) ? parsed.channelStats : [],
        dataSources: Array.isArray(parsed.dataSources) ? parsed.dataSources : [],
        game: parsed.game || "Game not found",
        gameReason: parsed.gameReason || "",
        gameStats: Array.isArray(parsed.gameStats) ? parsed.gameStats : [],
        dayData: Array.isArray(parsed.dayData) ? parsed.dayData : [],
        competitors: Array.isArray(parsed.competitors) ? parsed.competitors : [],
        backupGame: parsed.backupGame || "",
        backupReason: parsed.backupReason || "",
        bestTime: parsed.bestTime || "See analysis",
        timeReason: parsed.timeReason || "",
        tips: Array.isArray(parsed.tips) ? parsed.tips : [],
      };

      setResult(safe);
      setPhase("result");
    } catch (e) {
      setError("Something went wrong — " + e.message + ". Please try again.");
      setPhase("result");
    }
  }

  async function sendChat(inputOverride) {
    const input = (inputOverride || chatInput).trim();
    if (!input || chatLoading) return;
    const newMsg = { role: "user", content: input };
    setMessages(prev => [...prev, newMsg]);
    setChatInput("");
    setChatLoading(true);

    const history = [...messages, newMsg].slice(0, -1).map(m =>
      `${m.role === "user" ? "Streamer" : "Advisor"}: ${m.content}`
    ).join("\n");

    const prompt = `You are a streaming growth advisor. Today: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.

Context from live analysis:
- Platform: ${platform} | Handle: ${handle} | Niche: ${niche}
- Recommended game: ${result?.game} | Best time: ${result?.bestTime}
- Channel insight: ${result?.channelInsight}
- Game reason: ${result?.gameReason}
- Tips: ${result?.tips?.join(" | ")}
- Data sources: ${result?.dataSources?.join(", ")}
${history ? `\nConversation:\n${history}` : ""}

Question: "${input}"

If current data is needed, use web_search now. Answer conversationally, under 200 words, use <strong> for key points. Be direct and actionable.`;

    try {
      const resp = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 600,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await resp.json();
      const reply = (data.content || [])
        .filter(b => b.type === "text")
        .map(b => b.text || "")
        .join("")
        .trim();
      setMessages(prev => [...prev, { role: "ai", content: reply || "Sorry, I couldn't get a response. Please try again." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", content: "Something went wrong. Please try again." }]);
    }
    setChatLoading(false);
  }

  const STEP_LABELS = [
    `Fetching ${handle}'s live channel page`,
    "Scraping TwitchTracker for real-time stats",
    `Searching trending games in ${niche}`,
    "Pulling viewer peak & competitor data",
    "Building your personalised strategy"
  ];

  if (phase === "form") return (
    <div>
      <div className="hero">
        <div className="hero-tag">Live AI Analysis</div>
        <h1>Your <span>Personal</span><br/>Stream Advisor</h1>
        <p>Real-time game & schedule recommendations — then chat to refine your strategy.</p>
      </div>
      <div className="main">
        {/* Platform */}
        <div className="card">
          <div className="section-label">Your Platform</div>
          <div className="platform-pills">
            {["twitch","youtube","tiktok"].map(p => (
              <div key={p} className={`pill ${platform===p?`active-${p}`:""}`} onClick={() => { setPlatform(p); setHandle(""); }}>
                {p==="twitch"?<TwitchIcon/>:p==="youtube"?<YouTubeIcon/>:<TikTokIcon/>}
                {p[0].toUpperCase()+p.slice(1)}
              </div>
            ))}
          </div>
          {platform && (
            <div className="field" style={{marginTop:12}}>
              <label>{platform==="twitch"?"Twitch Username":platform==="youtube"?"YouTube Channel Name":"TikTok Username"}</label>
              <input type="text" placeholder="@username or channel name" value={handle} onChange={e=>setHandle(e.target.value)}/>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="card">
          <div className="section-label">Your Content</div>
          <div className="field-row">
            <div className="field">
              <label>Your Niche</label>
              <select value={niche} onChange={e=>setNiche(e.target.value)}>
                <option value="">— Select a niche —</option>
                {NICHES.map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Sub-niche / extra info <span style={{color:"var(--ink3)",fontWeight:400}}>(optional)</span></label>
              <input type="text" placeholder="e.g. competitive, chill vibes" value={extraInfo} onChange={e=>setExtraInfo(e.target.value)}/>
            </div>
          </div>
        </div>

        {/* Time */}
        <div className="card">
          <div className="section-label">When Are You Available?</div>
          <p style={{fontSize:13,color:"var(--ink3)",marginBottom:12}}>Add your available streaming windows — we'll find the best one.</p>
          <div className="time-ranges">
            {timeSlots.map(s => (
              <div key={s.id} className="time-range-row">
                <div className="time-inputs">
                  <input type="time" value={s.start} onChange={e=>updateSlot(s.id,"start",e.target.value)}/>
                  <span className="time-sep">to</span>
                  <input type="time" value={s.end} onChange={e=>updateSlot(s.id,"end",e.target.value)}/>
                  <span className="time-preview">{s.start&&s.end?`${fmt(s.start)} – ${fmt(s.end)}`:""}</span>
                </div>
                {timeSlots.length>1 && <button className="remove-btn" onClick={()=>removeSlot(s.id)}>×</button>}
              </div>
            ))}
          </div>
          <button className="add-time-btn" onClick={addSlot}>＋ Add another time window</button>
        </div>

        <button className="cta-btn" disabled={!canSubmit} onClick={analyze}>
          Analyse My Channel & Find Best Setup →
        </button>
        <div className="notice-box">🔍 <strong>Live search enabled</strong> — we'll fetch your current channel page and real-time game data from TwitchTracker, SullyGnome, and StreamsCharts.</div>
      </div>
    </div>
  );

  if (phase === "loading") return (
    <div>
      <div className="hero">
        <div className="hero-tag">Live AI Analysis</div>
        <h1>Your <span>Personal</span><br/>Stream Advisor</h1>
        <p>Real-time game & schedule recommendations — then chat to refine your strategy.</p>
      </div>
      <div className="main">
        <div className="card loading-state">
          <div className="loader"></div>
          <p style={{fontWeight:600,fontSize:15}}>Running live analysis...</p>
          <ul className="loading-steps">
            {STEP_LABELS.map((label,i)=>(
              <li key={i} className={loadingStep>i+1?"done":loadingStep===i+1?"active":""}>
                <span className="step-dot"></span>
                <span dangerouslySetInnerHTML={{__html:label}}/>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div>
      <div className="hero"><div className="hero-tag">Live AI Analysis</div><h1>Your <span>Personal</span><br/>Stream Advisor</h1><p>Real-time recommendations — chat to refine your strategy.</p></div>
      <div className="main">
        <div className="card"><div className="error-box">⚠ {error}</div></div>
        <button className="reset-btn" onClick={()=>{setPhase("form");setError("");}}>← Try Again</button>
      </div>
    </div>
  );

  const r = result;
  const maxV = r?.dayData ? Math.max(...r.dayData.map(d=>d.v),1) : 100;

  return (
    <div>
      <div className="hero">
        <div className="hero-tag">Live AI Analysis</div>
        <h1>Your <span>Personal</span><br/>Stream Advisor</h1>
        <p>Real-time game & schedule recommendations — then chat to refine your strategy.</p>
      </div>
      <div className="main">

        {/* Channel Intel */}
        <div className="card">
          <span className="badge badge-live"><span className="live-dot"></span>Live Channel Data</span>
          <div style={{fontSize:14,color:"var(--ink2)",lineHeight:1.7}} dangerouslySetInnerHTML={{__html:r.channelInsight}}/>
          {r.channelStats && (
            <div className="stat-grid" style={{marginTop:"1rem"}}>
              {r.channelStats.map((s,i)=>(
                <div key={i} className="stat-box"><div className="stat-val">{s.val}</div><div className="stat-key">{s.key}</div></div>
              ))}
            </div>
          )}
          {r.dataSources && (
            <div className="source-row">
              {r.dataSources.map((s,i)=><span key={i} className="source-tag">📡 {s}</span>)}
            </div>
          )}
        </div>

        {/* Game */}
        <div className="card">
          <span className="badge badge-game">Best Game Pick</span>
          <div className="result-title">{r.game}</div>
          <div className="result-sub" dangerouslySetInnerHTML={{__html:r.gameReason}}/>
          {r.gameStats && (
            <div className="stat-grid">
              {r.gameStats.map((s,i)=>(
                <div key={i} className="stat-box"><div className="stat-val">{s.val}</div><div className="stat-key">{s.key}</div></div>
              ))}
            </div>
          )}
          {r.dayData && (
            <>
              <div style={{fontSize:11,color:"var(--ink3)",marginBottom:6,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"}}>Viewer activity by day</div>
              <div className="day-grid">
                {r.dayData.map((d,i)=>(
                  <div key={i} className="day-cell">
                    <div className="day-name">{d.day}</div>
                    <div className="day-bar"><div className="day-bar-fill" style={{height:`${Math.round((d.v/maxV)*100)}%`}}></div></div>
                    <div className="day-val">{d.v}K</div>
                  </div>
                ))}
              </div>
            </>
          )}
          {r.competitors && (
            <>
              <div style={{fontSize:11,color:"var(--ink3)",margin:"1rem 0 6px",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"}}>Top competitors</div>
              {r.competitors.map((c,i)=>(
                <div key={i} className="competitor-row">
                  <span className="comp-rank">#{i+1}</span>
                  <span className="comp-name">{c.name}</span>
                  <span className="comp-stat">{c.viewers}</span>
                  <span className={`comp-tag ${c.sat?"sat":"grow"}`}>{c.sat?"Saturated":"Growing"}</span>
                </div>
              ))}
            </>
          )}
          {r.backupGame && <div className="backup-row">🔀 <strong>Runner-up:</strong> {r.backupGame} — {r.backupReason}</div>}
        </div>

        {/* Time */}
        <div className="card">
          <span className="badge badge-time">Optimal Stream Time</span>
          <div className="result-title">{r.bestTime}</div>
          <div className="result-sub">{r.timeReason}</div>
        </div>

        {/* Tips */}
        <div className="card">
          <span className="badge badge-tip">Personalised Growth Tips</span>
          {r.tips?.map((t,i)=>(
            <div key={i} className="tip-row">
              <div className="tip-bullet">{i+1}</div>
              <div className="tip-text" dangerouslySetInnerHTML={{__html:t}}/>
            </div>
          ))}
        </div>

        {/* Chat */}
        <div className="card">
          <div className="chat-header">
            <div className="chat-header-dot"></div>
            <div>
              <div className="chat-header-text">Ask your AI stream advisor anything</div>
              <div className="chat-header-sub">Refine your strategy, explore other games, get deeper insights</div>
            </div>
          </div>
          <div className="messages">
            <div className="msg ai">
              <div className="msg-avatar">AI</div>
              <div className="msg-bubble">I just pulled your live channel data and ran a real-time analysis. Ask me anything to dig deeper — why I picked this game, what days to avoid, how to beat the competition, or whether to change your niche. 🎮</div>
            </div>
            {messages.map((m,i)=>(
              <div key={i} className={`msg ${m.role==="user"?"user":"ai"}`}>
                <div className="msg-avatar">{m.role==="user"?"You":"AI"}</div>
                <div className="msg-bubble" dangerouslySetInnerHTML={{__html:m.content}}/>
              </div>
            ))}
            {chatLoading && (
              <div className="msg ai">
                <div className="msg-avatar">AI</div>
                <div className="msg-bubble"><div className="chat-typing"><div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/></div></div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>
          <div className="quick-chips">
            {QUICK_CHIPS.map(c=><button key={c} className="chip" onClick={()=>sendChat(c)}>{c}</button>)}
          </div>
          <div className="chat-input-row">
            <textarea
              className="chat-input"
              rows={1}
              placeholder="Ask a follow-up question..."
              value={chatInput}
              onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();}}}
            />
            <button className="chat-send" disabled={chatLoading||!chatInput.trim()} onClick={()=>sendChat()}>Send →</button>
          </div>
        </div>

        <button className="reset-btn" onClick={()=>{setPhase("form");setResult(null);setMessages([]);setError("");}}>← Start Over</button>
      </div>
    </div>
  );
}
