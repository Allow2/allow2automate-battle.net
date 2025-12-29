/**
 * ParentPortalClient - Battle.net Parent Portal Integration
 *
 * High-level client for managing Battle.net parental controls via the parent portal.
 * Combines BrowserService and TokenValidator for complete portal management.
 */

const BrowserService = require('./BrowserService');
const TokenValidator = require('./TokenValidator');

class ParentPortalClient {
  constructor(options = {}) {
    this.browserService = new BrowserService(options);
    this.tokenValidator = new TokenValidator();

    this.state = {
      authenticated: false,
      token: null,
      childId: null,
      children: [],
      lastSync: null
    };

    this.options = options;
  }

  /**
   * Authenticate with token (from URL or direct token)
   * @param {string} input - Token or URL containing token
   * @param {string} parentEmail - Parent email (optional, for fetching children)
   */
  async authenticate(input, parentEmail = null) {
    console.log('Authenticating with Battle.net parent portal...');

    // Validate and extract token
    const validation = this.tokenValidator.validateInput(input);

    if (!validation.success) {
      throw new Error(`Authentication failed: ${validation.error}`);
    }

    // Store token and child ID
    this.state.token = validation.token;
    this.state.childId = validation.childId;
    this.state.authenticated = true;

    console.log('Token validated successfully');

    // If parent email provided, fetch children
    if (parentEmail) {
      try {
        this.state.children = await this.getChildren(parentEmail);
        console.log(`Found ${this.state.children.length} child accounts`);
      } catch (error) {
        console.warn('Failed to fetch children:', error.message);
        // Non-fatal - can still use childId from URL
      }
    }

    return {
      success: true,
      token: this.state.token,
      childId: this.state.childId,
      childrenCount: this.state.children.length
    };
  }

  /**
   * Get list of child accounts
   * @param {string} parentEmail - Parent email address
   */
  async getChildren(parentEmail) {
    this.ensureAuthenticated();

    const children = await this.browserService.getChildren(
      this.state.token,
      parentEmail
    );

    this.state.children = children;
    this.state.lastSync = Date.now();

    return children;
  }

  /**
   * Enable gaming for a child
   * @param {string} childId - Child account ID (optional if set during auth)
   */
  async enableGaming(childId = null) {
    this.ensureAuthenticated();

    const targetChildId = childId || this.state.childId;
    if (!targetChildId) {
      throw new Error('Child ID is required. Provide childId parameter or authenticate with a URL containing child ID.');
    }

    console.log(`Enabling gaming for child ${targetChildId}...`);

    const result = await this.browserService.enableGaming(
      this.state.token,
      targetChildId
    );

    console.log('Gaming enabled successfully');

    return {
      success: true,
      childId: targetChildId,
      action: 'enable',
      timestamp: Date.now()
    };
  }

  /**
   * Disable gaming for a child
   * @param {string} childId - Child account ID (optional if set during auth)
   */
  async disableGaming(childId = null) {
    this.ensureAuthenticated();

    const targetChildId = childId || this.state.childId;
    if (!targetChildId) {
      throw new Error('Child ID is required. Provide childId parameter or authenticate with a URL containing child ID.');
    }

    console.log(`Disabling gaming for child ${targetChildId}...`);

    const result = await this.browserService.disableGaming(
      this.state.token,
      targetChildId
    );

    console.log('Gaming disabled successfully');

    return {
      success: true,
      childId: targetChildId,
      action: 'disable',
      timestamp: Date.now()
    };
  }

  /**
   * Update custom schedule for a child
   * @param {string} childId - Child account ID
   * @param {Object} schedule - Schedule configuration
   */
  async updateSchedule(childId, schedule) {
    this.ensureAuthenticated();

    console.log(`Updating schedule for child ${childId}...`);

    const result = await this.browserService.updateSchedule(
      this.state.token,
      childId,
      schedule
    );

    console.log('Schedule updated successfully');

    return {
      success: true,
      childId,
      schedule,
      timestamp: Date.now()
    };
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated() {
    return this.state.authenticated && this.state.token !== null;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      ...this.state,
      token: this.state.token ? '***REDACTED***' : null // Don't expose token
    };
  }

  /**
   * Validate token format without authenticating
   * @param {string} input - Token or URL to validate
   */
  validateToken(input) {
    return this.tokenValidator.validateInput(input);
  }

  /**
   * Extract token from URL
   * @param {string} url - Battle.net parent portal URL
   */
  extractToken(url) {
    return this.tokenValidator.extractToken(url);
  }

  /**
   * Close browser and cleanup
   */
  async close() {
    await this.browserService.close();

    this.state = {
      authenticated: false,
      token: null,
      childId: null,
      children: [],
      lastSync: null
    };

    console.log('Portal client closed');
  }

  /**
   * Ensure authenticated before operations
   * @private
   */
  ensureAuthenticated() {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated. Call authenticate() first with a valid token or URL.');
    }
  }

  /**
   * Debug: Take screenshot
   * @param {string} path - Path to save screenshot
   */
  async screenshot(path) {
    return await this.browserService.screenshot(path);
  }

  /**
   * Debug: Get page content
   */
  async getPageContent() {
    return await this.browserService.getPageContent();
  }
}

module.exports = ParentPortalClient;
