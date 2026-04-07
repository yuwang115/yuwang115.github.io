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
          /* Reduce inter-section spacing on tools page */
          #antarctica-3d-demo.hbb-section { padding-top: 48px; padding-bottom: 48px; }
          #glacio-sliding-demo.hbb-section { padding-top: 48px; padding-bottom: 48px; }
          #sl-ice-demo.hbb-section { padding-top: 48px; padding-bottom: 48px; }
          #tool-feedback.hbb-section { padding-top: 48px; padding-bottom: 48px; }

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
    id: sl-ice-demo
    content:
      title: ""
      text: |
        <style>
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Nunito:wght@400;600;700;800&display=swap');
          #sl-ice-demo .text-3xl { display: none; }
          #sl-ice-demo .max-w-prose { max-width: none; width: 100%; }
          #sl-ice-demo > div { max-width: none; }
          #sl-ice-demo .flex { max-width: min(1180px, calc(100% - 2rem)); }
          #sl-ice-demo .prose { font-size: 16px; line-height: 1.5; }
          .slice-hero .slice-hero-logo { margin: 0; }

          .slice-hero {
            display: grid;
            grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
            gap: clamp(1.4rem, 2.6vw, 2rem);
            align-items: stretch;
            padding: clamp(1.35rem, 3vw, 2.5rem);
            border-radius: 30px;
            overflow: hidden;
            position: relative;
            font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border: 1px solid #d6cfc4;
            box-shadow: 0 18px 40px rgba(45, 24, 16, 0.08);
            background:
              radial-gradient(circle at 12% 18%, rgba(74, 144, 168, 0.14), transparent 28%),
              radial-gradient(circle at 92% 86%, rgba(61, 139, 110, 0.10), transparent 26%),
              linear-gradient(160deg, #f8f5f0 0%, #efe9e0 54%, #f6f3ee 100%);
            transition: border-color 400ms ease;
          }
          .slice-hero:hover { border-color: #c4bab0; }

          html.dark .slice-hero {
            border-color: rgba(90, 172, 224, 0.22);
            box-shadow: 0 22px 46px rgba(2, 8, 13, 0.42);
            background:
              radial-gradient(circle at 12% 18%, rgba(90, 172, 224, 0.16), transparent 30%),
              radial-gradient(circle at 92% 86%, rgba(77, 191, 160, 0.12), transparent 28%),
              linear-gradient(160deg, rgba(6, 18, 27, 0.98) 0%, rgba(8, 23, 33, 0.96) 54%, rgba(8, 19, 28, 0.98) 100%);
          }
          html.dark .slice-hero:hover { border-color: rgba(90, 172, 224, 0.35); }

          .slice-hero-copy {
            display: grid;
            gap: 1.1rem;
            align-content: start;
          }

          .slice-hero-brand { margin-bottom: 0; }

          .slice-hero-logo {
            width: min(100%, 480px);
            height: auto;
            display: block;
            filter: drop-shadow(0 14px 32px rgba(45, 24, 16, 0.12));
          }
          .slice-hero-logo--dark  { display: none; }
          html.dark .slice-hero-logo--light { display: none; }
          html.dark .slice-hero-logo--dark  { display: block; }
          html.dark .slice-hero-logo {
            filter: drop-shadow(0 0 24px rgba(90, 172, 224, 0.12));
          }

          .slice-hero-lead {
            margin: 0.8rem 0;
            width: 100%;
            color: #2d1810;
            font-size: clamp(1.25rem, 1.9vw, 1.72rem);
            line-height: 1.22;
            font-weight: 750;
          }
          html.dark .slice-hero-lead { color: #e8dfd0; }

          a.slice-hero-brand,
          a.slice-hero-lead {
            text-decoration: none;
            color: inherit;
          }
          a.slice-hero-brand:hover,
          a.slice-hero-lead:hover { opacity: 0.85; }

          .slice-hero-summary {
            max-width: 74ch;
            margin: 0;
            color: #4a3828;
            font-size: 1.08rem;
            line-height: 1.78;
          }
          html.dark .slice-hero-summary { color: #b7c8d6; }

          .slice-hero-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.85rem;
            margin-top: 1.45rem;
          }

          .slice-hero-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 48px;
            padding: 0.82rem 1.5rem;
            border-radius: 999px;
            border: 1px solid transparent;
            font-weight: 700;
            text-decoration: none;
            transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease;
          }
          .slice-hero-btn:hover,
          .slice-hero-btn:focus-visible { transform: translateY(-1px); }

          .slice-hero-btn--primary {
            background: linear-gradient(135deg, #3d8b6e 0%, #4a90a8 100%);
            color: #f7fdff;
            box-shadow: 0 16px 28px rgba(61, 139, 110, 0.24);
          }

          .slice-hero-btn--ghost {
            background: #f3efe9;
            border-color: #d6cfc4;
            color: #4a3828;
          }
          html.dark .slice-hero-btn--ghost {
            background: rgba(8, 20, 29, 0.92);
            border-color: rgba(121, 186, 214, 0.24);
            color: #c6d8e8;
          }

          .slice-hero-showcase {
            display: grid;
            align-content: stretch;
            align-self: stretch;
            justify-self: end;
            width: min(100%, 760px);
            height: 100%;
          }

          .slice-hero-frame {
            width: 100%;
            height: 100%;
            min-height: 420px;
            border: 1px solid #c4bab0;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 22px 50px rgba(45, 24, 16, 0.12);
            position: relative;
            background: linear-gradient(160deg, #061f31 0%, #0c3a53 58%, #15536b 100%);
          }
          html.dark .slice-hero-frame {
            border-color: rgba(116, 175, 205, 0.28);
            box-shadow: 0 28px 60px rgba(2, 8, 13, 0.56);
            background: linear-gradient(160deg, #03111c 0%, #092437 58%, #0d3550 100%);
          }

          .slice-hero-chrome-bar {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 10px 14px;
            border-bottom: 1px solid rgba(100, 160, 200, 0.15);
            background: rgba(10, 20, 35, 0.6);
          }

          .slice-hero-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
          }

          .slice-hero-url {
            margin-left: 10px;
            flex: 1;
            height: 24px;
            border-radius: 6px;
            font-size: 11px;
            font-family: 'IBM Plex Mono', 'SF Mono', monospace;
            display: flex;
            align-items: center;
            padding: 0 10px;
            background: rgba(6, 14, 24, 0.5);
            color: #6a8a9a;
          }

          .slice-hero-preview {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            position: relative;
            text-decoration: none;
            overflow: hidden;
          }

          .slice-hero-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .slice-hero-play {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 300ms ease;
          }
          .slice-hero-preview:hover .slice-hero-play { opacity: 1; }

          .slice-hero-play-circle {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(74, 144, 168, 0.9);
            box-shadow: 0 0 30px rgba(74, 144, 168, 0.4);
          }

          .slice-hero-badge {
            position: absolute;
            top: 12px;
            right: 12px;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-family: 'IBM Plex Mono', 'SF Mono', monospace;
            background: rgba(0, 0, 0, 0.5);
            color: rgba(255, 255, 255, 0.7);
          }

          .slice-hero-wip {
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: 2;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            font-family: 'IBM Plex Mono', 'SF Mono', monospace;
            background: rgba(210, 160, 60, 0.15);
            color: #a07020;
            border: 1px solid rgba(210, 160, 60, 0.3);
          }
          html.dark .slice-hero-wip {
            background: rgba(232, 168, 96, 0.12);
            color: #e8a860;
            border-color: rgba(232, 168, 96, 0.25);
          }

          @media (max-width: 900px) {
            .slice-hero {
              grid-template-columns: 1fr;
            }
            .slice-hero-showcase {
              width: 100%;
              justify-self: auto;
            }
            .slice-hero-frame {
              min-height: 320px;
            }
            .slice-hero-preview {
              aspect-ratio: 1.6 / 1;
            }
          }
        </style>
        <div class="slice-hero not-prose">
          <span class="slice-hero-wip">unfinished demo</span>
          <div class="slice-hero-copy">
            <a class="slice-hero-brand" href="/tools/sl-ice/">
              <img class="slice-hero-logo slice-hero-logo--light" src="/tools/sl-ice-logo-light.png" alt="SL-ICE logo" loading="lazy" />
              <img class="slice-hero-logo slice-hero-logo--dark" src="/tools/sl-ice-logo-dark.png" alt="SL-ICE logo" loading="lazy" />
            </a>
            <a class="slice-hero-lead" href="/tools/sl-ice/">Explore Real Ice Sheet Physics</a>
            <p class="slice-hero-summary">SL-ICE brings Antarctic glaciology to life with a real-time Blatter&ndash;Pattyn simulator. Adjust climate parameters, watch ice flow, and understand the science behind sea-level rise &mdash; all in your browser.</p>
            <div class="slice-hero-actions">
              <a class="slice-hero-btn slice-hero-btn--primary" href="/tools/sl-ice/">Launch Simulator</a>
              <a class="slice-hero-btn slice-hero-btn--ghost" href="/tools/sl-ice/landing.html">Guide &amp; Learn</a>
            </div>
          </div>
          <div class="slice-hero-showcase">
            <div class="slice-hero-frame">
              <div class="slice-hero-chrome-bar">
                <div class="slice-hero-dot" style="background:#ff5f57"></div>
                <div class="slice-hero-dot" style="background:#febc2e"></div>
                <div class="slice-hero-dot" style="background:#28c840"></div>
                <div class="slice-hero-url">sl-ice.app</div>
              </div>
              <a href="/tools/sl-ice/" class="slice-hero-preview">
                <img class="slice-hero-img" src="/tools/slice_demo.png" alt="SL-ICE simulator demo — real-time ice sheet cross-section" loading="lazy" />
                <div class="slice-hero-play">
                  <div class="slice-hero-play-circle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="8,5 20,12 8,19" /></svg>
                  </div>
                </div>
                <div class="slice-hero-badge">Click to launch</div>
              </a>
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

          @keyframes contour-drift {
            0%   { background-position: 0 0, 0 0; }
            100% { background-position: 24px -12px, 0 0; }
          }

          .slide-hero {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
            gap: clamp(1.4rem, 2.6vw, 2rem);
            align-items: stretch;
            padding: clamp(1.35rem, 3vw, 2.5rem);
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #c8d4de;
            box-shadow: 0 20px 50px rgba(20, 28, 45, 0.10);
            background:
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Cpath d='M-20,60 C80,30 180,90 280,55 S440,25 620,70' fill='none' stroke='%235a7a8f' stroke-width='1.2' opacity='0.12'/%3E%3Cpath d='M-20,120 C60,90 170,150 270,110 S420,80 620,130' fill='none' stroke='%235a7a8f' stroke-width='0.9' opacity='0.09'/%3E%3Cpath d='M-20,180 C90,150 160,210 260,175 S410,145 620,190' fill='none' stroke='%235a7a8f' stroke-width='1.4' opacity='0.14'/%3E%3Cpath d='M-20,240 C50,215 150,270 250,235 S400,205 620,250' fill='none' stroke='%237a99ad' stroke-width='1.0' opacity='0.10'/%3E%3Cpath d='M-20,300 C80,275 180,330 280,295 S430,265 620,310' fill='none' stroke='%235a7a8f' stroke-width='0.8' opacity='0.08'/%3E%3Cpath d='M-20,355 C70,335 160,375 260,345 S410,325 620,365' fill='none' stroke='%237a99ad' stroke-width='1.1' opacity='0.10'/%3E%3Cg opacity='0.07' stroke='%235a7a8f' stroke-width='0.6'%3E%3Cline x1='147' y1='152' x2='153' y2='152'/%3E%3Cline x1='150' y1='149' x2='150' y2='155'/%3E%3Cline x1='347' y1='232' x2='353' y2='232'/%3E%3Cline x1='350' y1='229' x2='350' y2='235'/%3E%3Cline x1='497' y1='102' x2='503' y2='102'/%3E%3Cline x1='500' y1='99' x2='500' y2='105'/%3E%3C/g%3E%3C/svg%3E") center / 100% 100% no-repeat,
              linear-gradient(160deg, #f4f6f9 0%, #e8ecf2 54%, #f4f6f9 100%);
            animation: contour-drift 28s linear infinite;
            transition: border-color 400ms ease;
          }
          .slide-hero:hover { border-color: #a8b8c8; }

          html.dark .slide-hero {
            border-color: rgba(0, 229, 200, 0.20);
            box-shadow: 0 22px 50px rgba(10, 15, 30, 0.50);
            background:
              url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Cpath d='M-20,60 C80,30 180,90 280,55 S440,25 620,70' fill='none' stroke='%2300e5c8' stroke-width='1.2' opacity='0.25'/%3E%3Cpath d='M-20,120 C60,90 170,150 270,110 S420,80 620,130' fill='none' stroke='%2300e5c8' stroke-width='0.9' opacity='0.18'/%3E%3Cpath d='M-20,180 C90,150 160,210 260,175 S410,145 620,190' fill='none' stroke='%2300e5c8' stroke-width='1.4' opacity='0.30'/%3E%3Cpath d='M-20,240 C50,215 150,270 250,235 S400,205 620,250' fill='none' stroke='%2300b8a0' stroke-width='1.0' opacity='0.22'/%3E%3Cpath d='M-20,300 C80,275 180,330 280,295 S430,265 620,310' fill='none' stroke='%2300e5c8' stroke-width='0.8' opacity='0.15'/%3E%3Cpath d='M-20,355 C70,335 160,375 260,345 S410,325 620,365' fill='none' stroke='%2300b8a0' stroke-width='1.1' opacity='0.20'/%3E%3Cg opacity='0.10' stroke='%2300e5c8' stroke-width='0.6'%3E%3Cline x1='147' y1='152' x2='153' y2='152'/%3E%3Cline x1='150' y1='149' x2='150' y2='155'/%3E%3Cline x1='347' y1='232' x2='353' y2='232'/%3E%3Cline x1='350' y1='229' x2='350' y2='235'/%3E%3Cline x1='497' y1='102' x2='503' y2='102'/%3E%3Cline x1='500' y1='99' x2='500' y2='105'/%3E%3C/g%3E%3C/svg%3E") center / 100% 100% no-repeat,
              linear-gradient(160deg, #141824 0%, #1e2538 54%, #1a1f2e 100%);
          }
          html.dark .slide-hero:hover { border-color: rgba(0, 229, 200, 0.35); }

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
            filter: drop-shadow(0 14px 32px rgba(20, 28, 45, 0.14));
          }
          html.dark .slide-hero-logo {
            filter: brightness(1.05) drop-shadow(0 0 20px rgba(0, 229, 200, 0.15));
          }

          .slide-hero-summary {
            max-width: 420px;
            margin: 0;
            color: #1a2633;
            font-size: 1.08rem;
            line-height: 1.78;
            letter-spacing: 0.02em;
          }
          html.dark .slide-hero-summary { color: #b8ccd8; }

          .slide-hero-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
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
            border-radius: 6px;
            border: 1px solid transparent;
            font-weight: 700;
            font-size: 0.88rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            text-decoration: none;
            transition: box-shadow 200ms ease, filter 200ms ease, border-color 200ms ease, background 200ms ease, color 200ms ease;
          }

          .slide-hero-btn--primary {
            background: #1e3a4f;
            color: #f0f8ff;
            box-shadow: 0 8px 20px rgba(30, 58, 79, 0.22);
          }
          .slide-hero-btn--primary:hover,
          .slide-hero-btn--primary:focus-visible {
            filter: brightness(1.15);
            box-shadow: 0 8px 24px rgba(30, 58, 79, 0.30);
          }

          html.dark .slide-hero-btn--primary {
            background: #00e5c8;
            color: #0d1117;
            box-shadow: 0 8px 20px rgba(0, 229, 200, 0.18);
          }
          html.dark .slide-hero-btn--primary:hover,
          html.dark .slide-hero-btn--primary:focus-visible {
            filter: brightness(1.1);
            box-shadow: 0 0 16px rgba(0, 229, 200, 0.30), 0 8px 24px rgba(0, 229, 200, 0.22);
          }

          .slide-hero-btn--ghost {
            background: #edf1f5;
            border-color: #c0ccd6;
            color: #2a3f50;
          }
          html.dark .slide-hero-btn--ghost {
            background: rgba(20, 24, 36, 0.92);
            border-color: rgba(0, 229, 200, 0.20);
            color: #a0c8c0;
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
            border: 1px solid #b8c8d6;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(15, 22, 38, 0.16);
            position: relative;
            background: linear-gradient(160deg, #141824 0%, #1a2235 58%, #1e2840 100%);
          }
          html.dark .slide-hero-frame {
            border-color: rgba(0, 229, 200, 0.25);
            box-shadow: inset 0 0 30px rgba(0, 229, 200, 0.04), 0 24px 56px rgba(5, 10, 20, 0.55);
            background: linear-gradient(160deg, #0c1018 0%, #141c2a 58%, #181f30 100%);
          }

          .slide-hero-frame iframe {
            width: 100%;
            height: 100%;
            border: 0;
            display: block;
          }

          .slide-hero-hint {
            position: absolute;
            top: 10px;
            right: 12px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            font-size: 0.7rem;
            font-weight: 500;
            letter-spacing: 0.04em;
            color: rgba(200, 220, 240, 0.72);
            background: rgba(15, 20, 32, 0.55);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            border: 1px solid rgba(160, 200, 220, 0.12);
            border-radius: 6px;
            pointer-events: none;
            z-index: 2;
            opacity: 1;
            transition: opacity 0.5s ease;
          }
          .slide-hero-hint.is-hidden {
            opacity: 0;
          }
          .slide-hero-hint svg {
            width: 13px;
            height: 13px;
            opacity: 0.7;
            flex-shrink: 0;
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
              <a class="slide-hero-btn slide-hero-btn--ghost" href="/tools/slide-guide/">Guide &amp; Learn</a>
            </div>
          </div>
          <div class="slide-hero-showcase">
            <div class="slide-hero-frame">
              <span class="slide-hero-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 15l-2 5L9 9l11 4-5 2z"/><path d="M5 3L3 5"/><path d="M2 12H4"/><path d="M12 2v2"/><path d="M4.93 4.93l1.41 1.41"/></svg>
                Click to interact
              </span>
              <iframe title="SLIDE interactive preview" src="/tools/SLIDE_3d_showcase.html" loading="lazy" referrerpolicy="no-referrer"></iframe>
            </div>
          </div>
        </div>
        <script>
          (function () {
            var hint = document.querySelector('.slide-hero-hint');
            if (!hint) return;
            var frame = hint.closest('.slide-hero-frame');
            function hide() {
              hint.classList.add('is-hidden');
              frame.removeEventListener('pointerdown', hide);
              window.removeEventListener('blur', onBlur);
            }
            function onBlur() {
              if (document.activeElement && document.activeElement.tagName === 'IFRAME' &&
                  frame.contains(document.activeElement)) {
                hide();
              }
            }
            frame.addEventListener('pointerdown', hide);
            window.addEventListener('blur', onBlur);
          })();
        </script>
    design:
      columns: "1"
  - block: tools-feedback
    id: tool-feedback
    content:
      title: "Tools feedback"
      text: |
        Love it? Confused by it? Found a bug? Drop me a quick note! I rely on this inbox for bug reports, usability tweaks, and your ideas on how to improve these tools. 😉
    design:
      columns: "1"
---
