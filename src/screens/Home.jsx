import { memo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Typography, Grid, Button, Box } from "@mui/material";
import { Home as HomeIcon, ArrowForward as ArrowForwardIcon } from "@mui/icons-material";

const Home = ({}) => {
	return (
		<Box sx={{ flexGrow: 1, p: 4 }}>
			<Grid container spacing={4} alignItems="center" justifyContent="center">
				<Grid item xs={12} md={8} lg={6} display="flex" flexDirection="column" alignItems="center">
					<HomeIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
					<Typography variant="h4" component="h1" gutterBottom>
								Welcome to ISSEL
					</Typography>
					<Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
								It is time to play! 
					</Typography>
					<Button
						variant="contained"
						color="primary"
						endIcon={<ArrowForwardIcon />}
						component={RouterLink}
						to={`/login`}
					>
								Get Started
					</Button>
				</Grid>

				<Grid item xs={12} sx={{ mt: 4 }}>
					<Typography variant="subtitle1" align="center" color="textSecondary">
						We are going to try and fix some of the security issues found with the help of LLMs.
						<br />
						And then we will utilize the <b>BroLine</b> and do the exact same thing!
					</Typography>
				</Grid>
			</Grid>
		</Box>
	);
};

Home.propTypes = {};

export default memo(Home);