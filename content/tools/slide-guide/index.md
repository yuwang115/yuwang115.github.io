---
title: "SLIDE: Understand How Ice Slides Over Bedrock"
breadcrumb_title: "SLIDE Guide"
seo:
  title: "SLIDE Guide: Sliding Regime Explorer"
summary: "SLIDE visualises the unified glacial sliding law. Learn what controls how fast glaciers slide, why it matters for ice sheet predictions, and explore the physics interactively."
date: 2026-04-07
lastmod: 2026-04-07
layout: explorer-landing
type: page
slug: slide-guide
profile: false
share: true
show_breadcrumb: false
hide_date: true
reading_time: false
explorer_theme: ice
explorer_kicker: "Sliding Regime Explorer"
image:
  alt_text: "SLIDE explorer showing a 3D surface of the unified sliding law."
  preview_only: true
---

<div class="explorer-landing explorer-landing--ice">
<section class="explorer-ice-hero explorer-ice-hero--split">
<div class="explorer-hero-copy">
<div class="explorer-ice-brand">
<img class="explorer-ice-logo" src="/tools/SLIDE_logo.jpg" alt="SLIDE logo" loading="eager" />
</div>
<p class="explorer-ice-lead">Explore the Physics of Glacial Sliding</p>
<p class="explorer-summary">SLIDE lets you interactively explore how sliding velocity, effective pressure, and the sliding coefficient govern basal dynamics &mdash; the hidden physics at the ice&ndash;bedrock interface that controls glacier speed.</p>
<div class="explorer-actions explorer-actions--hero-grid">
<a class="explorer-button explorer-button--primary explorer-button--hero-launch" href="/tools/SLIDE.html">Launch Explorer</a>
<a class="explorer-button explorer-button--ghost explorer-button--hero-antarctica" href="#why-sliding-matters">Why Sliding Matters</a>
<a class="explorer-button explorer-button--ghost explorer-button--hero-source" href="#story-presets">Story Presets</a>
<a class="explorer-button explorer-button--ghost explorer-button--hero-greenland" href="#quick-start">Quick Start</a>
</div>
</div>
<div class="explorer-showcase-breakout explorer-showcase-breakout--hero">
<div class="explorer-showcase-frame explorer-showcase-frame--mobile-linkout">
<iframe title="SLIDE interactive 3D preview" src="/tools/SLIDE_3d_showcase.html" loading="eager" fetchpriority="high" referrerpolicy="no-referrer" style="width:100%;height:100%;border:0;display:block;"></iframe>
<a class="explorer-showcase-mobile-link" href="/tools/SLIDE.html" aria-label="Open the full SLIDE interface">
<span class="explorer-showcase-mobile-link-badge">Tap for full SLIDE interface</span>
</a>
</div>
</div>
</section>

<section id="why-sliding-matters" class="explorer-section explorer-feature-section">
<div class="explorer-region-intro">
<p class="explorer-region-label">Background</p>
<h2>Why Basal Sliding Matters</h2>
<p>What happens at the base of a glacier &mdash; hidden under kilometres of ice &mdash; is one of the most important controls on how fast ice sheets lose mass.</p>
</div>
<div class="explorer-feature-grid">
<article class="explorer-feature-card">
<h3>The Hidden Speed Controller</h3>
<p>Glaciers move in two ways: internal deformation (ice crystals slowly creeping) and basal sliding (the whole ice mass gliding over the bed). For fast-flowing ice streams that drain Antarctica, basal sliding accounts for nearly all the motion.</p>
</article>
<article class="explorer-feature-card">
<h3>Water Is the Key</h3>
<p>Meltwater at the glacier&rsquo;s base acts as a lubricant. More water means higher water pressure, lower &ldquo;effective pressure&rdquo; (the grip between ice and bed), and faster sliding. This is why glaciers can speed up dramatically during warm seasons or when subglacial lakes drain.</p>
</article>
<article class="explorer-feature-card">
<h3>Two Regimes, One Law</h3>
<p>On hard bedrock, sliding follows the classical <strong>Weertman</strong> regime &mdash; friction increases with speed. On soft, waterlogged sediment, friction hits a ceiling set by the sediment&rsquo;s strength (the <strong>Coulomb</strong> regime). SLIDE visualises the unified law that smoothly connects both.</p>
</article>
<article class="explorer-feature-card">
<h3>Why Models Get It Wrong</h3>
<p>Ice sheet models are only as good as their sliding laws. Using the wrong regime can drastically overestimate or underestimate future ice loss. Understanding the transition between Weertman and Coulomb behaviour is essential for trustworthy sea-level projections.</p>
</article>
</div>
</section>

