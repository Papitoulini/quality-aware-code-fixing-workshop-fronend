export { default as capitalize } from "./capitalize.js";
export { default as cookie } from "./cookie.js";
export { default as jwt } from "./jwt.js";
export { default as useSnackbar, snackStore } from "./use-snackbar.js";
export { default as useDocumentTitle } from "./use-document-title.js";
export { default as sortAndPrioritizeBranches } from "./sort-and-prioritize-branches.js";
export { default as constructCommitHref } from "./construct-commit-href.js";
export { default as dayjs } from "./dayjs.js";
export { default as useLocalStorage } from "./use-local-storage.js";
export { default as isFuzzyMatch } from "./is-fuzzy-match.js";
export { default as qualityCell } from "./quality-cell.jsx";
export { default as formatTileNumber } from "./format-tile-number.js";
export { default as sortMetricsBySeverity } from "./sort-metrics-by-severity.js";
export { default as getColorForQualityScore } from "./get-color-for-quality-score.js";
export { default as convertQualityScoreToLetter } from "./convert-quality-score-to-letter.js";
export { default as sum } from "./sum.js";
export { default as mapOverviewToMetrics } from "./map-overview-to-metrics.js";
export { default as levelThresholds } from "./characteristics-thresholds.js";
export const MUTATION_DELAY_IN_MS = 500;
export const POSSIBLE_LANGUAGES = new Set(["JavaScript", "TypeScript", "Java", "C#", "Python", "PHP", "Kotlin", "Dart"]);
export const POSSIBLE_VULNERABILITIES_SEVERITY = new Set(["critical", "high", "moderate", "low" ]);
export const POSSIBLE_VIOLATIONS_SEVERITY = new Set(["Critical", "Major", "Minor"]);
export const POSSIBLE_SAST_SEVERITY = new Set(["ERROR", "WARNING", "INFO"]);
export const GRADE_RANK = { "D⁻": 0, "D": 1, "D⁺": 2, "C⁻": 3, "C": 4, "C⁺": 5, "B⁻": 6, "B": 7, "B⁺": 8, "A⁻": 9, "A": 10, "A⁺": 11 };
export const CLONE_METRICS_NAME_MAP = {
	'duplicateCodePct': "duplicate code",
	'classes_containing_clones': "classes with duplicates",
	'duplicate_loc': "duplicate lines of code",
	'duplicate_instances': "duplicate instances",
}