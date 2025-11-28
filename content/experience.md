---
title: 'Experience'
date: 2023-10-24
type: landing

design:
  spacing: '5rem'

# Note: `username` refers to the user's folder name in `content/authors/`

# Page sections
sections:
  - block: markdown
    id: journey-map
    content:
      title: "Research Journey 🌍"
      subtitle: "Click the pins to explore where I’ve studied, taught, and collaborated."
      text: |
        <style>
          /* Keep map styling local to this block */
          #journey-map .max-w-prose {
            max-width: none;
            width: 100%;
          }
          #journey-map .journey-outer {
            width: 100%;
            display: flex;
            justify-content: center;
          }
          #journey-map .journey-wrap {
            width: min(1000px, 80vw);
            margin: 0 auto;
          }
          .map-shell {
            width: 100%;
          }
          #experience-map {
            width: 100%;
            aspect-ratio: 3 / 2;
            min-height: 480px;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 12px 30px rgba(0,0,0,0.15);
            background: radial-gradient(circle at 30% 30%, #f3f7ff, #e5eef9 45%, #dce6f5);
            position: relative;
            z-index: 0; /* keep map under the sticky nav */
          }
          /* Lower Leaflet panes so the navbar (z-30) stays on top */
          #journey-map .leaflet-pane,
          #journey-map .leaflet-top,
          #journey-map .leaflet-bottom {
            z-index: 1 !important;
          }
          .map-caption {
            text-align: center;
            margin-top: 0.75rem;
            color: #4a5568;
            font-style: italic;
            font-size: 0.95rem;
          }
        </style>
        <div class="journey-outer">
          <div class="journey-wrap">
            <div class="map-shell">
              <div id="experience-map"></div>
            </div>
            <p class="map-caption">Pins marks the stops along my research journey—click one to see the story.</p>
          </div>
        </div>

        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossorigin=""
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossorigin=""
        ></script>
        <script src="/js/journey-map.js"></script>
    design:
      columns: "1"
  - block: resume-experience
    content:
      username: admin
    design:
      # Hugo date format
      date_format: 'January 2006'
      # Education or Experience section first?
      is_education_first: false
  - block: resume-skills
    content:
      title: Skills
      username: admin
    design:
      show_skill_percentage: true
  - block: resume-awards
    content:
      title: Awards
      username: admin
  # - block: resume-languages
  #   content:
  #     title: Languages
  #     username: admin
---
