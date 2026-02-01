/**
 * unsplash.js
 * Unsplash API Integration for Dynamic Images
 * Testimonials, Technology Logos, and Trust Section Images
 *
 * @generated-from: task-id:84aa5878-6521-4140-9443-f67d4f1c6482
 * @modifies: index.html
 * @dependencies: ["index.html"]
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiBase: 'https://api.unsplash.com',
    apiVersion: 'v1',
    clientId: 'YOUR_UNSPLASH_ACCESS_KEY', // Replace with actual key
    fallbackDelay: 2000,
    imageQuality: 'regular',
    cacheExpiry: 3600000, // 1 hour in milliseconds
    retryAttempts: 3,
    retryDelay: 1000
  };

  // Image categories and search queries
  const IMAGE_QUERIES = {
    testimonials: {
      query: 'professional portrait headshot',
      orientation: 'squarish',
      count: 3,
      fallbacks: [
        'images/avatar-sarah.jpg',
        'images/avatar-michael.jpg',
        'images/avatar-emily.jpg'
      ]
    },
    technology: {
      query: 'technology logo brand',
      orientation: 'landscape',
      count: 6,
      fallbacks: [
        'images/logo-placeholder-1.jpg',
        'images/logo-placeholder-2.jpg',
        'images/logo-placeholder-3.jpg',
        'images/logo-placeholder-4.jpg',
        'images/logo-placeholder-5.jpg',
        'images/logo-placeholder-6.jpg'
      ]
    }
  };

  /**
   * Result type pattern for predictable error handling
   */
  const Result = {
    ok: (value) => ({ ok: true, value }),
    err: (error) => ({ ok: false, error })
  };

  /**
   * Local Storage Cache Manager
   * Implements caching with expiry for API responses
   */
  class CacheManager {
    constructor() {
      this.prefix = 'unsplash_cache_';
      this.isAvailable = this.checkStorageAvailability();
    }

    checkStorageAvailability() {
      try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    }

    set(key, value, expiry = CONFIG.cacheExpiry) {
      if (!this.isAvailable) {
        return;
      }

      const item = {
        value,
        timestamp: Date.now(),
        expiry
      };

      try {
        localStorage.setItem(this.prefix + key, JSON.stringify(item));
      } catch (e) {
        console.warn('Cache storage failed:', e.message);
      }
    }

    get(key) {
      if (!this.isAvailable) {
        return null;
      }

      try {
        const item = localStorage.getItem(this.prefix + key);

        if (!item) {
          return null;
        }

        const parsed = JSON.parse(item);
        const age = Date.now() - parsed.timestamp;

        if (age > parsed.expiry) {
          this.remove(key);
          return null;
        }

        return parsed.value;
      } catch (e) {
        console.warn('Cache retrieval failed:', e.message);
        return null;
      }
    }

    remove(key) {
      if (!this.isAvailable) {
        return;
      }

      try {
        localStorage.removeItem(this.prefix + key);
      } catch (e) {
        console.warn('Cache removal failed:', e.message);
      }
    }

    clear() {
      if (!this.isAvailable) {
        return;
      }

      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(this.prefix)) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.warn('Cache clear failed:', e.message);
      }
    }
  }

  /**
   * Unsplash API Client
   * Handles all interactions with the Unsplash API
   */
  class UnsplashClient {
    constructor() {
      this.cache = new CacheManager();
      this.requestQueue = [];
      this.isProcessing = false;
    }

    /**
     * Build API URL with parameters
     */
    buildUrl(endpoint, params = {}) {
      const url = new URL(`${CONFIG.apiBase}/${endpoint}`);

      // Add client ID
      url.searchParams.append('client_id', CONFIG.clientId);

      // Add additional parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, value);
        }
      });

      return url.toString();
    }

    /**
     * Fetch with retry logic and exponential backoff
     */
    async fetchWithRetry(url, attempt = 1) {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return Result.ok(await response.json());
      } catch (error) {
        if (attempt < CONFIG.retryAttempts) {
          const delay = CONFIG.retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.fetchWithRetry(url, attempt + 1);
        }

        return Result.err(new Error(`Failed after ${attempt} attempts: ${error.message}`, { cause: error }));
      }
    }

    /**
     * Search photos by query
     */
    async searchPhotos(query, options = {}) {
      const cacheKey = `search_${query}_${JSON.stringify(options)}`;
      const cached = this.cache.get(cacheKey);

      if (cached) {
        return Result.ok(cached);
      }

      const params = {
        query,
        per_page: options.count || 10,
        orientation: options.orientation || 'landscape',
        content_filter: 'high'
      };

      const url = this.buildUrl('search/photos', params);
      const result = await this.fetchWithRetry(url);

      if (result.ok) {
        this.cache.set(cacheKey, result.value);
      }

      return result;
    }

    /**
     * Get random photos by query
     */
    async getRandomPhotos(query, options = {}) {
      const cacheKey = `random_${query}_${JSON.stringify(options)}`;
      const cached = this.cache.get(cacheKey);

      if (cached) {
        return Result.ok(cached);
      }

      const params = {
        query,
        count: options.count || 1,
        orientation: options.orientation || 'landscape',
        content_filter: 'high'
      };

      const url = this.buildUrl('photos/random', params);
      const result = await this.fetchWithRetry(url);

      if (result.ok) {
        this.cache.set(cacheKey, result.value);
      }

      return result;
    }

    /**
     * Track photo download (required by Unsplash API guidelines)
     */
    async trackDownload(downloadLocation) {
      if (!downloadLocation) {
        return;
      }

      try {
        await fetch(downloadLocation);
      } catch (e) {
        console.warn('Download tracking failed:', e.message);
      }
    }
  }

  /**
   * Image Loader with Progressive Enhancement
   * Handles loading images with proper attribution and fallbacks
   */
  class ImageLoader {
    constructor(client) {
      this.client = client;
      this.loadingStates = new Map();
    }

    /**
     * Extract image data from Unsplash response
     */
    extractImageData(photo) {
      return {
        url: photo.urls[CONFIG.imageQuality] || photo.urls.regular,
        thumbnail: photo.urls.thumb,
        alt: photo.alt_description || photo.description || 'Image',
        author: photo.user.name,
        authorUrl: photo.user.links.html,
        downloadLocation: photo.links.download_location,
        color: photo.color || '#cccccc'
      };
    }

    /**
     * Create attribution element
     */
    createAttribution(data) {
      const attribution = document.createElement('div');
      attribution.className = 'image-attribution';
      attribution.innerHTML = `
        <span class="attribution-text">Photo by
          <a href="${data.authorUrl}?utm_source=programming_school&utm_medium=referral"
             target="_blank"
             rel="noopener noreferrer">${data.author}</a>
          on
          <a href="https://unsplash.com?utm_source=programming_school&utm_medium=referral"
             target="_blank"
             rel="noopener noreferrer">Unsplash</a>
        </span>
      `;
      return attribution;
    }

    /**
     * Load image with proper error handling
     */
    async loadImage(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));

        img.src = url;
      });
    }

    /**
     * Apply image to element with fade-in effect
     */
    applyImage(element, imageData, options = {}) {
      const { showAttribution = true, fadeIn = true } = options;

      return new Promise(async (resolve, reject) => {
        try {
          // Load the image
          await this.loadImage(imageData.url);

          // Update element
          if (element.tagName === 'IMG') {
            element.src = imageData.url;
            element.alt = imageData.alt;
          } else {
            element.style.backgroundImage = `url(${imageData.url})`;
          }

          // Add fade-in effect
          if (fadeIn) {
            element.style.opacity = '0';
            element.style.transition = 'opacity 0.6s ease';

            requestAnimationFrame(() => {
              element.style.opacity = '1';
            });
          }

          // Add attribution if requested
          if (showAttribution && element.parentElement) {
            const existingAttribution = element.parentElement.querySelector('.image-attribution');
            if (existingAttribution) {
              existingAttribution.remove();
            }

            const attribution = this.createAttribution(imageData);
            element.parentElement.appendChild(attribution);
          }

          // Track download
          if (imageData.downloadLocation) {
            this.client.trackDownload(imageData.downloadLocation);
          }

          resolve(imageData);
        } catch (error) {
          reject(error);
        }
      });
    }

    /**
     * Apply fallback image
     */
    applyFallback(element, fallbackUrl) {
      if (element.tagName === 'IMG') {
        element.src = fallbackUrl;
      } else {
        element.style.backgroundImage = `url(${fallbackUrl})`;
      }
    }
  }

  /**
   * Testimonial Image Manager
   * Manages testimonial profile images
   */
  class TestimonialImageManager {
    constructor(client, loader) {
      this.client = client;
      this.loader = loader;
    }

    async loadTestimonialImages() {
      const testimonialCards = document.querySelectorAll('.testimonial-card .testimonial-author img');

      if (testimonialCards.length === 0) {
        return;
      }

      const config = IMAGE_QUERIES.testimonials;
      const result = await this.client.getRandomPhotos(config.query, {
        count: config.count,
        orientation: config.orientation
      });

      if (!result.ok) {
        console.warn('Failed to load testimonial images:', result.error.message);
        this.applyFallbacks(testimonialCards, config.fallbacks);
        return;
      }

      const photos = Array.isArray(result.value) ? result.value : [result.value];

      testimonialCards.forEach((img, index) => {
        const photo = photos[index % photos.length];

        if (photo) {
          const imageData = this.loader.extractImageData(photo);

          this.loader.applyImage(img, imageData, {
            showAttribution: false,
            fadeIn: true
          }).catch(() => {
            this.loader.applyFallback(img, config.fallbacks[index]);
          });
        } else {
          this.loader.applyFallback(img, config.fallbacks[index]);
        }
      });
    }

    applyFallbacks(elements, fallbacks) {
      elements.forEach((element, index) => {
        const fallback = fallbacks[index % fallbacks.length];
        this.loader.applyFallback(element, fallback);
      });
    }
  }

  /**
   * Technology Logo Manager
   * Manages company and technology logos for trust section
   */
  class TechnologyLogoManager {
    constructor(client, loader) {
      this.client = client;
      this.loader = loader;
    }

    async loadTechnologyLogos() {
      const logoElements = document.querySelectorAll('[data-tech-logo]');

      if (logoElements.length === 0) {
        return;
      }

      const config = IMAGE_QUERIES.technology;
      const result = await this.client.searchPhotos(config.query, {
        count: config.count,
        orientation: config.orientation
      });

      if (!result.ok) {
        console.warn('Failed to load technology logos:', result.error.message);
        this.applyFallbacks(logoElements, config.fallbacks);
        return;
      }

      const photos = result.value.results || [];

      if (photos.length === 0) {
        this.applyFallbacks(logoElements, config.fallbacks);
        return;
      }

      logoElements.forEach((element, index) => {
        const photo = photos[index % photos.length];

        if (photo) {
          const imageData = this.loader.extractImageData(photo);

          this.loader.applyImage(element, imageData, {
            showAttribution: true,
            fadeIn: true
          }).catch(() => {
            this.loader.applyFallback(element, config.fallbacks[index]);
          });
        } else {
          this.loader.applyFallback(element, config.fallbacks[index]);
        }
      });
    }

    applyFallbacks(elements, fallbacks) {
      elements.forEach((element, index) => {
        const fallback = fallbacks[index % fallbacks.length];
        this.loader.applyFallback(element, fallback);
      });
    }
  }

  /**
   * Main Application Controller
   */
  class UnsplashApp {
    constructor() {
      this.client = new UnsplashClient();
      this.loader = new ImageLoader(this.client);
      this.testimonialManager = new TestimonialImageManager(this.client, this.loader);
      this.logoManager = new TechnologyLogoManager(this.client, this.loader);
      this.isInitialized = false;
    }

    /**
     * Check if API key is configured
     */
    isApiConfigured() {
      return CONFIG.clientId && CONFIG.clientId !== 'YOUR_UNSPLASH_ACCESS_KEY';
    }

    /**
     * Initialize the application
     */
    async init() {
      if (this.isInitialized) {
        return;
      }

      // Check if API is configured
      if (!this.isApiConfigured()) {
        console.warn('Unsplash API key not configured. Using fallback images.');
        this.useFallbacksOnly();
        return;
      }

      try {
        // Load testimonial images
        await this.testimonialManager.loadTestimonialImages();

        // Load technology logos
        await this.logoManager.loadTechnologyLogos();

        this.isInitialized = true;
      } catch (error) {
        console.error('Unsplash initialization failed:', error);
        this.useFallbacksOnly();
      }
    }

    /**
     * Use fallback images only
     */
    useFallbacksOnly() {
      const testimonialImages = document.querySelectorAll('.testimonial-card .testimonial-author img');
      const logoElements = document.querySelectorAll('[data-tech-logo]');

      testimonialImages.forEach((img, index) => {
        const fallback = IMAGE_QUERIES.testimonials.fallbacks[index % IMAGE_QUERIES.testimonials.fallbacks.length];
        this.loader.applyFallback(img, fallback);
      });

      logoElements.forEach((element, index) => {
        const fallback = IMAGE_QUERIES.technology.fallbacks[index % IMAGE_QUERIES.technology.fallbacks.length];
        this.loader.applyFallback(element, fallback);
      });
    }

    /**
     * Refresh images (clear cache and reload)
     */
    async refresh() {
      this.client.cache.clear();
      this.isInitialized = false;
      await this.init();
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const app = new UnsplashApp();
      app.init();

      // Expose to window for manual refresh if needed
      window.unsplashApp = app;
    });
  } else {
    const app = new UnsplashApp();
    app.init();

    // Expose to window for manual refresh if needed
    window.unsplashApp = app;
  }

})();
