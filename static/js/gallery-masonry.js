(function () {
  'use strict';

  /* =====================================================================
     1. Lazy-load with IntersectionObserver + blur-up
     ===================================================================== */
  var imgs = document.querySelectorAll('.masonry-item img[data-src]');
  if (!imgs.length) return;

  var io = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var img = e.target;
          var fig = img.closest('.masonry-item');
          img.src = img.dataset.src;
          img.addEventListener('load', function () { fig.classList.add('loaded'); }, { once: true });
          obs.unobserve(img);
        });
      }, { rootMargin: '200px' })
    : null;

  imgs.forEach(function (img) {
    if (io) {
      io.observe(img);
    } else {
      img.src = img.dataset.src;
      img.addEventListener('load', function () {
        img.closest('.masonry-item').classList.add('loaded');
      }, { once: true });
    }
  });

  /* =====================================================================
     2. Enhanced Lightbox
     ===================================================================== */
  var dlg = document.getElementById('gallery-lightbox');
  if (!dlg || typeof dlg.showModal !== 'function') return;

  // Collect all gallery links
  var links = Array.from(document.querySelectorAll('.masonry-item a[href]'));
  if (!links.length) return;

  var currentIdx = 0;

  // Build lightbox inner structure
  dlg.innerHTML =
    '<div class="lightbox-inner">' +
      '<button class="lightbox-btn lightbox-close" aria-label="Close" type="button">&times;</button>' +
      '<button class="lightbox-btn lightbox-prev" aria-label="Previous" type="button">&#8249;</button>' +
      '<img class="lightbox-img" alt="">' +
      '<button class="lightbox-btn lightbox-next" aria-label="Next" type="button">&#8250;</button>' +
      '<div class="lightbox-counter"></div>' +
    '</div>';

  dlg.setAttribute('data-count', links.length);

  var imgEl = dlg.querySelector('.lightbox-img');
  var counter = dlg.querySelector('.lightbox-counter');
  var btnClose = dlg.querySelector('.lightbox-close');
  var btnPrev = dlg.querySelector('.lightbox-prev');
  var btnNext = dlg.querySelector('.lightbox-next');

  function show(idx) {
    currentIdx = ((idx % links.length) + links.length) % links.length;
    imgEl.classList.add('fading');

    setTimeout(function () {
      imgEl.src = links[currentIdx].getAttribute('href');
      imgEl.onload = function () {
        imgEl.classList.remove('fading');
        imgEl.onload = null;
      };
      counter.textContent = (currentIdx + 1) + ' / ' + links.length;

      // Preload adjacent
      [currentIdx - 1, currentIdx + 1].forEach(function (i) {
        var j = ((i % links.length) + links.length) % links.length;
        if (j !== currentIdx) { new Image().src = links[j].getAttribute('href'); }
      });
    }, imgEl.src ? 150 : 0);
  }

  function openAt(idx) {
    show(idx);
    dlg.showModal();
  }

  // Click handlers on gallery items
  links.forEach(function (a, i) {
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      openAt(i);
    });
  });

  // Nav buttons
  btnClose.addEventListener('click', function () { dlg.close(); });
  btnPrev.addEventListener('click', function (e) { e.stopPropagation(); show(currentIdx - 1); });
  btnNext.addEventListener('click', function (e) { e.stopPropagation(); show(currentIdx + 1); });

  // Close on backdrop click (not on image or buttons)
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg || e.target.classList.contains('lightbox-inner')) {
      dlg.close();
    }
  });

  // Keyboard navigation
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); show(currentIdx - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(currentIdx + 1); }
  });

  // Touch swipe support
  var touchStartX = 0;
  var touchStartY = 0;
  dlg.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  dlg.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) show(currentIdx + 1); else show(currentIdx - 1);
    }
  }, { passive: true });
})();
