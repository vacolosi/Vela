import { useState } from "react";

const C = {
  ink: "#1a1715", espresso: "#2c2520", walnut: "#3d352e", clay: "#6b6158",
  stone: "#9c948b", sand: "#cec8c0", parchment: "#e8e4de", cream: "#f4f2ee",
  white: "#fafaf8", blue: "#4a7c9b", blueWash: "#edf3f7", sage: "#5b7a5e",
  sageWash: "#eef3ee", warm: "#c4a882", warmLight: "#e8ddd0", risk: "#b5705e",
  riskWash: "#f8f0ed",
};

const Phone = ({ children, label, notes }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 48 }}>
    <div style={{
      width: 375, minHeight: 720, background: C.white,
      borderRadius: 40, border: `8px solid ${C.ink}`,
      overflow: "hidden",
      boxShadow: "0 24px 80px rgba(26,23,21,0.15), 0 8px 24px rgba(26,23,21,0.08)",
    }}>
      <div style={{ height: 48, background: C.white, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8 }}>
        <div style={{ width: 120, height: 5, background: C.ink, borderRadius: 3 }} />
      </div>
      <div style={{ maxHeight: 672, overflowY: "auto", overflowX: "hidden" }}>{children}</div>
    </div>
    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: C.ink }}>{label}</span>
    {notes && <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.clay, fontWeight: 300, maxWidth: 375, textAlign: "center", lineHeight: 1.5 }}>{notes}</div>}
  </div>
);

