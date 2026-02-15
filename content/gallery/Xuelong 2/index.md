---
title: "Xue Long 2 🇨🇳"
date: 2025-04-27
summary: "Aboard China’s most advanced icebreaker"
reading_time: false
image:
  filename: "featured.jpeg"
  focal_point: Center
  
---

<div class="text-bleed">
  <p>I was fortunate to visit Xuelong 2, China’s most advanced polar research vessel. With its pioneering two-way icebreaking technology, it has recently returned from a nearly six-month Antarctic mission — the 41st of its kind. Deep gratitude to Professor Zhang Zhaoru for his thoughtful and inspiring guidance.</p>
  <p>Stepping onto the deck, I couldn’t help but feel a surge of warmth and pride 🇨🇳.</p>
</div>

<style>
/* ========== Full-bleed container (breaks out of article max-width) ========== */
.gallery-bleed { width: 100vw; max-width: 1800px; margin-left: 50%; transform: translateX(-50%); }

/* ========== Full-bleed text container ========== */
.text-bleed { width: 100vw; max-width: 1800px; margin-left: 50%; transform: translateX(-50%); padding: 0 20px; }
.text-bleed p { margin: 0 auto 0.8rem; font-size: clamp(1rem, 0.96rem + 0.4vw, 1.25rem); line-height: 1.8; }

/* ========== Masonry columns ========== */
.masonry { column-gap: 18px; }
@media (min-width: 420px){ .masonry { column-count: 2; } }
@media (min-width: 768px){ .masonry { column-count: 3; } }
@media (min-width: 1024px){ .masonry { column-count: 4; } }
@media (min-width: 1280px){ .masonry { column-count: 5; } }
@media (min-width: 1536px){ .masonry { column-count: 6; } }

/* Items reset & spacing */
.masonry figure{ margin:0; }
.masonry-item { break-inside: avoid; margin: 0 0 18px; position: relative; overflow: hidden; border-radius: 10px; background: transparent; }

/* Shimmer placeholder */
.masonry-item::before { content:""; position:absolute; inset:0; background: linear-gradient(90deg, #eee 0%, #f6f6f6 50%, #eee 100%); background-size:200% 100%; animation: shimmer 1.2s infinite; opacity: 1; transition: opacity .3s ease; }
.masonry-item.loaded::before { opacity: 0; animation: none; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Blur-up effect while loading; keep original aspect ratio */
.masonry-item img { width:100%; height:auto; display:block; filter: blur(12px); opacity: .85; transform: scale(1.02); transition: filter .45s ease, transform .45s ease, opacity .35s ease; }
.masonry-item.loaded img { filter: blur(0); transform: none; opacity: 1; }

/* Lightbox */
#lightbox { padding:0; border:none; background: transparent; }
#lightbox::backdrop { background: rgba(0,0,0,.85); }
#lightbox img { max-width: 92vw; max-height: 92vh; display:block; }
</style>

<div class="gallery-bleed">
  <div class="masonry">
    <figure class="masonry-item"><a href="DSC03151.jpeg"><img data-src="DSC03151.jpeg" alt="DSC03151" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC03170.jpeg"><img data-src="DSC03170.jpeg" alt="DSC03170" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC03213.jpeg"><img data-src="DSC03213.jpeg" alt="DSC03213" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC03249.jpeg"><img data-src="DSC03249.jpeg" alt="DSC03249" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC03282.jpeg"><img data-src="DSC03282.jpeg" alt="DSC03282" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC03294.jpeg"><img data-src="DSC03294.jpeg" alt="DSC03294" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC03311.jpeg"><img data-src="DSC03311.jpeg" alt="DSC03311" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC03320.jpeg"><img data-src="DSC03320.jpeg" alt="DSC03320" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC03341.jpeg"><img data-src="DSC03341.jpeg" alt="DSC03341" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="IMG_2128.jpeg"><img data-src="IMG_2128.jpeg" alt="IMG_2128" decoding="async" fetchpriority="low"></a></figure>
  </div>
</div>

<dialog id="lightbox"><img id="lightbox-img" alt=""></dialog>

<script>
(function(){
  // Lazy-load with IntersectionObserver
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const img = e.target; const fig = img.closest('.masonry-item');
      img.src = img.dataset.src;
      img.addEventListener('load', () => { fig.classList.add('loaded'); }, { once:true });
      obs.unobserve(img);
    });
  }, { rootMargin: '200px' }) : null;

  document.querySelectorAll('.masonry-item img[data-src]').forEach(img => {
    if (io) io.observe(img); else { img.src = img.dataset.src; img.addEventListener('load', () => img.closest('.masonry-item').classList.add('loaded'), { once:true }); }
  });

  // Simple lightbox using <dialog>
  const dlg = document.getElementById('lightbox');
  const dlgImg = document.getElementById('lightbox-img');
  document.querySelectorAll('.masonry-item a').forEach(a => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      dlgImg.src = a.getAttribute('href');
      if (typeof dlg.showModal === 'function') dlg.showModal();
    });
  });
  dlg && dlg.addEventListener('click', () => dlg.close());
})();
</script>