<section id="how-slide-works" class="explorer-section explorer-feature-section">
<div class="explorer-region-intro">
<p class="explorer-region-label">Features</p>
<h2>What You&rsquo;ll Find in SLIDE</h2>
</div>
<div class="explorer-feature-grid">
<article class="explorer-feature-card">
<h3>2D Friction Curve (Slice Inspector)</h3>
<p>Shows the relationship between sliding velocity and basal shear stress at a given effective pressure. The curve transitions smoothly from the Weertman (rising) regime to the Coulomb (flat) regime. A probe marker lets you explore specific velocities.</p>
</article>
<article class="explorer-feature-card">
<h3>3D Regime Surface</h3>
<p>The full parameter space rendered as an interactive 3D surface you can rotate and zoom. One axis is velocity, another is effective pressure, and the surface height shows the resulting stress. Colour encodes the regime: teal for Weertman, gold for transition, magenta for Coulomb.</p>
</article>
<article class="explorer-feature-card">
<h3>Regime Classification</h3>
<p>SLIDE automatically identifies which regime your current parameters fall into: <strong>Weertman-like</strong> (hard bed, friction grows with speed), <strong>Transition</strong> (crossing the ridge between regimes), or <strong>Coulomb-limited</strong> (soft bed, friction capped by sediment strength).</p>
</article>
<article class="explorer-feature-card">
<h3>Interactive Sliders</h3>
<p>Adjust five parameters in real time: sliding coefficient <em>C</em>, bed roughness <em>A<sub>s</sub></em>, Glen&rsquo;s flow law exponent <em>n</em>, effective pressure <em>N</em>, and probe velocity <em>u</em>. Every change instantly updates both the 2D curve and 3D surface.</p>
</article>
</div>
</section>

<section id="story-presets" class="explorer-section explorer-region">
<div class="explorer-region-intro">
<p class="explorer-region-label">Story Presets</p>
<h2>Four Real-World Glacier Scenarios</h2>
<p>Each preset configures SLIDE to match a different type of glacier. Click any preset to see how the same unified sliding law produces very different behaviour depending on the environment.</p>
</div>
<div class="explorer-feature-grid">
<article class="explorer-feature-card">
<h3>Alpine Glacier</h3>
<p>A hard-bedrock mountain glacier with a well-drained subglacial system. High effective pressure (N&nbsp;=&nbsp;1.5&nbsp;MPa) means strong ice&ndash;bed coupling. Sits firmly in the <strong>Weertman regime</strong> &mdash; friction increases steadily with sliding velocity.</p>
<p style="margin-top:0.8rem;"><a class="explorer-button explorer-button--ghost" href="/tools/SLIDE.html?preset=alpine" style="font-size:0.84rem;padding:0.5rem 1rem;">Try this preset</a></p>
</article>
<article class="explorer-feature-card">
<h3>Outlet Glacier</h3>
<p>A moderate marine-terminating outlet with balanced conditions near the transition threshold. Effective pressure is lower (N&nbsp;=&nbsp;1.0&nbsp;MPa), placing it right at the boundary where Weertman behaviour gives way to Coulomb &mdash; the <strong>transition zone</strong>.</p>
<p style="margin-top:0.8rem;"><a class="explorer-button explorer-button--ghost" href="/tools/SLIDE.html?preset=outlet" style="font-size:0.84rem;padding:0.5rem 1rem;">Try this preset</a></p>
</article>
<article class="explorer-feature-card">
<h3>Ice Stream</h3>
<p>Fast flow on deformable till near flotation. Very low effective pressure (N&nbsp;=&nbsp;0.15&nbsp;MPa) means the ice barely grips the bed. Deeply <strong>Coulomb-limited</strong> &mdash; stress is capped by the sediment&rsquo;s yield strength regardless of how fast the ice moves.</p>
<p style="margin-top:0.8rem;"><a class="explorer-button explorer-button--ghost" href="/tools/SLIDE.html?preset=ice-stream" style="font-size:0.84rem;padding:0.5rem 1rem;">Try this preset</a></p>
</article>
<article class="explorer-feature-card">
<h3>Tidewater Surge</h3>
<p>A lubricated marine bed with rapid sliding well past the transition ridge. Moderate effective pressure (N&nbsp;=&nbsp;0.3&nbsp;MPa) but very high velocity (2000&nbsp;m/yr). The ice is sliding so fast it has pushed deep into the <strong>Coulomb regime</strong>.</p>
<p style="margin-top:0.8rem;"><a class="explorer-button explorer-button--ghost" href="/tools/SLIDE.html?preset=tidewater" style="font-size:0.84rem;padding:0.5rem 1rem;">Try this preset</a></p>
</article>
</div>
</section>