const ProductDot = ({ size = 40, color }) => (
  <div style={{ width: size, height: size * 1.25, borderRadius: 6, background: color || C.cream, border: `1px solid ${C.parchment}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <div style={{ width: size * 0.4, height: size * 0.65, borderRadius: 3, background: "rgba(255,255,255,0.5)" }} />
  </div>
);

const BottomNav = ({ active }) => (
  <div style={{ position: "sticky", bottom: 0, background: C.white, borderTop: `1px solid ${C.parchment}`, padding: "12px 0 8px", display: "flex", justifyContent: "space-around" }}>
    {[{ l: "Home" }, { l: "Explore" }, { l: "+", action: true }, { l: "Cabinet" }].map((item, i) => (
      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        {item.action ? (
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", marginTop: -20, boxShadow: "0 2px 12px rgba(26,23,21,0.2)" }}>
            <span style={{ color: C.cream, fontSize: 20, fontWeight: 300, lineHeight: 1, marginTop: -1 }}>+</span>
          </div>
        ) : (
          <>
            <div style={{ width: 20, height: 20, borderRadius: 4, background: item.l === active ? C.ink : "transparent", border: item.l === active ? "none" : `1.5px solid ${C.sand}` }} />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: item.l === active ? C.ink : C.stone, fontWeight: item.l === active ? 500 : 300 }}>{item.l}</span>
          </>
        )}
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════
// SCREEN 1: ONBOARDING HERO
// ═══════════════════════════════════════════
const OnboardingHero = () => (
  <div style={{ background: C.white, minHeight: 620, display: "flex", flexDirection: "column" }}>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 32px 48px" }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.15, marginBottom: 16 }}>Make beauty<br />make sense.</div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: C.clay, fontWeight: 300, lineHeight: 1.6, maxWidth: 280 }}>The intelligence layer between your collection and your next purchase.</div>
    </div>
    <div style={{ padding: "0 32px 48px" }}>
      <div style={{ padding: "16px 0", background: C.ink, borderRadius: 10, textAlign: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: C.cream, fontWeight: 400 }}>Start My Cabinet</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.stone, fontWeight: 300 }}>Already have an account? Sign in</span>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════
// SCREEN 2: ONBOARDING CATEGORIES
// ═══════════════════════════════════════════
const OnboardingCategories = () => (
  <div style={{ background: C.white, padding: "24px" }}>
    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone, marginBottom: 8 }}>Step 1 of 4</div>
    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: C.ink, marginBottom: 6 }}>Which categories are you active in?</div>
    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.clay, fontWeight: 300, marginBottom: 24, lineHeight: 1.5 }}>This helps us personalize your experience.</div>
    {["Skincare", "Makeup", "Hair", "Body"].map((cat, i) => (
      <div key={i} style={{ marginBottom: 14, padding: "16px 18px", background: C.cream, borderRadius: 10, border: `1px solid ${C.parchment}` }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: C.ink, fontWeight: 400, marginBottom: 10 }}>{cat}</div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Active", "Occasional", "Not a user"].map((opt, j) => (
            <div key={j} style={{ flex: 1, padding: "7px 0", borderRadius: 6, textAlign: "center", background: j === 0 && i < 2 ? C.ink : "transparent", border: j === 0 && i < 2 ? "none" : `1px solid ${C.sand}` }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: j === 0 && i < 2 ? C.cream : C.clay }}>{opt}</span>
            </div>
          ))}
        </div>
      </div>
    ))}
    <div style={{ padding: "14px 0", background: C.ink, borderRadius: 8, textAlign: "center", marginTop: 12 }}>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.cream }}>Continue</span>
    </div>
  </div>
);

// ═══════════════════════════════════════════
// SCREEN 3: ONBOARDING MAKEUP IDENTITY
// ═══════════════════════════════════════════
const OnboardingMakeup = () => (
  <div style={{ background: C.white, padding: "24px" }}>
    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone, marginBottom: 8 }}>Step 3 of 4</div>
    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: C.ink, marginBottom: 6 }}>How do you approach makeup?</div>
    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.clay, fontWeight: 300, marginBottom: 24, lineHeight: 1.5 }}>No right answer. This helps the engine understand you.</div>
    {[
      { tier: "Essentialist", desc: "I keep it simple. A few go-to products that work and I'm out the door.", sel: false },
      { tier: "Curator", desc: "I want one of everything — and I want each one to be the best choice for me.", sel: true },
      { tier: "Enthusiast", desc: "I have my full kit dialed in, and I love building options within my favorites.", sel: false },
      { tier: "Creative", desc: "Makeup is my medium. I collect, experiment, and express.", sel: false },
    ].map((item, i) => (
      <div key={i} style={{ marginBottom: 8, padding: "14px 16px", borderRadius: 10, background: item.sel ? C.ink : C.cream, border: item.sel ? "none" : `1px solid ${C.parchment}` }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500, color: item.sel ? C.cream : C.ink, marginBottom: 3 }}>{item.tier}</div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 300, lineHeight: 1.5, color: item.sel ? C.sand : C.clay }}>{item.desc}</div>
      </div>
    ))}
    <div style={{ marginTop: 16, padding: "12px 18px", background: C.cream, borderRadius: 8, border: `1px solid ${C.parchment}` }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.clay, marginBottom: 8 }}>How often?</div>
      <div style={{ display: "flex", gap: 8 }}>
        {["Active", "Occasional"].map((o, j) => (
          <div key={j} style={{ flex: 1, padding: "8px 0", borderRadius: 6, textAlign: "center", background: j === 0 ? C.ink : "transparent", border: j === 0 ? "none" : `1px solid ${C.sand}` }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: j === 0 ? C.cream : C.clay }}>{o}</span>
          </div>
        ))}
      </div>
    </div>
    <div style={{ padding: "14px 0", background: C.ink, borderRadius: 8, textAlign: "center", marginTop: 16 }}>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.cream }}>Continue</span>
    </div>
  </div>
);

// ═══════════════════════════════════════════
// SCREEN 4: HOME
// ═══════════════════════════════════════════
const HomePage = () => (
  <div style={{ background: C.white }}>
    <div style={{ padding: "14px 24px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, fontStyle: "italic", color: C.ink }}>Home</div>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.cream, border: `1px solid ${C.parchment}` }} />
    </div>
    <div style={{ padding: "16px 24px 20px" }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone, marginBottom: 10 }}>Alignment</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 300, color: C.ink, lineHeight: 1 }}>78</span>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: C.sage }}>+3</span>
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.stone, fontWeight: 300, marginTop: 4 }}>Your routine is well-balanced with minor coverage gaps.</div>
    </div>
    <div style={{ padding: "0 24px 24px" }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
        <span>Selected for you</span><span style={{ color: C.blue }}>See all →</span>
      </div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
        {[{ b: "Supergoop", n: "Unseen SPF" }, { b: "Paula's Choice", n: "BHA Liquid" }, { b: "Tatcha", n: "Dewy Cream" }].map((p, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: 68 }}>
            <ProductDot size={48} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 7, color: C.stone, textTransform: "uppercase" }}>{p.b}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: C.walnut }}>{p.n}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ padding: "0 24px 20px" }}>
      {[
        { cat: "Skincare", score: 82, change: "+2", status: "Coverage complete", statusColor: C.sage, count: "5 active · 12 total" },
        { cat: "Makeup", score: 74, change: "→", status: "Shade profile incomplete", statusColor: C.warm, count: "18 total · 2 edits" },
        { cat: "Hair", score: 68, change: "+5", status: "Protection missing", statusColor: C.risk, count: "4 active · 7 total" },
      ].map((item, i) => (
        <div key={i} style={{ background: C.cream, borderRadius: 10, padding: "16px 18px", marginBottom: 8, border: `1px solid ${C.parchment}`, display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: C.ink }}>{item.cat}</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: item.statusColor, fontWeight: 300, marginTop: 2 }}>{item.status}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "flex-end" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.ink }}>{item.score}</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.sage }}>{item.change}</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: C.stone, marginTop: 2 }}>{item.count}</div>
          </div>
        </div>
      ))}
      <div style={{ background: C.cream, borderRadius: 10, padding: "16px 18px", border: `1px dashed ${C.sand}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: C.stone }}>Body</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.sand, fontWeight: 300, marginTop: 2 }}>Add 1 product to unlock</div>
        </div>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.blue }}>+ Add</span>
      </div>
    </div>
    <BottomNav active="Home" />
  </div>
);

