/**
 * GoDrive.academy - Instance Configuration Loader
 * Loads configuration from instance config and applies to template
 */

class GoDriveInstanceLoader {
  constructor() {
    this.config = null;
    this.instancePath = this.detectInstancePath();
  }

  /**
   * Detect which instance configuration to load
   */
  detectInstancePath() {
    // Check for instance parameter in URL
    const params = new URLSearchParams(window.location.search);
    const instance = params.get('instance');
    
    if (instance) {
      return `../../instances/${instance}/instance.config.json`;
    }
    
    // Default to reading from meta tag if set during build
    const meta = document.querySelector('meta[name="godrive-instance"]');
    if (meta) {
      return `../../instances/${meta.content}/instance.config.json`;
    }
    
    // Fallback to firststep
    return '../../instances/firststep/instance.config.json';
  }

  /**
   * Initialize and load configuration
   */
  async init() {
    try {
      await this.loadConfig();
      this.applyConfiguration();
      console.log('✅ GoDrive Instance Loaded:', this.config.schoolName);
      console.log('📍 Instance ID:', this.config._instanceId);
    } catch (error) {
      console.error('❌ Failed to load instance configuration:', error);
      this.loadDefaults();
    }
  }

  /**
   * Load configuration from instance config
   */
  async loadConfig() {
    const response = await fetch(this.instancePath);
    if (!response.ok) {
      throw new Error(`Failed to load instance config: ${response.status}`);
    }
    this.config = await response.json();
  }

  /**
   * Load default configuration if instance config fails
   */
  loadDefaults() {
    console.warn('⚠️ Loading default configuration');
    this.config = {
      schoolName: "Driving School",
      tagline: "Learn to Drive with Confidence",
      _instanceId: "default"
    };
    this.applyConfiguration();
  }

  /**
   * Apply all configuration settings
   */
  applyConfiguration() {
    this.applyColors();
    this.applyBranding();
    this.applyMeta();
    this.applyHero();
    this.applyContact();
    this.applyFeatures();
    this.applyLocations();
  }

  /**
   * Apply color scheme to CSS variables
   */
  applyColors() {
    if (!this.config.colors) return;

    const root = document.documentElement;
    const colors = this.config.colors;

    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-dark', colors.primaryDark);
    root.style.setProperty('--primary-light', colors.primaryLight);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-hover', colors.accentHover);
    
    if (colors.success) {
      root.style.setProperty('--success', colors.success);
    }
  }

  /**
   * Apply branding (logo, business name)
   */
  applyBranding() {
    const { schoolName, logo, favicon } = this.config;
    
    // Update logo images
    const logoImgs = document.querySelectorAll('.logo img, [data-logo]');
    logoImgs.forEach(img => {
      if (logo) img.src = logo;
      img.alt = schoolName;
    });

    // Update business name text
    const businessNames = document.querySelectorAll('.logo-text, [data-business-name]');
    businessNames.forEach(el => {
      el.textContent = schoolName;
    });

    // Replace all "First Step" text occurrences
    this.replaceText('First Step Driving Academy', schoolName);
    this.replaceText('First Step Driving', schoolName);
    this.replaceText('First Step', schoolName.split(' ')[0] + ' ' + schoolName.split(' ')[1]);

    // Update favicon
    if (favicon) {
      let faviconLink = document.querySelector('link[rel="icon"]');
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = favicon;
    }
  }

