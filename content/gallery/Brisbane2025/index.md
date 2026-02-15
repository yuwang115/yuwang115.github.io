---
title: "Brisbane, Wrapped in Warmth"
date: 2025-07-08
summary: "About art, sunshine, and love."
reading_time: false
image:
  filename: "featured.jpeg"
  focal_point: Center
  
---

<!-- 这里放一段相册说明、拍摄器材、行程等。 -->

<style>
/* ========== Full-bleed container (breaks out of article max-width) ========== */
.gallery-bleed { width: 100vw; max-width: 1800px; margin-left: 50%; transform: translateX(-50%); }

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
    <figure class="masonry-item"><a href="DSC04217.jpeg"><img data-src="DSC04217.jpeg" alt="DSC04217" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC04225.jpeg"><img data-src="DSC04225.jpeg" alt="DSC04225" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC04248.jpeg"><img data-src="DSC04248.jpeg" alt="DSC04248" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC04392.jpeg"><img data-src="DSC04392.jpeg" alt="DSC04392" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC04425.jpeg"><img data-src="DSC04425.jpeg" alt="DSC04425" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC04598.jpeg"><img data-src="DSC04598.jpeg" alt="DSC04598" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC04605.jpeg"><img data-src="DSC04605.jpeg" alt="DSC04605" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="DSC04745.jpeg"><img data-src="DSC04745.jpeg" alt="DSC04745" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="IMG_2838.jpeg"><img data-src="IMG_2838.jpeg" alt="IMG_2838" decoding="async" fetchpriority="low"></a></figure>
    <figure class="masonry-item"><a href="IMG_2845.jpeg"><img data-src="IMG_2845.jpeg" alt="IMG_2845" decoding="async" fetchpriority="low"></a></figure>
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
