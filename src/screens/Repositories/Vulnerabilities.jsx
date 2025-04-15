import { memo, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Grid, Typography, LinearProgress, Chip, Switch, Box } from "@mui/material";
import { Warning } from "@mui/icons-material";
import { shallow } from "zustand/shallow";
import useGlobalState from "../../use-global-state.js";
import { useTheme } from "@mui/material/styles";

import GeneralInfoTile from "../../components/GeneralInfoTile.jsx";
import VulnerabilitiesTables from "../../components/VulnerabilitiesTables.jsx";
import Tooltip from "../../components/Tooltip.jsx";

import { mapOverviewToMetrics, POSSIBLE_VULNERABILITIES_SEVERITY, capitalize } from "#utils";
import { useVulnerabilities } from "#api";

const filterVulnerabilities = (sectionValue, qualityVulnerabilities) => {
	return sectionValue.filter((sV) => qualityVulnerabilities[sV.severity]);
};

const filterVulnerabilitiesStats = (sectionValue, qualityVulnerabilities) => {
	return Object.fromEntries(
		Object.entries(sectionValue).filter(([key, _]) => {
			return qualityVulnerabilities[key];
		})
	);
};

const Vulnerabilities = (props) => {
	const { repository, hash, showDiff } = props;
	const { owner, name } = repository || {};
	const theme = useTheme();

	const { vulnerabilitiesInfo = {}, isLoading, isError } = useVulnerabilities(hash, repository || {});

	const vulnerabilitiesColorIcons = {
		low: theme.palette.yellow[500],
		moderate: theme.palette.yellow[700],
		high: theme.palette.deepOrange[300],
		critical: theme.palette.red[900],
	} 

	const { qualityVulnerabilities, setQualityVulnerabilities } = useGlobalState(
		useCallback(
			(state) => ({
				qualityVulnerabilities: state.qualityVulnerabilities,
				setQualityVulnerabilities: state.setQualityVulnerabilities,
			}),
			[]
		),
		shallow
	);

	// Apply filtering based on qualityVulnerabilities and filteredViolation
	const filteredVulnerabilitiesInfo = useMemo(() => ({
		vulnerabilities: Object.fromEntries(
			Object.entries(vulnerabilitiesInfo.vulnerabilities || {}).map(([sectionKey, sectionValue]) => {
				if (typeof sectionValue === 'object' && sectionValue !== null) {
					return [sectionKey, filterVulnerabilities(sectionValue, qualityVulnerabilities)];
				}
				return [sectionKey, sectionValue];
			})
		),
		vulnerabilitiesStats: Object.fromEntries(
			Object.entries(vulnerabilitiesInfo.vulnerabilitiesStats || {}).map(([sectionKey, sectionValue]) => {
				if (typeof sectionValue === 'object' && sectionValue !== null) {
					return [sectionKey, filterVulnerabilitiesStats(sectionValue, qualityVulnerabilities)];
				}
				return [sectionKey, sectionValue];
			})
		)
	}), [qualityVulnerabilities, vulnerabilitiesInfo.vulnerabilities, vulnerabilitiesInfo.vulnerabilitiesStats]);

	// Memoize metrics to avoid unnecessary recalculations
	const metrics = useMemo(() => mapOverviewToMetrics(filteredVulnerabilitiesInfo), [filteredVulnerabilitiesInfo]);

	useEffect(() => {
		// Ensure disabled states are synced with qualityViolations when data changes
		if (!isLoading) {
			const updatedQualityVulnerabilities = { ...qualityVulnerabilities };
			for (const severity of POSSIBLE_VULNERABILITIES_SEVERITY) {
				const isDisabled = !vulnerabilitiesInfo.vulnerabilitiesStats?.current[severity] &&
							!vulnerabilitiesInfo.vulnerabilitiesStats?.removed[severity];
				if (isDisabled) {
					updatedQualityVulnerabilities[severity] = false;
				}
			}
			setQualityVulnerabilities(updatedQualityVulnerabilities);
		}
	}, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

	// Early exit if essential props are missing
	if (!owner && !name && !hash) return null;
	if (isLoading) return <LinearProgress color="primary" />;

	return (
		<Grid container  display="flex" direction="column">
			<Grid container sx={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
				<Grid container display="flex" m={-1} sx={{ justifyContent: { xs: "center", md: "flex-start" } }}>
					{[...POSSIBLE_VULNERABILITIES_SEVERITY].map((severity) => {
						const isDisabled = !vulnerabilitiesInfo.vulnerabilitiesStats?.current[severity] && !vulnerabilitiesInfo.vulnerabilitiesStats?.removed[severity];
						return <Grid item key={`key_${severity}`}>
							<Chip
								style={{ backgroundColor: "transparent" }}
								avatar={<Warning style={{ color: vulnerabilitiesColorIcons[severity] }} />}
								label={<Typography color="inherit">{capitalize(severity)}</Typography>}
							/>
							<Tooltip title={`There are no ${severity.toLowerCase()} vulnerabilities`} disabled={!isDisabled} titleVariant="body2" placement="top">
								<Switch
									checked={!isDisabled && qualityVulnerabilities[severity]}
									disabled={isDisabled}
									onChange={() => {
										setQualityVulnerabilities({ ...qualityVulnerabilities, [severity]: !qualityVulnerabilities[severity] });
									// const parsed = queryString.parse(search);
									// parsed.critical = !qualityViolations.Critical;
									// navigate(queryString.stringifyUrl({ url: pathname, query: parsed }), { replace: true });
									}}
								/>
							</Tooltip>
						</Grid>
					})}
				</Grid>
				{Object.entries(metrics).map(([key, metrics]) => 
					<Grid container key={key} sx={{ padding: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
						{Object.entries(metrics).map(([key, metric]) => (
							<Grid item key={key} xs={12} sm={6} md={4} lg={3} xl={2}
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
			{/* Vulnerabilities Tables */}
			<Grid item md={6} xs={12}>
				<Box sx={{ overflowX: 'auto' }}>
					<VulnerabilitiesTables
						vulnerabilitiesData={filteredVulnerabilitiesInfo.vulnerabilities}
						diff={showDiff}
						isError={isError}
					/>
				</Box>
			</Grid>
		</Grid>
	);
};

Vulnerabilities.propTypes = {
	repository: PropTypes.object,
	hash: PropTypes.string.isRequired,
	showDiff: PropTypes.bool,
};

export default memo(Vulnerabilities);
