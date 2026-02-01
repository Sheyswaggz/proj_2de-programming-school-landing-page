/**
 * analytics.js
 * Google Analytics Event Tracking and Performance Monitoring
 * Privacy-compliant tracking with consent handling, event tracking for CTA clicks,
 * form submissions, scroll depth milestones, and page timing
 *
 * @generated-from: task-id:b1936aa8-ad08-425d-9af3-99ccf0f65362
 * @modifies: index.html
 * @dependencies: []
 */

(function() {
  'use strict';

  // Analytics configuration
  const CONFIG = {
    tracking: {
      scrollDepthThresholds: [25, 50, 75, 90, 100],
      engagementTimeout: 30000, // 30 seconds
      debounceDelay: 100
    },
    privacy: {
      consentKey: 'analytics_consent',
      consentExpiry: 365, // days
      respectDoNotTrack: true
    },
    events: {
      category: {
        engagement: 'Engagement',
        navigation: 'Navigation',
        form: 'Form',
        cta: 'CTA',
        performance: 'Performance'
      }
    }
  };

  /**
   * Privacy Manager
   * Handles user consent and privacy preferences
   */
  class PrivacyManager {
    constructor() {
      this.hasConsent = false;
      this.init();
    }

    init() {
      // Check Do Not Track header
      if (CONFIG.privacy.respectDoNotTrack && this.isDoNotTrackEnabled()) {
        this.hasConsent = false;
        return;
      }

      // Check stored consent
      this.hasConsent = this.getStoredConsent();
    }

    isDoNotTrackEnabled() {
      return navigator.doNotTrack === '1' ||
             window.doNotTrack === '1' ||
             navigator.msDoNotTrack === '1';
    }

    getStoredConsent() {
      try {
        const consent = localStorage.getItem(CONFIG.privacy.consentKey);
        if (!consent) {
          return false;
        }

        const data = JSON.parse(consent);
        const expiryDate = new Date(data.expiry);
        const now = new Date();

        if (now > expiryDate) {
          this.clearConsent();
          return false;
        }

        return data.granted === true;
      } catch (e) {
        return false;
      }
    }

    grantConsent() {
      try {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + CONFIG.privacy.consentExpiry);

        const consent = {
          granted: true,
          expiry: expiry.toISOString(),
          timestamp: new Date().toISOString()
        };

        localStorage.setItem(CONFIG.privacy.consentKey, JSON.stringify(consent));
        this.hasConsent = true;

        return true;
      } catch (e) {
        return false;
      }
    }

    revokeConsent() {
      this.clearConsent();
      this.hasConsent = false;
    }

    clearConsent() {
      try {
        localStorage.removeItem(CONFIG.privacy.consentKey);
      } catch (e) {
        // Silent fail
      }
    }

    canTrack() {
      return this.hasConsent;
    }
  }

  /**
   * Analytics Tracker
   * Sends events to Google Analytics (gtag.js)
   */
  class AnalyticsTracker {
    constructor(privacyManager) {
      this.privacyManager = privacyManager;
      this.isGtagAvailable = typeof window.gtag === 'function';
    }

    trackEvent(eventName, params = {}) {
      if (!this.privacyManager.canTrack()) {
        return;
      }

      if (!this.isGtagAvailable) {
        return;
      }

      try {
        window.gtag('event', eventName, params);
      } catch (e) {
        // Silent fail
      }
    }

    trackPageView(url) {
      if (!this.privacyManager.canTrack()) {
        return;
      }

      if (!this.isGtagAvailable) {
        return;
      }

      try {
        window.gtag('config', window.GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID', {
          page_path: url
        });
      } catch (e) {
        // Silent fail
      }
    }

    trackTiming(category, variable, value, label = '') {
      this.trackEvent('timing_complete', {
        event_category: category,
        name: variable,
        value: Math.round(value),
        event_label: label
      });
    }
  }

  /**
   * CTA Click Tracker
   * Tracks all CTA button clicks
   */
  class CTATracker {
    constructor(tracker) {
      this.tracker = tracker;
    }

    init() {
      // Track primary CTA buttons
      const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .course-cta');

      ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          this.trackCTAClick(button, e);
        });
      });

      // Track hero section CTAs
      const heroButtons = document.querySelectorAll('.hero-actions .btn');
      heroButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.trackHeroCTA(button);
        });
      });

      // Track course enrollment buttons
      const enrollButtons = document.querySelectorAll('[aria-label*="Enroll"]');
      enrollButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.trackEnrollmentClick(button);
        });
      });
    }

    trackCTAClick(button, event) {
      const text = button.textContent.trim();
      const href = button.getAttribute('href');
      const ariaLabel = button.getAttribute('aria-label');

      this.tracker.trackEvent('cta_click', {
        event_category: CONFIG.events.category.cta,
        event_label: ariaLabel || text,
        target_url: href,
        button_text: text
      });
    }

    trackHeroCTA(button) {
      const text = button.textContent.trim();

      this.tracker.trackEvent('hero_cta_click', {
        event_category: CONFIG.events.category.cta,
        event_label: text,
        section: 'hero'
      });
    }

    trackEnrollmentClick(button) {
      const ariaLabel = button.getAttribute('aria-label') || '';
      const courseName = ariaLabel.replace('Enroll in ', '');

      this.tracker.trackEvent('enrollment_click', {
        event_category: CONFIG.events.category.cta,
        event_label: courseName,
        action: 'enroll'
      });
    }
  }

  /**
   * Form Tracking
   * Tracks form interactions and submissions
   */
  class FormTracker {
    constructor(tracker) {
      this.tracker = tracker;
      this.formStarted = new Map();
      this.formFields = new Map();
    }

    init() {
      const forms = document.querySelectorAll('form');

      forms.forEach(form => {
        this.initFormTracking(form);
      });
    }

    initFormTracking(form) {
      const formId = form.id || 'unnamed_form';

      // Track form start (first interaction)
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          if (!this.formStarted.get(formId)) {
            this.trackFormStart(formId);
            this.formStarted.set(formId, true);
          }
        }, { once: true });
      });

      // Track field completion
      inputs.forEach(input => {
        if (input.type !== 'hidden') {
          input.addEventListener('blur', () => {
            this.trackFieldCompletion(formId, input);
          });
        }
      });

      // Track form submission
      form.addEventListener('submit', (e) => {
        this.trackFormSubmission(formId, form);
      });

      // Track form errors
      form.addEventListener('invalid', (e) => {
        this.trackFormError(formId, e.target);
      }, true);
    }

    trackFormStart(formId) {
      this.tracker.trackEvent('form_start', {
        event_category: CONFIG.events.category.form,
        event_label: formId,
        action: 'start'
      });
    }

    trackFieldCompletion(formId, input) {
      const fieldName = input.name || input.id;
      const fieldType = input.type || input.tagName.toLowerCase();
      const hasValue = input.value.trim().length > 0;

      if (hasValue) {
        const fieldKey = `${formId}_${fieldName}`;
        if (!this.formFields.has(fieldKey)) {
          this.tracker.trackEvent('form_field_complete', {
            event_category: CONFIG.events.category.form,
            event_label: fieldName,
            field_type: fieldType,
            form_id: formId
          });

          this.formFields.set(fieldKey, true);
        }
      }
    }

    trackFormSubmission(formId, form) {
      const formData = new FormData(form);
      const fieldCount = Array.from(formData.entries()).filter(([key]) => key !== 'website').length;

      this.tracker.trackEvent('form_submit', {
        event_category: CONFIG.events.category.form,
        event_label: formId,
        action: 'submit',
        field_count: fieldCount
      });
    }

    trackFormError(formId, field) {
      const fieldName = field.name || field.id;
      const errorType = this.getValidationErrorType(field);

      this.tracker.trackEvent('form_error', {
        event_category: CONFIG.events.category.form,
        event_label: fieldName,
        error_type: errorType,
        form_id: formId
      });
    }

    getValidationErrorType(field) {
      const validity = field.validity;

      if (validity.valueMissing) return 'required';
      if (validity.typeMismatch) return 'type_mismatch';
      if (validity.patternMismatch) return 'pattern_mismatch';
      if (validity.tooShort) return 'too_short';
      if (validity.tooLong) return 'too_long';

      return 'unknown';
    }
  }

  /**
   * Scroll Depth Tracker
   * Tracks how far users scroll down the page
   */
  class ScrollDepthTracker {
    constructor(tracker) {
      this.tracker = tracker;
      this.thresholds = CONFIG.tracking.scrollDepthThresholds;
      this.reachedThresholds = new Set();
      this.maxScroll = 0;
      this.debounceTimer = null;
    }

    init() {
      window.addEventListener('scroll', () => {
        this.handleScroll();
      }, { passive: true });

      // Track final scroll depth on page unload
      window.addEventListener('beforeunload', () => {
        this.trackFinalDepth();
      });
    }

    handleScroll() {
      // Debounce scroll events
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        this.calculateScrollDepth();
      }, CONFIG.tracking.debounceDelay);
    }

    calculateScrollDepth() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      const scrollPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );

      // Update max scroll
      if (scrollPercentage > this.maxScroll) {
        this.maxScroll = scrollPercentage;
      }

      // Check thresholds
      this.thresholds.forEach(threshold => {
        if (scrollPercentage >= threshold && !this.reachedThresholds.has(threshold)) {
          this.trackScrollMilestone(threshold);
          this.reachedThresholds.add(threshold);
        }
      });
    }

    trackScrollMilestone(percentage) {
      this.tracker.trackEvent('scroll_depth', {
        event_category: CONFIG.events.category.engagement,
        event_label: `${percentage}%`,
        value: percentage,
        non_interaction: true
      });
    }

    trackFinalDepth() {
      if (this.maxScroll > 0) {
        this.tracker.trackEvent('max_scroll_depth', {
          event_category: CONFIG.events.category.engagement,
          event_label: 'page_exit',
          value: this.maxScroll,
          non_interaction: true
        });
      }
    }
  }

  /**
   * Performance Tracker
   * Tracks page load timing and performance metrics
   */
  class PerformanceTracker {
    constructor(tracker) {
      this.tracker = tracker;
    }

    init() {
      // Wait for page to fully load
      if (document.readyState === 'complete') {
        this.trackPageTiming();
      } else {
        window.addEventListener('load', () => {
          // Delay to ensure all resources are loaded
          setTimeout(() => {
            this.trackPageTiming();
          }, 0);
        });
      }

      // Track time to interactive
      this.trackTimeToInteractive();
    }

    trackPageTiming() {
      if (!window.performance || !window.performance.timing) {
        return;
      }

      const timing = window.performance.timing;
      const navigation = window.performance.navigation;

      // Calculate metrics
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
      const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
      const tcpTime = timing.connectEnd - timing.connectStart;
      const serverTime = timing.responseEnd - timing.requestStart;
      const downloadTime = timing.responseEnd - timing.responseStart;
      const domInteractiveTime = timing.domInteractive - timing.navigationStart;

      // Track page load time
      if (pageLoadTime > 0 && pageLoadTime < 60000) {
        this.tracker.trackTiming(
          CONFIG.events.category.performance,
          'page_load',
          pageLoadTime,
          'total'
        );
      }

      // Track DOM ready time
      if (domReadyTime > 0 && domReadyTime < 60000) {
        this.tracker.trackTiming(
          CONFIG.events.category.performance,
          'dom_ready',
          domReadyTime,
          'interactive'
        );
      }

      // Track DNS lookup time
      if (dnsTime > 0 && dnsTime < 10000) {
        this.tracker.trackTiming(
          CONFIG.events.category.performance,
          'dns_lookup',
          dnsTime,
          'network'
        );
      }

      // Track server response time
      if (serverTime > 0 && serverTime < 30000) {
        this.tracker.trackTiming(
          CONFIG.events.category.performance,
          'server_response',
          serverTime,
          'backend'
        );
      }

      // Track navigation type
      const navType = this.getNavigationType(navigation.type);
      this.tracker.trackEvent('navigation_type', {
        event_category: CONFIG.events.category.performance,
        event_label: navType,
        non_interaction: true
      });

      // Track performance score
      this.trackPerformanceScore({
        pageLoadTime,
        domReadyTime,
        serverTime
      });
    }

    getNavigationType(type) {
      switch(type) {
        case 0: return 'navigate';
        case 1: return 'reload';
        case 2: return 'back_forward';
        default: return 'unknown';
      }
    }

    trackPerformanceScore(metrics) {
      let score = 100;

      // Deduct points for slow metrics
      if (metrics.pageLoadTime > 3000) score -= 20;
      else if (metrics.pageLoadTime > 2000) score -= 10;

      if (metrics.domReadyTime > 1500) score -= 15;
      else if (metrics.domReadyTime > 1000) score -= 5;

      if (metrics.serverTime > 600) score -= 15;
      else if (metrics.serverTime > 400) score -= 5;

      const rating = score >= 80 ? 'good' : score >= 50 ? 'needs_improvement' : 'poor';

      this.tracker.trackEvent('performance_score', {
        event_category: CONFIG.events.category.performance,
        event_label: rating,
        value: score,
        non_interaction: true
      });
    }

    trackTimeToInteractive() {
      // Use First Input Delay if available
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-input') {
                const fid = entry.processingStart - entry.startTime;

                this.tracker.trackTiming(
                  CONFIG.events.category.performance,
                  'first_input_delay',
                  fid,
                  'interactivity'
                );
              }
            }
          });

          observer.observe({ type: 'first-input', buffered: true });
        } catch (e) {
          // PerformanceObserver not fully supported
        }
      }
    }
  }

  /**
   * Engagement Tracker
   * Tracks user engagement metrics
   */
  class EngagementTracker {
    constructor(tracker) {
      this.tracker = tracker;
      this.startTime = Date.now();
      this.isEngaged = false;
      this.engagementTimer = null;
    }

    init() {
      // Track engaged time (active time on page)
      this.trackEngagement();

      // Track exit intent
      this.trackExitIntent();

      // Track visibility changes
      this.trackVisibilityChanges();
    }

    trackEngagement() {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

      const handleEngagement = () => {
        if (!this.isEngaged) {
          this.isEngaged = true;

          this.tracker.trackEvent('user_engaged', {
            event_category: CONFIG.events.category.engagement,
            event_label: 'engaged',
            non_interaction: true
          });
        }

        // Reset engagement timer
        if (this.engagementTimer) {
          clearTimeout(this.engagementTimer);
        }

        this.engagementTimer = setTimeout(() => {
          this.isEngaged = false;
        }, CONFIG.tracking.engagementTimeout);
      };

      events.forEach(event => {
        document.addEventListener(event, handleEngagement, { passive: true, once: true });
      });

      // Track time on page at intervals
      setInterval(() => {
        if (this.isEngaged) {
          const timeSpent = Math.round((Date.now() - this.startTime) / 1000);

          if (timeSpent % 30 === 0) { // Every 30 seconds
            this.tracker.trackEvent('time_on_page', {
              event_category: CONFIG.events.category.engagement,
              event_label: `${timeSpent}s`,
              value: timeSpent,
              non_interaction: true
            });
          }
        }
      }, 1000);
    }

    trackExitIntent() {
      document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 0) {
          this.tracker.trackEvent('exit_intent', {
            event_category: CONFIG.events.category.engagement,
            event_label: 'mouse_leave_top',
            non_interaction: true
          });
        }
      });
    }

    trackVisibilityChanges() {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          const timeSpent = Math.round((Date.now() - this.startTime) / 1000);

          this.tracker.trackEvent('page_hidden', {
            event_category: CONFIG.events.category.engagement,
            event_label: 'tab_hidden',
            value: timeSpent,
            non_interaction: true
          });
        }
      });
    }
  }

  /**
   * Analytics Manager
   * Coordinates all tracking functionality
   */
  class AnalyticsManager {
    constructor() {
      this.privacyManager = new PrivacyManager();
      this.tracker = new AnalyticsTracker(this.privacyManager);
      this.ctaTracker = new CTATracker(this.tracker);
      this.formTracker = new FormTracker(this.tracker);
      this.scrollTracker = new ScrollDepthTracker(this.tracker);
      this.performanceTracker = new PerformanceTracker(this.tracker);
      this.engagementTracker = new EngagementTracker(this.tracker);
    }

    init() {
      // Initialize all trackers
      this.ctaTracker.init();
      this.formTracker.init();
      this.scrollTracker.init();
      this.performanceTracker.init();
      this.engagementTracker.init();
    }

    // Public API for consent management
    grantConsent() {
      return this.privacyManager.grantConsent();
    }

    revokeConsent() {
      this.privacyManager.revokeConsent();
    }

    hasConsent() {
      return this.privacyManager.hasConsent;
    }
  }

  // Initialize analytics when DOM is ready
  function initAnalytics() {
    const analytics = new AnalyticsManager();
    analytics.init();

    // Expose public API
    window.ProgrammingSchoolAnalytics = {
      grantConsent: () => analytics.grantConsent(),
      revokeConsent: () => analytics.revokeConsent(),
      hasConsent: () => analytics.hasConsent()
    };
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalytics);
  } else {
    initAnalytics();
  }

})();
