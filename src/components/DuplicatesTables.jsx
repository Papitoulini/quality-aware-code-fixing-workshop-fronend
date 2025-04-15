// DuplicatesTables.jsx
import { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Grid, Typography, Box } from '@mui/material';
import queryString from "query-string";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import DataTable from "./DataTable.jsx";
import NoAvailableData from "./NoAvailableData.jsx";

const DuplicatesTables = ({ clonesData, diff, isError, tableDisabled = false }) => {
	const {
		current = [],
		introduced = [],
		removed = [],
	} = clonesData;
	const theme = useTheme();

	const { pathname, search } = useLocation();
	const navigate = useNavigate();

	const getTableColumns = useCallback((isClickable) => [
		{
			field: "Files",
			flex: 1,
			renderCell: ({ row }) => (
				<Typography 
					variant="h6" 
					sx={{ 
						width: "100%",
						...(isClickable ? {cursor: "pointer", '&:hover': { textDecoration: 'underline' }} : {}), 
						color: "primary.main", 
						paddingLeft: '8px',
					}} 
					disabled
					onClick={() => {
						if (isClickable) {
							const parsed = queryString.parse(search);
							parsed.cloneInstance = row.index;
							navigate(queryString.stringifyUrl({ url: pathname, query: parsed }), { replace: true });
						}
					}}
				>
					<Box sx={{ whiteSpace: 'pre-line', textColor: "red",  textAlign: 'left', paddingLeft: '8px' }}>
						{row.files.map((f, idx) => (
							<Box 
								key={idx} 
								component="span" 
								sx={{ 
									color: f.isAdded ? theme.palette.error[900] : f.isRemoved ? theme.palette.success[900] : 'inherit', // Use theme colors for consistency
									// textDecoration: isClickable && (f.isAdded || f.isRemoved) ? 'underline' : 'none',
									paddingLeft: '8px',
								}}
							>
								{f.filePath}
								{idx < row.files.length - 1 && <br />}
							</Box>
						))}
					</Box>
				</Typography>
			),
		},
		{
			field: "Lines",
			flex: 0.2,
			sortable: false,
			align: "left",
			...(tableDisabled
				? {
					renderCell: ({ row }) => (
						<Typography 
							variant="h6" 
							sx={{ 
								width: "100%",
								color: "primary.main", 
							}} 
							disabled
						>
							<Box sx={{ whiteSpace: 'pre-line', textAlign: 'center' }}>
								{row.files.map((f, idx) => (
									<Box 
										key={idx} 
										component="span"
									>
										{`${f.start_line}-${f.end_line}`}
										{idx < row.files.length - 1 && <br />}
									</Box>
								))}
							</Box>
						</Typography>
					),
				}
				: { valueGetter: ({ row }) => row.clone_loc }
			)
		},
		{
			field: "Instances",
			flex: 0.2,
			sortable: false,
			align: "left",
			valueGetter: ({ row }) => row.clone_instances,
		},
	], [navigate, pathname, search, theme.palette.error, theme.palette.success])

	const introducedCurrentColumns = useMemo(() => getTableColumns(!tableDisabled), [getTableColumns, tableDisabled]);
	const removedColumns = useMemo(() => getTableColumns(false), [getTableColumns]);

	if (isError) { return <NoAvailableData/> }

	return (
		<Grid container display="flex" direction="column">
			{ !( (diff && introduced.length === 0 && removed.length === 0)
					|| (!diff && current.length === 0)
			) &&

					<Grid
						item
						sx={{
							marginBottom: 4,
							borderRadius: "1rem",
							border: 1,
							borderColor: "divider",
							padding: 2,
							backgroundColor: "background.paper",
						}}
					>
						{diff ? (
							<>
								{introduced.length > 0 && (
									<DataTable
										color="pink.main"
										title="Added"
										rows={introduced}
										columns={introducedCurrentColumns}
										getRowId={(row) => JSON.stringify(row)}
										initialState={{
											sorting: { sortModel: [{ field: "Instances", sort: "desc" }, { field: "Lines", sort: "desc" }] },
											pagination: { paginationModel: { page: 0 } },
										}}
									/>
								)}
								{removed.length > 0 && (
									<DataTable
										sx={{ borderTopLeftRadius: '0px', borderTopRightRadius: '0px' }}
										color="secondary.main"
										title="Removed"
										rows={removed}
										columns={removedColumns}
										getRowId={(row) => JSON.stringify(row)}
										initialState={{
											sorting: { sortModel: [{ field: "Instances", sort: "desc" }, { field: "Lines", sort: "desc" }] },
											pagination: { paginationModel: { page: 0 } },
										}}
									/>
								)}
								{introduced.length === 0 && removed.length === 0 && (
									<Typography variant="body2" color="textSecondary" align="center">
										{`No introduced or removed duplicates`}
									</Typography>
								)}
							</>
						) : (
							<>
								{current.length > 0 ? (
									<DataTable
										rows={current}
										columns={introducedCurrentColumns}
										getRowId={(row) => JSON.stringify(row)}
										initialState={{
											sorting: { sortModel: [{ field: "Instances", sort: "desc" }, { field: "Lines", sort: "desc" }] },
											pagination: { paginationModel: { page: 0 } },
										}}
									/>
								) : (
								// If diff is false but no current duplicates, show a message
									<Typography variant="body2" color="textSecondary" align="center">
										{`No current duplicates`}
									</Typography>
								)}
							</>
						)}
					</Grid>
				
			}
		</Grid>
	);
};

DuplicatesTables.propTypes = {
	clonesData: PropTypes.shape({
		current: PropTypes.arrayOf(
			PropTypes.shape({
				moduleName: PropTypes.string.isRequired,
				recommendation: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired,
				severity: PropTypes.string.isRequired,
				files: PropTypes.arrayOf(
					PropTypes.shape({
						filePath: PropTypes.string.isRequired,
						line: PropTypes.number.isRequired,
					})
				).isRequired,
				index: PropTypes.number, // Assuming each clone has an index for unique identification
			})
		).isRequired,
		introduced: PropTypes.arrayOf(
			PropTypes.shape({
				moduleName: PropTypes.string.isRequired,
				recommendation: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired,
				severity: PropTypes.string.isRequired,
				files: PropTypes.arrayOf(
					PropTypes.shape({
						filePath: PropTypes.string.isRequired,
						line: PropTypes.number.isRequired,
					})
				).isRequired,
				index: PropTypes.number,
			})
		).isRequired,
		removed: PropTypes.arrayOf(
			PropTypes.shape({
				moduleName: PropTypes.string.isRequired,
				recommendation: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired,
				severity: PropTypes.string.isRequired,
				files: PropTypes.arrayOf(
					PropTypes.shape({
						filePath: PropTypes.string.isRequired,
						line: PropTypes.number.isRequired,
					})
				).isRequired,
				index: PropTypes.number,
			})
		).isRequired,
	}).isRequired,
	diff: PropTypes.bool.isRequired,
};

export default DuplicatesTables;
