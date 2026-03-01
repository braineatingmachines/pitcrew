/**
 * Main JavaScript for PitCrew
 * FTC/FRC Robotics Team Portfolio Template
 */

// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
if (darkModeToggle) {
  darkModeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
  });
}

// Accessibility Mode Toggle
const accessibilityToggle = document.getElementById('accessibility-toggle');
if (accessibilityToggle) {
  accessibilityToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('accessibility-mode');
    const isAccessible = document.documentElement.classList.contains('accessibility-mode');
    localStorage.setItem('accessibilityMode', isAccessible);
  });
}

// Mobile Menu
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuClose = document.getElementById('mobile-menu-close');
const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');

function openMobileMenu() {
  mobileMenu?.classList.remove('hidden');
  mobileMenu?.classList.add('flex');
  document.body.style.overflow = 'hidden';
  mobileMenuButton?.setAttribute('aria-expanded', 'true');
  mobileMenu?.querySelector('a, button')?.focus();
}

function closeMobileMenu() {
  mobileMenu?.classList.add('hidden');
  mobileMenu?.classList.remove('flex');
  document.body.style.overflow = '';
  mobileMenuButton?.setAttribute('aria-expanded', 'false');
  mobileMenuButton?.focus();
}

mobileMenuButton?.addEventListener('click', openMobileMenu);
mobileMenuClose?.addEventListener('click', closeMobileMenu);
mobileMenuBackdrop?.addEventListener('click', closeMobileMenu);

// Keyboard: Escape closes overlays, arrows navigate lightbox, Tab traps focus in mobile menu
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeMobileMenu();
    closeLightbox();
  }
  if (lightbox && !lightbox.classList.contains('hidden')) {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  }
  if (mobileMenu && !mobileMenu.classList.contains('hidden') && e.key === 'Tab') {
    const focusable = [...mobileMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
});

// Gallery Lightbox
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('gallery-lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

let currentGalleryIndex = 0;
let galleryImages = [];

function openLightbox(index) {
  if (!lightbox || !lightboxImage) return;

  currentGalleryIndex = index;
  const item = galleryImages[index];
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  if (lightboxCaption) {
    lightboxCaption.textContent = item.caption || '';
  }

  lightbox.classList.remove('hidden');
  lightbox.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.add('hidden');
  lightbox.classList.remove('flex');
  document.body.style.overflow = '';
}

function nextImage() {
  currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
  openLightbox(currentGalleryIndex);
}

function prevImage() {
  currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
  openLightbox(currentGalleryIndex);
}

// Initialize gallery
galleryItems.forEach((item, index) => {
  galleryImages.push({
    src: item.href,
    alt: item.querySelector('img')?.alt || '',
    caption: item.dataset.caption || ''
  });

  item.addEventListener('click', (e) => {
    e.preventDefault();
    openLightbox(index);
  });
});

lightboxClose?.addEventListener('click', closeLightbox);
lightboxPrev?.addEventListener('click', prevImage);
lightboxNext?.addEventListener('click', nextImage);

// Table of Contents generation for docs
const tocContainer = document.getElementById('toc');
if (tocContainer) {
  const headings = document.querySelectorAll('.prose h2, .prose h3');
  headings.forEach((heading) => {
    if (!heading.id) {
      heading.id = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    link.className = heading.tagName === 'H2'
      ? 'block text-[var(--color-text-muted)] hover:text-primary'
      : 'block text-[var(--color-text-muted)] hover:text-primary pl-4 text-xs';

    tocContainer.appendChild(link);
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Update URL without jumping
      history.pushState(null, null, `#${targetId}`);
    }
  });
});

// Circuit viewer controls (if present)
document.querySelectorAll('.circuit-viewer-container').forEach(container => {
  const img = container.querySelector('img');
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  const updateTransform = () => {
    if (img) {
      img.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    }
  };

  container.querySelector('.circuit-zoom-in')?.addEventListener('click', () => {
    scale = Math.min(scale * 1.2, 5);
    updateTransform();
  });

  container.querySelector('.circuit-zoom-out')?.addEventListener('click', () => {
    scale = Math.max(scale / 1.2, 0.5);
    updateTransform();
  });

  container.querySelector('.circuit-reset')?.addEventListener('click', () => {
    scale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
  });

  container.querySelector('.circuit-fullscreen')?.addEventListener('click', () => {
    const viewer = container.querySelector('.circuit-pan-zoom');
    if (viewer && document.fullscreenEnabled) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        viewer.requestFullscreen();
      }
    }
  });
});

// Accessibility mode detailed controls
const highContrastToggle = document.getElementById('high-contrast-toggle');
const reducedMotionToggle = document.getElementById('reduced-motion-toggle');
const largeTextToggle = document.getElementById('large-text-toggle');

highContrastToggle?.addEventListener('change', () => {
  document.documentElement.classList.toggle('high-contrast', highContrastToggle.checked);
  localStorage.setItem('highContrast', highContrastToggle.checked);
});

reducedMotionToggle?.addEventListener('change', () => {
  document.documentElement.classList.toggle('reduced-motion', reducedMotionToggle.checked);
  localStorage.setItem('reducedMotion', reducedMotionToggle.checked);
});

largeTextToggle?.addEventListener('change', () => {
  document.documentElement.classList.toggle('large-text', largeTextToggle.checked);
  localStorage.setItem('largeText', largeTextToggle.checked);
});

// Restore accessibility preferences
if (localStorage.getItem('highContrast') === 'true') {
  document.documentElement.classList.add('high-contrast');
  if (highContrastToggle) highContrastToggle.checked = true;
}
if (localStorage.getItem('reducedMotion') === 'true') {
  document.documentElement.classList.add('reduced-motion');
  if (reducedMotionToggle) reducedMotionToggle.checked = true;
}
if (localStorage.getItem('largeText') === 'true') {
  document.documentElement.classList.add('large-text');
  if (largeTextToggle) largeTextToggle.checked = true;
}

// PitCrew ready
