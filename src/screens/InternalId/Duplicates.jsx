import { memo, useMemo } from "react";
import { Typography, Grid, CircularProgress } from "@mui/material";
import { useLocation, useParams } from "react-router-dom";

import { mapOverviewToMetrics } from "../../utils/index.js";
import GeneralInfoTile from "../../components/GeneralInfoTile.jsx";
import DuplicatesTables from "../../components/DuplicatesTables.jsx";
import { useTddDuplicates } from "../../api/index.js";

const Duplicates = () => {
	const { internalId } = useParams();
	const { search } = useLocation();
	const token = useMemo(() => new URLSearchParams(search).get("token"), [search]);
	const { data = {}, isLoading } = useTddDuplicates(internalId, token);
	const clonesInfo = useMemo(() => data.clones, [data]);

	const metrics = useMemo(() => mapOverviewToMetrics(clonesInfo), [clonesInfo]);

	return (
		<>
			<Grid container display="flex" direction="column">
				<Grid item direction="column" sx={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
					{Object.entries(metrics).map(([key, metrics]) => 
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
			</Grid>
			{isLoading ? 
				<Grid container item flexDirection="row" alignItems="center" justifyContent="center" spacing={1} m={-1}>
					<CircularProgress/>
				</Grid>
				:
				<Grid container item flexDirection="row" alignItems="center" justifyContent="center" spacing={1} m={-1}>
					<Grid item>
						<Typography variant="h6" fontWeight="bold" color="primary">{"Clone Instances:"}</Typography>
					</Grid>
					<Grid item xs={12}>
						<DuplicatesTables
							tableDisabled
							clonesData={clonesInfo.clones || {}}
						/>
					</Grid>
				</Grid>
			}
		</>
	);
};

export default memo(Duplicates);
