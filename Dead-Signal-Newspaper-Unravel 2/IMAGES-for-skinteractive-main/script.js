'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Progressively bring the site's red/yellow palette back as the page is explored.
  const creaseHeavy = document.querySelector('.paper-crease-heavy');
  const creaseLight = document.querySelector('.paper-crease-light');
  const smoothstep = (a, b, x) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  const updateColorProgress = () => {
    const root = document.documentElement;
    const scrollableHeight = Math.max(1, root.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / scrollableHeight));
    root.style.setProperty('--color-progress', `${(progress * 100).toFixed(2)}%`);

    // Flatten the newspaper as you scroll: the sharp little creases smooth out first,
    // the big folds hang on longer and nearly disappear by the bottom.
    if (creaseHeavy) creaseHeavy.style.opacity = (1 - smoothstep(0, 0.5, progress)).toFixed(3);
    if (creaseLight) creaseLight.style.opacity = (1 - 0.94 * smoothstep(0.05, 0.95, progress)).toFixed(3);
  };
  updateColorProgress();
  window.addEventListener('scroll', updateColorProgress, { passive: true });
  window.addEventListener('resize', updateColorProgress, { passive: true });

  // If the visitor starts scrolling before the paper has finished unfolding, wrap the intro up quickly.
  const intro = document.querySelector('.paper-intro');
  if (intro) {
    const endIntro = () => {
      window.removeEventListener('scroll', endIntro);
      intro.getAnimations({ subtree: true }).forEach(a => a.cancel());
      const fade = intro.animate({ opacity: [1, 0] }, { duration: 250, fill: 'forwards' });
      fade.onfinish = () => intro.remove();
    };
    window.addEventListener('scroll', endIntro, { passive: true, once: true });
    intro.addEventListener('animationend', event => {
      if (event.target === intro) intro.remove();
    });
  }

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', !isOpen ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('is-open', !isOpen);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
      nav.classList.remove('is-open');
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
        nav.classList.remove('is-open');
      }
    });
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = document.querySelector('#lightbox-image');
  const lightboxCaption = document.querySelector('#lightbox-caption');
  const closeButton = document.querySelector('.lightbox-close');

  if (lightbox && lightboxImage && lightboxCaption && typeof lightbox.showModal === 'function') {
    document.querySelectorAll('.gallery-card[data-full]').forEach(card => {
      card.addEventListener('click', () => {
        const imagePath = card.dataset.full;
        if (!imagePath) return;
        lightboxImage.src = imagePath;
        lightboxImage.alt = card.querySelector('img')?.alt || '';
        lightboxCaption.textContent = card.dataset.caption || '';
        lightbox.showModal();
      });
    });
    const closeLightbox = () => {
      lightbox.close();
      lightboxImage.removeAttribute('src');
    };
    closeButton?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener('close', () => lightboxImage.removeAttribute('src'));
  }
});