// ═══════════════════════════════════════════
// SCREEN 5: PRODUCT PAGE
// ═══════════════════════════════════════════
const ProductPage = () => (
  <div style={{ background: C.white }}>
    <div style={{ padding: "14px 24px 0", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.stone }}>← Back</span>
    </div>
    <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 80, height: 130, borderRadius: 10, background: C.cream, border: `1px solid ${C.parchment}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 24px rgba(26,23,21,0.06)" }}>
        <div style={{ width: 32, height: 65, borderRadius: 5, background: C.parchment }} />
      </div>
    </div>
    <div style={{ padding: "4px 24px 16px" }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.stone, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>The Ordinary</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.ink, lineHeight: 1.2, marginBottom: 4 }}>Glycolic Acid 7% Toning Solution</div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: C.walnut, fontWeight: 300 }}>$9.90</div>
    </div>
    <div style={{ margin: "0 24px", padding: "16px 18px", background: C.cream, borderRadius: 10, border: `1px solid ${C.parchment}` }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone, marginBottom: 12 }}>Alignment</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        {["Low", "Moderate", "High"].map((l, i) => <span key={i} style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8, color: C.sand }}>{l}</span>)}
      </div>
      <div style={{ height: 3, background: C.parchment, borderRadius: 2, position: "relative", marginBottom: 14 }}>
        <div style={{ position: "absolute", left: "42%", top: -5, width: 13, height: 13, borderRadius: "50%", background: C.warm, border: `2.5px solid ${C.white}`, boxShadow: "0 1px 4px rgba(26,23,21,0.15)" }} />
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: C.warm, fontWeight: 500, marginBottom: 4 }}>Moderate</div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.clay, fontWeight: 300, lineHeight: 1.5 }}>Compatible with 3 products, but overlaps with an existing exfoliant.</div>
    </div>
    {/* Risk — shown FIRST when triggered */}
    <div style={{ padding: "12px 24px 0" }}>
      <div style={{ padding: "12px 14px", background: C.riskWash, borderRadius: 8, border: `1px solid ${C.risk}20` }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: C.risk, marginBottom: 4 }}>Risk</div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.walnut, fontWeight: 300, lineHeight: 1.5 }}>You have Retinol 0.5% in your lineup. Using glycolic acid alongside a retinoid may increase irritation potential. Consider alternating nights.</div>
      </div>
    </div>
    {/* Actions — immediately after alignment + risk */}
    <div style={{ padding: "14px 24px", display: "flex", gap: 10 }}>
      <div style={{ flex: 1, padding: "13px 0", background: C.ink, borderRadius: 8, textAlign: "center" }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.cream }}>Add to Cabinet</span>
      </div>
      <div style={{ padding: "13px 20px", border: `1px solid ${C.sand}`, borderRadius: 8, textAlign: "center" }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.clay }}>Buy</span>
      </div>
    </div>
    {/* Reasoning sections — below the fold */}
    <div style={{ padding: "0 24px 0" }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone, marginBottom: 8 }}>Details</div>
      {[
        { label: "Overlap", text: "Overlaps with The Ordinary Lactic Acid 10% — both serve an AHA exfoliation role.", link: "See swap logic →" },
        { label: "Coverage", text: "Does not expand treatment coverage — your exfoliation role is already filled." },
        { label: "Compatibility", text: "Integrates with your hydration and barrier support products." },
      ].map((s, i) => (
        <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${C.parchment}` }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: C.stone, marginBottom: 4 }}>{s.label}</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.walnut, fontWeight: 300, lineHeight: 1.5 }}>{s.text}</div>
          {s.link && <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.blue, marginTop: 6 }}>{s.link}</div>}
        </div>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════
