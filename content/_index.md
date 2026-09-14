---
# Leave the homepage title empty to use the site title
title: "Yu Wang | Antarctic Researcher"
date: 2025-08-21
type: landing

design:
  # Default section spacing
  spacing: "6rem"

sections:
  # ---------------------------------------------------------------------------
  # First screen: the 3D ICE model of Antarctica, auto-rotating and interactive.
  # Rendered by layouts/_partials/blox/ice-hero.html
  # ---------------------------------------------------------------------------
  - block: ice-hero
    id: hero
    content:
      name: "Yu Wang"
      native_name: "王禹"
      title_lines:
        - "Modelling the ice"
        - "that sets sea level"
      affiliation_lines:
        - "Climate Systems Engineering initiative"
        - "The University of Chicago"
      actions:
        - text: "Research"
          url: "#research"
        - text: "Explore 3D ICE"
          url: "/tools/3d-ice/"
      explorer:
        src: "/tools/3D-interactive-cryosphere-explorer.html?mode=showcase&preset=home-hero&desktopInteractive=1&mobileLinkout=1"
        title: "3D ICE — interactive model of the Antarctic Ice Sheet"
        poster: "media/hero-3d-ice.jpg"
        poster_portrait: "media/hero-3d-ice-portrait.jpg"
        poster_alt: "The Antarctic Ice Sheet and the bed beneath it, rendered in 3D from BedMachine topography"
      info: |
        Antarctic surface, ice base and bed topography, rendered live in your
        browser from BedMachine Antarctica. Vertical relief is exaggerated.
        Click the ice to take the camera; open the full explorer in
        [3D ICE](/tools/3d-ice/).
      cue: "About"
    design:
      spacing:
        padding: [0, 0, 0, 0]

  # ---------------------------------------------------------------------------
  # Second screen: portrait, biography, interests and education.
  # Rendered by layouts/_partials/blox/resume-biography-3.html (local override).
  # ---------------------------------------------------------------------------
  - block: resume-biography-3
    id: about
    content:
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: admin
      text: ''
      # Show a call-to-action button under your biography? (optional)
      button:
        text: Download CV
        url: uploads/resume.pdf
    design:
      # Avatar customization
      avatar:
        size: xl  # Options: small (150px), medium (200px, default), large (320px), xl (400px), xxl (500px)
        shape: rounded # Options: circle (default), square, rounded
      spacing:
        padding: ["7rem", 0, "6rem", 0]

  # ---------------------------------------------------------------------------
  # Research threads
  # ---------------------------------------------------------------------------
  - block: research-threads
    id: research
    content:
      eyebrow: "Research"
      title: "Three threads, one question: how fast can Antarctica lose its ice?"
      lede: |
        East Antarctica was long treated as the stable half of the continent. The
        Wilkes Subglacial Basin is the exception — enough ice to raise global sea
        level by several metres, resting on a bed that deepens inland. My work asks
        what actually sets the pace of its retreat, and whether anything can be done
        about it.
      threads:
        - title: "Ice-sheet and ice-shelf dynamics"
          body: |
            A retrograde bed means that once the grounding line retreats inland,
            thinning can keep feeding itself. I use
            [Elmer/Ice](http://elmerice.elmerfem.org/) to resolve that migration
            directly, and to show how much the answer depends on how melt is applied
            at the grounding line — [enough to change the projected
            contribution several-fold](/publication/cryosphere-2024-wsb-melt-param/).
          tools: "Elmer/Ice · SSA & full-Stokes · WilkesMIP"
        - title: "Subglacial hydrology"
          body: |
            Water at the bed sets basal traction, and the drainage system that carries
            it reorganises as the ice above it changes. Coupling
            [GlaDS](https://doi.org/10.3189/2013JoG13J045) to Elmer/Ice lets
            distributed and channelised drainage evolve with the ice sheet instead of
            being prescribed — a two-way link that [amplifies Antarctica's projected
            sea-level contribution](/publication/natcomm-2025-subglacial-water/).
          tools: "GlaDS · Coupled Elmer/Ice–GlaDS"
        - title: "Glacial climate intervention"
          body: |
            At the [Climate Systems Engineering
            initiative](https://climate.uchicago.edu/entities/csei/) I test whether
            targeted interventions — drying the bed, buttressing an ice shelf — could
            slow polar ice loss enough to matter for sea level, and what they would
            cost in risk, side effects and sheer engineering scale.
          tools: "CSEi · Work in progress"
      figure:
        video: "/media/3DWSB.mp4"
        # Intrinsic size, so the frame reserves its aspect ratio before the
        # lazily-started video reports its own dimensions.
        width: 2800
        height: 1612
        label: "Animation of a coupled ice-sheet and subglacial hydrology experiment in the Wilkes Subglacial Basin"
        caption: |
          **Evolving ice sheet and subglacial hydrology in the Wilkes Subglacial
          Basin.** A coupled ice–hydrology experiment: channel discharge and ice
          velocity evolve together as the drainage system reorganises beneath the
          retreating ice.
    design:
      spacing:
        padding: ["2rem", 0, "6rem", 0]

  # ---------------------------------------------------------------------------
  # Publications
  # ---------------------------------------------------------------------------
  - block: collection
    id: papers
    content:
      title: "Featured Publications"
      filters:
        folders:
          - publication
        featured_only: true
    design:
      view: article-grid
      columns: 2
      spacing:
        padding: ["4rem", 0, "2rem", 0]

  - block: collection
    id: coauthored-publications
    content:
      title: "Co-authored Publications"
      filters:
        folders:
          - publication
        exclude_featured: true
    design:
      view: citation
      spacing:
        padding: ["2rem", 0, "4rem", 0]

  # ---------------------------------------------------------------------------
  # Photography
  # ---------------------------------------------------------------------------
  - block: collection
    id: gallery
    content:
      title: "Photography Gallery"
      subtitle: "A selection of my photography beyond academia"
      text: ""
      filters:
        folders:
          - gallery
      # show up to 12 gallery items if you create sub-albums as page bundles
      count: 6
    design:
      view: article-grid
      columns: 3

  # ---------------------------------------------------------------------------
  # Contact
  # ---------------------------------------------------------------------------
  - block: cta-card
    content:
      title: "Explore my work & get in touch"
      text: |-
        I’m always keen to discuss Antarctic ice dynamics, subglacial hydrology, and modelling workflows. If you’d like to collaborate or invite a talk, feel free to reach out.
      button:
        text: Email Me
        url: mailto:wangyu@uchicago.edu
    design:
      card:
        # Card background color (CSS class)
        css_class: "bg-primary-700"
        css_style: ""
---
