// External.jsx
import { useState, useCallback, useEffect, memo, lazy, Suspense, useMemo } from "react";
import { Tabs, Tab, Typography, Grid, Box, Link as MaterialLink, TextField, Autocomplete, Switch, CircularProgress } from "@mui/material";
import { Pageview, FileCopy, BarChart, Shield, Security, ErrorOutlineRounded } from "@mui/icons-material";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import queryString from "query-string";
import { useTheme } from "@mui/material/styles";

import { jwt, dayjs, useDocumentTitle, constructCommitHref, useSnackbar } from "#utils";
import { useCommit, useRepositories } from "#api";
import Tooltip from "../../components/Tooltip.jsx";

const Vulnerabilities = lazy(() => import("./Vulnerabilities"));
const Violations = lazy(() => import("./Violations"));
const Duplicates = lazy(() => import("./Duplicates"));
const Overview = lazy(() => import("./Overview"));
const Coverage = lazy(() => import("./Coverage"));
const WeeklyOverview = lazy(() => import("./WeeklyOverview"));

const tabConfig = [
	{ label: "Overview", value: "overview", icon: <Pageview /> },
	{ label: "Duplicates", value: "duplicates", icon: <FileCopy /> },
	{ label: "Violations", value: "violations", icon: <ErrorOutlineRounded /> },
	{ label: "Vulnerabilities", value: "vulnerabilities", icon: <Shield /> },
	{ label: "Coverage", value: "coverage", icon: <BarChart /> },
	{ label: "WeeklyOverview", value: "weeklyoverview", icon: <Security /> },
];

const noDiffTabs = new Set(["coverage", "overview", "weeklyoverview"]);

const formatOptionLabel = (option) => {
	const ownerNameRoot = [option.owner, option.name, option.root] .filter(Boolean).join('/');
	const details = [option.language, option.productionBranch].filter(Boolean).join(' - ');
	return details ? `${ownerNameRoot} - ${details}` : ownerNameRoot;
};

