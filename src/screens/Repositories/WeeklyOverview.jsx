import { useState, useCallback, useEffect, memo, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import { Typography, Grid, LinearProgress, MenuItem, Chip, Switch, Avatar, Link as MaterialLink, Box, CardContent, Card, CardHeader } from "@mui/material";
import { Warning, MenuBook, Cached, Build, Security, TrendingUp, TrendingDown, TrendingFlat } from "@mui/icons-material";
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
import SastTables from "../../components/SastTables.jsx";
import Tooltip from "../../components/Tooltip.jsx";

import { useSast, useFileContent } from "#api";
import { mapOverviewToMetrics, POSSIBLE_SAST_SEVERITY, capitalize, getColorForQualityScore, convertQualityScoreToLetter, dayjs, constructCommitHref, jwt, GRADE_RANK} from "#utils";
import NoAvailableData from "../../components/NoAvailableData.jsx";

const filterStats = (sectionValue, qualityKeys) => {
	return  Object.fromEntries(
		Object.entries(sectionValue).filter(([key, _]) => {
			return qualityKeys[key]
		})
	);
};

const mapMetricsNames = {
	maintainabilityScore: { title: "maintainability", icon: <Build sx={{ color: "grey.700", display: "block" }} /> },
	readabilityScore: { title: "readability", icon: <MenuBook sx={{ color: "grey.700", display: "block" }} />},
	reusabilityScore: { title: "reusability", icon: <Cached sx={{ color: "grey.700", display: "block" }} />},
	securityScore: { title: "security", icon: <Security sx={{ color: "grey.700", display: "block" }} />},
}

const Sast = (props) => {
	const { repository, hash, showDiff = false } = props;
	const { owner, name, language } = repository || {};
	const navigate = useNavigate();
	const theme = useTheme();
	const { search, pathname } = useLocation();
	const [fileName, setFileName] = useState(null)
	const filePath = fileName && decodeURIComponent(fileName);
	const { fileContent = "" } = useFileContent(owner, name, filePath, hash);
	const [filteredSast, setFilteredSast] = useState();
	const editorRef = useRef(null);
	const { overview = {}, isLoading, isError } = useSast(hash, repository || {});

	const sastColorIcons = {
		INFO: theme.palette.yellow[700],
		WARNING: theme.palette.deepOrange[300],
		ERROR: theme.palette.red[900],
	} 

	const { qualitySast, setQualitySast } = useGlobalState(useCallback((e) => ({
		qualitySast: e.qualitySast,
		setQualitySast: e.setQualitySast,
	}), []), shallow);

	// Apply filtering based on qualityViolations and filteredViolation
	const filteredSastInfo = useMemo(() => (
		{
			sast: Object.keys(overview?.sast?.current || {}).reduce((acc, severity) => {
				if (qualitySast[severity]) {
					acc[severity] = overview.sast.current[severity];
				}
				return acc;
			}, {}),
			sastStats: Object.fromEntries(
				Object.entries(overview.sastStats || {}).map(([sectionKey, sectionValue]) => {
					if (typeof sectionValue === 'object' && sectionValue !== null) { 
						return [sectionKey, filterStats(sectionValue, qualitySast)];
					}
					return [sectionKey, sectionValue];
				})
			)
		}
	), [qualitySast, overview.sast, overview.sastStats]);

	const allSast = useMemo(() => {
		const {introduced = {}, removed = {}, current = {}}  = filteredSastInfo.sast || {};
		const someSast = showDiff ? { ...introduced, ...removed } : { ...current };
		return someSast
	}, [filteredSastInfo.sast, showDiff])

	const sastOptions = useMemo(() => {
		const uniqueCategories = [...new Set(Object.values(allSast).map((e) => e.category))];
		return uniqueCategories.map((el) => ({
			label: el,
			options: Object.values(allSast)
				.filter((value) => value.category === el)
				.map((ele) => ({ label: ele.title, value: ele.title })),
		}));
	}, [allSast]);

	const renderedOptions = useMemo(() => {
		return Object.values(allSast).map((sast) => {
			const validFilePaths = Array.isArray(sast?.files) ? sast.files : [];
			return (
				<MenuItem
					key={`${sast.label}_${sast.value}`}
					value={sast.value}
					disabled={filePath && !(validFilePaths.some((f) => f.filePath === filePath))}
				>
					<Typography sx={{ display: "flex", alignItems: "center" }}>
						<Warning
							titleAccess={sast?.severity}
							sx={{
								color: sast?.severity === "ERROR"
									? theme.palette.red[900]
									: sast?.severity === "WARNING"
										? theme.palette.deepOrange[300]
										: theme.palette.yellow[700],
							}}
						/>
							&nbsp;
						{sast.metadata.vulnerability_class[0]}
					</Typography>
				</MenuItem>
			);
		});
	}, [allSast, filePath, theme.palette.deepOrange, theme.palette.red, theme.palette.yellow]);

	useEffect(() => {
		const { sastType, fileName: fN } = queryString.parse(search);
		const vType = Object.values(allSast).find((e) => e.title === sastType);

		if (vType) {
			if (filteredSast?.value !== vType.title) setFilteredSast({ label: vType.title, value: vType.title });
		} else {
			setFilteredSast(null);
		}
		if (fN) setFileName(fN)
		else setFileName(null)
	}, [allSast, filteredSast?.value, search]);
	
	const diagnostics = useMemo(() => {
		let problems = [];
	
		if (filteredSastInfo.sast) {
			if (showDiff) {
			// // Process introduced violations (added)
			// 	if (filteredSastInfo.sast.introduced) {
			// 		const introduced = Object.entries(
			// 			filteredSastInfo.sast.introduced
			// 		);

			// 		for (const [key, metric] of introduced) {
			// 			for (const sast of metric.files.filter(
			// 				(e) => e.filePath === filePath
			// 			)) {
			// 				problems.push({
			// 					violation: key,
			// 					line: sast.line,
			// 					value: 1,
			// 					category: metric.category,
			// 					explanation: metric.explanation,
			// 					severity: metric.severity,
			// 					title: metric.title,
			// 					cat: 'violations',
			// 					status: 'introduced', // Added violations
			// 				});
			// 			}
			// 		}
			// 	}
			} else {
			// Process current violations
				if (filteredSastInfo.sast) {
					const current = Object.entries(filteredSastInfo.sast);
	
					for (const [severity, sasts] of current) {
						for (const [key, metric] of Object.entries(sasts)) {
							for (const sast of metric.filter(
								(e) => e.filepath === filePath
							)) {
								problems.push({
									// violation: key,
									line: sast.line.start.line,
									endLine: sast.line.end.line,
									value: 1,
									category: key,
									explanation: sast.message,
									severity,
									title: key,
									cat: 'sast',
									status: 'current',
								});
							}
						}
					}
				}
			}
		}
	
		return new Cycled(problems.sort(numberSmallToLarge((v) => v.line)));
	}, [filePath, filteredSastInfo.sast, showDiff]);

	const getAnnotations = useCallback(
		(view) =>
			[...diagnostics].map(({ explanation, line, endLine, severity }) => {
				return {
					message: explanation,
					severity: severity === "error" ? "error" : "warning",
					from: view.state.doc.line(line).from,
					to: view.state.doc.line(endLine).to,
				};
			}),
		[diagnostics]
	);

	useEffect(() => {
		// Ensure disabled states are synced with qualityViolations when data changes
		if (!isLoading) {
			const updatedQualitySast = { ...qualitySast };
			for (const severity of POSSIBLE_SAST_SEVERITY) {
				const isDisabled = !overview.sastStats?.current[severity] &&
							!overview.sastStats?.removed[severity];
				if (isDisabled) {
					updatedQualitySast[severity] = false;
				}
			}
			setQualitySast(updatedQualitySast);
		}
	}, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

	const velocityCell = useCallback((value, variant = "body1") => {
		if (value === undefined) return (<Typography variant={variant}>{"Calculating..."}</Typography>);
		if (!value) return (<Typography variant={variant}>{"Not available"}</Typography>);
		let tooltip = `Great job! Your score improved from ${value[1]} to ${value[0]}.`;
		let color = "green.500";
		let iconType = "up";
		if (GRADE_RANK[value[1]] < GRADE_RANK[value[0]]) {
			tooltip = `Your score dropped from ${value[1]} to ${value[0]}. Keep trying!`;
			color = "red.500";
			iconType = "down";
		} else if (GRADE_RANK[value[1]] === GRADE_RANK[value[0]]) {
			tooltip = "Your score remained the same compared to last week.";
			color = "grey.500";
			iconType = "flat";
		}

		return (
			<Tooltip title={tooltip}>
				<Typography variant={variant} sx={{ color, textAlign: "center" }}>
					{iconType === "up" && (<TrendingUp fontSize="inherit" />)}
					{iconType === "down" && (<TrendingDown fontSize="inherit" />)}
					{iconType === "flat" && (<TrendingFlat fontSize="inherit" />)}
				</Typography>
			</Tooltip>
		);
	}, []);

	if (!owner && !name && !hash) return
	if (isLoading) return <LinearProgress color="primary" />;
	if (isError) return <NoAvailableData/ >

	return (
		<>
			<Grid item container display="flex" justifyContent="center" sx={{ p: 1, mb: 3, borderRadius: 1 }}>
				<Box sx={{ flexDirection: {xs: "column", md: "row"}, p:3, display: "flex", gap:3, bgcolor: "grey.light", borderRadius: 1, justifyContent: "center", alignItems: "center" }}>
					<Box display="flex" flexDirection="column">
						<Typography variant="body1" sx={{ display: "inline-flex" }}>
							{"Commit: "} &nbsp;
							<MaterialLink
								underline="none"
								href={constructCommitHref(jwt.decode()?.type, { owner, name, vcType: "git" }, overview.metrics?.commits?.previews?.hash)}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Typography sx={{ display: "inline-flex" }}>
									{overview.metrics?.commits?.previews?.hash?.slice(0, 7)}
								</Typography>
							</MaterialLink>
						</Typography>
						<Typography variant="body2" sx={{ display: "inline-flex" }}>
							{"Authored At:"} &nbsp;
							<Typography
								color="primary"
								variant="body2"
								sx={{ display: "inline-flex" }}
							>
								{dayjs(overview.metrics?.commits?.previews?.authoredAt).fromNow()}
							</Typography>
						</Typography>
					</Box>
					{"to"}
					<Box display="flex" flexDirection="column">
						<Typography variant="body1" sx={{ display: "inline-flex" }}>
							{"Commit"} &nbsp;
							<MaterialLink
								underline="none"
								href={constructCommitHref(jwt.decode()?.type, { owner, name, vcType: "git" }, overview.metrics?.commits?.current?.hash)}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Typography sx={{ display: "inline-flex" }}>
									{overview.metrics?.commits?.current?.hash?.slice(0, 7)},
								</Typography>
							</MaterialLink>
						</Typography>
						<Typography variant="body2" sx={{ display: "inline-flex" }}>
							{"Authored At:"} &nbsp;
							<Typography
								color="primary"
								variant="body2"
								sx={{ display: "inline-flex" }}
							>
								{dayjs(overview.metrics?.commits?.current?.authoredAt).fromNow()}
							</Typography>
						</Typography>
					</Box>
				</Box>
			</Grid>
			<Grid container display="flex" direction="column">
				<Grid container direction="row" justifyContent="center" spacing={3} m={-1.5} mb={1} sx={{ "> .MuiGrid-item": { p: 1.5 } }}>
					<Grid item xs={12} md={4} lg={3}>
						<Card sx={{ boxShadow: 3,  height: "100%", transition: "background-color 0.3s ease" }} >
							<CardHeader
								title={"Overall"}
								sx={{
									padding: 1,
									backgroundColor: "primary.main",
								}}
								titleTypographyProps={{
									variant: "h6",
									align: "center",
									sx: { fontWeight: "bold", color: "white" },
								}}
							/>
							<CardContent>
								<Typography variant="h3" align="center" display="flex" alignItems="center" justifyContent="center" sx={{ gap: 2 }}>
									<Avatar
										sx={{
											width: (t) => t.spacing(10.5),
											height: (t) => t.spacing(10.5),
											bgcolor: getColorForQualityScore(overview?.metrics?.overallQualityScore.previews),
											display: "inline-flex",
											fontSize: "inherit",
										}}
									>
										{convertQualityScoreToLetter(overview?.metrics?.overallQualityScore.previews)}
									</Avatar>
									{velocityCell([
										convertQualityScoreToLetter(overview?.metrics?.overallQualityScore.previews),
										convertQualityScoreToLetter(overview?.metrics?.overallQualityScore.current)],
									"h4")}
								</Typography>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
				<Grid container direction="row" justifyContent="space-between" spacing={3} m={-1.5} mb={1} sx={{ "> .MuiGrid-item": { p: 1.5 } }}>
					{Object.entries(overview?.metrics?.characteristics || {}).map(([key, value]) => (
						<Grid item key={key} xs={12} md={6} lg={3} sx={{  position: "relative" }}>
							<Card sx={{ boxShadow: 3,  height: "100%", transition: "background-color 0.3s ease" }} >
								<CardHeader
									title={capitalize(mapMetricsNames[key].title)}
									sx={{
										padding: 1,
										backgroundColor: "primary.main",
									}}
									titleTypographyProps={{
										variant: "h6",
										align: "center",
										sx: { fontWeight: "bold", color: "white" },
									}}
								/>
								<CardContent>
									{mapMetricsNames[key].icon}
								
									<Typography variant="h3" align="center" display="flex" alignItems="center" justifyContent="center" sx={{ gap: 2 }}>
										<Avatar
											sx={{
												width: (t) => t.spacing(10.5),
												height: (t) => t.spacing(10.5),
												bgcolor: getColorForQualityScore(value.current),
												display: "inline-flex",
												fontSize: "inherit",
											}}
										>
											{convertQualityScoreToLetter(value.current)}
										</Avatar>
										{velocityCell([
											convertQualityScoreToLetter(value.previews),
											convertQualityScoreToLetter(value.current)],
										"h4")}
									</Typography>
								</CardContent>
							</Card>
						</Grid>)
					)}
				</Grid>
				<Grid container sx={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
					<Grid container display="flex" m={-1} sx={{ justifyContent: { xs: "center", md: "flex-start" } }}>
						{[...POSSIBLE_SAST_SEVERITY].map((severity) => {
							const isDisabled = (!overview.sastStats?.current[severity] && !overview.sastStats?.removed[severity]) || severity === "INFO";
							return <Grid item key={`key_${severity}`}>
								<Chip
									style={{ backgroundColor: "transparent" }}
									avatar={<Warning style={{ color: sastColorIcons[severity] }} />}
									label={<Typography color="inherit">{capitalize(severity)}</Typography>}
								/>
								<Tooltip title={`There are no ${severity.toLowerCase()} code vulnerabilities`} disabled={!isDisabled} titleVariant="body2" placement="top">
									<Switch
										checked={!isDisabled && qualitySast[severity]}
										disabled={isDisabled}
										onChange={() => {
											setQualitySast({ ...qualitySast, [severity]: !qualitySast[severity] });
											// const parsed = queryString.parse(search);
											// parsed.critical = !qualityViolations.Critical;
											// navigate(queryString.stringifyUrl({ url: pathname, query: parsed }), { replace: true });
										}}
									/>
								</Tooltip>
							</Grid>

						})}
					</Grid>
					{Object.entries(mapOverviewToMetrics(filteredSastInfo)).map(([key, metrics]) => 
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
							value={filteredSast?.value || ""}
							options={sastOptions}
							onChange={(e) => {
								const currentQueryParams = queryString.parse(search); // Parse the existing query parameters
								const updatedQueryParams = {
									...currentQueryParams, // Spread the current query parameters
									sastCategory: e.target.value || null, // Add or overwrite the `filePath` parameter
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
					<SastTables
						sastData={filteredSastInfo.sast}
						diff={showDiff}
					/>
				</Grid>
			</Grid>
		</>
	);
};

Sast.propTypes = {
	repository: PropTypes.object,
	hash: PropTypes.string.isRequired,
	showDiff: PropTypes.bool,
};

export default memo(Sast);