<section id="quick-start" class="explorer-section explorer-region">
<div class="explorer-region-intro">
<p class="explorer-region-label">Getting Started</p>
<h2>Quick Start Guide</h2>
<p>Five steps to start exploring glacial sliding physics.</p>
</div>
<div class="explorer-feature-grid" style="grid-template-columns: 1fr;">
<article class="explorer-feature-card" style="max-width:none;">
<div style="display:grid;gap:1.5rem;">
<div style="display:grid;grid-template-columns:2.6rem 1fr;gap:1rem;align-items:start;">
<span style="display:flex;align-items:center;justify-content:center;width:2.6rem;height:2.6rem;border-radius:50%;font-weight:800;font-size:1.1rem;background:linear-gradient(135deg,#0f7ea8,#17906b);color:#fff;flex-shrink:0;">1</span>
<div>
<strong>Start with a Story Preset</strong>
<p style="margin:0.3rem 0 0;">Click one of the four preset buttons (Alpine, Outlet, Ice Stream, Tidewater) to load a real-world scenario. The 2D curve and 3D surface update instantly.</p>
</div>
</div>
<div style="display:grid;grid-template-columns:2.6rem 1fr;gap:1rem;align-items:start;">
<span style="display:flex;align-items:center;justify-content:center;width:2.6rem;height:2.6rem;border-radius:50%;font-weight:800;font-size:1.1rem;background:linear-gradient(135deg,#0f7ea8,#17906b);color:#fff;flex-shrink:0;">2</span>
<div>
<strong>Read the 2D curve</strong>
<p style="margin:0.3rem 0 0;">The left panel shows <strong>basal shear stress vs. sliding velocity</strong>. The curve rises steeply at low speeds (Weertman) then flattens at high speeds (Coulomb). The orange marker shows your current probe velocity.</p>
</div>
</div>
<div style="display:grid;grid-template-columns:2.6rem 1fr;gap:1rem;align-items:start;">
<span style="display:flex;align-items:center;justify-content:center;width:2.6rem;height:2.6rem;border-radius:50%;font-weight:800;font-size:1.1rem;background:linear-gradient(135deg,#0f7ea8,#17906b);color:#fff;flex-shrink:0;">3</span>
<div>
<strong>Drag the N (effective pressure) slider</strong>
<p style="margin:0.3rem 0 0;">This is the most important control. Lowering <em>N</em> simulates more water at the bed, reducing the ice&rsquo;s grip. Watch the 3D surface reshape as the Coulomb ceiling drops and the transition shifts.</p>
</div>
</div>
<div style="display:grid;grid-template-columns:2.6rem 1fr;gap:1rem;align-items:start;">
<span style="display:flex;align-items:center;justify-content:center;width:2.6rem;height:2.6rem;border-radius:50%;font-weight:800;font-size:1.1rem;background:linear-gradient(135deg,#0f7ea8,#17906b);color:#fff;flex-shrink:0;">4</span>
<div>
<strong>Explore the 3D surface</strong>
<p style="margin:0.3rem 0 0;">Click and drag to rotate the 3D plot. The golden ridge line marks the transition between Weertman and Coulomb regimes. The cyan line shows the current N-slice. Find where your glacier sits on the surface.</p>
</div>
</div>
<div style="display:grid;grid-template-columns:2.6rem 1fr;gap:1rem;align-items:start;">
<span style="display:flex;align-items:center;justify-content:center;width:2.6rem;height:2.6rem;border-radius:50%;font-weight:800;font-size:1.1rem;background:linear-gradient(135deg,#0f7ea8,#17906b);color:#fff;flex-shrink:0;">5</span>
<div>
<strong>Watch the regime indicator</strong>
<p style="margin:0.3rem 0 0;">The dashboard tells you which regime you&rsquo;re in and why. Try switching between Alpine (Weertman) and Ice Stream (Coulomb) to see how dramatically the physics changes even though the underlying law is the same.</p>
</div>
</div>
</div>
</article>
</div>
</section>

