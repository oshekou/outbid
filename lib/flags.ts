/** Feature flags for "Later" features that appear in the mockups (BUILD_PLAN.md §2). */
export const FEATURE_MAX_BID = process.env.NEXT_PUBLIC_FEATURE_MAX_BID === "true";
export const FEATURE_WALLET = process.env.NEXT_PUBLIC_FEATURE_WALLET === "true";
/** Reshare tracking: show the "student reshares" row from mock data in Phase 1 only. */
export const FEATURE_RESHARES = process.env.NEXT_PUBLIC_FEATURE_RESHARES !== "false";
