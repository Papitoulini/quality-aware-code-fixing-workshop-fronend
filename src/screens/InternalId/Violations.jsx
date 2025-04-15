import { useCallback, useEffect, memo, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
	Typography,
	Grid,
	LinearProgress,
	Chip,
	Switch,
} from "@mui/material";
import { Warning } from "@mui/icons-material";
import useGlobalState from "../../use-global-state.js";
import { shallow } from "zustand/shallow";
import { useTheme } from "@mui/material/styles";

import GeneralInfoTile from "../../components/GeneralInfoTile.jsx";
import Tooltip from "../../components/Tooltip.jsx";

import { useTddViolations } from "#api";
import { mapOverviewToMetrics, POSSIBLE_VIOLATIONS_SEVERITY, capitalize } from "#utils";
import ViolationsTables from "../../components/ViolationsTables.jsx";

const filterViolations = (sectionValue, qualityViolations) => {
	return Object.fromEntries(
		Object.entries(sectionValue).filter(([_, violation]) => {
			// 1. Category Filter
			if (qualityViolations.Category && violation.category !== qualityViolations.Category) return false;
			// 2. Severity Filter
			if (!qualityViolations[violation.severity]) return false;
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

const Violations = () => {
	const theme = useTheme();
	const { internalId } = useParams();
	const { search } = useLocation();
	const token = useMemo(() => new URLSearchParams(search).get("token"), [search]);
	const { data = {}, isLoading } = useTddViolations(internalId, token);
	const violationsInfo = useMemo(() => data.violations, [data]);

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
				Object.entries(violationsInfo?.violations || {}).map(([sectionKey, sectionValue]) => {
					if (typeof sectionValue === 'object' && sectionValue !== null) {
						return [sectionKey, filterViolations(sectionValue, qualityViolations)];
					}
					return [sectionKey, sectionValue];
				})
			),
			violationsStats: Object.fromEntries(
				Object.entries(violationsInfo?.violationsStats || {}).map(([sectionKey, sectionValue]) => {
					if (typeof sectionValue === 'object' && sectionValue !== null) { 
						return [sectionKey, filterViolationsStats(sectionValue, qualityViolations)];
					}
					return [sectionKey, sectionValue];
				})
			)
		}
	), [violationsInfo, qualityViolations]);

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
				<Grid item xs={12}>
					<ViolationsTables
						tableDisabled
						violationsData={filteredViolationsInfo.violations}
					/>
				</Grid>
			</Grid>
		</>
	);
};

export default memo(Violations);
