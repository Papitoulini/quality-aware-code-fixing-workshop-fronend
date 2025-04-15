import { memo, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Typography, Grid, LinearProgress, Avatar, CardContent, Card, CardHeader } from "@mui/material";
import { MenuBook, Cached, Build, Security } from "@mui/icons-material";

import { useTddMetrics } from "#api";
import { capitalize, getColorForQualityScore, convertQualityScoreToLetter} from "#utils";
import NoAvailableData from "../../components/NoAvailableData.jsx";

const mapMetricsNames = {
	maintainability: { title: "maintainability", icon: <Build sx={{ color: "grey.700", display: "block" }} /> },
	readability: { title: "readability", icon: <MenuBook sx={{ color: "grey.700", display: "block" }} />},
	reusability: { title: "reusability", icon: <Cached sx={{ color: "grey.700", display: "block" }} />},
	security: { title: "security", icon: <Security sx={{ color: "grey.700", display: "block" }} />},
}

const Metrics = () => {
	const { internalId } = useParams();
	const { search } = useLocation();
	const token = useMemo(() => new URLSearchParams(search).get("token"), [search]);
	const { data = {}, isLoading, isError } = useTddMetrics(internalId, token);
	const metrics = useMemo(() => data.metrics, [data]);

	if (isLoading) return <LinearProgress color="primary" />;
	if (isError) return <NoAvailableData />;

	return (
		<>
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
											bgcolor: getColorForQualityScore(metrics?.overall),
											display: "inline-flex",
											fontSize: "inherit",
										}}
									>
										{convertQualityScoreToLetter(metrics?.overall)}
									</Avatar>
								</Typography>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
				<Grid container direction="row" justifyContent="space-between" spacing={3} m={-1.5} mb={1} sx={{ "> .MuiGrid-item": { p: 1.5 } }}>
					{Object.entries(metrics?.characteristics || {}).map(([key, value]) => (
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
												bgcolor: getColorForQualityScore(value),
												display: "inline-flex",
												fontSize: "inherit",
											}}
										>
											{convertQualityScoreToLetter(value)}
										</Avatar>
									</Typography>
								</CardContent>
							</Card>
						</Grid>)
					)}
				</Grid>
			</Grid>
		</>
	);
};

export default memo(Metrics);
