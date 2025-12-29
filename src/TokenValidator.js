/**
 * TokenValidator - Battle.net XSRF Token Extraction and Validation
 *
 * Handles extraction of Battle.net parent portal XSRF tokens from various input formats:
 * - Full URL: https://account.blizzard.com/parent-portal/parental-controls/12345?xsrfToken=G0ABCD...
 * - Partial URL: parent-portal/parental-controls/12345?xsrfToken=G0ABCD...
 * - Token only: G0ABCD1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890AB
 *
 * Token Format: G0 + 64 hexadecimal characters (uppercase)
 * Example: G0A1B2C3D4E5F6789012345678901234567890123456789012345678901234567890
 */

class TokenValidator {
  constructor() {
    // XSRF Token pattern: G0 followed by 64 hex characters (case-insensitive)
    this.tokenRegex = /G0[A-F0-9]{64}/i;

    // URL patterns for Battle.net parent portal
    this.urlPatterns = {
      full: /https?:\/\/account\.blizzard\.com\/parent-portal\/parental-controls\/\d+\?.*xsrfToken=([^&]+)/i,
      partial: /parent-portal\/parental-controls\/\d+\?.*xsrfToken=([^&]+)/i,
      query: /xsrfToken=([^&]+)/i
    };
  }

  /**
   * Extract token from various input formats
   * @param {string} input - User input (URL, partial URL, or token)
   * @returns {Object} { success: boolean, token: string|null, error: string|null }
   */
  extractToken(input) {
    if (!input || typeof input !== 'string') {
      return {
        success: false,
        token: null,
        error: 'Input is required and must be a string'
      };
    }

    const trimmedInput = input.trim();

    // Try extracting from full URL
    const fullUrlMatch = trimmedInput.match(this.urlPatterns.full);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return this.validateToken(fullUrlMatch[1]);
    }

    // Try extracting from partial URL
    const partialUrlMatch = trimmedInput.match(this.urlPatterns.partial);
    if (partialUrlMatch && partialUrlMatch[1]) {
      return this.validateToken(partialUrlMatch[1]);
    }

    // Try extracting from query string
    const queryMatch = trimmedInput.match(this.urlPatterns.query);
    if (queryMatch && queryMatch[1]) {
      return this.validateToken(queryMatch[1]);
    }

    // Try direct token validation (token only)
    if (this.tokenRegex.test(trimmedInput)) {
      return this.validateToken(trimmedInput);
    }

    // No valid token found
    return {
      success: false,
      token: null,
      error: 'Invalid token format. Expected G0 followed by 64 hexadecimal characters, or a valid Battle.net parent portal URL.'
    };
  }

  /**
   * Validate token format
   * @param {string} token - Token to validate
   * @returns {Object} { success: boolean, token: string|null, error: string|null }
   */
  validateToken(token) {
    const trimmedToken = token.trim();
    const match = trimmedToken.match(this.tokenRegex);

    if (match) {
      return {
        success: true,
        token: match[0].toUpperCase(), // Normalize to uppercase
        error: null,
        metadata: {
          length: match[0].length,
          prefix: 'G0',
          format: 'valid'
        }
      };
    }

    return {
      success: false,
      token: null,
      error: `Invalid token format. Token must be G0 followed by 64 hexadecimal characters. Found: ${trimmedToken.substring(0, 20)}...`
    };
  }

  /**
   * Extract child account ID from URL
   * @param {string} url - Battle.net parent portal URL
   * @returns {Object} { success: boolean, childId: string|null, error: string|null }
   */
  extractChildId(url) {
    if (!url || typeof url !== 'string') {
      return {
        success: false,
        childId: null,
        error: 'URL is required'
      };
    }

    // Extract child account ID from URL pattern
    // Example: https://account.blizzard.com/parent-portal/parental-controls/12345?xsrfToken=...
    const childIdPattern = /parent-portal\/parental-controls\/(\d+)/i;
    const match = url.match(childIdPattern);

    if (match && match[1]) {
      return {
        success: true,
        childId: match[1],
        error: null
      };
    }

    return {
      success: false,
      childId: null,
      error: 'Could not extract child account ID from URL'
    };
  }

  /**
   * Parse complete portal URL
   * @param {string} url - Full Battle.net parent portal URL
   * @returns {Object} { success: boolean, token: string, childId: string, error: string|null }
   */
  parsePortalUrl(url) {
    const tokenResult = this.extractToken(url);
    const childIdResult = this.extractChildId(url);

    if (!tokenResult.success || !childIdResult.success) {
      return {
        success: false,
        token: null,
        childId: null,
        error: tokenResult.error || childIdResult.error
      };
    }

    return {
      success: true,
      token: tokenResult.token,
      childId: childIdResult.childId,
      error: null,
      metadata: {
        ...tokenResult.metadata,
        childAccountId: childIdResult.childId
      }
    };
  }

  /**
   * Validate and normalize input for Battle.net portal access
   * @param {string} input - User input (URL or token)
   * @returns {Object} Parsed and validated result
   */
  validateInput(input) {
    // Try parsing as full URL first
    const urlResult = this.parsePortalUrl(input);
    if (urlResult.success) {
      return {
        success: true,
        type: 'full_url',
        token: urlResult.token,
        childId: urlResult.childId,
        error: null
      };
    }

    // Try extracting token only
    const tokenResult = this.extractToken(input);
    if (tokenResult.success) {
      return {
        success: true,
        type: 'token_only',
        token: tokenResult.token,
        childId: null,
        error: null,
        warning: 'Child account ID not provided. You will need to select a child account manually.'
      };
    }

    // Invalid input
    return {
      success: false,
      type: 'invalid',
      token: null,
      childId: null,
      error: 'Invalid input. Please provide either:\n' +
              '1. Full URL from Battle.net parent portal\n' +
              '2. XSRF token (G0 + 64 hex characters)\n' +
              '3. Partial URL containing xsrfToken parameter'
    };
  }
}

module.exports = TokenValidator;
