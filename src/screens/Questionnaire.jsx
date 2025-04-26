import { memo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Typography, Grid, Button, Box } from "@mui/material";
import { Home as HomeIcon, ArrowForward as ArrowForwardIcon } from "@mui/icons-material";

const Questionnaire = () => {
	return (
		<Box sx={{ flexGrow: 1, p: 4 }}>
			<Grid container spacing={4} alignItems="center" justifyContent="center">
				<Grid item xs={12} md={8} lg={6} display="flex" flexDirection="column" alignItems="center">
                    <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSde_JLU1dDQgAj7LyvCwivLxlrS_lygFqysDHjdyoMnlWUfAw/viewform?embedded=true"
                    width="640"
                    height="1402"
                    frameBorder="0"
                    marginHeight="0"
                    marginWidth="0"
                    title="Google Form"
                >
                    Loading…
                </iframe>
				</Grid>
			</Grid>
		</Box>
	);
};

Questionnaire.propTypes = {};

export default memo(Questionnaire);