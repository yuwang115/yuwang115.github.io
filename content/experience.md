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
          /* Match info column width to the journey map */
          #section-resume-experience .max-w-prose,
          #section-resume-skills .max-w-prose,
          #section-resume-awards .max-w-prose,
          #teaching-experience .max-w-prose,
          #professional-service .max-w-prose,
          #presentations .max-w-prose {
            max-width: min(1000px, 80vw);
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
  - block: markdown
    id: teaching-experience
    content:
      title: "Teaching Experience"
      text: |
        - **Teaching Assistant - Ice Sheets, Climate & Sea Level Rise**, UTAS,
          Sep 2025 - Oct 2025  
          Designed and led practicals; assisted students in analysing model results.
        - **Lecturer - Kioloa Winter School: Antarctic Tipping Points**, ANU,
          Jun 2025  
          Delivered lectures on tipping points and irreversibility within ice sheets.
  - block: markdown
    id: professional-service
    content:
      title: "Professional Service & Development"
      text: |
        - **Asian Forum for Polar Sciences (AFoPS) Summer School**, Jul 2026  
          Polar Research Institute of China, China.
        - **Creator & Developer - [3D ICE](/tools/3d-ice/)**, Feb 2026  
          Interactive 3D visualisation for Antarctica and Greenland.
        - **Peer Reviewer**, Apr 2025 - present  
          *Nature Communications*, *Journal of Glaciology*, *Communications Earth & Environment*.
        - **Co-convenor - WilkesMIP Project**, Jan 2025 - present  
          Coordinating an international model intercomparison project.
        - **Organiser and Host - UTAS Ice Sheets Group Meeting**, Jun 2023 - Aug 2024  
          Organised weekly group seminars and facilitated discussions.
        - **Karthaus Summer School on Ice Sheets and Glaciers**, May 2024  
          Karthaus, Italy.
        - **Monash Hackathon - Disentangling Uncertainties in ISMIP6-2300**, Mar 2024  
          Monash University, Australia.
        - **Subglacial Hydrology and Geology Workshop**, Oct 2023  
          Tarraleah, Tasmania.
        - **Visiting Research Student**, Sep 2021 - Feb 2022  
          Prof. John Moore's Group, Beijing Normal University, China.
  - block: markdown
    id: presentations
    content:
      title: "Presentations"
      text: |
        - **Invited Seminar**, School of Oceanography, Shanghai Jiao Tong University (Jul 2026)
        - **Oral Presentation**, Asia Early Career Polar Forum 2026, Zhuhai (Jun 2026)
        - **Oral Presentation**, Antarctic Research Centre, Victoria University of Wellington (Feb 2026)
        - **Oral Presentation**, Climate and Cryosphere Conference 2026, Wellington (Feb 2026)
        - **Oral Presentation**, Antarctica Day Symposium, Hobart (Dec 2025)
        - **Oral Presentation**, FRISP - Southern Hemisphere Workshop, Queensland (Jul 2025)
        - **Invited Seminar**, School of Oceanography, Shanghai Jiao Tong University (Dec 2024)
        - **Poster**, Australian Antarctic Research Conference, Hobart (Nov 2024)
        - **Oral Presentation**, IMAS HDR Conference, Hobart (Nov 2024)
        - **Invited Seminar**, ICEMAP Antarctic Modelling Workshop, Rovaniemi (May 2024)
        - **Poster**, European Geosciences Union (EGU) General Assembly, Vienna (Apr 2024)
        - **Poster**, AAPP Symposium, Hobart (Oct 2023)
        - **Poster**, ACCESS Community Workshop, Canberra (Sep 2023)
        - **Oral Presentation**, Coupled Ice-Sheet Modelling and Simulations Workshop (Feb 2023)
        - **Lightning talk**, European Geosciences Union (EGU) General Assembly (Online) (Apr 2021)
  - block: resume-skills
    content:
      title: Skills
      username: admin
    design:
      show_skill_percentage: true
---
