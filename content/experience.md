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
      text: |
        <link rel="stylesheet" href="/vendor/maplibre-gl/6.11.2/maplibre-gl.css" />
        <link rel="stylesheet" href="/css/journey-map.css" />
        <link rel="modulepreload" href="/vendor/maplibre-gl/6.11.2/maplibre-gl.mjs" />
        <link rel="modulepreload" href="/vendor/maplibre-gl/6.11.2/maplibre-gl-shared.mjs" />
        <div class="journey-wrap not-prose">
          <div id="experience-map" role="region" aria-label="Interactive globe of research journey stops"></div>
          <p class="journey-caption">Drag to spin the globe, pinch or hold Ctrl/⌘ while scrolling to zoom, and pick a pin or a stop below to fly there.</p>
          <div id="journey-stops" class="journey-stops"></div>
        </div>
        <script type="module" src="/js/journey-globe.js"></script>
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
          Designed and led practicals; assisted students in analyzing model results.
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
          Interactive 3D visualization for Antarctica and Greenland.
        - **Peer Reviewer**, Apr 2025 - present  
          *Nature Communications*, *Journal of Glaciology*, *Communications Earth & Environment*.
        - **Co-convenor - WilkesMIP Project**, Jan 2025 - present  
          Coordinating an international model intercomparison project.
        - **Organizer and Host - UTAS Ice Sheets Group Meeting**, Jun 2023 - Aug 2024  
          Organized weekly group seminars and facilitated discussions.
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
