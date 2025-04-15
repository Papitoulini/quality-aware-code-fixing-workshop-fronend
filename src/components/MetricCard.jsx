import { memo } from "react";
import { CardHeader, Grid, Divider,  Card, CardActionArea, CardContent, Typography, Box } from "@mui/material";
import queryString from "query-string";

import { formatTileNumber, capitalize  } from "#utils";

function toPercentage(str) {
	// Parse the string to a float
	const num = Number.parseFloat(str);
  
	// If it's not a valid number, default to 0%
	if (Number.isNaN(num)) return "0%";
  
	// Round the number and return it with a "%" sign
	return `${Math.round(num)}%`;
}

const MetricCard = memo(({ title, metrics, parsedQuery, pathname, navigate }) => {
	const handleClick = () => {
		const currentQueryParams = {
			...parsedQuery,
			tab: title.toLowerCase(),
			selectedInstance: undefined,
			LS: undefined,
			LE: undefined,
		};
		navigate(queryString.stringifyUrl({ url: pathname, query: currentQueryParams }));
	};

	return (
		<Card sx={{ 
			height: '100%',
			display: 'flex',
			flexDirection: 'column',
			boxShadow: 3,
			minHeight: 250,
			width: "100%" // Set minimum height for all cards
		}}>
			<CardHeader
				title={capitalize(title)}
				sx={{ padding: 1, backgroundColor: "primary.main" }}
				titleTypographyProps={{
					variant: "h6",
					align: "center",
					sx: { fontWeight: "bold", color: "white" },
				}}
			/>
			<CardActionArea onClick={handleClick} sx={{ flexGrow: 1 }}>
				<CardContent sx={{ 
					display: 'flex', 
					flexDirection: 'column', 
					justifyContent: 'center', 
					height: '100%',
					width: '100%',
				}}>
					{Object.values(metrics).every(m => m.removed === 0 && m.added === 0) ? (
						<Typography align="center">No Changes detected!</Typography>
					) : (
						<Grid container display="flex" justifyContent="center">
							<Grid item sx={{ textAlign: "start" }}>
								<Box sx={{ height: "1.3rem" }} />
								{Object.entries(metrics).map(([metricKey]) => (
									<Typography key={metricKey} sx={{ marginBottom: 1 }}>
										{capitalize(metricKey)}
									</Typography>
								))}
							</Grid>
							<Grid item sx={{ minWidth: "3rem", textAlign: "center" }}>
								<Typography variant="body2" fontWeight="bold" color="grey.dark">{title === "coverage" ? "Current" : "Added"}</Typography>
								{Object.entries(metrics).map(([metricKey, metric]) => (
									<Typography key={metricKey} sx={{ color: metric.added ? ( metric.added === 0 ? "black" : "error.main") : "primary.main", marginBottom: 1 }}>
										{(metric.added > 0 ? "+" : "") + metric.coverage ? toPercentage(metric.coverage) : formatTileNumber(metric.total || metric.total === 0 ? metric.total :  metric.added, { percent: metric.percent, isTime: false })}
									</Typography>
								))}
							</Grid>
							{
								title !== "coverage" &&
								<>
									<Grid item>
										<Divider orientation="vertical" flexItem sx={{ mx: 1, height: "100%" }} />
									</Grid><Grid item sx={{ minWidth: "3rem", textAlign: "center" }}>
										<Typography variant="body2" fontWeight="bold" color="grey.dark">{"Removed"}</Typography>
										{Object.entries(metrics).map(([metricKey, metric]) => (
											<Typography key={metricKey} sx={{ color: metric.removed === 0 ? "black" : "success.main", marginBottom: 1 }}>
												{(metric.removed > 0 ? "-" : "") + formatTileNumber( metric.removed, { percent: metric.percent, isTime: false })}
											</Typography>
										))}
									</Grid>
								</>}
						</Grid>
					)}
				</CardContent>
			</CardActionArea>
		</Card>
	);
});

export default MetricCard;