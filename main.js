/* ===================================================================
   K9 Pet Care — interactions & Guest Carousel
   =================================================================== */

// --- Mobile nav toggle ---
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close the menu when a link is tapped
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// --- Guest Pets Carousel ---
(function initGuestCarousel() {
  const viewport = document.getElementById('carouselViewport');
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');
  const counter = document.getElementById('carouselCounter');
  const filterChips = document.querySelectorAll('.filter-chip');
  const allCards = Array.from(document.querySelectorAll('.guest-card'));

  if (!viewport || !track || allCards.length === 0) return;

  let currentIndex = 0;
  let activeFilter = 'all';
  let autoplayTimer = null;
  const AUTOPLAY_DELAY = 5000;

  // Touch & Drag variables
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;

  function getCardsPerView() {
    const width = window.innerWidth;
    if (width <= 600) return 1;
    if (width <= 940) return 2;
    return 3;
  }

  function getVisibleCards() {
    return allCards.filter(card => !card.classList.contains('is-filtered-out'));
  }

  function getMaxIndex() {
    const visible = getVisibleCards();
    const perView = getCardsPerView();
    return Math.max(0, visible.length - perView);
  }

  function updateCarousel(animate = true) {
    const visible = getVisibleCards();
    const perView = getCardsPerView();
    const maxIndex = getMaxIndex();

    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }
    if (currentIndex < 0) {
      currentIndex = 0;
    }

    if (!animate) {
      track.classList.add('no-transition');
    } else {
      track.classList.remove('no-transition');
    }

    if (visible.length === 0) {
      track.style.transform = 'translateX(0px)';
      if (counter) counter.textContent = '0 guests';
      renderDots(0);
      return;
    }

    // Card width + 24px gap
    const firstCard = visible[0];
    const cardRect = firstCard.getBoundingClientRect();
    const cardWidth = cardRect.width;
    const gap = 24;
    const moveAmount = currentIndex * (cardWidth + gap);

    currentTranslate = -moveAmount;
    prevTranslate = currentTranslate;
    track.style.transform = `translateX(${currentTranslate}px)`;

    // Counter
    if (counter) {
      const startNum = currentIndex + 1;
      const endNum = Math.min(currentIndex + perView, visible.length);
      if (visible.length <= perView) {
        counter.textContent = `All ${visible.length} Guests`;
      } else {
        counter.textContent = `Guest ${startNum}–${endNum} of ${visible.length}`;
      }
    }

    // Controls state
    if (prevBtn && nextBtn) {
      if (maxIndex === 0) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
      } else {
        prevBtn.disabled = false;
        nextBtn.disabled = false;
      }
    }

    renderDots(maxIndex + 1);
  }

  function renderDots(totalDots) {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';

    if (totalDots <= 1) return;

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('button');
      dot.className = `dot ${i === currentIndex ? 'active' : ''}`;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel(true);
        restartAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function goToNext() {
    const maxIndex = getMaxIndex();
    if (maxIndex === 0) return;
    if (currentIndex >= maxIndex) {
      currentIndex = 0; // loop
    } else {
      currentIndex++;
    }
    updateCarousel(true);
  }

  function goToPrev() {
    const maxIndex = getMaxIndex();
    if (maxIndex === 0) return;
    if (currentIndex <= 0) {
      currentIndex = maxIndex; // loop
    } else {
      currentIndex--;
    }
    updateCarousel(true);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToNext();
      restartAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToPrev();
      restartAutoplay();
    });
  }

  // Filter chips interaction
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      activeFilter = chip.getAttribute('data-filter') || 'all';

      allCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (activeFilter === 'all' || cat === activeFilter) {
          card.classList.remove('is-filtered-out');
        } else {
          card.classList.add('is-filtered-out');
        }
      });

      currentIndex = 0;
      updateCarousel(false);
      restartAutoplay();
    });
  });

  // Autoplay
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goToNext();
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  viewport.addEventListener('mouseenter', stopAutoplay);
  viewport.addEventListener('mouseleave', startAutoplay);

  // Drag & Swipe handling
  viewport.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    stopAutoplay();
    viewport.classList.add('is-dragging');
    track.classList.add('no-transition');
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    track.style.transform = `translateX(${prevTranslate + deltaX}px)`;
  });

  window.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove('is-dragging');
    track.classList.remove('no-transition');

    const deltaX = e.clientX - startX;
    if (deltaX < -50) {
      goToNext();
    } else if (deltaX > 50) {
      goToPrev();
    } else {
      updateCarousel(true);
    }

    startAutoplay();
  });

  // Responsive resize
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCarousel(false);
    }, 100);
  });

  // Keyboard navigation when viewport has focus
  viewport.setAttribute('tabindex', '0');
  viewport.setAttribute('aria-label', 'Guest pets carousel');
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      goToNext();
      restartAutoplay();
    } else if (e.key === 'ArrowLeft') {
      goToPrev();
      restartAutoplay();
    }
  });

  // Initial render
  setTimeout(() => {
    updateCarousel(false);
    startAutoplay();
  }, 100);
})();

