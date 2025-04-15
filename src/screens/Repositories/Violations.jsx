import { useState, useCallback, useEffect, memo, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import {
	Typography,
	Grid,
	LinearProgress,
	MenuItem,
	ListSubheader,
	Chip,
	Switch,
} from "@mui/material";
import { Warning } from "@mui/icons-material";
import queryString from "query-string";
import Cycled from "cycled";
import { numberSmallToLarge } from "@iamnapo/sort";
import useGlobalState from "../../use-global-state.js";
import { shallow } from "zustand/shallow";
import { useTheme } from "@mui/material/styles";

import Select from "../../components/Select.jsx";
import CodeViewer from "../../components/CodeViewer.jsx";
import BorderBox from "../../components/BorderBox.jsx";
import GeneralInfoTile from "../../components/GeneralInfoTile.jsx";
import BackToFilesButton from "../../components/BackToFilesButton.jsx";
import CodeViewerNavButtons from "../../components/CodeViewerNavButtons.jsx";
import ViolationsTables from "../../components/ViolationsTables.jsx";
import Tooltip from "../../components/Tooltip.jsx";

import { useViolations, useFileContent } from "#api";
import { mapOverviewToMetrics, POSSIBLE_VIOLATIONS_SEVERITY, capitalize } from "#utils";

const filterViolations = (sectionValue, qualityViolations, filteredViolation) => {
	return Object.fromEntries(
		Object.entries(sectionValue).filter(([_, violation]) => {
			// 1. Category Filter
			if (qualityViolations.Category && violation.category !== qualityViolations.Category) return false;
			// 2. Severity Filter
			if (!qualityViolations[violation.severity]) return false;
			// 3. Specific Violation Filter
			if (filteredViolation?.value && violation.title !== filteredViolation.value) return false;
			return true;
		})
	);
};

const filterViolationsStats = (sectionValue, qualityViolations) => {
	return  Object.fromEntries(
		Object.entries(sectionValue).filter(([key, _]) => {
			return qualityViolations[key]
		})
	);
};

const Violations = (props) => {
	const { repository, hash, showDiff } = props;
	const { owner, name, language } = repository || {};
	const navigate = useNavigate();
	const theme = useTheme();
	const { search, pathname } = useLocation();
	const [fileName, setFileName] = useState(null)
	const filePath = fileName && decodeURIComponent(fileName);
	const { fileContent = "" } = useFileContent(owner, name, filePath, hash);
	const [filteredViolation, setFilteredViolation] = useState();
	const editorRef = useRef(null);
	const { violationsInfo = {}, isLoading, isError } = useViolations(hash, repository || {});

	const violationsColorIcons = {
		Minor: theme.palette.yellow[700],
		Major: theme.palette.deepOrange[300],
		Critical: theme.palette.red[900],
	} 

	const { qualityViolations, setQualityViolations } = useGlobalState(useCallback((e) => ({
		qualityViolations: e.qualityViolations,
		setQualityViolations: e.setQualityViolations,
	}), []), shallow);
	
	// Apply filtering based on qualityViolations and filteredViolation
	const filteredViolationsInfo = useMemo(() => (
		{
			violations: Object.fromEntries(
				Object.entries(violationsInfo.violations || {}).map(([sectionKey, sectionValue]) => {
					if (typeof sectionValue === 'object' && sectionValue !== null) {
						return [sectionKey, filterViolations(sectionValue, qualityViolations, filteredViolation)];
					}
					return [sectionKey, sectionValue];
				})
			),
			violationsStats: Object.fromEntries(
				Object.entries(violationsInfo.violationsStats || {}).map(([sectionKey, sectionValue]) => {
					if (typeof sectionValue === 'object' && sectionValue !== null) { 
						return [sectionKey, filterViolationsStats(sectionValue, qualityViolations)];
					}
					return [sectionKey, sectionValue];
				})
			)
		}
	), [violationsInfo, qualityViolations, filteredViolation]);

	const allViolations = useMemo(() => {
		const {introduced = {}, removed = {}, current = {}}  = filteredViolationsInfo.violations || {};
		const someViolations = showDiff ? { ...introduced, ...removed } : { ...current };
		return someViolations
	}, [filteredViolationsInfo.violations, showDiff])

	const violationOptions = useMemo(() => {
		const uniqueCategories = [...new Set(Object.values(allViolations).map((e) => e.category))];
		return uniqueCategories.map((el) => ({
			label: el,
			options: Object.values(allViolations)
				.filter((value) => value.category === el)
				.map((ele) => ({ label: ele.title, value: ele.title })),
		}));
	}, [allViolations]);

	const renderedOptions = useMemo(() => {
		return violationOptions.flatMap((category) => [
			<ListSubheader key={`subheader_${category.label}`}>{category.label}</ListSubheader>,
			...category.options.map((option) => {
				const violation = Object.values(allViolations).find((e) => e.title === option.value);
				const validFilePaths = Array.isArray(violation?.files) ? violation.files : [];
				return (
					<MenuItem
						key={`${category.label}_${option.value}`}
						value={option.value}
						disabled={filePath && !(validFilePaths.some((f) => f.filePath === filePath))}
					>
						<Typography sx={{ display: "flex", alignItems: "center" }}>
							<Warning
								titleAccess={violation?.severity}
								sx={{
									color: violation?.severity === "Critical"
										? theme.palette.red[900]
										: violation?.severity === "Major"
											? theme.palette.deepOrange[300]
											: theme.palette.yellow[700],
								}}
							/>
							&nbsp;
							{option.label}
						</Typography>
					</MenuItem>
				);
			}),
		]);
	}, [violationOptions, allViolations, filePath, theme.palette]);

	useEffect(() => {
		const { violationType, fileName: fN } = queryString.parse(search);
		const vType = Object.values(allViolations).find((e) => e.title === violationType);

		if (vType) {
			if (filteredViolation?.value !== vType.title) setFilteredViolation({ label: vType.title, value: vType.title });
		} else {
			setFilteredViolation(null);
		}
		if (fN) setFileName(fN)
		else setFileName(null)
	}, [allViolations, filteredViolation?.value, search]);
	
	const diagnostics = useMemo(() => {
		let problems = [];
	
		if (filteredViolationsInfo.violations) {
			if (showDiff) {
			// Process introduced violations (added)
				if (filteredViolationsInfo.violations.introduced) {
					const introduced = Object.entries(
						filteredViolationsInfo.violations.introduced
					);

					for (const [key, metric] of introduced) {
						for (const violation of metric.files.filter(
							(e) => e.filePath === filePath
						)) {
							problems.push({
								violation: key,
								line: violation.line,
								value: 1,
								category: metric.category,
								explanation: metric.explanation,
								severity: metric.severity,
								title: metric.title,
								cat: 'violations',
								status: 'introduced', // Added violations
							});
						}
					}
				}
			} else {
			// Process current violations
				if (filteredViolationsInfo.violations.current) {
					const current = Object.entries(filteredViolationsInfo.violations.current);
	
					for (const [key, metric] of current) {
						for (const violation of metric.files.filter(
							(e) => e.filePath === filePath
						)) {
							problems.push({
								violation: key,
								line: violation.line,
								value: 1,
								category: metric.category,
								explanation: metric.explanation,
								severity: metric.severity,
								title: metric.title,
								cat: 'violations',
								status: 'current',
							});
						}
					}
				}
			}
		}
	
		return new Cycled(problems.sort(numberSmallToLarge((v) => v.line)));
	}, [filteredViolationsInfo.violations, showDiff, filePath]);

	const getAnnotations = useCallback(
		(view) =>
			[...diagnostics].map(({ explanation, line, severity }) => {
				return {
					message: explanation,
					severity: severity === "Critical" ? "error" : "warning",
					from: view.state.doc.line(line).from,
					to: view.state.doc.line(line).to,
				};
			}),
		[diagnostics]
	);

	useEffect(() => {
		// Ensure disabled states are synced with qualityViolations when data changes
		if (!isLoading) {
			const updatedQualityViolations = { ...qualityViolations };
			for (const severity of POSSIBLE_VIOLATIONS_SEVERITY) {
				const isDisabled = !violationsInfo.violationsStats?.current[severity] &&
							!violationsInfo.violationsStats?.removed[severity];
				if (isDisabled) {
					updatedQualityViolations[severity] = false;
				}
			}
			setQualityViolations(updatedQualityViolations);
		}
	}, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

	if (!owner && !name && !hash) return
	if (isLoading) return <LinearProgress color="primary" />;

	return (
		<>
			<Grid container display="flex" direction="column">
				<Grid container sx={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
					<Grid container display="flex" m={-1} sx={{ justifyContent: { xs: "center", md: "flex-start" } }}>
						{[...POSSIBLE_VIOLATIONS_SEVERITY].map((severity) => {
							const isDisabled = !violationsInfo.violationsStats?.current[severity] && !violationsInfo.violationsStats?.removed[severity];
							return <Grid item key={`key_${severity}`}>
								<Chip
									style={{ backgroundColor: "transparent" }}
									avatar={<Warning style={{ color: violationsColorIcons[severity] }} />}
									label={<Typography color="inherit">{capitalize(severity)}</Typography>}
								/>
								<Tooltip title={`There are no ${severity.toLowerCase()} violations`} disabled={!isDisabled} titleVariant="body2" placement="top">
									<Switch
										checked={!isDisabled && qualityViolations[severity]}
										disabled={isDisabled}
										onChange={() => {
											setQualityViolations({ ...qualityViolations, [severity]: !qualityViolations[severity] });
										// const parsed = queryString.parse(search);
										// parsed.critical = !qualityViolations.Critical;
										// navigate(queryString.stringifyUrl({ url: pathname, query: parsed }), { replace: true });
										}}
									/>
								</Tooltip>
							</Grid>
						})}
					</Grid>
					{Object.entries(mapOverviewToMetrics(filteredViolationsInfo)).map(([key, metrics]) => 
						<Grid container key={key} sx={{ padding: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
							{Object.entries(metrics).map(([key, metric]) => (
								<Grid item key={key} xs={12} sm={6} md={3}
									sx={{
										padding: "1rem",
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
									}}
								>
									<GeneralInfoTile
										key={key}
										content={key}
										number={Number.parseFloat(metric.main)}
										added={metric.added}
										removed={metric.removed}
										percent={metric.percent}
									/>
								</Grid>
							))}
						</Grid>
					)}
				</Grid>
				<Grid container sx={{display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }} >
					<Grid item hidden={!filePath} xs={12}sm="auto"sx={{ flex: "1 1 auto",textAlign: { xs: "center", sm: "left" } }} >
						<BackToFilesButton />
					</Grid>
					<Grid item xs={12} sm="auto" sx={{ ml: "auto", textAlign: { xs: "center", sm: "right" } }} >
						<Select
							size="medium"
							id="violationTypeFilter"
							name="violationTypeFilter"
							value={filteredViolation?.value || ""}
							options={violationOptions}
							onChange={(e) => {
								const currentQueryParams = queryString.parse(search); // Parse the existing query parameters
								const updatedQueryParams = {
									...currentQueryParams, // Spread the current query parameters
									violationType: e.target.value || null, // Add or overwrite the `filePath` parameter
									LS: undefined,
									LE: undefined,
								};
								const updatedUrl = queryString.stringifyUrl({ 
									url: pathname, 
									query: updatedQueryParams 
								});
								
								navigate(updatedUrl);

							}}
							sx={{
								width: { xs: "100%", sm: "auto" }, // Full width on small screens
								minWidth: "200px",
								textAlign: "left"
							}}
						>
							<MenuItem value="">{"All"}</MenuItem>
							{renderedOptions}
						</Select>
					</Grid>
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
								getAnnotations={getAnnotations}
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
				<Grid item hidden={filePath} xs={12}>
					<ViolationsTables
						violationsData={filteredViolationsInfo.violations}
						diff={showDiff}
						isError={isError}
					/>
				</Grid>
			</Grid>
		</>
	);
};

Violations.propTypes = {
	repository: PropTypes.object.isRequired,
	analysis: PropTypes.object.isRequired,
	hash: PropTypes.string.isRequired,
};

export default memo(Violations);
