# Battle.net Smart Quota Synchronization - Technical Summary

## Overview

The Battle.net plugin implements a three-tier adaptive quota synchronization system that intelligently balances real-time accuracy with resource efficiency.

## Core Innovation

Instead of a fixed sync interval (which is either too slow or too wasteful), the system **adapts** based on quota state:

```
┌─────────────────────────────────────────────────────┐
│         THREE-TIER ADAPTIVE SYNC SYSTEM            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🟢 NORMAL (Hourly)      - Quota >= 30 min         │
│  🟡 AGGRESSIVE (10-min)  - Quota < 30 min          │
│  🔴 IMMEDIATE (Instant)  - Critical events         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Decision Logic

Located in `detectQuotaChange()` function:

```javascript
// Decision tree
if (oldMinutes === null) return 'normal';        // First time
if (newMinutes > oldMinutes) return 'immediate'; // Parent added time
if (newMinutes === 0) return 'immediate';        // Quota exhausted
if (newMinutes < 30) return 'aggressive';        // Running low
return 'normal';                                 // Healthy quota
```

## Why 30 Minutes?

The 30-minute threshold was chosen based on:

1. **Behavioral Psychology**
   - 30 minutes = typical gaming session length
   - Users expect tighter control when approaching session end

2. **Technical Efficiency**
   - With 10-min intervals: 3 sync opportunities before exhaustion
   - Provides sufficient protection without excessive API calls

3. **Resource Balance**
   - Normal mode: 24 API calls/day (1/hour)
   - Aggressive mode: 6 API calls/hour (short-term only)
   - Immediate mode: Event-driven (minimal overhead)

4. **Parental Expectations**
   - Parents want tight control when time is running out
   - Parents accept relaxed monitoring when quota is healthy

## State Machine

```
                    NORMAL SYNC
                    (Hourly)
                    Quota >= 30
                         │
            ┌────────────┼────────────┐
            │            │            │
     Quota < 30     Quota = 0    Quota Up
            │            │            │
            ▼            ▼            ▼
    AGGRESSIVE      IMMEDIATE    IMMEDIATE
    (10-min)        (Lockout)    (Restore)
    Quota: 1-29         │            │
            │            │            │
            └────────────┴────────────┘
                         │
                  Quota >= 30 again
                         │
                         ▼
                    NORMAL SYNC
                    (Hourly)
