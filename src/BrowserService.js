/**
 * BrowserService - Playwright-based Battle.net Browser Automation
 *
 * Handles headless browser automation for Battle.net parent portal interactions:
 * - Token-based authentication
 * - Child account management
 * - Schedule updates (enable/disable gaming)
 * - Session management
 */

const { chromium } = require('playwright');

class BrowserService {
  constructor(options = {}) {
    this.browser = null;
    this.context = null;
    this.page = null;

    this.options = {
      headless: options.headless !== false, // Default to headless
      timeout: options.timeout || 30000,
      baseUrl: 'https://account.blizzard.com',
      ...options
    };
  }

  /**
   * Initialize browser and create context
   */
  async init() {
    if (this.browser) {
      return; // Already initialized
    }

    console.log('Initializing Playwright browser...');

    this.browser = await chromium.launch({
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 }
    });

    this.page = await this.context.newPage();

    console.log('Browser initialized successfully');
  }

  /**
   * Navigate to parent portal with XSRF token
   * @param {string} xsrfToken - XSRF token for authentication
   * @param {string} childId - Child account ID (optional)
   */
  async navigateToPortal(xsrfToken, childId = null) {
    await this.init();

    // Set XSRF token cookie
    await this.context.addCookies([{
      name: 'XSRF-TOKEN',
      value: xsrfToken,
      domain: '.blizzard.com',
      path: '/',
      secure: true,
      httpOnly: false,
      sameSite: 'Strict'
    }]);

    // Navigate to portal
    const url = childId
      ? `${this.options.baseUrl}/parent-portal/parental-controls/${childId}`
      : `${this.options.baseUrl}/parent-portal/access`;

    console.log(`Navigating to: ${url}`);
    await this.page.goto(url, {
      waitUntil: 'networkidle',
      timeout: this.options.timeout
    });

    return this.page;
  }

  /**
   * Get list of child accounts
   * @param {string} xsrfToken - XSRF token
   * @param {string} parentEmail - Parent email address
   */
  async getChildren(xsrfToken, parentEmail) {
    await this.init();

    // Set cookies
    await this.context.addCookies([{
      name: 'XSRF-TOKEN',
      value: xsrfToken,
      domain: '.blizzard.com',
      path: '/',
      secure: true,
      httpOnly: false,
      sameSite: 'Strict'
    }]);

    // Make API call to get children
    const response = await this.page.evaluate(async ({ baseUrl, parentEmail, xsrfToken }) => {
      const res = await fetch(`${baseUrl}/api/parental-controls/children?parentEmail=${encodeURIComponent(parentEmail)}`, {
        headers: {
          'X-XSRF-TOKEN': xsrfToken,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch children: ${res.status}`);
      }

      return await res.json();
    }, {
      baseUrl: this.options.baseUrl,
      parentEmail,
      xsrfToken
    });

    return response;
  }

  /**
   * Update child's gaming schedule
   * @param {string} xsrfToken - XSRF token
   * @param {string} childId - Child account ID
   * @param {Object} schedule - Schedule configuration
   */
  async updateSchedule(xsrfToken, childId, schedule) {
    await this.init();

    // Set cookies
    await this.context.addCookies([{
      name: 'XSRF-TOKEN',
      value: xsrfToken,
      domain: '.blizzard.com',
      path: '/',
      secure: true,
      httpOnly: false,
      sameSite: 'Strict'
    }]);

    // Navigate to portal to establish session
    await this.navigateToPortal(xsrfToken, childId);

    // Submit schedule update
    const response = await this.page.evaluate(async ({ baseUrl, childId, schedule, xsrfToken }) => {
      const res = await fetch(`${baseUrl}/api/parental-controls/schedule`, {
        method: 'POST',
        headers: {
          'X-XSRF-TOKEN': xsrfToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountId: parseInt(childId),
          enabled: schedule.enabled,
          timeZone: schedule.timeZone || 'Etc/UTC+0',
          monday: schedule.monday || 0,
          tuesday: schedule.tuesday || 0,
          wednesday: schedule.wednesday || 0,
          thursday: schedule.thursday || 0,
          friday: schedule.friday || 0,
          saturday: schedule.saturday || 0,
          sunday: schedule.sunday || 0
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to update schedule: ${res.status} - ${errorText}`);
      }

      return { success: true, status: res.status };
    }, {
      baseUrl: this.options.baseUrl,
      childId,
      schedule,
      xsrfToken
    });

    return response;
  }

  /**
   * Enable gaming for child (set unlimited schedule)
   * @param {string} xsrfToken - XSRF token
   * @param {string} childId - Child account ID
   */
  async enableGaming(xsrfToken, childId) {
    // All time blocks set to max value (unrestricted)
    const MAX_TIME_BLOCK = 281474976710655; // 2^48 - 1 (all time slots enabled)

    return await this.updateSchedule(xsrfToken, childId, {
      enabled: false, // Disabled schedule = unrestricted
      monday: MAX_TIME_BLOCK,
      tuesday: MAX_TIME_BLOCK,
      wednesday: MAX_TIME_BLOCK,
      thursday: MAX_TIME_BLOCK,
      friday: MAX_TIME_BLOCK,
      saturday: MAX_TIME_BLOCK,
      sunday: MAX_TIME_BLOCK
    });
  }

  /**
   * Disable gaming for child (block all times)
   * @param {string} xsrfToken - XSRF token
   * @param {string} childId - Child account ID
   */
  async disableGaming(xsrfToken, childId) {
    // All time blocks set to 0 (no access)
    return await this.updateSchedule(xsrfToken, childId, {
      enabled: true, // Enabled schedule with all blocks = 0 means no access
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0
    });
  }

  /**
   * Take screenshot (for debugging)
   * @param {string} path - Path to save screenshot
   */
  async screenshot(path) {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    await this.page.screenshot({ path, fullPage: true });
    console.log(`Screenshot saved to: ${path}`);
  }

  /**
   * Get page HTML (for debugging)
   */
  async getPageContent() {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    return await this.page.content();
  }

  /**
   * Close browser and clean up
   */
  async close() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }

    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    console.log('Browser closed');
  }

  /**
   * Check if browser is initialized
   */
  isInitialized() {
    return this.browser !== null && this.page !== null;
  }
}

module.exports = BrowserService;
