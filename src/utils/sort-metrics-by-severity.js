/**
 * Maps the overview object to a flat array of metrics with main, added, and removed values.
 * @param {Object} overview - The overview data object.
 * @returns {Array} - An array of metric objects.
 */
const severityOrder = {
	Critical: 1,
	Major: 5,
	Minor: 7,
	critical: 2,
	high: 3,
	moderate: 6,
	low: 7,
	ERROR: 8,
	WARNING: 9,
	INFO: 10,
};

const sortMetricsBySeverity = (metrics) => {
	// Create a shallow copy to avoid mutating the original array
	const metricsCopy = [...metrics];
	metricsCopy.sort((a, b) => {
		const isEntryA = Array.isArray(a);
		const isEntryB = Array.isArray(b);

		const severityA = isEntryA ? a[0] : a;
		const severityB = isEntryB ? b[0] : b;

		const orderA = severityOrder[severityA] || 99;
		const orderB = severityOrder[severityB] || 99;

		return orderA - orderB;
	});
	return metricsCopy;
};
export default sortMetricsBySeverity;