import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Table, TableBody, TableContainer, Typography } from '@mui/material';
import { POSSIBLE_SAST_SEVERITY } from '#utils';

import DiffTable from './DiffTable'; // Import your DiffTable component
import NoFindings from './NoFindings'; // Import your DiffTable component

const SastTables = ({ sastData, page = 0, rowsPerPage = 20, tableDisabled = false }) => {
	// Prepare data for each severity level
	const sastBySeverity = useMemo(() => {
		return [...POSSIBLE_SAST_SEVERITY].reduce((acc, severity) => {
			const data = { current: [] };

			// Current Violations
			const current = Object.entries(sastData?.[severity] ?? {});

			const currentList = current.map(([className, sast]) => {
				const fileInfo = sast.reduce((fi, sastInstance) => {
					const { filepath, line } = sastInstance;
					if (!fi[filepath]) fi[filepath] = [];
					// Extract the line number from `line.start.line`
					// Find if the startLine already exists for this filePath
					const existingEntry = fi[filepath].find(entry => entry.startLine === line.start.line && entry.endLine === line.end.line);

					if (existingEntry) {
						// If it exists, increment num
						existingEntry.num = (existingEntry.num || 1) + 1;
					} else {
						// Otherwise, create a new entry
						fi[filepath].push({ startLine: line.start.line, endLine: line.end.line, num: 1 });
					}
					return fi;
				}, {});
              
				return {
					finding: className,
					severity: severity,
					fileInfo,
				};
			});

			data.current = currentList;

			acc[severity] = data;
			return acc;
		}, {});
	}, [sastData]);

	// Determine if there are any violations to display
	const hasAnySast = useMemo(() => {
		return [...POSSIBLE_SAST_SEVERITY].some((severity) => {
			const data = sastBySeverity[severity];
			return data.current.length > 0;
		});
	}, [sastBySeverity]);

	if (!hasAnySast) (<NoFindings text={'No current violations found.'}/>);

	return (
		<>
			{[...POSSIBLE_SAST_SEVERITY].map((severity) => {
				const data = sastBySeverity[severity];

				// Skip rendering if there are no violations for this severity
				if (data.current.length === 0) return null;

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
								<>
									{data.current.length > 0 ? (
										<DiffTable
											type="current"
											rows={data.current}
											page={page}
											rowsPerPage={rowsPerPage}
											tableDisabled={tableDisabled}
										/>
									) : (
										// If diff is false but no current violations, show a message
										<Typography variant="body2" color="textSecondary" align="center">
											{`No current sast for severity: ${severity}.`}
										</Typography>
									)}
								</>
							</TableBody>
						</Table>
					</TableContainer>
				);
			})}
		</>
	);
};

SastTables.propTypes = {
	violationsData: PropTypes.shape({
		current: PropTypes.object,
		introduced: PropTypes.object,
		removed: PropTypes.object,
	}),
	diff: PropTypes.bool.isRequired,
	page: PropTypes.number,
	rowsPerPage: PropTypes.number,
};

export default SastTables;
