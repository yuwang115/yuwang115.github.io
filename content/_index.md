---
# Leave the homepage title empty to use the site title
title: ""
date: 2025-08-21
type: landing

design:
  # Default section spacing
  spacing: "6rem"

sections:
  - block: resume-biography-3
    content:
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: admin
      text: ''
      # Show a call-to-action button under your biography? (optional)
      button:
        text: Download CV
        url: uploads/resume.pdf
    design:
      css_class: dark
      # Avatar customization
      avatar:
        size: large  # Options: small (150px), medium (200px, default), large (320px), xl (400px), xxl (500px)
        shape: circle # Options: circle (default), square, rounded
      background:
        color: "black"
        image:
          # Add your image background to `assets/media/`.
          filename: "background.jpg"
          filters:
            brightness: 0.5  # 暗化背景以提升文字可读性
            blur: 2px  # 轻微模糊背景，降低细节干扰
          size: cover
          position: center
          parallax: false
  # - block: markdown
  #   content:
  #     title: "Research Focus 🧐"
  #     subtitle: ""
  #     text: |-
  #       My work combines numerical modelling and data analysis to quantify how subglacial hydrology and ocean forcing control East Antarctic ice mass loss.

  #       I build and use: **Elmer/Ice** (SSA & full-Stokes ice flow), **GlaDS** (distributed/channelised drainage), and **ROMSIceShelf** for targeted experiments in the **Wilkes Subglacial Basin**. The goal is to improve long-term sea‑level projections and test the sensitivity and potential reversibility of grounding‑line retreat.
  #   design:
  #     columns: '1'
  - block: collection
    id: papers
    content:
      title:  Featured Publications 📑
      filters:
        folders:
          - publication
        featured_only: true
    design:
      view: article-grid
      columns: 2
  - block: collection
    content:
      title:  Co-authored Publications 📝
      text: ""
      filters:
        folders:
          - publication
        exclude_featured: true
    design:
      view: citation
  - block: collection
    id: gallery
    content:
      title: Photography Gallery 📷
      subtitle: "A selection of my photography beyond academia"
      text: ""
      filters:
        folders:
          - gallery
      # show up to 12 gallery items if you create sub-albums as page bundles
      count: 6
    design:
      view: article-grid
      columns: 1
  # - block: collection
  #   id: talks
  #   content:
  #     title: Recent & Upcoming Talks
  #     filters:
  #       folders:
  #         - event
  #   design:
  #     view: article-grid
  #     columns: 1

  # - block: collection
  #   id: news
  #   content:
  #     title: Recent News
  #     subtitle: ''
  #     text: ''
  #     # Page type to display. E.g. post, talk, publication...
  #     page_type: post
  #     # Choose how many pages you would like to display (0 = all pages)
  #     count: 5
  #     # Filter on criteria
  #     filters:
  #       author: ""
  #       category: ""
  #       tag: ""
  #       exclude_featured: false
  #       exclude_future: false
  #       exclude_past: false
  #       publication_type: ""
  #     # Choose how many pages you would like to offset by
  #     offset: 0
  #     # Page order: descending (desc) or ascending (asc) date.
  #     order: desc
  #   design:
  #     # Choose a layout view
  #     view: date-title-summary
  #     # Reduce spacing
  #     spacing:
  #       padding: [0, 0, 0, 0]

  - block: cta-card
    demo: true  # only display this section in the hugo blox builder demo site
    content:
      title: 👉 Explore my work & get in touch
      text: |-
        I’m always keen to discuss Antarctic ice dynamics, subglacial hydrology, and modelling workflows. If you’d like to collaborate or invite a talk, feel free to reach out.
      button:
        text: Email Me
        url: mailto:yu.wang0@utas.edu.au
    design:
      card:
        # Card background color (CSS class)
        css_class: "bg-primary-700"
        css_style: ""
---