```

## Implementation Components

### 1. Quota State Tracking
```javascript
state.quotaState[childId] = {
  allow2Minutes: number,      // Current quota
  lastSyncTime: timestamp,    // Last successful sync
  lastSyncMinutes: number,    // Last synced value
  syncMode: 'normal'|'aggressive',
  aggressiveTimer: timer|null,
  normalTimer: timer|null
}
```

### 2. Timer Management

**Normal Sync Timer:**
```javascript
const NORMAL_INTERVAL = 60 * 60 * 1000; // 1 hour
setInterval(() => syncQuotaToBattleNet(...), NORMAL_INTERVAL);
```

**Aggressive Sync Timer:**
```javascript
const AGGRESSIVE_INTERVAL = 10 * 60 * 1000; // 10 minutes
setInterval(() => syncQuotaToBattleNet(...), AGGRESSIVE_INTERVAL);
```

**Anti-Spam Protection:**
```javascript
const MIN_SYNC_INTERVAL = 60 * 1000; // 1-minute cooldown
if (timeSinceLastSync < MIN_SYNC_INTERVAL && !force) {
  return; // Skip sync
}
```

### 3. Mode Transitions

**Switching to Aggressive:**
```javascript
if (newMinutes < 30 && currentMode !== 'aggressive') {
  stopNormalSync(childId);      // Clear hourly timer
  startAggressiveSync(childId); // Start 10-min timer
  state.quotaState[childId].syncMode = 'aggressive';
}
```

**Switching to Normal:**
```javascript
if (newMinutes >= 30 && currentMode !== 'normal') {
  stopAggressiveSync(childId);  // Clear 10-min timer
  startNormalSync(childId);     // Start hourly timer
  state.quotaState[childId].syncMode = 'normal';
}
```

**Immediate Sync:**
```javascript
if (newMinutes === 0 || newMinutes > oldMinutes) {
  syncQuotaToBattleNet(childId, newMinutes, force=true);
  // No timer change, just immediate action
}
```

## Performance Metrics

### API Call Rates

**Normal Day (Single Child):**
- Morning: Parent sets 120 min → Immediate sync
- Throughout day: Hourly syncs → 24 calls/day
- Evening: Drops below 30 min → Aggressive mode
- Aggressive period: ~3 syncs before exhaustion → 3 calls
- Total: ~28 API calls

**Heavy Usage Day:**
- Multiple parent additions → 3-5 immediate syncs
- Extended aggressive periods → 10-15 aggressive syncs
- Normal syncs → 15-20 calls
- Total: ~35-40 API calls

**Resource Impact:**
- Very low in normal mode (1 call/hour)
- Moderate in aggressive mode (6 calls/hour, short-term)
- Justified for immediate mode (critical events only)

### Expected Quota Drift

**Normal Mode:**
- Max drift: ~60 minutes (worst case: sync at top of hour)
- Typical drift: ~30 minutes (average case)
- Acceptable: Yes, quota is healthy (>30 min remaining)

**Aggressive Mode:**
- Max drift: ~10 minutes (worst case: just after sync)
- Typical drift: ~5 minutes (average case)
- Acceptable: Yes, provides tight control without spam

**Immediate Mode:**
- Max drift: ~5 seconds (plugin processing time)
- Blizzard delay: 1-30 minutes (their system processing)
- Acceptable: Yes, we sync immediately on our end

## Integration Points

### 1. Allow2 Quota Updates
```javascript
context.ipcMain.handle('battlenet:quotaUpdate', async (event, params) => {
  const { childId, allow2Quota } = params;
  onQuotaUpdate(childId, allow2Quota);
});
```

### 2. BrowserService Integration
```javascript
const result = await browserService.updateControls(
  state.token,
  battleNetChildId,
  { timeLimits: { dailyMinutes: minutes } }
);
```

### 3. Claude Flow Metrics
```javascript
storeMetric('quota-sync-success', {
  childId,
  battleNetChildId,
  minutes,
  syncMode: state.quotaState[childId].syncMode
});
```

## Future Enhancements

1. **Adaptive Threshold**
   - Learn child's typical session length
   - Adjust LOW_QUOTA_THRESHOLD dynamically
   - Example: If child usually plays 45-min sessions, threshold could be 45

2. **Predictive Sync**
   - Calculate time until quota exhaustion
   - Increase sync frequency as predicted time approaches
   - Example: If quota dropping 10 min/hour, predict exhaustion in 3 hours

3. **Configurable Thresholds**
   - Allow parents to set aggressive threshold
   - Per-child configuration
   - Example: Parent wants aggressive mode at 60 min for one child, 15 min for another

4. **Smart Cooldown**
   - Adjust MIN_SYNC_INTERVAL based on change magnitude
   - Smaller changes = longer cooldown
   - Larger changes = shorter cooldown

## Comparison to Alternatives

### Fixed Interval Sync

**Approach:** Sync every N minutes regardless of quota state

**Problems:**
- Too slow (N=60): Large drift, poor control
- Too fast (N=5): Excessive API calls, resource waste
- No flexibility for different scenarios

**Our Solution:**
- Adapts to quota state
- Efficient when possible, aggressive when needed
- Best of both worlds

### Continuous Polling

**Approach:** Check Battle.net status every minute

**Problems:**
- Extremely wasteful (1440 calls/day)
- High risk of rate limiting
- Unnecessary when quota is healthy

**Our Solution:**
- Event-driven immediate syncs
- Intelligent timer-based syncs
- 50-100x fewer API calls

### Manual Sync Only

**Approach:** Only sync when parent manually triggers

**Problems:**
- Requires parent action for every change
- Poor user experience
- No automatic enforcement

**Our Solution:**
- Fully automatic
- Smart defaults
- Parent doesn't need to think about it

## Testing Scenarios

### Scenario 1: Normal Day
```
3:00 PM: Parent sets 120 min → Immediate sync
4:00 PM: 60 min remaining → Normal sync (hourly)
5:00 PM: 30 min remaining → Normal sync (last hourly)
5:15 PM: 15 min remaining → Aggressive sync (switched modes)
5:25 PM: 5 min remaining → Aggressive sync (10-min tick)
5:30 PM: 0 min → Immediate lockout
```

**Expected Behavior:**
- 1 immediate sync at start
- 2 normal syncs during healthy period
- 2 aggressive syncs during low period
- 1 immediate sync at exhaustion
- Total: 6 syncs for entire day

### Scenario 2: Parent Adds Time
```
5:00 PM: 0 min (locked out)
5:15 PM: Parent adds 30 min → Immediate unlock
5:15 PM: 30 min → Normal mode (threshold = 30)
6:15 PM: 20 min → Normal sync, switch to aggressive
6:25 PM: 15 min → Aggressive sync
6:35 PM: 10 min → Aggressive sync
6:45 PM: 5 min → Aggressive sync
6:55 PM: 0 min → Immediate lockout
```

**Expected Behavior:**
- Immediate unlock when parent adds time
- Brief normal mode at threshold
- Quick switch to aggressive as quota depletes
- Multiple aggressive syncs during depletion
- Immediate lockout at exhaustion

## Conclusion

The three-tier adaptive quota synchronization system provides:

✅ **Efficiency** - Minimal API calls during normal usage
✅ **Responsiveness** - Tight control when quota is low
✅ **Immediacy** - Instant response to critical events
✅ **Scalability** - Scales well with multiple children
✅ **Maintainability** - Clear state machine, well-documented

This balances parental control effectiveness with resource conservation, providing a production-ready solution for real-world quota management.

---

**Related Documentation:**
- [QUOTA_SYNC_GUIDE.md](../../plugins/allow2automate-battle.net/docs/QUOTA_SYNC_GUIDE.md) - Developer guide
- [QUOTA_SYNC_USER_GUIDE.md](../../plugins/allow2automate-battle.net/docs/QUOTA_SYNC_USER_GUIDE.md) - User guide
- [README.md](../../plugins/allow2automate-battle.net/README.md) - Plugin overview
