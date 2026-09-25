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
        - "Modeling the ice"
        - "we may yet hold back"
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
      title: "Understand the ice first. Then ask whether we can slow it."
      lede: |
        Ice sheets are hard to predict. Much of what controls them happens out of
        sight, at a bed buried under kilometers of ice, and the processes our models
        simplify can amplify ice loss or hold it back. I want to understand that
        system well enough to say how fast it could change — and then to ask,
        honestly, whether anything we do could slow it.
      threads:
        - title: "What are our models still missing?"
          body: |
            Grounding lines retreating over deepening beds, water reorganizing beneath
            the ice, ice shelves holding back the flow — leave one out and projected
            ice loss can [change several-fold](/publication/cryosphere-2024-wsb-melt-param/)
            or [grow substantially](/publication/natcomm-2025-subglacial-water/). I
            want to know which feedbacks matter most, where retreat becomes
            irreversible, and how much of the uncertainty we can actually reduce.
          tools: "Elmer/Ice · GlaDS · WilkesMIP · ISMIP6"
        - title: "Can we change what happens at the bed?"
          body: |
            If water at the bed lets ice slide faster, removing it looks like an
            obvious lever. But the drainage system is not passive: it reorganizes,
            and in coupled simulations it can partly undo the intervention. I want to
            find out when drying the bed could work, when it cannot, and why.
          tools: "Coupled Elmer/Ice–GlaDS · Bed-drying experiments"
        - title: "Could we keep the ice shelves holding?"
          body: |
            Much of Antarctica's ice loss begins where warm ocean water reaches its
            ice shelves. Proposals to block that water or to
            reinforce the shelves are now being taken seriously. At
            [CSEi](https://climate.uchicago.edu/entities/csei/), I want to test them
            with the same models we use for projections: how much ice they could
            save, how long they would take to work, and what they would cost in risk
            and scale.
          tools: "CSEi · Ice–ocean modeling"
      figure:
        video: "/media/3DWSB.mp4"
        # Intrinsic size, so the frame reserves its aspect ratio before the
        # lazily-started video reports its own dimensions.
        width: 2800
        height: 1612
        label: "Animation of a coupled ice-sheet and subglacial hydrology experiment in the Wilkes Subglacial Basin"
        caption: |
          **Ice and water, evolving together.** A coupled ice-sheet and subglacial
          hydrology simulation: channel discharge and ice velocity change in step
          as the drainage system reorganizes beneath the retreating ice.
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
        I’m always keen to discuss Antarctica, modeling and glaciology. If you’d like to collaborate or invite a talk, feel free to reach out.
      button:
        text: Email Me
        url: mailto:wangyu@uchicago.edu
    design:
      card:
        # Card background color (CSS class)
        css_class: "bg-primary-700"
        css_style: ""
---
