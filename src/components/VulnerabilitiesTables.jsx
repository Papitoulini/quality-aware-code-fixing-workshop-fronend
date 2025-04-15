// VulnerabilitiesTables.jsx
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Typography, Grid } from '@mui/material';
import { POSSIBLE_VULNERABILITIES_SEVERITY } from '#utils';

import MarkdownViewer from "./MarkdownViewer.jsx";
import DataTable from "./DataTable.jsx";
import NoAvailableData from "./NoAvailableData.jsx";

const VulnerabilitiesTables = ({ vulnerabilitiesData, diff, isError }) => {
	const {
		current: c = [],
		introduced: i = [],
		removed: r = [],
	} = vulnerabilitiesData;

	// Define table columns using useMemo for stability
	const tableColumns = useMemo(() => [
		{
			field: "Module",
			minWidth: 170,
			valueGetter: ({ row }) => row.moduleName,
		},
		{
			field: "Recommendation",
			flex: 1,
			sortable: false,
			align: "left",
			valueGetter: ({ row }) => (
				<div style={{ padding: "1rem", overflow: "auto", maxHeight: "25vh" }}>
					<MarkdownViewer content={row.recommendation} />
				</div>
			),
		},
		{
			field: "Description",
			flex: 0.5,
			sortable: false,
			align: "left",
			valueGetter: ({ row }) => row.description,
		},
	], []);

	// Prepare data for each severity level
	const vulnerabilitiesBySeverity = useMemo(() => {
		return [...POSSIBLE_VULNERABILITIES_SEVERITY].reduce((acc, severity) => {
			const data = { added: [], removed: [], current: [] };

			if (diff) {
				// Introduced Vulnerabilities (Added)
				const introduced = i.filter(
					(v) => v.severity === severity
				);

				// Removed Vulnerabilities
				const removed = r.filter(
					(v) => v.severity === severity
				);

				data.added = introduced;
				data.removed = removed;
			} else {
				// Current Vulnerabilities
				const current = c.filter(
					(v) => v.severity === severity
				);

				const currentList = current

				data.current = currentList;
			}

			acc[severity] = data;
			return acc;
		}, {});
	}, [c, diff, i, r]);

	if (isError) {
		return (<NoAvailableData/>);
	}

	return (
		<Grid container display="flex" direction="column">
			{[...POSSIBLE_VULNERABILITIES_SEVERITY].map((severity) => {
				const data = vulnerabilitiesBySeverity[severity];

				// Skip rendering if there are no vulnerabilities for this severity
				if (
					(diff && data.added.length === 0 && data.removed.length === 0) ||
          (!diff && data.current.length === 0)
				) {
					return null;
				}

				return (
					<Grid
						item
						key={severity}
						sx={{
							marginBottom: 4,
							borderRadius: "1rem",
							border: 1,
							borderColor: "divider",
							padding: 2,
							backgroundColor: "background.paper",
						}}
					>
						<Typography variant="h6" sx={{ paddingBottom: 2 }}>
							{`Severity: ${severity}`}
						</Typography>
						{diff ? (
							<>
								{data.added.length > 0 && (
									<DataTable
										color="pink.main"
										title="Added"
										rows={data.added}
										columns={tableColumns}
										getRowId={(row) => `${row.moduleName}_${row.recommendation}`}
										initialState={{
											sorting: { sortModel: [{ field: "Severity", sort: "asc" }] },
											pagination: { paginationModel: { page: 0 } },
										}}
									/>
								)}
								{data.removed.length > 0 && (
									<DataTable
										sx={{ borderTopLeftRadius: '0px', borderTopRightRadius: '0px' }}
										color="secondary.main"
										title="Removed"
										rows={data.removed}
										columns={tableColumns}
										getRowId={(row) => `${row.moduleName}_${row.recommendation}`}
										initialState={{
											sorting: { sortModel: [{ field: "Severity", sort: "asc" }] },
											pagination: { paginationModel: { page: 0 } },
										}}
									/>
								)}
								{/* If diff is true but no added or removed, show a message */}
								{data.added.length === 0 && data.removed.length === 0 && (
									<Typography variant="body2" color="textSecondary" align="center">
                    No introduced or removed vulnerabilities for severity: {severity}.
									</Typography>
								)}
							</>
						) : (
							<>
								{data.current.length > 0 ? (
									<DataTable
										rows={data.current}
										columns={tableColumns}
										getRowId={(row) => `${row.moduleName}_${row.recommendation}`}
										initialState={{
											sorting: { sortModel: [{ field: "Severity", sort: "asc" }] },
											pagination: { paginationModel: { page: 0 } },
										}}
									/>
								) : (
								// If diff is false but no current vulnerabilities, show a message
									<Typography variant="body2" color="textSecondary" align="center">
                    No current vulnerabilities for severity: {severity}.
									</Typography>
								)}
							</>
						)}
					</Grid>
				);
			})}
		</Grid>
	);
};

VulnerabilitiesTables.propTypes = {
	vulnerabilitiesData: PropTypes.object,
	diff: PropTypes.bool.isRequired,
};

export default VulnerabilitiesTables;
