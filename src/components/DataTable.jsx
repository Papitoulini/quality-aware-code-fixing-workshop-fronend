import { useMemo, useCallback } from "react";
import { Box, LinearProgress, MenuItem, TextField, Typography } from "@mui/material";
import {
	DataGrid,
	gridClasses,
	GridToolbarColumnsButton,
	GridToolbarContainer,
	GridToolbarQuickFilter,
	gridFilteredSortedRowIdsSelector,
	gridVisibleColumnDefinitionsSelector,
	useGridApiContext,
	GridToolbarExportContainer,
	GridCsvExportMenuItem,
	GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { ArrowDownward, ArrowUpward, FilterAlt } from "@mui/icons-material";
import { shallow } from "zustand/shallow";
import queryString from "query-string";
import { useNavigate, useLocation } from "react-router-dom";

import { isFuzzyMatch, MUTATION_DELAY_IN_MS, useLocalStorage, capitalize } from "../utils/index.js";

import NoDataAvailable from "./NoDataAvailable.jsx";

const pageSizeOptions = [5, 10, 50, 100];

const getJson = (apiRef) => {
	const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
	const visibleColumnsDefinition = gridVisibleColumnDefinitionsSelector(apiRef);
	const data = filteredSortedRowIds.map((id) => {
		const row = {};
		for (const { field } of visibleColumnsDefinition.filter((column) => !column.disableExport)) {
			row[field] = apiRef.current.getCellParams(id, field).formattedValue;
		}

		return row;
	});

	return JSON.stringify(data, null, 2);
};

const exportBlob = (blob, filename) => {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	setTimeout(() => {
		URL.revokeObjectURL(url);
	});
};

const JsonExportMenuItem = (props) => {
	const apiRef = useGridApiContext();

	const { hideMenu } = props;

	return (
		<MenuItem
			onClick={() => {
				const jsonString = getJson(apiRef);
				const blob = new Blob([jsonString], {
					type: "text/json",
				});
				exportBlob(blob, `${document.title}.json`);
				hideMenu?.();
			}}
		>
			{"Download as JSON"}
		</MenuItem>
	);
};

const ExcelExportMenuItem = (props) => {
	const apiRef = useGridApiContext();

	const { hideMenu } = props;

	return (
		<MenuItem
			onClick={async () => {
				const jsonString = getJson(apiRef);
				const { utils, writeFile } = await import("xlsx");
				const ws = utils.json_to_sheet(JSON.parse(jsonString));
				const wb = utils.book_new();
				utils.book_append_sheet(wb, ws);
				writeFile(wb, `${document.title}.xlsx`);
				hideMenu?.();
			}}
		>
			{"Download as EXCEL"}
		</MenuItem>
	);
};

const ColumnSortedDescendingIcon = (props) => <ArrowDownward sx={{ color: "white !important" }} {...props} />;
const ColumnSortedAscendingIcon = (props) => <ArrowUpward sx={{ color: "white !important" }} {...props} />;
const ColumnHeaderFilterIconButton = ({ counter }) => (counter ? <FilterAlt sx={{ color: "white !important", fontSize: "small" }} /> : null);
const Toolbar = ({ extraOptions, addFilterButton, color, title = "" }) => (
	<GridToolbarContainer
		sx={{
			borderRadius: (t) => `${t.shape.borderRadius}px`,
			boxShadow: (t) => `${t.shadows[1]} !important`,
			borderBottomLeftRadius: 0,
			borderBottomRightRadius: 0,
			justifyContent: "space-between",
		}}
	>
		<Box>
			<GridToolbarColumnsButton sx={{ color }} />
			{addFilterButton && <GridToolbarFilterButton sx={{ color }} />}
			{extraOptions}
			<GridToolbarExportContainer sx={{ color }}>
				<GridCsvExportMenuItem
					options={{
						getRowsToExport: ({ apiRef }) => gridFilteredSortedRowIdsSelector(apiRef),
						delimiter: ";",
					}}
				/>
				<JsonExportMenuItem />
				<ExcelExportMenuItem />
			</GridToolbarExportContainer>
		</Box>
		{title && <Typography> {capitalize(title)} </Typography>}
		<GridToolbarQuickFilter
			debounceMs={MUTATION_DELAY_IN_MS}
		/>
	</GridToolbarContainer>
);

const DataTable = ({
	tableName,
	rows = [],
	columns = [],
	noRowsLabel = "No data available!",
	color = "primary.main",
	CustomToolbar = Toolbar,
	initialState,
	toolbar,
	addFilterButton = false,
	title = null,
	id,
	sx,
	...props
}) => {
	const navigate = useNavigate();
	const { pathname, search } = useLocation();

	const { defaultPageOptions, setDefaultPageOptions } = useLocalStorage(useCallback((e) => ({
		defaultPageOptions: e.defaultPageOptions,
		setDefaultPageOptions: e.setDefaultPageOptions,
	}), []), shallow);
	const columnsEnhanced = useMemo(() => columns.map((column) => ({
		align: "center",
		headerAlign: "center",
		getApplyQuickFilterFn: (searchValue) => ({ value }) => isFuzzyMatch(value, searchValue),
		renderHeader: () => <Typography variant="h6" fontWeight="bold">{column.field}</Typography>,
		renderCell: ({ value }) => <Typography width="100%" align="center">{value}</Typography>,
		...column,
	})), [columns]);

	return (
		<Box
			id={id}
			sx={{
				borderRadius: (t) => `${t.shape.borderRadius}px`,
				boxShadow: (t) => `${t.shadows[1]} !important`,
				width: "100%",
				"& .MuiDataGrid-root--densityStandard .MuiDataGrid-cell": { py: "5px", borderColor: "white" },
				...sx,
			}}
		>
			<DataGrid
				autoHeight
				disableColumnMenu
				disableRowSelectionOnClick
				componentsProps={{
					footer: { sx: { justifyContent: "center" } },
				}}
				initialState={{
					...initialState,
					pagination: {
						paginationModel: {
							page: Number(queryString.parse(search)[(tableName) ? `${tableName}-tp` : "tp"]
								?? initialState?.pagination?.paginationModel?.page
								?? defaultPageOptions?.page),
							pageSize: queryString.parse(search)[(tableName) ? `${tableName}-tps` : "tps"]
								? pageSizeOptions.includes(Number(queryString.parse(search)[(tableName) ? `${tableName}-tps` : "tps"]))
									? Number(queryString.parse(search)[(tableName) ? `${tableName}-tps` : "tps"])
									: 5
								: (initialState?.pagination?.paginationModel?.pageSize ?? defaultPageOptions?.pageSize),
						},
					},
				}}
				rows={rows}
				columns={columnsEnhanced}
				pageSizeOptions={pageSizeOptions}
				getRowId={(e) => e.id ?? e._id}
				sortingOrder={["asc", "desc"]}
				columnBuffer={columns.length}
				getRowClassName={({ indexRelativeToCurrentPage }) => (indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd")}
				getRowHeight={() => "auto"}
				getEstimatedRowHeight={() => 100}
				components={{
					ColumnHeaderFilterIconButton,
					ColumnSortedDescendingIcon,
					ColumnSortedAscendingIcon,
					Toolbar: () => <CustomToolbar extraOptions={toolbar} title={title} addFilterButton={addFilterButton} color="primary.main" />,
					LoadingOverlay: LinearProgress,
					NoRowsOverlay: () => <NoDataAvailable text={noRowsLabel} />,
					BaseTextField: (prps) => (
						<TextField
							{...prps}
							InputProps={{ ...prps.InputProps, sx: { color: "primary.main" } }}
							sx={{
								"& .MuiInput-underline": {
									"&:before, &:after": {
										borderBottomColor: (t) => `${t.palette.primary.main} !important`,
									},
								},
							}}
						/>
					),
				}}
				sx={{
					border: "none",
					overflowX: "scroll",
					backgroundColor: "common.white",
					"& .MuiDataGrid-columnHeaders": {
						borderRadius: 0,
						bgcolor: color,
						color: "common.white",
						"& .MuiDataGrid-columnHeader:last-child": {
							"> .MuiDataGrid-columnSeparator": {
								color,
							},
						},
					},
					"& .MuiDataGrid-columnHeaderTitleContainer": {
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					},
					[`& .${gridClasses.cell}`]: {
						whiteSpace: "normal !important",
						wordBreak: "break-all",
					},
					[`& .${gridClasses.row}.even`]: {
						backgroundColor: "var(--card-background-dark)",
						"&:hover, &.Mui-hovered": {
							backgroundColor: "#d7e0e8",
						},
					},
					[`& .${gridClasses.row}.odd`]: {
						backgroundColor: "var(--card-background-light)",
						"&:hover, &.Mui-hovered": {
							backgroundColor: "#d7e0e8",
						},
					},
				}}
				onPaginationModelChange={((newPageOptions) => {
					const parsed = queryString.parse(search);
					const page = newPageOptions.page ?? initialState?.pagination?.paginationModel?.page;
					const pageSize = newPageOptions.pageSize ?? initialState?.pagination?.paginationModel?.pageSize;
					parsed[(tableName) ? `${tableName}-tp` : "tp"] = page;
					parsed[(tableName) ? `${tableName}-tps` : "tps"] = pageSize;
					navigate(queryString.stringifyUrl({ url: pathname, query: parsed }), { replace: true });
					setDefaultPageOptions({ page, pageSize });
				})}
				{...props}
			/>
		</Box>
	);
};

export default DataTable;
