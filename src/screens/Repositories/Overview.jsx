import { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { Grid, LinearProgress, Typography, Box, Divider } from "@mui/material";
import queryString from "query-string";
import { useNavigate, useLocation } from "react-router-dom";

import { useOverview } from "#api";
import { mapOverviewToMetrics } from "#utils";

import MetricCard from "../../components/MetricCard";

const Overview = (props) => {
	const { repository, hash } = props;
	const { owner, name } = repository || {};
	const { overview = {}, isLoading = false } = useOverview(hash, repository || {});
	const navigate = useNavigate();
	const { search, pathname } = useLocation();

	const parsedQuery = useMemo(() => queryString.parse(search), [search]);

	if (!owner && !name && !hash) return null;
	if (isLoading) return <LinearProgress color="primary" />;

	return (
		<Box width="100%" display="flex" justifyContent="center" alignItems="center" flexDirection="column">
			<Grid	container sx={{ width: { xs: "100%", sm: "90%", md: "80%", lg: "70%"}}} display="flex" flexDirection="column">
				<Typography textAlign="center" sx={{typography: {xs: "h4", sm: "h3", md: "h2"}}} mb={2} >Commit Changes</Typography>
				<Grid
					container
					display="flex"
					justifyContent="center"
					spacing={5}
					alignSelf="center"
				>
					{Object.entries(mapOverviewToMetrics(overview)).filter(([key]) => key !== "coverage" && key !== "sast").map(
						([key, metrics]) => 
							<Grid item key={key} xs={12} sm={6}>
								<MetricCard
									title={key}
									metrics={metrics}
									parsedQuery={parsedQuery}
									pathname={pathname}
									navigate={navigate}
								/>
							</Grid>
					)}
				</Grid>
				<Grid item my={2} sx={{ width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
					<Divider orientation="horizontal" flexItem sx={{ mx: 1, height: "100%" }} />
				</Grid>
				<Grid
					container
					display="flex"
					justifyContent="center"
					spacing={5}
					alignSelf="center"
				>
					<Grid item xs={12} sm={6}>
						<MetricCard
							title="coverage"
							metrics={overview?.coverage?.current || {}}
							parsedQuery={parsedQuery}
							pathname={pathname}
							navigate={navigate}
						/>
					</Grid>
				</Grid>
			</Grid>

		</Box>
	);
};

Overview.propTypes = {
	repository: PropTypes.object.isRequired,
	showDiff: PropTypes.object.isRequired,
	hash: PropTypes.string.isRequired,
};

export default memo(Overview);
