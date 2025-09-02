// Feature flags for controlling UI visibility
// Set to false to hide features from the UI without removing code

export const FEATURE_FLAGS = {
  // AI functionality - defect detection, report writing
  SHOW_AI_FEATURES: false,
  
  // Future flags can be added here
  // SHOW_BETA_FEATURES: false,
} as const;

export default FEATURE_FLAGS;