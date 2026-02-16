---
title: Tools
summary: Interactive research tools
type: landing

sections:
  - block: markdown
    id: antarctica-3d-demo
    content:
      title: "3D Antarctica Explorer 🇦🇶" 
      text: |
        <style>
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
            title="Antarctic Ice Dynamics and Subglacial Hydrology 3D explorer"
            src="/tools/antarctica-bedmachine-3d.html"
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
      title: "Interact with the “best” ice sliding law 🧊"
      text: |
        <style>
          #tools-demo .max-w-prose {
            max-width: none;
            width: 100%;
          }
          #tools-demo .tools-embed {
            width: 100%;
            height: 85vh;
            min-height: 640px;
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
        </style>
        <div class="tools-embed">
          <iframe
            title="Regularised Coulomb Sliding Law interactive demo"
            src="/tools/rCoulomb_demo_YW.html"
            loading="lazy"
            fetchpriority="low"
            referrerpolicy="no-referrer"
          ></iframe>
        </div>
    design:
      columns: "1"
---