  /**
   * Replace text in DOM
   */
  replaceText(oldText, newText) {
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, strong, em');
    elements.forEach(el => {
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
        if (el.textContent.includes(oldText)) {
          el.textContent = el.textContent.replace(new RegExp(oldText, 'g'), newText);
        }
      }
    });
  }

  /**
   * Apply meta tags for SEO
   */
  applyMeta() {
    const { meta, schoolName, tagline } = this.config;
    if (!meta) return;

    // Update title
    if (meta.title) {
      document.title = meta.title;
    } else {
      document.title = `${schoolName} | ${tagline}`;
    }

    // Update meta tags
    this.updateMetaTag('name', 'description', meta.description);
    this.updateMetaTag('name', 'keywords', meta.keywords);
    this.updateMetaTag('property', 'og:title', meta.title || document.title);
    this.updateMetaTag('property', 'og:description', meta.description);
  }

  /**
   * Update or create meta tag
   */
  updateMetaTag(attribute, name, content) {
    if (!content) return;

    let tag = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attribute, name);
      document.head.appendChild(tag);
    }
    tag.content = content;
  }

  /**
   * Apply hero section content
   */
  applyHero() {
    const { hero } = this.config;
    if (!hero) return;

    // Hero badge
    if (hero.badge) {
      const badges = document.querySelectorAll('.hero-badge, [data-hero-badge]');
      badges.forEach(badge => badge.textContent = hero.badge);
    }

    // Hero headline
    if (hero.headline) {
      const headlines = document.querySelectorAll('.hero h1, [data-hero-headline]');
      headlines.forEach(h => h.textContent = hero.headline);
    }

    // Hero subheadline
    if (hero.subheadline) {
      const subs = document.querySelectorAll('.hero > .container > .hero-content > p, [data-hero-subheadline]');
      subs.forEach(p => p.textContent = hero.subheadline);
    }

    // CTAs
    if (hero.ctaPrimaryText) {
      const btns = document.querySelectorAll('.hero .btn-primary, [data-hero-cta-primary]');
      btns.forEach(btn => btn.textContent = hero.ctaPrimaryText);
    }

    if (hero.ctaSecondaryText) {
      const btns = document.querySelectorAll('.hero .btn-white, [data-hero-cta-secondary]');
      btns.forEach(btn => btn.textContent = hero.ctaSecondaryText);
    }

    // Stats
    if (hero.stats && hero.stats.length > 0) {
      const stats = document.querySelectorAll('.hero-stats .stat');
      hero.stats.forEach((stat, index) => {
        if (stats[index]) {
          const number = stats[index].querySelector('.stat-number');
          const label = stats[index].querySelector('.stat-label');
          if (number) number.textContent = stat.number;
          if (label) label.textContent = stat.label;
        }
      });
    }
  }

  /**
   * Apply contact information
   */
  applyContact() {
    const { phone, email, address, city, state, zip } = this.config;
    
    // Phone numbers
    if (phone) {
      document.querySelectorAll('a[href^="tel:"], [data-phone]').forEach(el => {
        if (el.tagName === 'A') {
          el.href = `tel:${phone.replace(/\D/g, '')}`;
          el.textContent = phone;
        } else {
          el.textContent = phone;
        }
      });

      // Replace hardcoded phone numbers
      this.replaceText('(555) 123-4567', phone);
      this.replaceText('(555) 234-5678', phone);
      this.replaceText('(555) 345-6789', phone);
    }

    // Email
    if (email) {
      document.querySelectorAll('a[href^="mailto:"], [data-email]').forEach(el => {
        if (el.tagName === 'A') {
          el.href = `mailto:${email}`;
          el.textContent = email;
        } else {
          el.textContent = email;
        }
      });
    }

    // Address
    const fullAddress = `${address}, ${city}, ${state} ${zip}`;
    document.querySelectorAll('[data-address]').forEach(el => {
      el.textContent = fullAddress;
    });
  }

  /**
   * Apply feature configurations
   */
  applyFeatures() {
    const { features } = this.config;
    if (!features) return;

    // Practice tests
    if (features.practiceTests) {
      const pt = features.practiceTests;
      
      if (!pt.enabled) {
        const section = document.querySelector('.practice-cta');
        if (section) section.style.display = 'none';
        return;
      }

      if (pt.badge) {
        document.querySelectorAll('.practice-cta-badge').forEach(el => {
          el.textContent = pt.badge;
        });
      }

      if (pt.title) {
        document.querySelectorAll('.practice-cta h2').forEach(el => {
          el.textContent = pt.title;
        });
      }

      if (pt.description) {
        document.querySelectorAll('.practice-cta-content > p').forEach(el => {
          el.innerHTML = pt.description;
        });
      }
    }

    // Courses
    if (features.courses && features.courses.length > 0) {
      const courseCards = document.querySelectorAll('.service-card');
      features.courses.forEach((course, index) => {
        if (courseCards[index]) {
          const icon = courseCards[index].querySelector('.service-icon');
          const title = courseCards[index].querySelector('h3');
          const desc = courseCards[index].querySelector('p');

          if (icon) icon.textContent = course.icon;
          if (title) title.textContent = course.title;
          if (desc) desc.textContent = course.description;
        }
      });
    }
  }

  /**
   * Apply locations
   */
  applyLocations() {
    const { locations } = this.config;
    if (!locations || locations.length === 0) return;

    const locationCards = document.querySelectorAll('.location');
    locations.forEach((location, index) => {
      if (locationCards[index]) {
        const name = locationCards[index].querySelector('h3');
        const address = locationCards[index].querySelector('p');
        const phone = locationCards[index].querySelector('span');

        if (name) name.textContent = location.name;
        if (address) address.textContent = location.address;
        if (phone) phone.textContent = location.phone;
      }
    });
  }

  /**
   * Get configuration value by path
   */
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }
}

// Global instance
window.goDriveInstance = new GoDriveInstanceLoader();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.goDriveInstance.init());
} else {
  window.goDriveInstance.init();
}
