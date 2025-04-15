import PropTypes from "prop-types";
import { Box, Typography, Grid } from "@mui/material";
import { ThumbUp } from "@mui/icons-material";

const NoFindings = ({ text = "No data available!" }) => (
	<Grid item container xs={12} justifyContent="center" alignItems="center">
		<Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 4 }}>
			<Typography variant="h3">
				<ThumbUp color="secondary" fontSize="inherit" />
			</Typography>
			<Typography variant="h4">
				<Typography fontSize="inherit" display="inline-flex" color="secondary">
					{"Congrats!"}
				</Typography>
				{text}
			</Typography>
		</Box>
	</Grid>
);

NoFindings.propTypes = { text: PropTypes.string, sx: PropTypes.object };

export default NoFindings;
