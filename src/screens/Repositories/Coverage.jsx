import { useState, useCallback, useEffect, memo, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { Typography, Grid, LinearProgress, Link as MaterialLink } from "@mui/material";
import queryString from "query-string";
import Cycled from "cycled";
import { Decoration } from "@codemirror/view"; // Import Decoration

import CodeViewer from "../../components/CodeViewer.jsx";
import GeneralInfoTile from "../../components/GeneralInfoTile.jsx";
import DataTable from "../../components/DataTable.jsx";
import BorderBox from "../../components/BorderBox.jsx";
import BackToFilesButton from "../../components/BackToFilesButton.jsx";
import CodeViewerNavButtons from "../../components/CodeViewerNavButtons.jsx";

import { useFileContent, useCoverage } from "#api";

const coverageColors = {
	partiallyCovered: "rgba(255, 155, 0, 0.3)",
	notCovered: "rgba(255, 0, 0, 0.3)",
};

const displayCoverage = (data) => {
	// Extract the total and parse the coverage string as a float.
	const total = data.total;
	const coverage = Number.parseFloat(data.coverage);
    
	// Calculate the number of covered items by applying the percentage.
	const covered = Math.round(total * (coverage / 100));
    
	// Return the result as a formatted string.
	return `${covered} / ${total}`;
}

// Helper function to parse "covered / total" and return an object with both values.
const parseCoverage = (coverageStr) => {
	if (!coverageStr) return { percentage: 0, total: 0 };
	const parts = coverageStr.split('/');
	if (parts.length !== 2) return { percentage: 0, total: 0 };

	const covered = Number.parseFloat(parts[0].trim());
	const total = Number.parseFloat(parts[1].trim());

	const percentage = total > 0 ? (covered / total) * 100 : 0;
	return { percentage, total };
};

const shortCategory = (valueA, valueB) => {
	const { percentage: percA, total: totalA } = parseCoverage(valueA);
	const { percentage: percB, total: totalB } = parseCoverage(valueB);

	if (percA !== percB) return percA - percB;
	return totalA - totalB;
};

const Coverage = (props) => {
	const { repository, hash } = props;
	const { owner, name, language } = repository || {};
	const { search } = useLocation();
	const [fileName, setFileName] = useState(null)
	const filePath = fileName && decodeURIComponent(fileName);
	const { fileContent = "" } = useFileContent(owner, name, filePath, hash);
	const editorRef = useRef(null);
	const { coverage = {}, isLoading } = useCoverage(hash, repository || {});

	useEffect(() => {
		const parsed = queryString.parse(search);
		if (parsed.fileName) setFileName(parsed.fileName)
		else setFileName(null)
	}, [search]);

	const diagnostics = useMemo(() => {
		const problems = coverage.filesCoverage?.[filePath] || {};
		const diagnosticLines = Object.keys(problems.lineCoverage || {}).map(line => ({ line: Number.parseInt(line, 10) }));
		return new Cycled(diagnosticLines);
	}, [coverage.filesCoverage, filePath]);

	const getDecorations = useCallback((state) => {
		const widgets = [];

		if (!coverage.filesCoverage) return Decoration.set(widgets);

		const fileCoverage = coverage.filesCoverage?.[filePath];
		if (!fileCoverage) return Decoration.set(widgets);

		const { lineCoverage } = fileCoverage

		for (const [lineStr, status] of Object.entries(lineCoverage)) {
			const lineNumber = Number.parseInt(lineStr, 10);
			const line = state.doc.line(lineNumber);

			if (!line) continue; // Skip if the line does not exist

			const color = coverageColors[status];

			if (color) {
				widgets.push(
					Decoration.line({
						attributes: {
							style: `background-color: ${color};`,
							title: `Line ${lineNumber}: ${status}`,
						},
					}).range(line.from),
				);
			}
		}
		return Decoration.set(widgets);
	}, [coverage.filesCoverage, filePath]);

	const coverageTableColumns = useMemo(() => [
		{
			field: "File Name",
			minWidth: 150,
			flex: 1,
			align: "left",
			valueGetter: ({ row }) => row.name,
			renderCell: ({ value }) => {
				const currentQueryParams = queryString.parse(search); // Parse the existing query parameters
				const updatedQueryParams = {
					...currentQueryParams, // Spread the current query parameters
					fileName: value, // Add or overwrite the `filePath` parameter
				};
				const updatedUrl = queryString.stringifyUrl({ 
					url: "", 
					query: updatedQueryParams 
				});
				return (
					<MaterialLink
						variant="body1"
						underline="none"
						component={Link}
						sx={{ overflow: "auto" }}
						to={updatedUrl}
					>
						{value}
					</MaterialLink>
				)},
		},
		...Object.entries(coverage.overall || {})
			.map(([key]) => (
				{
					field: key,
					width: 140,
					valueGetter: ({ row }) => (displayCoverage(coverage.filesCoverage[row.name]?.[key])),
					getApplyQuickFilterFn: undefined,
					sortComparator: shortCategory,
				}
			))
	], [coverage.filesCoverage, coverage.overall, search]);

	if (!owner && !name && !hash) return
	if (isLoading) return <LinearProgress color="primary" />;

	return (
		<>
			<Grid item container direction="column" justifyContent="flex-start">
				<Grid container sx={{ padding: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
					{Object.entries(
						coverage.filesCoverage?.[filePath]
							? coverage.filesCoverage?.[filePath].overall
							: coverage.overall || {}
					).length > 0 ? Object.entries(coverage.filesCoverage?.[filePath] ? coverage.filesCoverage?.[filePath].overall : coverage.overall || {}).map(([key, value]) =>  {
							return <Grid item  key={key} xs={12} sm={6} md={3}
								sx={{
									padding: "1rem",
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							><GeneralInfoTile
									percent
									key={key}
									content={key}
									number={Number.parseFloat(value.coverage)/100}
								/>
							</Grid>
						}) : "no finings"}
				</Grid>
				<Grid item hidden={!filePath}>
					<BackToFilesButton/>
				</Grid>
				<Grid item hidden={!filePath} sx={{ display: "flex", justifyContent: "space-between" }}>
					<Grid item display="flex" alignItems="center">
						<Typography style={{ display: "inline-flex" }}>
							{"File:"}
							&nbsp;
						</Typography>
						<Typography color="primary" style={{ display: "inline-flex" }}>
							{filePath}
						</Typography>
					</Grid>
				</Grid>
				<Grid item hidden={!filePath} style={{ zIndex: 0, maxWidth: "100%" }}>
					{fileContent ? (
						<BorderBox sx={{ p: 0 }}>
							<CodeViewer
								handleQueryParams={true}
								ref={editorRef}
								value={fileContent}
								getDecorations={getDecorations}
								language={(language || "Java").toLowerCase()}
								filePath={filePath}
								hash={hash}
							/>
							<CodeViewerNavButtons
								diagnostics={diagnostics}
								editorRef={editorRef}
							/>
						</BorderBox>
					) : (
						<LinearProgress color="primary" />
					)}
				</Grid>
			</Grid>
			<Grid item xs={12}>
				{!filePath && (
					<DataTable
						tableName="coverageTable"
						rows={Object.keys(coverage.filesCoverage || {}).map((name) => ({name}))}
						columns={coverageTableColumns}
						getRowId={(e) => e.name}
						initialState={{ sorting: { sortModel: [{ field: "Critical", sort: "desc" }] }, pagination: { paginationModel: { page: 0 } } }}
					/>
				)}
			</Grid>
		</>
	);
};

Coverage.propTypes = {
	repository: PropTypes.object.isRequired,
	analysis: PropTypes.object.isRequired,
	hash: PropTypes.string.isRequired,
};

export default memo(Coverage);
