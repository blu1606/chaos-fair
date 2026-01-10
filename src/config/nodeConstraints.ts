/**
 * NodeUI Constraints
 * Extracted constants for easy adjustment
 */

export const NODE_CONSTRAINTS = {
  // Auto-submit interval in seconds (1 minute = 60s)
  AUTO_SUBMIT_INTERVAL_SECONDS: 60 as number,
  
  // Minimum entropy quality to allow submission (0-1)
  MIN_ENTROPY_THRESHOLD: 0.7 as number,
  
  // Warning threshold for countdown (show urgent styling)
  COUNTDOWN_WARNING_SECONDS: 10 as number,
  
  // Epoch duration in seconds (5 minutes = 300s)
  EPOCH_DURATION_SECONDS: 300 as number,
  
  // Log max entries
  LOG_MAX_ENTRIES: 50 as number,
  
  // Spectrum analyzer bars count
  SPECTRUM_BARS: 64 as number,
};
