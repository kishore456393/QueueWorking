# Privacy & Edge Computing

## Overview
This queue management system implements **edge computing** principles to protect user privacy while maintaining full functionality.

## Privacy Features

### 1. **Local Processing Only**
- ✅ All video processing happens **locally on your server**
- ✅ **No cloud transmission** - videos never leave your infrastructure
- ✅ YOLO detection runs on-premises (port 8000)
- ✅ No third-party AI services or external APIs

### 2. **Automatic Data Deletion**
```typescript
// Detection snapshots expire after 1 hour
MAX_SNAPSHOT_AGE: 60 minutes
CLEANUP_INTERVAL: Every 5 minutes
```
- Old detection data is **automatically purged**
- Only recent aggregate statistics retained
- No long-term storage of personal data

### 3. **Aggregate Statistics Only**
**What we STORE:**
- ✅ Queue counts (e.g., "Queue 1: 5 people")
- ✅ Total people across all queues
- ✅ Best/worst queue recommendations
- ✅ Timestamp of measurement

**What we DON'T STORE:**
- ❌ Individual faces or identifying features
- ❌ Full video footage (deleted after processing)
- ❌ Personal information
- ❌ Tracking of specific individuals

### 4. **Frame Data Handling**
- Frames used for **visualization only**
- Automatically removed after 1 hour
- No permanent storage
- Optional face blurring (can be enabled)

## Data Retention Policy

| Data Type | Retention Period | Purpose |
|-----------|------------------|---------|
| Video Files | Temporary (during processing) | Real-time analysis |
| Detection Snapshots | 1 hour maximum | Live dashboard updates |
| Queue Statistics | 1 hour maximum | Aggregate reporting |
| Settings | Persistent | User preferences |

## GDPR & Privacy Compliance

### ✅ Compliant Features:
1. **Data Minimization** - Only essential metrics collected
2. **Storage Limitation** - 1-hour auto-expiry
3. **Purpose Limitation** - Data used only for queue management
4. **Security** - Local processing, no external transmission
5. **Transparency** - Clear documentation of data handling

### Edge Computing Architecture:
```
[Video Feed] → [Local Server] → [YOLO Detector]
                    ↓
              [Extract Stats]
                    ↓
         [Store Aggregates Only]
                    ↓
      [Auto-delete after 1 hour]
```

## Privacy Manager API

### Automatic Cleanup
```typescript
// Runs every 5 minutes
PrivacyManager.startAutoCleanup(snapshotsMap);
```

### Manual Cleanup
```typescript
// Delete old snapshots
PrivacyManager.cleanupOldSnapshots(snapshotsMap, maxAgeMs);
```

### Privacy Report
```typescript
const report = PrivacyManager.getPrivacyReport(snapshotsMap);
// Returns:
// - totalSnapshots
// - oldestSnapshot
// - newestSnapshot
// - dataRetentionCompliant
```

## For System Administrators

### Verify Privacy Compliance:
1. Check cleanup service is running:
   ```
   [Privacy] Auto-cleanup service started
   [Privacy] Edge computing mode enabled
   ```

2. Monitor console for automatic purges:
   ```
   [Privacy] Cleaned up 42 old detection snapshots
   [Privacy] Snapshot created - aggregate stats only
   ```

3. Verify no permanent video storage:
   - `uploads/` folder should only contain active processing files
   - Old videos automatically removed after analysis

### Configuration Options:
```typescript
// In privacy-manager.ts
MAX_SNAPSHOT_AGE_MS = 60 * 60 * 1000;  // 1 hour
CLEANUP_INTERVAL_MS = 5 * 60 * 1000;   // 5 minutes
```

## Security Best Practices

1. **Network Isolation**: Run on private network
2. **Access Control**: Limit dashboard access to authorized users
3. **HTTPS**: Use TLS encryption for web interface
4. **Regular Updates**: Keep dependencies updated
5. **Audit Logs**: Monitor system access

## User Rights (GDPR)

Users have the right to:
- ✅ **Access**: View aggregated queue statistics
- ✅ **Erasure**: All data auto-deletes within 1 hour
- ✅ **Portability**: Export queue statistics via API
- ✅ **Transparency**: This documentation explains all processing

## Questions?

**Q: Is video footage stored permanently?**  
A: No. Videos are processed locally and deleted. Only aggregate statistics (queue counts) are temporarily retained.

**Q: Can individuals be identified?**  
A: No. The system only counts people in zones, it doesn't track or identify individuals.

**Q: Where is data sent?**  
A: Nowhere. All processing happens locally on your server. No cloud services or external APIs.

**Q: How long is data kept?**  
A: Maximum 1 hour. Automated cleanup runs every 5 minutes to purge old data.

**Q: Is this GDPR compliant?**  
A: Yes. The system follows data minimization, storage limitation, and purpose limitation principles.
