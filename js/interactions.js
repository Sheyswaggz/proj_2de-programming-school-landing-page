/**
 * interactions.js
 * Contact Form Handling with Validation, Submission States, and Spam Protection
 * Accessible form validation with custom error messages and ARIA announcements
 *
 * @generated-from: task-id:69d2c8d4-cf1a-4256-b40a-127757d09081
 * @modifies: index.html
 * @dependencies: []
 */

(function() {
  'use strict';

  // Form configuration
  const CONFIG = {
    validation: {
      debounceDelay: 500,
      showErrorsOnBlur: true,
      showErrorsOnSubmit: true
    },
    submission: {
      timeout: 10000,
      simulateDelay: 1500
    },
    messages: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      phone: 'Please enter a valid phone number',
      minLength: 'Please enter at least {min} characters',
      maxLength: 'Please enter no more than {max} characters',
      generic: 'Please check this field',
      success: 'Thank you! Your message has been sent successfully.',
      error: 'Sorry, something went wrong. Please try again.',
      submitting: 'Sending your message...'
    }
  };

  /**
   * Form Validator
   * Handles HTML5 validation with custom error messages
   */
  class FormValidator {
    constructor(form) {
      this.form = form;
      this.fields = new Map();
      this.errors = new Map();
    }

    init() {
      // Find all form fields that need validation
      const inputs = this.form.querySelectorAll('input, textarea, select');

      inputs.forEach(input => {
        this.fields.set(input, {
          isValid: true,
          errorMessage: '',
          touched: false
        });

        // Add event listeners
        this.addFieldListeners(input);
      });

      // Prevent default form submission
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    addFieldListeners(input) {
      // Validate on blur if enabled
      if (CONFIG.validation.showErrorsOnBlur) {
        input.addEventListener('blur', () => {
          const state = this.fields.get(input);
          state.touched = true;
          this.validateField(input, true);
        });
      }

      // Clear error on input
      input.addEventListener('input', () => {
        const state = this.fields.get(input);
        if (state.touched) {
          this.validateField(input, false);
        }
      });
    }

    validateField(input, showError = true) {
      const state = this.fields.get(input);

      // Clear previous error
      this.clearFieldError(input);

      // Check validity
      if (!input.validity.valid) {
        state.isValid = false;
        state.errorMessage = this.getErrorMessage(input);

        if (showError) {
          this.showFieldError(input, state.errorMessage);
        }

        return false;
      }

      // Custom validation rules
      if (input.type === 'email' && input.value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(input.value)) {
          state.isValid = false;
          state.errorMessage = CONFIG.messages.email;

          if (showError) {
            this.showFieldError(input, state.errorMessage);
          }

          return false;
        }
      }

      if (input.type === 'tel' && input.value) {
        const phonePattern = /^[\d\s\-\+\(\)]+$/;
        if (!phonePattern.test(input.value) || input.value.replace(/\D/g, '').length < 10) {
          state.isValid = false;
          state.errorMessage = CONFIG.messages.phone;

          if (showError) {
            this.showFieldError(input, state.errorMessage);
          }

          return false;
        }
      }

      // Field is valid
      state.isValid = true;
      state.errorMessage = '';
      this.showFieldSuccess(input);

      return true;
    }

    getErrorMessage(input) {
      const validity = input.validity;

      if (validity.valueMissing) {
        return CONFIG.messages.required;
      }

      if (validity.typeMismatch) {
        if (input.type === 'email') {
          return CONFIG.messages.email;
        }
        if (input.type === 'tel') {
          return CONFIG.messages.phone;
        }
      }

      if (validity.tooShort) {
        return CONFIG.messages.minLength.replace('{min}', input.minLength);
      }

      if (validity.tooLong) {
        return CONFIG.messages.maxLength.replace('{max}', input.maxLength);
      }

      if (validity.patternMismatch) {
        return input.getAttribute('title') || CONFIG.messages.generic;
      }

      return CONFIG.messages.generic;
    }

    showFieldError(input, message) {
      // Mark input as invalid
      input.setAttribute('aria-invalid', 'true');
      input.classList.add('input-error');
      input.classList.remove('input-success');

      // Create or update error message element
      let errorElement = this.getErrorElement(input);

      if (!errorElement) {
        errorElement = this.createErrorElement(input, message);
      } else {
        errorElement.textContent = message;
      }

      // Announce error to screen readers
      this.announceError(message);
    }

    showFieldSuccess(input) {
      // Mark input as valid
      input.setAttribute('aria-invalid', 'false');
      input.classList.remove('input-error');

      // Only show success state if field has been touched and has value
      const state = this.fields.get(input);
      if (state.touched && input.value) {
        input.classList.add('input-success');
      }
    }

    clearFieldError(input) {
      input.removeAttribute('aria-invalid');
      input.classList.remove('input-error', 'input-success');

      const errorElement = this.getErrorElement(input);
      if (errorElement) {
        errorElement.remove();
      }
    }

    getErrorElement(input) {
      const errorId = `${input.id}-error`;
      return document.getElementById(errorId);
    }

    createErrorElement(input, message) {
      const errorElement = document.createElement('div');
      const errorId = `${input.id}-error`;

      errorElement.id = errorId;
      errorElement.className = 'form-error';
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
      errorElement.textContent = message;

      // Link error to input
      input.setAttribute('aria-describedby', errorId);

      // Insert after input or parent form-group
      const formGroup = input.closest('.form-group');
      if (formGroup) {
        formGroup.appendChild(errorElement);
      } else {
        input.parentNode.insertBefore(errorElement, input.nextSibling);
      }

      return errorElement;
    }

    validateAll() {
      let isFormValid = true;

      this.fields.forEach((state, input) => {
        state.touched = true;
        const isFieldValid = this.validateField(input, CONFIG.validation.showErrorsOnSubmit);

        if (!isFieldValid) {
          isFormValid = false;
        }
      });

      return isFormValid;
    }

    handleSubmit() {
      // Validate all fields
      const isValid = this.validateAll();

      if (!isValid) {
        // Focus first invalid field
        this.focusFirstError();
        this.announceError('Please fix the errors in the form');
        return;
      }

      // Trigger form submission event
      const submitEvent = new CustomEvent('form:submit', {
        detail: {
          form: this.form,
          data: this.getFormData()
        }
      });

      document.dispatchEvent(submitEvent);
    }

    getFormData() {
      const formData = new FormData(this.form);
      const data = {};

      formData.forEach((value, key) => {
        data[key] = value;
      });

      return data;
    }

    focusFirstError() {
      for (const [input, state] of this.fields) {
        if (!state.isValid) {
          input.focus();
          break;
        }
      }
    }

    announceError(message) {
      this.announce(message, 'assertive');
    }

    announceSuccess(message) {
      this.announce(message, 'polite');
    }

    announce(message, priority = 'polite') {
      // Create or update announcement region
      let announcer = document.getElementById('form-announcer');

      if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'form-announcer';
        announcer.className = 'sr-only';
        announcer.setAttribute('role', 'status');
        announcer.setAttribute('aria-live', priority);
        announcer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(announcer);
      } else {
        announcer.setAttribute('aria-live', priority);
      }

      // Clear and set new message
      announcer.textContent = '';

      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
    }

    reset() {
      this.form.reset();

      this.fields.forEach((state, input) => {
        state.isValid = true;
        state.errorMessage = '';
        state.touched = false;
        this.clearFieldError(input);
      });
    }
  }

  /**
   * Form Submission Handler
   * Manages form submission with loading/success/error states
   */
  class FormSubmissionHandler {
    constructor(form, validator) {
      this.form = form;
      this.validator = validator;
      this.submitButton = null;
      this.isSubmitting = false;
      this.originalButtonText = '';
    }

    init() {
      this.submitButton = this.form.querySelector('button[type="submit"]');

      if (this.submitButton) {
        this.originalButtonText = this.submitButton.textContent;
      }

      // Listen for form submission
      document.addEventListener('form:submit', (e) => {
        if (e.detail.form === this.form) {
          this.handleSubmission(e.detail.data);
        }
      });
    }

    async handleSubmission(data) {
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;
      this.setLoadingState();

      try {
        // Simulate API call (replace with actual API endpoint)
        const response = await this.submitToServer(data);

        if (response.success) {
          this.setSuccessState();
          this.validator.announceSuccess(CONFIG.messages.success);

          // Reset form after delay
          setTimeout(() => {
            this.validator.reset();
            this.resetButtonState();
          }, 3000);
        } else {
          throw new Error(response.message || 'Submission failed');
        }
      } catch (error) {
        this.setErrorState();
        this.validator.announceError(CONFIG.messages.error);

        // Reset button after delay
        setTimeout(() => {
          this.resetButtonState();
        }, 3000);

        console.error('Form submission error:', error);
      } finally {
        this.isSubmitting = false;
      }
    }

    async submitToServer(data) {
      // Simulate server request
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate successful submission
          resolve({
            success: true,
            message: 'Form submitted successfully'
          });
        }, CONFIG.submission.simulateDelay);
      });

      // In production, replace with actual API call:
      // const response = await fetch(this.form.action, {
      //   method: this.form.method || 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(data),
      //   signal: AbortSignal.timeout(CONFIG.submission.timeout)
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Network response was not ok');
      // }
      //
      // return await response.json();
    }

    setLoadingState() {
      if (!this.submitButton) {
        return;
      }

      this.submitButton.disabled = true;
      this.submitButton.setAttribute('aria-busy', 'true');
      this.submitButton.classList.add('btn-loading');

      // Create spinner
      const spinner = this.createSpinner();
      const text = document.createElement('span');
      text.textContent = CONFIG.messages.submitting;

      this.submitButton.innerHTML = '';
      this.submitButton.appendChild(spinner);
      this.submitButton.appendChild(text);
    }

    setSuccessState() {
      if (!this.submitButton) {
        return;
      }

      this.submitButton.disabled = false;
      this.submitButton.setAttribute('aria-busy', 'false');
      this.submitButton.classList.remove('btn-loading');
      this.submitButton.classList.add('btn-success');

      // Create checkmark
      const checkmark = this.createCheckmark();
      const text = document.createElement('span');
      text.textContent = 'Sent!';

      this.submitButton.innerHTML = '';
      this.submitButton.appendChild(checkmark);
      this.submitButton.appendChild(text);
    }

    setErrorState() {
      if (!this.submitButton) {
        return;
      }

      this.submitButton.disabled = false;
      this.submitButton.setAttribute('aria-busy', 'false');
      this.submitButton.classList.remove('btn-loading');
      this.submitButton.classList.add('btn-error');

      const text = document.createElement('span');
      text.textContent = 'Try Again';

      this.submitButton.innerHTML = '';
      this.submitButton.appendChild(text);
    }

    resetButtonState() {
      if (!this.submitButton) {
        return;
      }

      this.submitButton.disabled = false;
      this.submitButton.removeAttribute('aria-busy');
      this.submitButton.classList.remove('btn-loading', 'btn-success', 'btn-error');
      this.submitButton.textContent = this.originalButtonText;
      this.isSubmitting = false;
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
   * Honeypot Spam Protection
   * Implements basic spam protection using honeypot technique
   */
  class HoneypotProtection {
    constructor(form) {
      this.form = form;
      this.honeypotField = null;
    }

    init() {
      // Create honeypot field
      this.honeypotField = this.createHoneypotField();
      this.form.appendChild(this.honeypotField);

      // Check honeypot before submission
      document.addEventListener('form:submit', (e) => {
        if (e.detail.form === this.form) {
          if (!this.validateHoneypot()) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.warn('Spam detected: honeypot field was filled');
          }
        }
      }, true);
    }

    createHoneypotField() {
      const field = document.createElement('input');
      field.type = 'text';
      field.name = 'website'; // Common bot target field name
      field.setAttribute('tabindex', '-1');
      field.setAttribute('autocomplete', 'off');
      field.setAttribute('aria-hidden', 'true');

      // Hide with CSS that bots might not respect
      field.style.cssText = `
        position: absolute;
        left: -9999px;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
      `;

      return field;
    }

    validateHoneypot() {
      // If honeypot field is filled, it's likely a bot
      return !this.honeypotField.value;
    }
  }

  /**
   * Form Accessibility Enhancer
   * Improves form accessibility with ARIA attributes and keyboard navigation
   */
  class FormAccessibilityEnhancer {
    constructor(form) {
      this.form = form;
    }

    init() {
      // Ensure all inputs have labels
      this.ensureLabels();

      // Add required field indicators
      this.markRequiredFields();

      // Enhance fieldsets
      this.enhanceFieldsets();

      // Add keyboard navigation improvements
      this.enhanceKeyboardNavigation();
    }

    ensureLabels() {
      const inputs = this.form.querySelectorAll('input, textarea, select');

      inputs.forEach(input => {
        if (!input.id) {
          input.id = `field-${Math.random().toString(36).substr(2, 9)}`;
        }

        const label = this.form.querySelector(`label[for="${input.id}"]`);

        if (!label && !input.getAttribute('aria-label')) {
          console.warn(`Input ${input.id} is missing a label`);
        }
      });
    }

    markRequiredFields() {
      const requiredInputs = this.form.querySelectorAll('[required], [aria-required="true"]');

      requiredInputs.forEach(input => {
        const label = this.form.querySelector(`label[for="${input.id}"]`);

        if (label && !label.querySelector('.required-indicator')) {
          // Check if there's already a visual indicator
          const hasVisualIndicator = label.textContent.includes('*') ||
                                     label.textContent.includes('required');

          if (!hasVisualIndicator) {
            const indicator = document.createElement('span');
            indicator.className = 'required-indicator';
            indicator.setAttribute('aria-label', 'required');
            indicator.textContent = '*';
            indicator.style.color = 'var(--color-error, #dc2626)';
            label.appendChild(indicator);
          }
        }
      });
    }

    enhanceFieldsets() {
      const fieldsets = this.form.querySelectorAll('fieldset');

      fieldsets.forEach(fieldset => {
        if (!fieldset.querySelector('legend')) {
          console.warn('Fieldset is missing a legend');
        }
      });
    }

    enhanceKeyboardNavigation() {
      // Allow Enter key to submit from input fields
      const inputs = this.form.querySelectorAll('input:not([type="submit"])');

      inputs.forEach(input => {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && input.type !== 'textarea') {
            e.preventDefault();

            // Find submit button and trigger click
            const submitButton = this.form.querySelector('button[type="submit"]');
            if (submitButton) {
              submitButton.click();
            }
          }
        });
      });
    }
  }

  /**
   * Character Counter
   * Shows character count for text inputs and textareas
   */
  class CharacterCounter {
    constructor(field, maxLength) {
      this.field = field;
      this.maxLength = maxLength || field.getAttribute('maxlength');
      this.counter = null;
    }

    init() {
      if (!this.maxLength) {
        return;
      }

      this.counter = this.createCounter();
      const formGroup = this.field.closest('.form-group');

      if (formGroup) {
        formGroup.appendChild(this.counter);
      } else {
        this.field.parentNode.insertBefore(this.counter, this.field.nextSibling);
      }

      this.field.addEventListener('input', () => {
        this.updateCounter();
      });

      this.updateCounter();
    }

    createCounter() {
      const counter = document.createElement('div');
      counter.className = 'character-counter';
      counter.setAttribute('aria-live', 'polite');
      counter.setAttribute('aria-atomic', 'true');
      counter.style.cssText = `
        font-size: 0.875rem;
        color: var(--color-text-secondary, #6b7280);
        margin-top: 0.25rem;
        text-align: right;
      `;

      return counter;
    }

    updateCounter() {
      const currentLength = this.field.value.length;
      const remaining = this.maxLength - currentLength;

      this.counter.textContent = `${currentLength} / ${this.maxLength}`;

      // Change color when approaching limit
      if (remaining < 20) {
        this.counter.style.color = 'var(--color-warning, #f59e0b)';
      }

      if (remaining === 0) {
        this.counter.style.color = 'var(--color-error, #dc2626)';
      }

      if (remaining > 20) {
        this.counter.style.color = 'var(--color-text-secondary, #6b7280)';
      }
    }
  }

  /**
   * Initialize form interactions
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Find contact form
    const contactForm = document.querySelector('.contact-form form, #contact form');

    if (!contactForm) {
      console.warn('Contact form not found');
      return;
    }

    // Initialize validator
    const validator = new FormValidator(contactForm);
    validator.init();

    // Initialize submission handler
    const submissionHandler = new FormSubmissionHandler(contactForm, validator);
    submissionHandler.init();

    // Initialize honeypot protection
    const honeypot = new HoneypotProtection(contactForm);
    honeypot.init();

    // Initialize accessibility enhancements
    const accessibility = new FormAccessibilityEnhancer(contactForm);
    accessibility.init();

    // Initialize character counters for textareas
    const textareas = contactForm.querySelectorAll('textarea[maxlength]');
    textareas.forEach(textarea => {
      const counter = new CharacterCounter(textarea);
      counter.init();
    });

    // Add spinner animation styles
    addSpinnerStyles();

    // Log initialization
    console.log('Form interactions initialized', {
      form: contactForm,
      features: {
        validation: true,
        submission: true,
        spamProtection: true,
        accessibility: true,
        characterCounter: textareas.length > 0
      }
    });
  }

  /**
   * Add CSS animation for spinner
   */
  function addSpinnerStyles() {
    if (document.getElementById('form-spinner-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'form-spinner-styles';
    style.textContent = `
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .form-error {
        color: var(--color-error, #dc2626);
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .input-error {
        border-color: var(--color-error, #dc2626) !important;
      }

      .input-success {
        border-color: var(--color-success, #16a34a) !important;
      }

      .btn-loading {
        opacity: 0.8;
        cursor: not-allowed;
      }

      .btn-success {
        background-color: var(--color-success, #16a34a) !important;
        border-color: var(--color-success, #16a34a) !important;
      }

      .btn-error {
        background-color: var(--color-error, #dc2626) !important;
        border-color: var(--color-error, #dc2626) !important;
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `;

    document.head.appendChild(style);
  }

  // Start initialization
  init();

  // Export for external use if needed
  if (typeof window !== 'undefined') {
    window.FormInteractions = {
      FormValidator,
      FormSubmissionHandler,
      HoneypotProtection,
      FormAccessibilityEnhancer,
      CharacterCounter
    };
  }

})();
