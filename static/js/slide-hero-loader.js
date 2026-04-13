/**
 * SLIDE hero: on desktop, lazy-load the 3D Plotly iframe via IntersectionObserver.
 * On mobile/touch, keep the static preview (no Plotly download at all).
 */
(function () {
  'use strict';

  function init() {
    var preview = document.getElementById('slide-hero-preview');
    var slot = document.getElementById('slide-hero-iframe-slot');
    if (!preview || !slot) return;

    // On mobile / touch: static preview only — no iframe created at all
    var isMobile = window.matchMedia('(pointer: coarse)').matches ||
                   window.matchMedia('(max-width: 900px)').matches;
    if (isMobile) return;

    var frame = slot.closest('.slide-hero-frame');
    if (!frame) return;
    var loaded = false;

    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !loaded) {
        loaded = true;
        observer.disconnect();

        var iframe = document.createElement('iframe');
        iframe.title = 'SLIDE interactive preview';
        iframe.src = '/tools/SLIDE_3d_showcase.html';
        iframe.referrerPolicy = 'no-referrer';
        iframe.style.cssText = 'width:100%;height:100%;border:0;display:block;position:absolute;inset:0;z-index:1;';
        iframe.onload = function () {
          preview.style.display = 'none';
        };
        slot.appendChild(iframe);

        // Add the "Click to interact" hint
        var hint = document.createElement('span');
        hint.className = 'slide-hero-hint';
        hint.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 15l-2 5L9 9l11 4-5 2z"/><path d="M5 3L3 5"/><path d="M2 12H4"/><path d="M12 2v2"/><path d="M4.93 4.93l1.41 1.41"/></svg> Click to interact';
        frame.appendChild(hint);

        function hideHint() {
          hint.classList.add('is-hidden');
          frame.removeEventListener('pointerdown', hideHint);
          window.removeEventListener('blur', onBlur);
        }
        function onBlur() {
          if (document.activeElement && document.activeElement.tagName === 'IFRAME' &&
              frame.contains(document.activeElement)) {
            hideHint();
          }
        }
        frame.addEventListener('pointerdown', hideHint);
        window.addEventListener('blur', onBlur);
      }
    }, { rootMargin: '200px' });

    observer.observe(frame);
  }

  // Run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