const Repositories = () => {
	const navigate = useNavigate();
	const { error } = useSnackbar();
	const { search, pathname } = useLocation();
	const { owner: rawOwner, name: rawName, hash = null } = useParams();
	const owner = decodeURIComponent(rawOwner || "");
	const name = decodeURIComponent(rawName || "");
	const { repositories = [], isError: isErrorRepositories, isLoading } = useRepositories();
	const parsedQuery = useMemo(() => queryString.parse(search), [search]);
	const repository = useMemo(() => {
		const selected = repositories?.find(repo =>
			repo.owner === owner &&
			repo.name === name &&
			(parsedQuery.root ? repo.root === parsedQuery.root : true) &&
			(parsedQuery.language ? repo.language === parsedQuery.language : true) &&
			(parsedQuery.productionBranch ? repo.productionBranch === parsedQuery.productionBranch : true) &&
			(parsedQuery.csProjects ? JSON.stringify(repo.csProjects || []) === JSON.stringify(parsedQuery.csProjects) : true)
		);

		let sanitizedRepository = selected;

		if (selected) {
			sanitizedRepository = { ...selected };
			const queryKeys = ['root', 'language', 'productionBranch', 'csProjects'];
			for (const key of queryKeys) {
				if (!(key in parsedQuery && parsedQuery[key] !== undefined)) delete sanitizedRepository[key];
			}
		}
		
		return sanitizedRepository || null;
	}, [repositories, owner, name, parsedQuery]);

	const { commit = {}, isError: isErrorCommit } = useCommit(hash, repository || { owner, name });
	const location = useLocation();
	const theme = useTheme();

	useEffect(() => {
		if (isErrorRepositories) error();
	}, [error, isErrorRepositories, isErrorCommit, navigate]);

	const [activeTab, setActiveTab] = useState(parsedQuery.tab || "overview");
	const [showDiff, setShowDiff] = useState(parsedQuery.showDiff !== 'false');

	useDocumentTitle(owner && name && `${owner}/${name}`);

	useEffect(() => {
		const parsed = queryString.parse(search);
		if (parsed.tab && parsed.tab !== activeTab) setActiveTab(parsed.tab)
	}, [activeTab, search]);

	const updatedUrl = useMemo((() => {
		const queryParams = {
			...parsedQuery,
			selectedInstance: undefined,
			LS: undefined,
			LE: undefined,
			tab: parsedQuery.tab || "overview",
		};
		return queryString.stringifyUrl({ 
			url: `/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`, 
			query: queryParams 
		});
	}),[name, owner, parsedQuery])

	const handleRepoChange = useCallback((event, value) => {
		if (value) {
			const queryParams = {
				language: value.language,
				root: value.root,
				csProjects: value.csProjects,
				productionBranch: value.productionBranch,
				selectedInstance: undefined,
				LS: undefined,
				LE: undefined,
				tab: parsedQuery.tab || "overview",
			};
			const updatedUrl = queryString.stringifyUrl({ 
				url: `/${encodeURIComponent(value.owner)}/${encodeURIComponent(value.name)}`, 
				query: queryParams 
			});
			navigate(updatedUrl);
		}
	}, [navigate, parsedQuery.tab]);

	const handleTabChange = useCallback((_, newValue) => {
		const currentQueryParams = {
			...parsedQuery, // Spread the current query parameters
			tab: newValue, // Add or overwrite the `filePath` parameter
			selectedInstance: undefined,
			LS: undefined,
			LE: undefined,
		};
		const updatedUrl = queryString.stringifyUrl({ 
			url: pathname, 
			query: currentQueryParams 
		});
		navigate(updatedUrl);
	}, [navigate, pathname, parsedQuery]);

	const handleShowDiffToggle = useCallback(() => {
		setShowDiff((p) => !p)
		const updatedQueryParams = { ...parsedQuery, showDiff: !showDiff };
		const updatedUrl = queryString.stringifyUrl({ 
			url: pathname, 
			query: updatedQueryParams 
		});
		navigate(updatedUrl);
	}, [navigate, parsedQuery, pathname, showDiff]);

	useEffect(() => {
		if (owner && name && !hash && commit?.hash) {
			const newPathname = `${location.pathname}/${commit.hash}`;
			const currentQueryParams = queryString.parse(search);
			const updatedUrl = queryString.stringifyUrl({ 
				url: newPathname, 
				query: currentQueryParams 
			});
			navigate(updatedUrl);
		}
	}, [commit, hash, location.pathname, name, navigate, owner, search]);

	const commonProps = { repository, hash, showDiff };

	const renderTabContent = () => {
		switch (activeTab) {
		case "overview": {
			return (
				<Suspense fallback={<div style={{ display: "flex", justifyContent: "center" }}><CircularProgress color="secondary" /></div>}>
					<Overview {...commonProps} />
				</Suspense>
			);
		}
		case "coverage": {
			return (
				<Suspense fallback={<div style={{ display: "flex", justifyContent: "center" }}><CircularProgress color="secondary" /></div>}>
					<Coverage {...commonProps} />
				</Suspense>
			);
		}
		case "violations": {
			return (
				<Suspense fallback={<div style={{ display: "flex", justifyContent: "center" }}><CircularProgress color="secondary" /></div>}>
					<Violations {...commonProps} />
				</Suspense>
			);
		}
		case "vulnerabilities": {
			return (
				<Suspense fallback={<div style={{ display: "flex", justifyContent: "center" }}><CircularProgress color="secondary" /></div>}>
					<Vulnerabilities {...commonProps} />
				</Suspense>
			);
		}
		case "duplicates": {
			return (
				<Suspense fallback={<div style={{ display: "flex", justifyContent: "center" }}><CircularProgress color="secondary" /></div>}>
					<Duplicates {...commonProps} />
				</Suspense>
			);
		}
		case "weeklyoverview": {
			return (
				<Suspense fallback={<div style={{ display: "flex", justifyContent: "center" }}><CircularProgress color="secondary" /></div>}>
					<WeeklyOverview {...commonProps } showDiff={false} />
				</Suspense>
			);
		}
		default: {
			return null;
		}
		}
	};
	return (
		<>
			<section style={{ paddingTop: "1rem" }}>
				<div className="container">
					<Grid item container m={1} justifyContent="center" alignItems="center">
						<Autocomplete
							options={repositories?.sort((a, b) => dayjs(b.lastUpdate).valueOf() - dayjs(a.lastUpdate).valueOf()) || []}
							getOptionLabel={(option) => formatOptionLabel(option)}
							groupBy={(option) => `${option.owner}/${option.name}`}
							value={repository}
							renderInput={(params) => (
								<TextField
									{...params}
									label={repository? "Repository" : "Select Repository"}
									error={!isLoading && !repository} // Highlight input with red border if error exists
									helperText={!isLoading && !repository ? 'No repository selected' : ''} // Display error message if error exists	variant="outlined"
									InputProps={{
										...params.InputProps,
										endAdornment: (
											<>
												{isLoading ? (
													<CircularProgress
														color="secondary"
														size={20}
													/>
												) : null}
												{params.InputProps.endAdornment}
											</>
										),
									}}
								/>
							)}
							renderGroup={(params) => (
								<Box key={params.key} sx={{ bgcolor: 'background.paper' }}>
									<Typography
										variant="subtitle2"
										sx={{ padding: '8px 10px', backgroundColor: 'grey.200' }}
									>
										{params.group}
									</Typography>
									{params.children}
								</Box>
							)}
							renderOption={(props, option) => (
								<li {...props} key={option.id}>
									<Box>
										<Typography variant="body1">{`${option.owner}/${option.name}`}</Typography>
										<Typography variant="body2" color="text.secondary">
											{`Branch: ${option.productionBranch} | Language: ${option.language} | Root: ${option.root}`}
										</Typography>
									</Box>
								</li>
							)}
							style={{ width: 400 }}
							onChange={handleRepoChange}
							isOptionEqualToValue={(option, value) => option.id === value?.id}
						/>
					</Grid>
					{noDiffTabs.has(activeTab) || activeTab !== "overview" && (
						<Grid item container m={1} justifyContent="center" alignItems="center">
							<Typography>{"Commit Analysis"}</Typography>
							<Switch 
								checked={!showDiff} 
								onChange={handleShowDiffToggle} 
								name="showDiffToggle" 
								color="primary" 
							/>
							<Typography>{"Bigger Picture"}</Typography>
						</Grid>
					)}
					<Grid item container m={1} justifyContent="center" textAlign="left">
						<Typography variant="h4" width="100%">
							{repository 
								? 
								<MaterialLink
									// variant="body1"
									underline="none"
									component={Link}
									sx={{ overflow: 'auto'}}
									to={updatedUrl}
								>
									{`${repository.name}${(repository.root === "." || !repository.root) ? "" : `/${repository.root.replace(/^\//, "")}`}`}

								</MaterialLink>
								: "Please select a repository..."
							}
						</Typography>
					</Grid>
				</div>
			</section>
			<div className="container" style={{ flexGrow: "0", margin: "0 auto" }}>
				<Grid container direction="row" alignItems="flex-end">
					<Grid item xs={12} md={12} lg={activeTab === "weeklyoverview"? 12 : 9} sx={{ borderBottom: 1, borderColor: "divider" }}>
						<Tabs
							value={activeTab}
							variant="scrollable"
							onChange={handleTabChange}
							aria-label="Repository Tabs"
						>
							{tabConfig.map((tab) => {
								const isNoDiffTab = tab.value === "coverage";

								return (
									<Tab
										key={tab.value}
										label={
											<Tooltip
												key={tab.value}
												title="Commit differences are not available for this view"
												arrow
												disabled={!isNoDiffTab}
											>
												{tab.label} {isNoDiffTab && "(!)"}
											</Tooltip>
										}
										value={tab.value}
										icon={tab.icon}
										disabled={!repository}
										aria-controls={`${tab.value}-tabpanel`}
										id={`${tab.value}-tab`}
										sx={{
											pointerEvents: "auto",
											// Apply a subtle background and text color difference for "no diff" tabs
											...(isNoDiffTab && {
												backgroundColor: theme.palette.action.hover,
												color: theme.palette.text.secondary,
												"&.Mui-selected": {
													backgroundColor: theme.palette.action.selected,
													color: theme.palette.text.primary,
												},
											}),
										}}
									/>
								);
							})}
						</Tabs>
					</Grid>
					<Grid item hidden={activeTab === "weeklyoverview"} sx={{ p: 1, bgcolor: "grey.light", borderRadius: 1 }} xs={12} md={12} lg={3}>
						<Box
							sx={{
								width: "100%",
								display: "flex",
								flexDirection: { lg: "column", md: "row", xs: "column" },
								alignItems: { lg: "flex-end", md: "center" },
								justifyContent: "space-between",
								textAlign: { lg: "right", md: "center" },
							}}
						>
							<Box style={{display: "flex", gap:5}}>
								{commit.parent && showDiff && !noDiffTabs.has(activeTab) && (
									<Typography variant="body1" sx={{ display: "inline-flex" }}>
										{"parent"} &nbsp;
										<MaterialLink
											underline="none"
											href={constructCommitHref(jwt.decode()?.type, { owner, name, vcType: "git" }, commit.parent)}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Typography sx={{ display: "inline-flex" }}>
												{commit.parent.slice(0, 7)},
											</Typography>
										</MaterialLink>
									</Typography>
								)}
								{hash && (
									<Typography variant="body1" sx={{ display: "inline-flex" }}>
										{"commit"} &nbsp;
										<MaterialLink
											underline="none"
											href={constructCommitHref(jwt.decode()?.type, { owner, name, vcType: "git" }, hash)}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Typography sx={{ display: "inline-flex" }}>
												{hash.slice(0, 7)}
											</Typography>
										</MaterialLink>
									</Typography>
								)}
							</Box>
							<Box>
								<Typography variant="body2" sx={{ display: "inline-flex" }}>
									{"Authored At:"} &nbsp;
								</Typography>
								{commit.authoredAt ? (
									<Typography
										color="primary"
										variant="body2"
										sx={{ display: "inline-flex" }}
									>
										{dayjs(commit.authoredAt).fromNow()}
									</Typography>
								) : (
									"-"
								)}
							</Box>
						</Box>
					</Grid>
				</Grid>
			</div>
			<section style={{ padding: "2rem" }}>
				<div className="container">{renderTabContent()}</div>
			</section>
		</>
	);
};

export default memo(Repositories);
