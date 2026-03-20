---
title: Tools
summary: Interactive research tools
type: landing

sections:
  - block: markdown
    id: antarctica-3d-demo
    content:
      title: "Hold Antarctica and Greenland in your hands with [3D ICE](/tools/3d-ice/) ❄️"
      text: |
        <style>
          #antarctica-3d-demo .text-3xl a {
            color: inherit;
            text-decoration: underline;
            text-decoration-color: rgba(16, 81, 109, 0.34);
            text-underline-offset: 0.12em;
            transition: color 180ms ease, text-decoration-color 180ms ease;
          }
          #antarctica-3d-demo .text-3xl a:hover,
          #antarctica-3d-demo .text-3xl a:focus-visible {
            color: #0b5874;
            text-decoration-color: currentColor;
          }
          #antarctica-3d-demo .max-w-prose {
            max-width: none;
            width: 100%;
          }
          #antarctica-3d-demo .tools-embed {
            width: 100%;
            height: 88vh;
            min-height: 680px;
            border: 1px solid #d6e5ec;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 14px 35px rgba(15, 23, 42, 0.12);
            background: linear-gradient(160deg, #07283d 0%, #114562 56%, #1f5f6f 100%);
            position: relative;
          }
          #antarctica-3d-demo .tools-embed iframe {
            width: 100%;
            height: 100%;
            border: 0;
            display: block;
          }
        </style>
        <div class="tools-embed">
          <iframe
            title="Hold Antarctica and Greenland in your hands with 3D ICE ❄️"
            src="/tools/3D-interactive-cryosphere-explorer.html"
            loading="lazy"
            fetchpriority="low"
            referrerpolicy="no-referrer"
          ></iframe>
        </div>
    design:
      columns: "1"
  - block: markdown
    id: tools-demo
    content:
      title: "Interact with the “best” ice sliding law 🧊 (demo)"
      text: |
        <style>
          #tools-demo .max-w-prose {
            max-width: none;
            width: 100%;
          }
          #tools-demo .tools-embed {
            width: 100%;
            height: clamp(780px, 104dvh, 1120px);
            min-height: 780px;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 14px 35px rgba(15, 23, 42, 0.12);
            position: relative;
            background: linear-gradient(160deg, #f6fbfe 0%, #edf6fb 100%);
          }
          #tools-demo .tools-embed iframe {
            width: 100%;
            height: 100%;
            border: 0;
            display: block;
          }
          @media (max-width: 768px) {
            #tools-demo .tools-embed {
              height: 90dvh;
              min-height: 0;
              border-radius: 12px;
            }
          }
        </style>
        <div class="tools-embed">
          <iframe
            title="Regularised Coulomb Sliding Law interactive demo"
            src="/tools/rCoulomb_demo_YW.html"
            loading="eager"
            fetchpriority="high"
            referrerpolicy="no-referrer"
            allow="fullscreen"
            allowfullscreen
          ></iframe>
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
