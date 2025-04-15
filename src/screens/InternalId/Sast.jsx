import { useCallback, useEffect, memo, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Typography, Grid, LinearProgress, Chip, Switch } from "@mui/material";
import { Warning } from "@mui/icons-material";
import useGlobalState from "../../use-global-state.js";
import { shallow } from "zustand/shallow";
import { useTheme } from "@mui/material/styles";
import GeneralInfoTile from "../../components/GeneralInfoTile.jsx";
import SastTables from "../../components/SastTables.jsx";
import Tooltip from "../../components/Tooltip.jsx";

import { useTddSast } from "#api";
import { mapOverviewToMetrics, POSSIBLE_SAST_SEVERITY, capitalize } from "#utils";

const filterStats = (sectionValue, qualityKeys) => {
	return  Object.fromEntries(
		Object.entries(sectionValue).filter(([key, _]) => {
			return qualityKeys[key]
		})
	);
};

const Sast = () => {
	const theme = useTheme();
	const { internalId } = useParams();
	const { search } = useLocation();
	const token = useMemo(() => new URLSearchParams(search).get("token"), [search]);
	const { data = {}, isLoading } = useTddSast(internalId, token);
	const sastInfo = useMemo(() => data.sast, [data]);

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
			sast: Object.keys(sastInfo?.sast?.current || {}).reduce((acc, severity) => {
				if (qualitySast[severity]) {
					acc[severity] = sastInfo.sast.current[severity];
				}
				return acc;
			}, {}),
			sastStats: Object.fromEntries(
				Object.entries(sastInfo?.sastStats || {}).map(([sectionKey, sectionValue]) => {
					if (typeof sectionValue === 'object' && sectionValue !== null) { 
						return [sectionKey, filterStats(sectionValue, qualitySast)];
					}
					return [sectionKey, sectionValue];
				})
			)
		}
	), [qualitySast, sastInfo?.sast, sastInfo?.sastStats]);

	useEffect(() => {
		// Ensure disabled states are synced with qualityViolations when data changes
		if (!isLoading) {
			const updatedQualitySast = { ...qualitySast };
			for (const severity of POSSIBLE_SAST_SEVERITY) {
				const isDisabled = !sastInfo?.sastStats?.current[severity] &&
							!sastInfo?.sastStats?.removed[severity];
				if (isDisabled) {
					updatedQualitySast[severity] = false;
				}
			}
			setQualitySast(updatedQualitySast);
		}
	}, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

	if (isLoading) return <LinearProgress color="primary" />;

	return (
		<>
			<Grid container display="flex" direction="column">
				<Grid container sx={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
					<Grid container display="flex" m={-1} sx={{ justifyContent: { xs: "center", md: "flex-start" } }}>
						{[...POSSIBLE_SAST_SEVERITY].map((severity) => {
							const isDisabled = (!sastInfo?.sastStats?.current[severity] && !sastInfo?.sastStats?.removed[severity]) || severity === "INFO";
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
				<Grid item xs={12}>
					<SastTables
						tableDisabled
						sastData={filteredSastInfo.sast}
					/>
				</Grid>
			</Grid>
		</>
	);
};

export default memo(Sast);