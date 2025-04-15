import PropTypes from "prop-types";
import { Box, Typography, Grid } from "@mui/material";

const NoAvailableData = () => (
	<Grid item container xs={12} justifyContent="center" alignItems="center">
		<Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 4 }}>
			<Typography variant="h4">
				{"There are no "}
				<Typography fontSize="inherit" display="inline-flex" color="secondary">
					{"available"}
				</Typography>
				{" data"}
			</Typography>
		</Box>
	</Grid>
);

NoAvailableData.propTypes = { text: PropTypes.string, sx: PropTypes.object };

export default NoAvailableData;
