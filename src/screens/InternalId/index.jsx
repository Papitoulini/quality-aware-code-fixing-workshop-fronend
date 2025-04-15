import { useState, useEffect, memo, lazy, Suspense, useMemo } from "react";
import { Tabs, Tab, Typography, Grid, CircularProgress, LinearProgress } from "@mui/material";
import { Troubleshoot, FileCopy, Lock, Shield, ErrorOutlineRounded } from "@mui/icons-material";
import { useLocation, useParams } from "react-router-dom";

import { useDocumentTitle, useSnackbar } from "#utils";
import { useTddFilename } from "#api";

const Metrics = lazy(() => import("./Metrics"));
const Violations = lazy(() => import("./Violations"));
const Duplicates = lazy(() => import("./Duplicates"));
const Vulnerabilities = lazy(() => import("./Vulnerabilities"));
const Sast = lazy(() => import("./Sast"));

const tabConfig = [
	{ label: "Metrics", value: "metrics", icon: <Troubleshoot /> },
	{ label: "Violations", value: "violations", icon: <ErrorOutlineRounded /> },
	{ label: "Duplicates", value: "duplicates", icon: <FileCopy /> },
	{ label: "Vulnerabilities", value: "vulnerabilities", icon: <Shield /> },
	{ label: "Sast", value: "sast", icon: <Lock /> },
];

const InternalId = () => {
	const { error } = useSnackbar();
	const { internalId } = useParams();
	const { search } = useLocation();
	const token = useMemo(() => new URLSearchParams(search).get("token"), [search]);
	const { response = {}, isError: isErrorRepositories, isLoading } = useTddFilename(internalId, token);
	const filename = useMemo(() => response?.filename, [response]);

	useEffect(() => {
		if (isErrorRepositories) error();
	}, [error, isErrorRepositories]);

	const [activeTab, setActiveTab] = useState("metrics");

	useDocumentTitle(filename);

	const renderTabContent = () => {
		switch (activeTab) {
		case "metrics": {
			return (
				<Suspense fallback={<div style={{ display: "flex", justifyContent: "center" }}><CircularProgress color="secondary" /></div>}>
					<Metrics />
				</Suspense>
			);
		}
		case "violations": {
			return (
				<Suspense fallback={<div style={{ display: "flex", justifyContent: "center" }}><CircularProgress color="secondary" /></div>}>
					<Violations />
				</Suspense>
			);
		}
		case "duplicates": {
			return (
				<Suspense fallback={<div style={{ display: "flex", justifyContent: "center" }}><CircularProgress color="secondary" /></div>}>
					<Duplicates />
				</Suspense>
			);
		}
		case "vulnerabilities": {
			return (
				<Suspense fallback={<div style={{ display: "flex", justifyContent: "center" }}><CircularProgress color="secondary" /></div>}>
					<Vulnerabilities />
				</Suspense>
			);
		}
		case "sast": {
			return (
				<Suspense fallback={<div style={{ display: "flex", justifyContent: "center" }}><CircularProgress color="secondary" /></div>}>
					<Sast />
				</Suspense>
			);
		}
		default: {
			return null;
		}
		}
	};
	if (isLoading) return <LinearProgress color="primary" />;
	return (
		<>
			<section style={{ paddingTop: "1rem" }}>
				<div className="container">
					<Grid item container m={1} justifyContent="center" textAlign="left">
						<Typography variant="h4" width="100%">
							{filename ?? "Analysis not found"}
						</Typography>
					</Grid>
				</div>
			</section>
			<div className="container" style={{ flexGrow: "0", margin: "0 auto" }}>
				<Grid container direction="row" alignItems="flex-end">
					<Grid item sx={{ borderBottom: 1, borderColor: "divider" }}>
						<Tabs
							value={activeTab}
							variant="scrollable"
							onChange={(_, newValue) => setActiveTab(newValue)}
							aria-label="Repository Tabs"
						>
							{tabConfig.map((tab) => (
								<Tab
									key={tab.value}
									label={tab.label}
									value={tab.value}
									icon={tab.icon}
									disabled={!filename}
									aria-controls={`${tab.value}-tabpanel`}
									id={`${tab.value}-tab`}
									sx={{ pointerEvents: "auto" }}
								/>
							))}
						</Tabs>
					</Grid>
				</Grid>
			</div>
			<section style={{ padding: "2rem" }}>
				<div className="container">{renderTabContent()}</div>
			</section>
		</>
	);
};

export default memo(InternalId);