<section id="key-concepts" class="explorer-section explorer-region">
<div class="explorer-region-intro">
<p class="explorer-region-label">Learn</p>
<h2>Key Concepts Explained</h2>
<p>These explanations cover the physics behind what you see in SLIDE.</p>
</div>
<div class="explorer-faq">
<details>
<summary>What is effective pressure?</summary>
<p>The difference between the weight of ice pushing down (overburden pressure) and the water pressure pushing up at the base. When subglacial water pressure is high, effective pressure is low, and the ice barely grips the bed. Think of it like an air hockey table: the more air you pump, the less friction, and the puck glides freely.</p>
</details>
<details>
<summary>What is the Weertman regime?</summary>
<p>The classical hard-bed sliding behaviour, where basal shear stress increases with sliding velocity. Named after Johannes Weertman, who first described it in the 1950s. This applies when ice slides over clean, hard bedrock with relatively little water &mdash; like an alpine glacier on granite. The faster the ice slides, the more resistance it encounters.</p>
</details>
<details>
<summary>What is the Coulomb regime?</summary>
<p>When ice sits on soft, waterlogged sediment (till), the maximum friction is limited by the sediment&rsquo;s shear strength &mdash; which depends on effective pressure, not velocity. No matter how fast the ice moves, friction cannot exceed this ceiling. This explains why ice streams can flow hundreds of metres per year on nearly flat beds.</p>
</details>
<details>
<summary>What is the unified sliding law?</summary>
<p>A single equation that smoothly transitions between the Weertman regime (at low velocity or high effective pressure) and the Coulomb regime (at high velocity or low effective pressure). Instead of choosing one law or the other, modern ice sheet models use this unified formulation so that the physics adapts automatically to local conditions.</p>
</details>
<details>
<summary>What is the transition ridge?</summary>
<p>On the 3D surface in SLIDE, a golden ridge line marks where the sliding transitions from Weertman to Coulomb behaviour. At velocities below the ridge, stress grows with speed. Above the ridge, stress flattens out. The ridge&rsquo;s position depends on the sliding coefficient <em>C</em>, bed roughness <em>A<sub>s</sub></em>, and effective pressure <em>N</em>.</p>
</details>
<details>
<summary>How does this connect to SL-ICE?</summary>
<p>The SL-ICE simulator uses a sliding law at the ice&ndash;bed interface as part of its Blatter&ndash;Pattyn higher-order model. SLIDE lets you explore that sliding law in isolation, so you can build intuition about how changes in basal conditions affect ice flow. Understanding SLIDE helps you predict how the SL-ICE simulator will respond when you change parameters. <a href="/tools/sl-ice-guide/">Learn more about SL-ICE &rarr;</a></p>
</details>
</div>
</section>

<section class="explorer-section explorer-feedback-only explorer-community-section">
<div class="explorer-community-grid">
<div class="explorer-community-copy">
<p class="explorer-region-label">Community</p>
<h2>Feedback Welcome</h2>
<p>SLIDE is designed to make glacial sliding physics accessible. If something&rsquo;s unclear or you have ideas for improvement, I&rsquo;d love to hear from you.</p>
<ul class="explorer-community-list">
<li><strong>Teaching with SLIDE?</strong> Let me know how you use it in the classroom and what features would help.</li>
<li><strong>Found a bug?</strong> Report it and I&rsquo;ll fix it as soon as possible.</li>
</ul>
</div>
<div class="explorer-feedback-panel explorer-feedback-panel--faq-style">
{{< tools-feedback-inline
  identifier="faq-feedback-slide"
  title=""
  text="Ideas, bug reports, or feedback for SLIDE? Send a quick note. English or Chinese is welcome."
  default_tool="SLIDE: Sliding Regime Explorer"
  source_page="/tools/slide-guide/"
  source_section="tools-feedback"
  root_class="tool-feedback-root--inline tool-feedback-root--untitled"
>}}
</div>
</div>
</section>
<div class="explorer-community-cta-standalone">
<div class="explorer-community-cta-row">
<a class="explorer-button explorer-button--community-utility" href="/tools/SLIDE.html">Launch Explorer</a>
<a class="explorer-button explorer-button--browse-spotlight" href="/tools/#tools-demo">Browse all research tools</a>
</div>
</div>
</div>