// --- Auto-Rotating Pet Parent Reviews Carousel ---
(function initReviewsCarousel() {
  const viewport = document.getElementById('reviewsViewport');
  const track = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  const dotsContainer = document.getElementById('reviewsDots');
  const counter = document.getElementById('reviewsCounter');
  const cards = Array.from(document.querySelectorAll('.review-card'));

  if (!viewport || !track || cards.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const AUTOPLAY_DELAY = 4500; // Auto-rotates every 4.5s

  // Touch & Drag variables
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;

  function getCardsPerView() {
    return window.innerWidth <= 940 ? 1 : 2;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - getCardsPerView());
  }

  function updateCarousel(animate = true) {
    const perView = getCardsPerView();
    const maxIndex = getMaxIndex();

    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;

    if (!animate) {
      track.classList.add('no-transition');
    } else {
      track.classList.remove('no-transition');
    }

    const firstCard = cards[0];
    const cardRect = firstCard.getBoundingClientRect();
    const cardWidth = cardRect.width;
    const gap = 24;
    const moveAmount = currentIndex * (cardWidth + gap);

    currentTranslate = -moveAmount;
    prevTranslate = currentTranslate;
    track.style.transform = `translateX(${currentTranslate}px)`;

    // Counter
    if (counter) {
      const startNum = currentIndex + 1;
      const endNum = Math.min(currentIndex + perView, cards.length);
      if (perView === 1) {
        counter.textContent = `Review ${startNum} of ${cards.length}`;
      } else {
        counter.textContent = `Reviews ${startNum}–${endNum} of ${cards.length}`;
      }
    }

    renderDots(maxIndex + 1);
  }

  function renderDots(totalDots) {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';

    if (totalDots <= 1) return;

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('button');
      dot.className = `dot ${i === currentIndex ? 'active' : ''}`;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to review slide ${i + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel(true);
        restartAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function goToNext() {
    const maxIndex = getMaxIndex();
    if (maxIndex === 0) return;
    if (currentIndex >= maxIndex) {
      currentIndex = 0; // Seamless loop
    } else {
      currentIndex++;
    }
    updateCarousel(true);
  }

  function goToPrev() {
    const maxIndex = getMaxIndex();
    if (maxIndex === 0) return;
    if (currentIndex <= 0) {
      currentIndex = maxIndex; // Seamless loop
    } else {
      currentIndex--;
    }
    updateCarousel(true);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToNext();
      restartAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToPrev();
      restartAutoplay();
    });
  }

  // Autoplay logic
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goToNext();
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Pause on hover or focus so user can read comfortably
  viewport.addEventListener('mouseenter', stopAutoplay);
  viewport.addEventListener('mouseleave', startAutoplay);
  viewport.addEventListener('focusin', stopAutoplay);
  viewport.addEventListener('focusout', startAutoplay);

  // Drag & Swipe handling
  viewport.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    stopAutoplay();
    viewport.classList.add('is-dragging');
    track.classList.add('no-transition');
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    track.style.transform = `translateX(${prevTranslate + deltaX}px)`;
  });

  window.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove('is-dragging');
    track.classList.remove('no-transition');

    const deltaX = e.clientX - startX;
    if (deltaX < -50) {
      goToNext();
    } else if (deltaX > 50) {
      goToPrev();
    } else {
      updateCarousel(true);
    }

    startAutoplay();
  });

  // Keyboard navigation
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      goToNext();
      restartAutoplay();
    } else if (e.key === 'ArrowLeft') {
      goToPrev();
      restartAutoplay();
    }
  });

  // Responsive resize
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateCarousel(false);
    }, 100);
  });

  // Initial render
  setTimeout(() => {
    updateCarousel(false);
    startAutoplay();
  }, 150);
})();

// --- Scroll reveal animations ---
const revealTargets = document.querySelectorAll(
  '.card, .guest-card, .review-card, .carousel-container, .reviews-carousel-wrap, .carousel-filters, .section-head, .compare-wrap, .split-copy, .split-media, .badges-row, .cta-inner, .narrow.center'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealTargets.forEach(el => observer.observe(el));

// --- Current year in footer ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
