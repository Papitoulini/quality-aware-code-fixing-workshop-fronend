import sortMetricsBySeverity from "./sort-metrics-by-severity.js"
import { CLONE_METRICS_NAME_MAP } from "./index.js"

const mapOverviewToMetrics = (overview) => {
	const metrics = {};

	// Process Violations Stats
	if (overview?.violationsStats) {
		const { current, introduced, removed } = overview.violationsStats;
		let total = 0;
		let totalIntroduced = 0;
		let totalRemoved = 0;

		metrics.violations = [];
		const sortedEntries = sortMetricsBySeverity(Object.entries(current || {}));
		for (const [severity, count] of sortedEntries) {
			metrics.violations[severity] = {
				main: count,
				added: introduced ? introduced[severity] || 0 : 0,
				removed: removed ? removed[severity] || 0 : 0,
				percent: false,
			};

			total += count;
			totalIntroduced += introduced ? introduced[severity] || 0 : 0;
			totalRemoved += removed ? removed[severity] || 0 : 0;
		}

		metrics.violations.total = {
			label: "total",
			main: total,
			added: totalIntroduced,
			removed: totalRemoved,
			percent: false,
		};
	}

	if (overview?.sastStats) {
		const { current, introduced, removed } = overview.sastStats;
		let total = 0;
		let totalIntroduced = 0;
		let totalRemoved = 0;

		metrics.sast = [];
		const sortedEntries = sortMetricsBySeverity(Object.entries(current || {}));
		for (const [severity, count] of sortedEntries) {
			metrics.sast[severity] = {
				main: count,
				added: introduced ? introduced[severity] || 0 : 0,
				removed: removed ? removed[severity] || 0 : 0,
				percent: false,
			};

			total += count;
			totalIntroduced += introduced ? introduced[severity] || 0 : 0;
			totalRemoved += removed ? removed[severity] || 0 : 0;
		}

		metrics.sast.total = {
			main: total,
			added: totalIntroduced,
			removed: totalRemoved,
			percent: false,
		};
	}

	if (overview?.vulnerabilitiesStats) {
		const { current, introduced, removed } = overview.vulnerabilitiesStats;
		let total = 0;
		let totalIntroduced = 0;
		let totalRemoved = 0;

		metrics.vulnerabilities = [];
		const sortedEntries = sortMetricsBySeverity(Object.entries(current || {}));
		for (const [severity, count] of sortedEntries) {
			metrics.vulnerabilities[severity] = {
				main: count,
				added: introduced ? introduced[severity] || 0 : 0,
				removed: removed ? removed[severity] || 0 : 0,
				percent: false,
			};

			total += count;
			totalIntroduced += introduced ? introduced[severity] || 0 : 0;
			totalRemoved += removed ? removed[severity] || 0 : 0;
		}

		metrics.vulnerabilities.total = {
			main: total,
			added: totalIntroduced,
			removed: totalRemoved,
			percent: false,
		};
	}

	// Process Clones Info Stats
	if (overview?.clonesStats) {
		const { current, introduced, removed } = overview.clonesStats;

		metrics.duplicates = [];
		for (const [metric, formattedMetric] of Object.entries(CLONE_METRICS_NAME_MAP)) {
			metrics.duplicates[formattedMetric] = {
				main: current ? CLONE_METRICS_NAME_MAP[metric]  === "duplicate code" ? ( current[metric] || 0) / 100 : current[metric] || 0 : 0,
				added: introduced ? CLONE_METRICS_NAME_MAP[metric]  === "duplicate code" ? ( introduced[metric] || 0) / 100 : introduced[metric] || 0 : 0,
				removed: removed ? CLONE_METRICS_NAME_MAP[metric]  === "duplicate code" ? ( removed[metric] || 0) / 100 :  removed[metric] || 0 : 0,
				percent: CLONE_METRICS_NAME_MAP[metric] === "duplicate code",
			};
		}
	}

	return metrics;
};

export default mapOverviewToMetrics;