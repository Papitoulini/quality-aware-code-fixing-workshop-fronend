import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableContainer, Typography } from '@mui/material';
import { POSSIBLE_VIOLATIONS_SEVERITY } from '#utils';

import ViolationsDiffTable from './DiffTable'; // Import your ViolationsDiffTable component
import NoAvailableData from './NoAvailableData.jsx'; // Import your ViolationsDiffTable component

const violationsList = (violations) => {
	return violations.map(([_, violation]) => {
		const fileInfo = violation.files.reduce((fi, file) => {
			if (!fi[file.filePath]) fi[file.filePath] = [];
			// Find if the startLine already exists for this filePath
			const existingEntry = fi[file.filePath].find((entry) => entry.startLine === file.line);

			if (existingEntry) {
				// If it exists, increment num
				existingEntry.num = (existingEntry.num || 1) + 1;
			} else {
				// Otherwise, create a new entry
				fi[file.filePath].push({ startLine: file.line, num: 1 });
			}
			return fi;
		}, {});

		return {
			finding: violation.title,
			severity: violation.severity,
			fileInfo,
		};
	});
}

const ViolationsTables = ({ violationsData, diff, isError, page, rowsPerPage, tableDisabled = false }) => {
	const {
		current: c = {},
		introduced: i = {},
		removed: r = {},
	} = violationsData;

	// Prepare data for each severity level
	const violationsBySeverity = useMemo(() => {
		return [...POSSIBLE_VIOLATIONS_SEVERITY].reduce((acc, severity) => {
			const data = { added: [], removed: [], current: [] };

			if (diff) {
				// Introduced Violations (Added)
				const introduced = Object.entries(i).filter(
					([, violation]) => violation.severity === severity
				);

				const addedList = violationsList(introduced);

				// Removed Violations
				const removed = Object.entries(r).filter(
					([, violation]) => violation.severity === severity
				);

				const removedList = violationsList(removed);

				data.added = addedList;
				data.removed = removedList;
			} else {
				// Current Violations
				const current = Object.entries(c).filter(
					([, violation]) => violation.severity === severity
				);

				const currentList = violationsList(current);

				data.current = currentList;
			}

			acc[severity] = data;
			return acc;
		}, {});
	}, [diff, i, r, c]);

	if (isError) { return (<NoAvailableData />); }

	return (
		<>
			{[...POSSIBLE_VIOLATIONS_SEVERITY].map((severity) => {
				const data = violationsBySeverity[severity];

				// Skip rendering if there are no violations for this severity
				if (
					(diff && data.added.length === 0 && data.removed.length === 0)
					|| (!diff && data.current.length === 0)
				) {
					return null;
				}

				return (
					<TableContainer
						key={severity}
						sx={{ marginBottom: 4, borderRadius: '1rem', border: 1, padding: 2 }}
					>
						<Typography variant="h6" sx={{ paddingBottom: 2 }}>
							{`Severity: ${severity}`}
						</Typography>
						<Table>
							<TableBody>
								{diff ? (
									<>
										{data.added.length > 0 && (
											<ViolationsDiffTable
												type="introduced"
												rows={data.added}
												page={page}
												rowsPerPage={rowsPerPage}
												tableDisabled={tableDisabled}
											/>
										)}
										{data.removed.length > 0 && (
											<ViolationsDiffTable
												type="removed"
												rows={data.removed}
												page={page}
												rowsPerPage={rowsPerPage}
												tableDisabled={tableDisabled}
											/>
										)}
										{/* If diff is true but no added or removed, show a message */}
										{data.added.length === 0 && data.removed.length === 0 && (
											<Typography variant="body2" color="textSecondary" align="center">
												{`No introduced or removed violations for severity: ${severity}.`}
											</Typography>
										)}
									</>
								) : (
									<>
										{data.current.length > 0 ? (
											<ViolationsDiffTable
												type="current"
												rows={data.current}
												page={page}
												rowsPerPage={rowsPerPage}
												tableDisabled={tableDisabled}
											/>
										) : (
										// If diff is false but no current violations, show a message
											<Typography variant="body2" color="textSecondary" align="center">
												{`No current violations for severity: ${severity}.`}
											</Typography>
										)}
									</>
								)}
							</TableBody>
						</Table>
					</TableContainer>
				);
			})}
		</>
	);
};

ViolationsTables.propTypes = {
	violationsData: PropTypes.shape({
		current: PropTypes.object,
		introduced: PropTypes.object,
		removed: PropTypes.object,
	}).isRequired,
	diff: PropTypes.bool.isRequired,
	page: PropTypes.number,
	rowsPerPage: PropTypes.number,
};

ViolationsTables.defaultProps = {
	page: 0,
	rowsPerPage: 10,
};

export default ViolationsTables;
