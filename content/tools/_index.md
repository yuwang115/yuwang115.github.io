---
title: Tools
summary: Interactive research tools
type: landing

sections:
  - block: markdown
    id: antarctica-3d-demo
    content:
      title: ""
      text: |
        <style>
          #antarctica-3d-demo .text-3xl { display: none; }
          #antarctica-3d-demo .max-w-prose { max-width: none; width: 100%; }
          #antarctica-3d-demo > div { max-width: none; }
          #antarctica-3d-demo .flex { max-width: min(1180px, calc(100% - 2rem)); }
          #antarctica-3d-demo .prose { font-size: 16px; line-height: 1.5; }
          .ice-hero .ice-hero-logo { margin: 0; }

          .ice-hero {
            display: grid;
            grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
            gap: clamp(1.4rem, 2.6vw, 2rem);
            align-items: stretch;
            padding: clamp(1.35rem, 3vw, 2.5rem);
            border-radius: 30px;
            overflow: hidden;
            border: 1px solid #cfe1eb;
            box-shadow: 0 18px 40px rgba(11, 36, 50, 0.08);
            background:
              radial-gradient(circle at 12% 18%, rgba(124, 216, 255, 0.22), transparent 28%),
              radial-gradient(circle at 92% 86%, rgba(77, 178, 156, 0.16), transparent 26%),
              linear-gradient(160deg, #f7fbfe 0%, #edf6fb 54%, #f8fbfd 100%);
          }

          html.dark .ice-hero {
            border-color: rgba(111, 166, 196, 0.28);
            box-shadow: 0 22px 46px rgba(2, 8, 13, 0.42);
            background:
              radial-gradient(circle at 12% 18%, rgba(53, 169, 219, 0.34), transparent 30%),
              radial-gradient(circle at 92% 86%, rgba(28, 138, 122, 0.24), transparent 28%),
              linear-gradient(160deg, rgba(6, 18, 27, 0.98) 0%, rgba(8, 23, 33, 0.96) 54%, rgba(8, 19, 28, 0.98) 100%);
          }

          .ice-hero-copy {
            display: grid;
            gap: 1.1rem;
            align-content: start;
          }

          .ice-hero-brand { margin-bottom: 0; }

          .ice-hero-logo {
            width: min(100%, 780px);
            height: auto;
            display: block;
            filter: drop-shadow(0 18px 40px rgba(10, 33, 50, 0.16));
          }
          .ice-hero-logo--dark  { display: none; }
          html.dark .ice-hero-logo--light { display: none; }
          html.dark .ice-hero-logo--dark  { display: block; }

          .ice-hero-lead {
            margin: 0.8rem 0;
            width: 100%;
            color: #082335;
            font-size: clamp(1.25rem, 1.9vw, 1.72rem);
            line-height: 1.22;
            font-weight: 750;
          }
          html.dark .ice-hero-lead { color: #ebf8ff; }

          a.ice-hero-brand,
          a.ice-hero-lead {
            text-decoration: none;
            color: inherit;
          }
          a.ice-hero-brand:hover,
          a.ice-hero-lead:hover { opacity: 0.85; }

          .ice-hero-summary {
            max-width: 74ch;
            margin: 0;
            color: #24475a;
            font-size: 1.08rem;
            line-height: 1.78;
          }
          html.dark .ice-hero-summary { color: #b7d6e6; }

          .ice-hero-actions {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.85rem;
            margin-top: 1.45rem;
          }

          .ice-hero-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 48px;
            padding: 0.82rem 1.3rem;
            border-radius: 999px;
            border: 1px solid transparent;
            font-weight: 700;
            text-decoration: none;
            transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease;
          }
          .ice-hero-btn:hover,
          .ice-hero-btn:focus-visible { transform: translateY(-1px); }

          .ice-hero-btn--primary {
            background: linear-gradient(135deg, #0f7ea8 0%, #17906b 100%);
            color: #f7fdff;
            box-shadow: 0 16px 28px rgba(16, 104, 139, 0.24);
          }

          .ice-hero-btn--ghost {
            background: #f3f9fc;
            border-color: #c6dce7;
            color: #204c61;
          }
          html.dark .ice-hero-btn--ghost {
            background: rgba(8, 20, 29, 0.92);
            border-color: rgba(121, 186, 214, 0.24);
            color: #c6e7f8;
          }

          .ice-hero-showcase {
            display: grid;
            align-content: stretch;
            align-self: stretch;
            justify-self: end;
            width: min(100%, 760px);
            height: 100%;
          }

          .ice-hero-frame {
            width: 100%;
            height: 100%;
            min-height: 520px;
            border: 1px solid #c3dce8;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 22px 50px rgba(9, 34, 49, 0.16);
            position: relative;
            background: linear-gradient(160deg, #061f31 0%, #0c3a53 58%, #15536b 100%);
          }
          html.dark .ice-hero-frame {
            border-color: rgba(116, 175, 205, 0.28);
            box-shadow: 0 28px 60px rgba(2, 8, 13, 0.56);
            background: linear-gradient(160deg, #03111c 0%, #092437 58%, #0d3550 100%);
          }

          .ice-hero-frame iframe {
            width: 100%;
            height: 100%;
            border: 0;
            display: block;
          }

          @media (max-width: 900px) {
            .ice-hero {
              grid-template-columns: 1fr;
            }
            .ice-hero-showcase {
              width: 100%;
              justify-self: auto;
            }
            .ice-hero-frame {
              min-height: 400px;
              aspect-ratio: 1.6 / 1;
            }
          }
        </style>
        <div class="ice-hero not-prose">
          <div class="ice-hero-copy">
            <a class="ice-hero-brand" href="/tools/3d-ice/">
              <img class="ice-hero-logo ice-hero-logo--light" src="/tools/3d-ice-logo-light.jpg" alt="3D ICE logo" loading="eager" />
              <img class="ice-hero-logo ice-hero-logo--dark"  src="/tools/3d-ice-logo.jpg"       alt="3D ICE logo" loading="eager" />
            </a>
            <a class="ice-hero-lead" href="/tools/3d-ice/">Explore Antarctica and Greenland like never before.</a>
            <p class="ice-hero-summary">3D ICE is an Interactive Cryosphere Explorer designed to turn state-of-the-art Antarctica and Greenland datasets into an intuitive browser-based experience for glaciology research, teaching, and public engagement.</p>
            <div class="ice-hero-actions">
              <a class="ice-hero-btn ice-hero-btn--primary" href="/tools/3D-interactive-cryosphere-explorer.html">Launch Explorer</a>
              <a class="ice-hero-btn ice-hero-btn--ghost" href="/tools/3d-ice/#antarctica-features">Antarctica Features</a>
              <a class="ice-hero-btn ice-hero-btn--ghost" href="/tools/3d-ice/#source-data">Source Data</a>
              <a class="ice-hero-btn ice-hero-btn--ghost" href="/tools/3d-ice/#greenland-features">Greenland Features</a>
            </div>
          </div>
          <div class="ice-hero-showcase">
            <div class="ice-hero-frame">
              <iframe title="3D ICE interactive Antarctica showcase" src="/tools/3D-interactive-cryosphere-explorer.html?mode=showcase&preset=tools-hero&mobileLinkout=1&desktopInteractive=1&recording=1&recordingSpeed=0.60&recordingZoomAmount=10" loading="eager" fetchpriority="high" referrerpolicy="no-referrer"></iframe>
            </div>
          </div>
        </div>
    design:
      columns: "1"
  - block: markdown
    id: glacio-sliding-demo
    content:
      title: ""
      text: |
        <style>
          #glacio-sliding-demo .text-3xl { display: none; }
          #glacio-sliding-demo .max-w-prose { max-width: none; width: 100%; }
          #glacio-sliding-demo > div { max-width: none; }
          #glacio-sliding-demo .flex { max-width: min(1180px, calc(100% - 2rem)); }
          #glacio-sliding-demo .prose { font-size: 16px; line-height: 1.5; }

          .slide-hero {
            display: grid;
            grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
            gap: clamp(1.4rem, 2.6vw, 2rem);
            align-items: stretch;
            padding: clamp(1.35rem, 3vw, 2.5rem);
            border-radius: 30px;
            overflow: hidden;
            border: 1px solid #c1dfe8;
            box-shadow: 0 18px 40px rgba(8, 38, 48, 0.08);
            background:
              radial-gradient(circle at 12% 18%, rgba(15, 130, 171, 0.20), transparent 28%),
              radial-gradient(circle at 92% 86%, rgba(25, 168, 143, 0.16), transparent 26%),
              linear-gradient(160deg, #f5fbfd 0%, #ecf6f4 54%, #f7fbfc 100%);
          }

          html.dark .slide-hero {
            border-color: rgba(15, 130, 171, 0.28);
            box-shadow: 0 22px 46px rgba(2, 10, 13, 0.42);
            background:
              radial-gradient(circle at 12% 18%, rgba(15, 130, 171, 0.34), transparent 30%),
              radial-gradient(circle at 92% 86%, rgba(25, 168, 143, 0.24), transparent 28%),
              linear-gradient(160deg, rgba(4, 16, 22, 0.98) 0%, rgba(6, 24, 30, 0.96) 54%, rgba(6, 18, 24, 0.98) 100%);
          }

          .slide-hero-copy {
            display: grid;
            gap: 1.1rem;
            align-content: start;
          }

          .slide-hero-brand { margin-bottom: 0; }

          .slide-hero-logo {
            width: 100%;
            max-width: 420px;
            height: auto;
            display: block;
            filter: drop-shadow(0 14px 32px rgba(8, 38, 48, 0.14));
          }

          .slide-hero-summary {
            max-width: 420px;
            margin: 0;
            color: #1e4a58;
            font-size: 1.08rem;
            line-height: 1.78;
          }
          html.dark .slide-hero-summary { color: #a8d4cc; }

          .slide-hero-actions {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 0.85rem;
            margin-top: 1.45rem;
            max-width: 420px;
          }

          .slide-hero-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 48px;
            padding: 0.82rem 1.3rem;
            border-radius: 999px;
            border: 1px solid transparent;
            font-weight: 700;
            text-decoration: none;
            transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease;
          }
          .slide-hero-btn:hover,
          .slide-hero-btn:focus-visible { transform: translateY(-1px); }

          .slide-hero-btn--primary {
            background: linear-gradient(135deg, #0f82ab 0%, #19a88f 100%);
            color: #f7fdff;
            box-shadow: 0 16px 28px rgba(15, 130, 171, 0.24);
          }

          .slide-hero-btn--ghost {
            background: #f0f8f6;
            border-color: #bdddd4;
            color: #1a5249;
          }
          html.dark .slide-hero-btn--ghost {
            background: rgba(6, 20, 26, 0.92);
            border-color: rgba(25, 168, 143, 0.24);
            color: #b0e0d6;
          }

          .slide-hero-showcase {
            display: grid;
            align-content: stretch;
            align-self: stretch;
            justify-self: end;
            width: min(100%, 760px);
            height: 100%;
          }

          .slide-hero-frame {
            width: 100%;
            height: 100%;
            min-height: 520px;
            border: 1px solid #b8d9d1;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 22px 50px rgba(6, 34, 42, 0.16);
            position: relative;
            background: linear-gradient(160deg, #062a35 0%, #0c4a53 58%, #15615b 100%);
          }
          html.dark .slide-hero-frame {
            border-color: rgba(25, 168, 143, 0.28);
            box-shadow: 0 28px 60px rgba(2, 10, 13, 0.56);
            background: linear-gradient(160deg, #021610 0%, #073830 58%, #0d5048 100%);
          }

          .slide-hero-frame iframe {
            width: 100%;
            height: 100%;
            border: 0;
            display: block;
          }

          @media (max-width: 900px) {
            .slide-hero {
              grid-template-columns: 1fr;
            }
            .slide-hero-showcase {
              width: 100%;
              justify-self: auto;
            }
            .slide-hero-frame {
              min-height: 400px;
              aspect-ratio: 1.6 / 1;
            }
          }
        </style>
        <div class="slide-hero not-prose">
          <div class="slide-hero-copy">
            <div class="slide-hero-brand">
              <img class="slide-hero-logo" src="/tools/SLIDE_logo.jpg" alt="SLIDE logo" loading="eager" />
            </div>
            <p class="slide-hero-summary">Explore how sliding velocity, effective pressure, and the sliding coefficient govern basal dynamics within a unified, state-of-the-art ice sliding law.</p>
            <div class="slide-hero-actions">
              <a class="slide-hero-btn slide-hero-btn--primary" href="/tools/SLIDE.html">Launch Explorer</a>
            </div>
          </div>
          <div class="slide-hero-showcase">
            <div class="slide-hero-frame">
              <iframe title="SLIDE interactive preview" src="/tools/SLIDE_3d_showcase.html" loading="lazy" referrerpolicy="no-referrer"></iframe>
            </div>
          </div>
        </div>
    design:
      columns: "1"
  - block: markdown
    id: misi-flowline-demo
    content:
      title: "1D Marine Ice Sheet Flowline Lab 🥶 (unfinished demo)"
      text: |
        <style>
          #misi-flowline-demo .max-w-prose {
            max-width: none;
            width: 100%;
          }
          #misi-flowline-demo .tools-embed {
            width: 100%;
            height: 88vh;
            min-height: 680px;
            border: 1px solid #c9e0ea;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 14px 35px rgba(15, 23, 42, 0.12);
            position: relative;
            background: linear-gradient(160deg, #edf8fd 0%, #d8ebf3 100%);
          }
          #misi-flowline-demo .tools-embed iframe {
            width: 100%;
            height: 100%;
            border: 0;
            display: block;
          }
          @media (max-width: 768px) {
            #misi-flowline-demo .tools-embed {
              height: 90dvh;
              min-height: 0;
              border-radius: 12px;
            }
          }
        </style>
        <div class="tools-embed">
          <iframe
            title="Marine ice sheet flowline simulator"
            src="/tools/marine-ice-sheet-flowline.html"
            loading="lazy"
            fetchpriority="low"
            referrerpolicy="no-referrer"
          ></iframe>
        </div>
    design:
      columns: "1"
  - block: tools-feedback
    id: tool-feedback
    content:
      title: "Tools feedback"
      text: |
        if one of these demos was helpful, confusing, or a little annoying, send me a quick note here. I use this inbox to collect bug reports, usability feedback, and ideas for what to improve next😉!
    design:
      columns: "1"
---