// SCREEN 6: CABINET
// ═══════════════════════════════════════════
const CabinetView = () => (
  <div style={{ background: C.white }}>
    <div style={{ padding: "14px 24px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, fontStyle: "italic", color: C.ink }}>Cabinet</div>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.blue }}>Edit</span>
    </div>
    <div style={{ display: "flex", gap: 0, padding: "0 24px", borderBottom: `1px solid ${C.parchment}` }}>
      {["All", "Skincare", "Makeup", "Hair", "Body"].map((t, i) => (
        <div key={i} style={{ padding: "9px 11px", fontFamily: "'Outfit', sans-serif", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: i === 0 ? C.ink : C.stone, fontWeight: i === 0 ? 500 : 300, borderBottom: i === 0 ? `2px solid ${C.ink}` : "2px solid transparent", marginBottom: -1 }}>{t}</div>
      ))}
    </div>
    <div style={{ padding: "12px 24px", display: "flex", gap: 20, borderBottom: `1px solid ${C.parchment}` }}>
      <div><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: C.ink }}>47</span><span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: C.stone, marginLeft: 4 }}>total</span></div>
      <div><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: C.sage }}>12</span><span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: C.stone, marginLeft: 4 }}>in lineup</span></div>
    </div>
    <div style={{ padding: "0 24px" }}>
      {[
        { b: "CeraVe", n: "Hydrating Facial Cleanser", tag: "Hydration", active: true },
        { b: "The Ordinary", n: "Niacinamide 10% + Zinc 1%", tag: "Oil Regulation", active: true },
        { b: "Paula's Choice", n: "2% BHA Liquid Exfoliant", tag: "Exfoliation", active: true },
        { b: "Drunk Elephant", n: "A-Passioni Retinol Cream", tag: "Retinoids", active: true },
        { b: "Supergoop!", n: "Unseen Sunscreen SPF 50", tag: "SPF", active: true },
        { b: "CeraVe", n: "Moisturizing Cream", tag: "Barrier", active: false },
        { b: "Rare Beauty", n: "Soft Pinch Liquid Blush", tag: "Blush", active: false },
      ].map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.parchment}` }}>
          <ProductDot size={36} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8, color: C.stone, letterSpacing: "0.06em", textTransform: "uppercase" }}>{p.b}</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.ink, lineHeight: 1.3 }}>{p.n}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 3, border: `1px solid ${C.sand}`, color: C.clay }}>{p.tag}</span>
            {p.active && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.sage }}>In lineup</span>}
          </div>
        </div>
      ))}
    </div>
    <BottomNav active="Cabinet" />
  </div>
);

// ═══════════════════════════════════════════
// SCREEN 7: SCAN
// ═══════════════════════════════════════════
const ScanFlow = () => (
  <div style={{ background: C.ink, minHeight: 672, display: "flex", flexDirection: "column" }}>
    <div style={{ padding: "8px 20px 0", display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: C.stone }}>✕</span>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.stone }}>Flash</span>
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone, marginBottom: 24 }}>Point at product barcode</div>
      <div style={{ width: 240, height: 160, position: "relative" }}>
        {[[0, 0, "top", "left"], [0, 1, "top", "right"], [1, 0, "bottom", "left"], [1, 1, "bottom", "right"]].map(([r, co, v, h], i) => (
          <div key={i} style={{ position: "absolute", [v]: 0, [h]: 0, width: 30, height: 30, [`border${v.charAt(0).toUpperCase() + v.slice(1)}`]: `2px solid ${C.cream}`, [`border${h.charAt(0).toUpperCase() + h.slice(1)}`]: `2px solid ${C.cream}` }} />
        ))}
        <div style={{ position: "absolute", top: "50%", left: 8, right: 8, height: 1, background: C.blue, opacity: 0.8 }} />
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.stone, fontWeight: 300, marginTop: 24 }}>or search by name</div>
    </div>
    <div style={{ padding: "0 32px 14px" }}>
      <div style={{ display: "flex", gap: 4, background: C.espresso, borderRadius: 8, padding: 4 }}>
        <div style={{ flex: 1, padding: "9px 0", borderRadius: 6, background: C.walnut, textAlign: "center" }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.cream }}>Scan to Check</span>
        </div>
        <div style={{ flex: 1, padding: "9px 0", borderRadius: 6, textAlign: "center" }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.stone }}>Scan to Add</span>
        </div>
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: C.clay, fontWeight: 300, textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>Check: see alignment before buying. Add: batch-add at home.</div>
    </div>
    <div style={{ padding: "0 32px 28px" }}>
      <div style={{ padding: "11px 14px", background: C.espresso, borderRadius: 8 }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.clay }}>Search product name or brand...</span>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════
// SCREEN 8: EXPLORE
// ═══════════════════════════════════════════
const ExplorePage = () => (
  <div style={{ background: C.white }}>
    <div style={{ padding: "14px 24px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, fontStyle: "italic", color: C.ink }}>Explore</div>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.cream, border: `1px solid ${C.parchment}` }} />
    </div>
    <div style={{ padding: "0 24px 16px" }}>
      <div style={{ padding: "11px 14px", background: C.cream, borderRadius: 8, border: `1px solid ${C.parchment}` }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.sand }}>Search products, brands, people...</span>
      </div>
    </div>
    <div style={{ padding: "0 24px 20px" }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
        <span>Selected</span><span style={{ color: C.blue }}>See all →</span>
      </div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
        {[{ b: "Supergoop", n: "Unseen SPF 50", p: "$38" }, { b: "The Ordinary", n: "HA 2% + B5", p: "$9" }, { b: "Rhode", n: "Barrier Butter", p: "$36" }].map((p, i) => (
          <div key={i} style={{ minWidth: 105, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.parchment}`, flexShrink: 0 }}>
            <div style={{ height: 85, background: C.cream, display: "flex", alignItems: "center", justifyContent: "center" }}><ProductDot size={36} /></div>
            <div style={{ padding: "8px" }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 7, color: C.stone, textTransform: "uppercase" }}>{p.b}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: C.ink, lineHeight: 1.2, marginTop: 1 }}>{p.n}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: C.clay, fontWeight: 300, marginTop: 3 }}>{p.p}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ padding: "0 24px 20px" }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone, marginBottom: 12 }}>Trending Edits</div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
        {[
          { n: "Summer Glow", cr: "Alix Earle", s: "2.1k", bg: `linear-gradient(135deg, ${C.warmLight}, ${C.cream})`, dark: false },
          { n: "Glass Skin", cr: "Nikki", s: "1.8k", bg: `linear-gradient(135deg, ${C.blueWash}, ${C.cream})`, dark: false },
          { n: "90s Brown Lip", cr: "Maya", s: "943", bg: `linear-gradient(135deg, ${C.walnut}, ${C.espresso})`, dark: true },
        ].map((e, i) => (
          <div key={i} style={{ minWidth: 130, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.parchment}`, flexShrink: 0 }}>
            <div style={{ height: 80, background: e.bg, display: "flex", alignItems: "flex-end", padding: 8 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontStyle: "italic", color: e.dark ? C.cream : C.ink }}>{e.n}</span>
            </div>
            <div style={{ padding: "8px" }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: C.clay, fontWeight: 300 }}>{e.cr}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.stone, marginTop: 2 }}>{e.s} saves</div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ padding: "0 24px 20px" }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
        <span>Cabinets to Explore</span><span style={{ color: C.blue }}>See all →</span>
      </div>
      {[
        { n: "Alix Earle", h: "@alixearle", prods: 47, common: 8, desc: "Full glam · Dewy base · Bold lip" },
        { n: "Hyram", h: "@hyram", prods: 23, common: 12, desc: "Skincare-focused · Minimal makeup" },
      ].map((cr, i) => (
        <div key={i} style={{ padding: "14px", background: C.cream, borderRadius: 10, border: `1px solid ${C.parchment}`, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.clay, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: C.cream, fontStyle: "italic" }}>{cr.n[0]}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.ink }}>{cr.n}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: C.stone, fontWeight: 300 }}>{cr.h}</div>
            </div>
            <div style={{ padding: "5px 10px", border: `1px solid ${C.sand}`, borderRadius: 5 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: C.clay }}>View</span>
            </div>
          </div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: C.clay, fontWeight: 300, marginBottom: 6 }}>{cr.desc}</div>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.stone }}>{cr.prods} products</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: C.sage }}>{cr.common} in common</span>
          </div>
        </div>
      ))}
    </div>
    <BottomNav active="Explore" />
  </div>
);

// ═══════════════════════════════════════════
// SCREEN 9: CREATOR CABINET
// ═══════════════════════════════════════════
const CreatorCabinet = () => (
  <div style={{ background: C.white }}>
    <div style={{ padding: "14px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.stone }}>← Explore</span>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: "italic", color: C.ink }}>Cabinet</div>
    </div>
    <div style={{ padding: "24px 24px 20px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 12px", background: C.clay, border: `2px solid ${C.warm}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.cream, fontStyle: "italic" }}>A</span>
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.ink }}>Alix Earle</div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.stone, fontWeight: 300, marginBottom: 8 }}>@alixearle</div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.clay, fontWeight: 300, lineHeight: 1.5, maxWidth: 240, margin: "0 auto 14px" }}>Full glam enthusiast. Skincare-first. Loves a dewy base and bold lip.</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 28, marginBottom: 16 }}>
        {[{ v: "47", l: "Products" }, { v: "6", l: "Edits" }, { v: "12.4k", l: "Saves" }].map((s, i) => (
          <div key={i}><div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: C.ink }}>{s.v}</div><div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8, color: C.stone, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.l}</div></div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <div style={{ padding: "8px 20px", background: C.ink, borderRadius: 6 }}><span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.cream }}>Save Cabinet</span></div>
        <div style={{ padding: "8px 14px", border: `1px solid ${C.sand}`, borderRadius: 6 }}><span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.clay }}>Compare</span></div>
      </div>
    </div>
    <div style={{ margin: "0 24px 16px", padding: "12px 16px", background: C.blueWash, borderRadius: 8, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.blue, flexShrink: 0 }} />
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: C.blue, fontWeight: 300, lineHeight: 1.4 }}>You share 8 products. See how your routines compare.</div>
    </div>
    <div style={{ display: "flex", padding: "0 24px", borderBottom: `1px solid ${C.parchment}`, marginBottom: 12 }}>
      {["All", "Skincare", "Makeup", "Hair"].map((t, i) => (
        <div key={i} style={{ padding: "9px 14px", fontFamily: "'Outfit', sans-serif", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: i === 0 ? C.ink : C.stone, fontWeight: i === 0 ? 500 : 300, borderBottom: i === 0 ? `2px solid ${C.ink}` : "2px solid transparent", marginBottom: -1 }}>{t}</div>
      ))}
    </div>
    <div style={{ padding: "0 24px" }}>
      {[
        { b: "CeraVe", n: "Hydrating Cleanser", tag: "Hydration", yours: true },
        { b: "Skinceuticals", n: "C E Ferulic", tag: "Antioxidants", yours: false },
        { b: "Paula's Choice", n: "BHA Liquid", tag: "Exfoliation", yours: true },
        { b: "Rare Beauty", n: "Liquid Blush — Happy", tag: "Cool", yours: false },
        { b: "Fenty Beauty", n: "Gloss Bomb — Fenty Glow", tag: "Staple", yours: true },
      ].map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderBottom: `1px solid ${C.parchment}` }}>
          <ProductDot size={32} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 8, color: C.stone, textTransform: "uppercase" }}>{p.b}</div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: C.ink, lineHeight: 1.3 }}>{p.n}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 7, textTransform: "uppercase", padding: "2px 6px", borderRadius: 3, background: `${C.warm}15`, color: C.warm }}>{p.tag}</span>
            {p.yours && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: C.sage }}>In your cabinet</span>}
          </div>
        </div>
      ))}
    </div>
    <div style={{ height: 40 }} />
  </div>
);

