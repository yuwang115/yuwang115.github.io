---
# Leave the homepage title empty to use the site title
title: "Yu Wang | Antarctic Researcher"
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
        size: xxl  # Options: small (150px), medium (200px, default), large (320px), xl (400px), xxl (500px)
        shape: circle # Options: circle (default), square, rounded
      background:
        # Use a close fallback tone to avoid a black flash before hero image decodes.
        color: "#101a24"
        image:
          # Add your image background to `assets/media/`.
          filename: "background.jpg"
          filters:
            brightness: 0.5  # 暗化背景以提升文字可读性、
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

  - block: markdown
    id: antarctica-showcase-home
    content:
      title: "3D Antarctica Explorer 🇦🇶"
      text: |
        <style>
          #antarctica-showcase-home .max-w-prose {
            max-width: none;
            width: 100%;
          }
          #antarctica-showcase-home .showcase-wrap {
            position: relative;
            left: 50%;
            right: 50%;
            margin-left: -50vw;
            margin-right: -50vw;
            width: 100vw;
          }
          #antarctica-showcase-home .showcase-embed {
            width: 100%;
            height: 86vh;
            min-height: 620px;
            border: 0;
            border-radius: 0;
            overflow: hidden;
            box-shadow: 0 26px 48px rgba(5, 19, 30, 0.26);
            position: relative;
            background: linear-gradient(160deg, #061f31 0%, #0c3a53 58%, #15536b 100%);
          }
          #antarctica-showcase-home .showcase-embed iframe {
            width: 100%;
            height: 100%;
            border: 0;
            display: block;
          }
          #antarctica-showcase-home .showcase-note {
            max-width: 960px;
            margin: 1rem auto 0;
            padding: 0 1rem;
            text-align: center;
            color: #123447;
            line-height: 1.6;
            font-size: 1rem;
          }
          #antarctica-showcase-home .showcase-note a {
            font-weight: 700;
            text-decoration: underline;
          }
          @media (max-width: 900px) {
            #antarctica-showcase-home .showcase-embed {
              height: 74vh;
              min-height: 500px;
            }
            #antarctica-showcase-home .showcase-note {
              font-size: 0.95rem;
            }
          }
        </style>
        <div class="showcase-wrap">
          <div class="showcase-embed">
            <iframe
              title="Antarctic Ice Dynamics and Subglacial Hydrology 3D demo (Balanced preset)"
              src="/tools/antarctica-bedmachine-3d.html?mode=showcase"
              loading="eager"
              fetchpriority="high"
              referrerpolicy="no-referrer"
            ></iframe>
          </div>
          <p class="showcase-note">
            Open the <a href="/tools/">Tools page</a> to unlock all interactions.
          </p>
        </div>
    design:
      columns: "1"
      spacing:
        padding: ["5rem", 0, "2.5rem", 0]

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
      spacing:
        padding: ["10rem", 0, 0, 0]  # 移除底部padding

  - block: markdown
    id: loop-video
    content:
      title: ""   # 可留空；如果要标题就写在这里
      text: |
        <div style="position:relative; left:50%; right:50%; margin-left:-50vw; margin-right:-50vw; width:100vw; height:100svh; min-height:100vh; overflow:hidden;">
          <video style="position:absolute; inset:0; width:100%; height:100%; object-fit:contain; background:#fff; object-position:center;"
                 autoplay
                 muted
                 loop
                 playsinline
                 preload="metadata">
            <source src="/media/3DWSB.mp4" type="video/mp4">
            您的浏览器不支持 HTML5 视频。
          </video>
        </div>
    design:
      columns: "1"
      spacing:
        padding: [0, 0, 0, 0]



  - block: collection
    id: coauthored-publications
    content:
      title:  Co-authored Publications 📝
      text: |
        <style>
          #coauthored-publications .max-w-3xl {
            max-width: 64rem;
          }
        </style>
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
      columns: 3
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
