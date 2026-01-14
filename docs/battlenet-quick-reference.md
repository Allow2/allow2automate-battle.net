# BrowserService Quick Reference Guide

## Quick Start

```javascript
const BrowserService = require('./services/BrowserService');

// Initialize with anti-bot protection
const browser = new BrowserService({
  headless: true,
  minDelayMs: 1500,
  maxDelayMs: 3000,
  enableAntiBot: true
});

// First time authentication
const token = 'G0abc123...';
await browser.forceReauth(token);

// Use cached session for all operations
const children = await browser.getChildren(token);
await browser.updateControls(token, childId, controls);

// Monitor session
console.log(browser.getSessionState());

// Cleanup
await browser.cleanup();
```

## Method Reference

### Core Methods

| Method | Token URL? | Cache? | Description |
|--------|-----------|--------|-------------|
| `init()` | No | - | Initialize browser (auto-called) |
| `forceReauth(token)` | Yes* | - | Authenticate with 1hr cooldown |
| `validateToken(token, force?)` | No** | - | Validate using cached session |
| `getChildren(token, refresh?)` | No** | Yes | Get children (5min cache) |
| `updateControls(token, id, opts)` | No** | - | Update controls via session |
| `testConnection()` | No | - | Test Battle.net connectivity |
| `cleanup()` | No | - | Stop keep-alive, close browser |

\* Respects 1-hour cooldown  
\** Only if session invalid

### Session Management

| Method | Returns | Description |
|--------|---------|-------------|
| `isSessionValid()` | boolean | Check if authenticated |
| `refreshSession()` | {success, error?} | Extend without token URL |
| `getSessionState()` | Object | Get full session info |
| `keepAlive()` | void | Manual keep-alive ping |
| `startKeepAlive()` | void | Start auto keep-alive |
| `stopKeepAlive()` | void | Stop auto keep-alive |

### Cache Management

| Method | Description |
|--------|-------------|
| `isCacheValid(key)` | Check if cache entry is valid |
| `getCached(key)` | Get cached data if valid |
| `setCached(key, data)` | Store data in cache |
| `clearCache(key?)` | Clear specific or all cache |

### Anti-Bot Helpers

| Method | Description |
|--------|-------------|
| `randomDelay(min, max)` | Random delay (respects config) |
| `humanClick(page, selector)` | Click with mouse movement |
| `humanType(page, selector, text)` | Type with realistic delays |
| `getRandomViewport()` | Random viewport dimensions |
| `getRandomUserAgent()` | Random UA from pool |

## Configuration Reference

```javascript
{
  // Standard Playwright options
  headless: true,              // Run in headless mode
  timeout: 30000,              // Page load timeout (ms)
  
  // Logging
  onLog: (msg) => {},          // Log handler
  onError: (msg, err) => {},   // Error handler
  
  // Anti-bot configuration
  minDelayMs: 1000,            // Minimum action delay
  maxDelayMs: 3000,            // Maximum action delay
  enableAntiBot: true,         // Enable anti-bot features
  
  // Session management
  tokenUrlCooldown: 3600000,   // Token URL cooldown (1hr)
  sessionKeepaliveInterval: 600000  // Keep-alive interval (10min)
}
```

## Common Patterns

### Pattern 1: Simple Usage
```javascript
const browser = new BrowserService({ headless: true });
await browser.forceReauth(token);
const children = await browser.getChildren(token);
await browser.cleanup();
```

### Pattern 2: Long-Running Service
```javascript
const browser = new BrowserService({
  sessionKeepaliveInterval: 300000  // 5 minutes
});

// Initial auth
await browser.forceReauth(token);

// Keep-alive runs automatically in background
// Session stays valid indefinitely

// Use as needed
const children = await browser.getChildren(token);

// Cleanup when done
await browser.cleanup();
```

### Pattern 3: Manual Session Management
```javascript
// Check before operations
if (!await browser.isSessionValid()) {
  await browser.forceReauth(token);
}

const children = await browser.getChildren(token);

// Refresh periodically
setInterval(async () => {
  await browser.refreshSession();
}, 30 * 60 * 1000);
```

### Pattern 4: Aggressive Anti-Bot
```javascript
const browser = new BrowserService({
  minDelayMs: 2000,
  maxDelayMs: 5000,
  enableAntiBot: true
});

// Even slower, more human-like behavior
await browser.forceReauth(token);
const children = await browser.getChildren(token);
```

## Cache Keys

| Key | TTL | Content |
|-----|-----|---------|
| `children` | 5 minutes | Array of child accounts |
| `status` | 30 seconds | Status information |

## Session State Object

```javascript
{
  sessionValid: boolean,          // Is session authenticated?
  lastTokenAuth: "ISO date",      // Last token URL access
  lastActivity: "ISO date",       // Last browser activity
  authAttempts: number,           // Total auth attempts
  hasCookies: boolean,            // Has cached cookies?
  currentToken: "G0abc1...",      // Current token (truncated)
  cacheStatus: {
    children: "valid|expired",    // Children cache status
    status: "valid|expired"       // Status cache status
  },
  keepAliveActive: boolean        // Is keep-alive running?
}
```

## Error Handling

```javascript
try {
  const result = await browser.forceReauth(token);
  if (!result.success) {
    console.error('Auth failed:', result.error);
    
    // Check if cooldown
    if (result.error.includes('cooldown')) {
      // Wait or use refreshSession
      await browser.refreshSession();
    }
  }
} catch (error) {
  console.error('Fatal error:', error);
  await browser.cleanup();
}
```

## Troubleshooting

### Token URL being called too often?
```javascript
// Check session state
const state = browser.getSessionState();
console.log('Session valid?', state.sessionValid);
console.log('Last auth:', state.lastTokenAuth);

// Ensure you're reusing session
await browser.forceReauth(token);  // Only once
const data1 = await browser.getChildren(token);  // Uses session
const data2 = await browser.getChildren(token);  // Uses cache
```

### Session expiring too quickly?
```javascript
// Lower keep-alive interval
const browser = new BrowserService({
  sessionKeepaliveInterval: 300000  // 5 minutes instead of 10
});

// Or manually refresh
setInterval(async () => {
  await browser.refreshSession();
}, 15 * 60 * 1000);
```

### Getting detected as bot?
```javascript
// Increase delays
const browser = new BrowserService({
  minDelayMs: 2000,
  maxDelayMs: 5000,
  enableAntiBot: true
});

// Use humanized interactions
await browser.humanClick(page, '.button');
await browser.humanType(page, 'input', 'text');
```

## Best Practices

1. ✅ **DO** call `forceReauth()` once at startup
2. ✅ **DO** reuse the same BrowserService instance
3. ✅ **DO** enable anti-bot features in production
4. ✅ **DO** call `cleanup()` when done
5. ❌ **DON'T** create new BrowserService for each operation
6. ❌ **DON'T** call `forceReauth()` repeatedly
7. ❌ **DON'T** bypass cache unless necessary
8. ❌ **DON'T** set delays too low (< 500ms)

## Performance Tips

- Use cache when possible (don't always `forceRefresh`)
- Reuse browser instance across operations
- Let keep-alive run automatically
- Monitor session state to avoid unnecessary re-auth
- Batch operations when possible