// ═══════════════════════════════════════════
// SCREEN 10: SETTINGS
// ═══════════════════════════════════════════
const SettingsView = () => (
  <div style={{ background: C.white }}>
    <div style={{ padding: "14px 24px 16px" }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, fontStyle: "italic", color: C.ink }}>Settings</div>
    </div>
    {[
      { section: "Profile", items: [{ l: "Shade Profile", v: "Medium, Warm" }, { l: "Skincare Goals", v: "Anti-aging, Hydration" }, { l: "Concerns", v: "Fine lines, Dryness" }] },
      { section: "Makeup", items: [{ l: "Identity", v: "Curator" }, { l: "Frequency", v: "Active" }] },
      { section: "Categories", items: [{ l: "Skincare", v: "Active", vc: C.sage }, { l: "Makeup", v: "Active", vc: C.sage }, { l: "Hair", v: "Occasional", vc: C.warm }, { l: "Body", v: "Not a user", vc: C.stone }] },
    ].map((sec, si) => (
      <div key={si} style={{ padding: "0 24px 16px" }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone, marginBottom: 8 }}>{sec.section}</div>
        {sec.items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.parchment}` }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.ink }}>{item.l}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: item.vc || C.clay, fontWeight: 300 }}>{item.v}</span>
              {!item.vc && <span style={{ color: C.sand, fontSize: 11 }}>›</span>}
            </div>
          </div>
        ))}
      </div>
    ))}
    <div style={{ padding: "0 24px 16px" }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone, marginBottom: 8 }}>Preferences</div>
      {["Clean beauty", "Fragrance-free", "Vegan", "Cruelty-free"].map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.parchment}` }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: C.ink }}>{p}</span>
          <div style={{ width: 36, height: 20, borderRadius: 10, background: i < 2 ? C.sage : C.sand, position: "relative" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.white, position: "absolute", top: 2, left: i < 2 ? 18 : 2, boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }} />
          </div>
        </div>
      ))}
    </div>
    <div style={{ padding: "0 24px 40px" }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.stone, marginBottom: 8 }}>Account</div>
      {["Subscription", "Reset Profile", "Clear Cabinet", "Sign Out"].map((a, i) => (
        <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${C.parchment}` }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: i >= 2 ? C.risk : C.ink }}>{a}</span>
        </div>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════
const allScreens = [
  { id: "hero", label: "1. Onboarding: Hero", group: "Onboarding", component: OnboardingHero, notes: "First screen. Primary CTA: Start My Cabinet." },
  { id: "categories", label: "2. Onboarding: Categories", group: "Onboarding", component: OnboardingCategories, notes: "Active / Occasional / Not a user per category." },
  { id: "makeup-id", label: "3. Onboarding: Makeup Identity", group: "Onboarding", component: OnboardingMakeup, notes: "Four tiers + Active/Occasional frequency toggle." },
  { id: "home", label: "4. Home", group: "Core", component: HomePage, notes: "Alignment score, selected products, category stack." },
  { id: "product", label: "5. Product Page", group: "Core", component: ProductPage, notes: "Alignment bar, 4 reasoning sections, action hierarchy." },
  { id: "cabinet", label: "6. Cabinet", group: "Core", component: CabinetView, notes: "All owned products. Tabs by category. Lineup badges." },
  { id: "scan", label: "7. Scan", group: "Core", component: ScanFlow, notes: "Camera viewfinder. Two modes: Check vs Add. Search fallback." },
  { id: "explore", label: "8. Explore", group: "Social", component: ExplorePage, notes: "Selected products, trending edits, public cabinets." },
  { id: "creator", label: "9. Creator Cabinet", group: "Social", component: CreatorCabinet, notes: "Public cabinet. 'X in common' hook. Save/Compare actions." },
  { id: "settings", label: "10. Settings", group: "Core", component: SettingsView, notes: "Profile, identity, categories, preferences, account." },
];

export default function AllWireframes() {
  const [filter, setFilter] = useState("All");
  const groups = ["All", "Onboarding", "Core", "Social"];
  const visible = filter === "All" ? allScreens : allScreens.filter(s => s.group === filter);

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: "#f0eeea", minHeight: "100vh", padding: "40px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Outfit:wght@200;300;400;500;600&family=JetBrains+Mono:wght@300;400&display=swap" rel="stylesheet" />

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.stone, marginBottom: 6 }}>Beauty Intelligence Platform</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 300, fontStyle: "italic", color: C.ink, marginBottom: 4 }}>Complete Wireframes</div>
        <div style={{ fontSize: 12, color: C.clay, fontWeight: 300, marginBottom: 20 }}>10 screens covering onboarding, core app, and social features</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {groups.map(g => (
            <button key={g} onClick={() => setFilter(g)} style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "6px 14px", borderRadius: 4, cursor: "pointer",
              border: filter === g ? `1px solid ${C.ink}` : `1px solid ${C.sand}`,
              background: filter === g ? C.ink : "transparent",
              color: filter === g ? C.cream : C.clay,
            }}>{g}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center" }}>
        {visible.map(s => (
          <Phone key={s.id} label={s.label} notes={s.notes}>
            <s.component />
          </Phone>
        ))}
      </div>
    </div>
  );
}
