/**
 * animations.js
 * Hero Section Kinetic Typography and Interactive Animations
 * Course Card Scroll-Triggered Animations with Skeleton Loading
 * Social Proof Section with Animated Counters and Scroll-Triggered Reveals
 *
 * @generated-from: task-id:84aa5878-6521-4140-9443-f67d4f1c6482
 * @modifies: index.html
 * @dependencies: ["styles/animations.css"]
 */

(function() {
  'use strict';

  // Detect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Animation configuration
  const CONFIG = {
    typography: {
      delay: prefersReducedMotion ? 0 : 50,
      stagger: prefersReducedMotion ? 0 : 30
    },
    scroll: {
      smoothScroll: !prefersReducedMotion,
      duration: prefersReducedMotion ? 0 : 800
    },
    button: {
      loadingDuration: 2000,
      successDuration: 1500
    },
    courses: {
      staggerMin: prefersReducedMotion ? 0 : 100,
      staggerMax: prefersReducedMotion ? 0 : 150,
      skeletonDuration: prefersReducedMotion ? 0 : 1200,
      observerThreshold: 0.1
    },
    socialProof: {
      counterDuration: prefersReducedMotion ? 0 : 2000,
      staggerDelay: prefersReducedMotion ? 0 : 100,
      observerThreshold: 0.2,
      easing: 'easeOutExpo'
    }
  };

  /**
   * Kinetic Typography Animation
   * Animates text letter-by-letter for hero headline
   */
  class KineticTypography {
    constructor(element) {
      this.element = element;
      this.originalText = element.textContent;
      this.letters = [];
    }

    init() {
      if (prefersReducedMotion) {
        return;
      }

      // Clear the element
      this.element.textContent = '';
      this.element.setAttribute('aria-label', this.originalText);

      // Wrap each character in a span
      const chars = this.originalText.split('');
      chars.forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.opacity = '0';
        span.style.display = 'inline-block';
        span.style.transform = 'translateY(20px)';
        span.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

        // Preserve spaces
        if (char === ' ') {
          span.style.width = '0.3em';
        }

        this.element.appendChild(span);
        this.letters.push(span);
      });

      // Start animation
      this.animate();
    }

    animate() {
      this.letters.forEach((letter, index) => {
        setTimeout(() => {
          letter.style.opacity = '1';
          letter.style.transform = 'translateY(0)';
        }, index * CONFIG.typography.stagger);
      });
    }

    reset() {
      this.letters.forEach(letter => {
        letter.style.opacity = '0';
        letter.style.transform = 'translateY(20px)';
      });
    }
  }

  /**
   * Smooth Scroll Handler
   * Manages smooth scrolling to target sections
   */
  class SmoothScroll {
    constructor() {
      this.isScrolling = false;
    }

    init() {
      // Find all anchor links
      const links = document.querySelectorAll('a[href^="#"]');

      links.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');

          // Skip empty hash or just "#"
          if (!href || href === '#') {
            return;
          }

          const target = document.querySelector(href);

          if (target) {
            e.preventDefault();
            this.scrollToTarget(target);
          }
        });
      });
    }

    scrollToTarget(target) {
      if (this.isScrolling) {
        return;
      }

      this.isScrolling = true;

      if (prefersReducedMotion) {
        target.scrollIntoView();
        this.isScrolling = false;
        return;
      }

      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = CONFIG.scroll.duration;
      let startTime = null;

      const easeInOutCubic = (t) => {
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const animation = (currentTime) => {
        if (startTime === null) {
          startTime = currentTime;
        }

        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutCubic(progress);

        window.scrollTo(0, startPosition + distance * ease);

        if (progress < 1) {
          requestAnimationFrame(animation);
        } else {
          this.isScrolling = false;
          target.focus();
        }
      };

      requestAnimationFrame(animation);
    }
  }

  /**
   * Button State Manager
   * Handles loading and success states for interactive buttons
   */
  class ButtonStateManager {
    constructor() {
      this.buttons = new Map();
    }

    init() {
      // Find all primary CTA buttons
      const ctaButtons = document.querySelectorAll('.btn-primary, .hero-actions .btn');

      ctaButtons.forEach(button => {
        // Skip if it's a regular link without special functionality
        if (button.tagName === 'A' && !button.hasAttribute('data-interactive')) {
          return;
        }

        this.buttons.set(button, {
          originalText: button.textContent,
          state: 'idle'
        });
      });

      // Listen for custom events to trigger state changes
      document.addEventListener('button:loading', (e) => {
        if (e.detail && e.detail.button) {
          this.setLoading(e.detail.button);
        }
      });

      document.addEventListener('button:success', (e) => {
        if (e.detail && e.detail.button) {
          this.setSuccess(e.detail.button);
        }
      });

      document.addEventListener('button:error', (e) => {
        if (e.detail && e.detail.button) {
          this.setError(e.detail.button);
        }
      });

      document.addEventListener('button:reset', (e) => {
        if (e.detail && e.detail.button) {
          this.reset(e.detail.button);
        }
      });
    }

    setLoading(button) {
      const state = this.buttons.get(button);
      if (!state || state.state === 'loading') {
        return;
      }

      state.state = 'loading';
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');

      // Store original content
      state.originalHTML = button.innerHTML;

      // Create loading indicator
      const spinner = this.createSpinner();
      button.innerHTML = '';
      button.appendChild(spinner);

      const text = document.createElement('span');
      text.textContent = 'Loading...';
      button.appendChild(text);

      button.classList.add('btn-loading');
    }

    setSuccess(button) {
      const state = this.buttons.get(button);
      if (!state) {
        return;
      }

      state.state = 'success';
      button.disabled = false;
      button.setAttribute('aria-busy', 'false');

      // Show success message
      button.innerHTML = '';
      const checkmark = this.createCheckmark();
      button.appendChild(checkmark);

      const text = document.createElement('span');
      text.textContent = 'Success!';
      button.appendChild(text);

      button.classList.remove('btn-loading');
      button.classList.add('btn-success');

      // Auto-reset after delay
      setTimeout(() => {
        this.reset(button);
      }, CONFIG.button.successDuration);
    }

    setError(button) {
      const state = this.buttons.get(button);
      if (!state) {
        return;
      }

      state.state = 'error';
      button.disabled = false;
      button.setAttribute('aria-busy', 'false');

      button.innerHTML = '';
      const text = document.createElement('span');
      text.textContent = 'Try Again';
      button.appendChild(text);

      button.classList.remove('btn-loading');
      button.classList.add('btn-error');

      // Auto-reset after delay
      setTimeout(() => {
        this.reset(button);
      }, CONFIG.button.successDuration);
    }

    reset(button) {
      const state = this.buttons.get(button);
      if (!state) {
        return;
      }

      state.state = 'idle';
      button.disabled = false;
      button.removeAttribute('aria-busy');

      // Restore original content
      if (state.originalHTML) {
        button.innerHTML = state.originalHTML;
      } else {
        button.textContent = state.originalText;
      }

      button.classList.remove('btn-loading', 'btn-success', 'btn-error');
    }

    createSpinner() {
      const spinner = document.createElement('span');
      spinner.className = 'spinner';
      spinner.setAttribute('role', 'status');
      spinner.setAttribute('aria-hidden', 'true');
      spinner.style.cssText = `
        display: inline-block;
        width: 1em;
        height: 1em;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      `;
      return spinner;
    }

    createCheckmark() {
      const checkmark = document.createElement('span');
      checkmark.innerHTML = '&#10003;';
      checkmark.setAttribute('aria-hidden', 'true');
      checkmark.style.cssText = `
        display: inline-block;
        font-weight: bold;
        color: currentColor;
      `;
      return checkmark;
    }
  }

  /**
   * Scroll Indicator
   * Animated scroll indicator to guide users to content below
   */
  class ScrollIndicator {
    constructor() {
      this.indicator = null;
    }

    init() {
      // Find hero section
      const heroSection = document.querySelector('.hero-section, #hero');
      if (!heroSection) {
        return;
      }

      // Create scroll indicator
      this.indicator = this.createIndicator();
      heroSection.appendChild(this.indicator);

      // Hide on scroll
      window.addEventListener('scroll', () => {
        this.updateVisibility();
      });

      // Click to scroll
      this.indicator.addEventListener('click', () => {
        const nextSection = heroSection.nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      });

      // Initial visibility check
      this.updateVisibility();
    }

    createIndicator() {
      const indicator = document.createElement('div');
      indicator.className = 'scroll-indicator';
      indicator.setAttribute('role', 'button');
      indicator.setAttribute('aria-label', 'Scroll to next section');
      indicator.setAttribute('tabindex', '0');

      indicator.style.cssText = `
        position: absolute;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        width: 30px;
        height: 50px;
        border: 2px solid currentColor;
        border-radius: 20px;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.3s ease;
        z-index: 10;
      `;

      // Create mouse wheel indicator
      const wheel = document.createElement('div');
      wheel.style.cssText = `
        width: 4px;
        height: 8px;
        background-color: currentColor;
        border-radius: 2px;
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        ${prefersReducedMotion ? '' : 'animation: scroll-wheel 1.5s ease-in-out infinite;'}
      `;

      indicator.appendChild(wheel);

      // Add keyframe animation if not reduced motion
      if (!prefersReducedMotion) {
        const style = document.createElement('style');
        style.textContent = `
          @keyframes scroll-wheel {
            0% {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
            100% {
              opacity: 0;
              transform: translateX(-50%) translateY(15px);
            }
          }
        `;
        document.head.appendChild(style);
      }

      // Hover effect
      indicator.addEventListener('mouseenter', () => {
        indicator.style.opacity = '1';
      });

      indicator.addEventListener('mouseleave', () => {
        indicator.style.opacity = '0.7';
      });

      // Keyboard support
      indicator.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          indicator.click();
        }
      });

      return indicator;
    }

    updateVisibility() {
      if (!this.indicator) {
        return;
      }

      const scrollPosition = window.pageYOffset;
      const windowHeight = window.innerHeight;

      // Hide after scrolling past first screen
      if (scrollPosition > windowHeight * 0.3) {
        this.indicator.style.opacity = '0';
        this.indicator.style.pointerEvents = 'none';
      } else {
        this.indicator.style.opacity = '0.7';
        this.indicator.style.pointerEvents = 'auto';
      }
    }
  }

  /**
   * Intersection Observer for Scroll Reveals
   * Adds reveal animations to elements as they enter viewport
   */
  class ScrollReveal {
    constructor() {
      this.observer = null;
    }

    init() {
      if (prefersReducedMotion) {
        return;
      }

      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            this.observer.unobserve(entry.target);
          }
        });
      }, options);

      // Observe elements that should reveal on scroll (excluding course cards)
      const revealElements = document.querySelectorAll(
        '.testimonial-card, .about-content, .section-header'
      );

      revealElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        this.observer.observe(element);
      });
    }
  }

  /**
   * Course Card Animator
   * Manages scroll-triggered animations and skeleton loading for course cards
   */
  class CourseCardAnimator {
    constructor() {
      this.observer = null;
      this.cards = [];
      this.skeletonStates = new Map();
    }

    init() {
      // Find all course cards
      const courseCards = document.querySelectorAll('.course-card');
      if (courseCards.length === 0) {
        return;
      }

      this.cards = Array.from(courseCards);

      // Initialize skeleton loading states
      this.initializeSkeletonStates();

      // Set up Intersection Observer for scroll-triggered animations
      this.setupIntersectionObserver();
    }

    initializeSkeletonStates() {
      this.cards.forEach((card, index) => {
        // Add skeleton loading class
        card.classList.add('course-card-skeleton');

        // Store initial state
        this.skeletonStates.set(card, {
          isLoaded: false,
          index: index
        });

        // Set initial hidden state
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      });
    }

    setupIntersectionObserver() {
      if (prefersReducedMotion) {
        // Remove skeleton and show cards immediately if reduced motion is preferred
        this.cards.forEach(card => {
          card.classList.remove('course-card-skeleton');
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
        return;
      }

      const options = {
        root: null,
        rootMargin: '0px',
        threshold: CONFIG.courses.observerThreshold
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCard(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, options);

      // Observe all course cards
      this.cards.forEach(card => {
        this.observer.observe(card);
      });
    }

    animateCard(card) {
      const state = this.skeletonStates.get(card);
      if (!state || state.isLoaded) {
        return;
      }

      // Calculate staggered delay based on card index
      const staggerDelay = this.calculateStaggerDelay(state.index);

      // Simulate loading with skeleton state
      setTimeout(() => {
        this.removeSkeletonState(card, state, staggerDelay);
      }, CONFIG.courses.skeletonDuration);
    }

    calculateStaggerDelay(index) {
      // Generate random delay between staggerMin and staggerMax
      const range = CONFIG.courses.staggerMax - CONFIG.courses.staggerMin;
      const randomOffset = Math.random() * range;
      return CONFIG.courses.staggerMin + randomOffset + (index * 50);
    }

    removeSkeletonState(card, state, staggerDelay) {
      // Remove skeleton class
      card.classList.remove('course-card-skeleton');

      // Mark as loaded
      state.isLoaded = true;

      // Trigger reveal animation with stagger
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.classList.add('reveal');
      }, staggerDelay);
    }

    reset() {
      // Reset all cards to initial state (useful for testing)
      this.cards.forEach(card => {
        const state = this.skeletonStates.get(card);
        if (state) {
          state.isLoaded = false;
          card.classList.add('course-card-skeleton');
          card.classList.remove('reveal');
          card.style.opacity = '0';
          card.style.transform = 'translateY(30px)';
          if (this.observer) {
            this.observer.observe(card);
          }
        }
      });
    }
  }

  /**
   * Animated Counter
   * Animates numbers from 0 to target value using requestAnimationFrame
   */
  class AnimatedCounter {
    constructor(element, targetValue, duration = 2000) {
      this.element = element;
      this.targetValue = this.parseTargetValue(element.textContent || targetValue);
      this.duration = duration;
      this.hasAnimated = false;
      this.suffix = this.extractSuffix(element.textContent);
    }

    parseTargetValue(text) {
      // Extract numeric value from text like "5000+", "98%", "50+"
      const match = text.match(/[\d,]+/);
      if (match) {
        return parseInt(match[0].replace(/,/g, ''), 10);
      }
      return 0;
    }

    extractSuffix(text) {
      // Extract suffix like "+", "%", etc.
      const match = text.match(/[\d,]+(.*)$/);
      return match && match[1] ? match[1] : '';
    }

    animate() {
      if (this.hasAnimated || prefersReducedMotion) {
        this.element.textContent = this.formatNumber(this.targetValue) + this.suffix;
        return;
      }

      this.hasAnimated = true;
      const startTime = performance.now();
      const startValue = 0;

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / this.duration, 1);

        // Easing function: easeOutExpo
        const easedProgress = progress === 1
          ? 1
          : 1 - Math.pow(2, -10 * progress);

        const currentValue = Math.floor(startValue + (this.targetValue - startValue) * easedProgress);
        this.element.textContent = this.formatNumber(currentValue) + this.suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          this.element.textContent = this.formatNumber(this.targetValue) + this.suffix;
        }
      };

      requestAnimationFrame(updateCounter);
    }

    formatNumber(num) {
      // Add comma separators for thousands
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    reset() {
      this.hasAnimated = false;
      this.element.textContent = '0' + this.suffix;
    }
  }

  /**
   * Social Proof Animator
   * Manages animations for social proof section including testimonials, stats, and trust elements
   */
  class SocialProofAnimator {
    constructor() {
      this.observer = null;
      this.counters = [];
      this.animatedElements = new Set();
    }

    init() {
      // Initialize animated counters for statistics
      this.initializeCounters();

      // Set up Intersection Observer for scroll-triggered reveals
      this.setupIntersectionObserver();
    }

    initializeCounters() {
      // Find all stat numbers that should be animated
      const statNumbers = document.querySelectorAll('.stat-number, [data-counter]');

      statNumbers.forEach(element => {
        const counter = new AnimatedCounter(
          element,
          element.textContent,
          CONFIG.socialProof.counterDuration
        );
        this.counters.push({ element, counter });

        // Set initial state to 0
        if (!prefersReducedMotion) {
          element.textContent = '0' + counter.suffix;
        }
      });
    }

    setupIntersectionObserver() {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: CONFIG.socialProof.observerThreshold
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
            this.animateElement(entry.target);
            this.animatedElements.add(entry.target);
          }
        });
      }, options);

      // Observe testimonial cards
      this.observeTestimonials();

      // Observe trust elements and badges
      this.observeTrustElements();

      // Observe about section stats
      this.observeStatistics();

      // Observe social proof section
      this.observeSocialProofSection();
    }

    observeTestimonials() {
      const testimonials = document.querySelectorAll('.testimonial-card');

      testimonials.forEach((testimonial, index) => {
        if (!prefersReducedMotion) {
          testimonial.style.opacity = '0';
          testimonial.style.transform = 'translateY(30px)';
          testimonial.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
          testimonial.dataset.animationIndex = index;
        }
        this.observer.observe(testimonial);
      });
    }

    observeTrustElements() {
      const trustElements = document.querySelectorAll(
        '.trust-badge, .logo-cloud-item, [data-trust-element]'
      );

      trustElements.forEach((element, index) => {
        if (!prefersReducedMotion) {
          element.style.opacity = '0';
          element.style.transform = 'scale(0.9)';
          element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
          element.dataset.animationIndex = index;
        }
        this.observer.observe(element);
      });
    }

    observeStatistics() {
      const statItems = document.querySelectorAll('.stat-item, .about-stats .stat-item');

      statItems.forEach((statItem, index) => {
        if (!prefersReducedMotion) {
          statItem.style.opacity = '0';
          statItem.style.transform = 'translateY(20px)';
          statItem.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
          statItem.dataset.animationIndex = index;
        }
        this.observer.observe(statItem);
      });
    }

    observeSocialProofSection() {
      const socialProofSections = document.querySelectorAll(
        '#testimonials, .testimonials-section, .social-proof-section'
      );

      socialProofSections.forEach(section => {
        this.observer.observe(section);
      });
    }

    animateElement(element) {
      // Check if this element contains a counter
      const counterData = this.counters.find(c => c.element === element || element.contains(c.element));

      if (counterData && !counterData.counter.hasAnimated) {
        // Animate the counter
        setTimeout(() => {
          counterData.counter.animate();
        }, this.getStaggerDelay(element));
      }

      // Animate the element itself
      if (!prefersReducedMotion) {
        const index = parseInt(element.dataset.animationIndex || '0', 10);
        const delay = this.getStaggerDelay(element, index);

        setTimeout(() => {
          if (element.classList.contains('testimonial-card')) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.classList.add('reveal');
          } else if (element.classList.contains('trust-badge') ||
                     element.classList.contains('logo-cloud-item') ||
                     element.hasAttribute('data-trust-element')) {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
            element.classList.add('reveal-scale');
          } else if (element.classList.contains('stat-item')) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.classList.add('reveal');

            // Also trigger counter animation if it hasn't happened yet
            const statNumber = element.querySelector('.stat-number, [data-counter]');
            if (statNumber) {
              const counter = this.counters.find(c => c.element === statNumber);
              if (counter && !counter.counter.hasAnimated) {
                setTimeout(() => {
                  counter.counter.animate();
                }, 200);
              }
            }
          }
        }, delay);
      } else {
        // Reduced motion: show immediately
        element.style.opacity = '1';
        element.style.transform = 'none';
      }
    }

    getStaggerDelay(element, index = 0) {
      // Calculate staggered delay for sequential reveals
      const baseDelay = CONFIG.socialProof.staggerDelay;
      return index * baseDelay;
    }

    reset() {
      // Reset all counters and animations (useful for testing)
      this.counters.forEach(({ counter }) => {
        counter.reset();
      });

      this.animatedElements.clear();

      // Reset element styles
      document.querySelectorAll('.testimonial-card, .trust-badge, .stat-item').forEach(element => {
        element.classList.remove('reveal', 'reveal-scale');
        if (!prefersReducedMotion) {
          element.style.opacity = '0';
          element.style.transform = '';
        }
      });
    }
  }

  /**
   * Initialize all animations
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize kinetic typography for hero headline
    const heroTitle = document.querySelector('#hero-title, .hero-section h1');
    if (heroTitle) {
      const typography = new KineticTypography(heroTitle);
      typography.init();
    }

    // Initialize smooth scroll
    const smoothScroll = new SmoothScroll();
    smoothScroll.init();

    // Initialize button state manager
    const buttonManager = new ButtonStateManager();
    buttonManager.init();

    // Initialize scroll indicator
    const scrollIndicator = new ScrollIndicator();
    scrollIndicator.init();

    // Initialize scroll reveal
    const scrollReveal = new ScrollReveal();
    scrollReveal.init();

    // Initialize course card animator
    const courseCardAnimator = new CourseCardAnimator();
    courseCardAnimator.init();

    // Initialize social proof animator
    const socialProofAnimator = new SocialProofAnimator();
    socialProofAnimator.init();

    // Log initialization (can be removed in production)
    console.log('Animations initialized', {
      prefersReducedMotion,
      features: {
        kineticTypography: !!heroTitle,
        smoothScroll: true,
        buttonStates: true,
        scrollIndicator: true,
        scrollReveal: !prefersReducedMotion,
        courseCardAnimations: true,
        socialProofAnimations: true
      }
    });
  }

  // Start initialization
  init();

  // Export for external use if needed
  if (typeof window !== 'undefined') {
    window.Animations = {
      KineticTypography,
      SmoothScroll,
      ButtonStateManager,
      ScrollIndicator,
      ScrollReveal,
      CourseCardAnimator,
      AnimatedCounter,
      SocialProofAnimator
    };
  }

})();
