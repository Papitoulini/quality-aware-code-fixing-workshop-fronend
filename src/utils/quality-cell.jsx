import { Avatar, Typography } from "@mui/material";

import convertQualityScoreToLetter from "./convert-quality-score-to-letter.js";
import getColorForQualityScore from "./get-color-for-quality-score.js";

const qualityCell = (value, isLoading, variant = "h6") => {
	if (isLoading) return (<Typography variant={variant}>{"Calculating..."}</Typography>);
	if (!Number.isFinite(value)) return (<Typography variant={variant}>{"Not available"}</Typography>);
	const quality = convertQualityScoreToLetter(value);
	return (
		<Avatar sx={{ bgcolor: getColorForQualityScore(value), display: "inline-flex", fontSize: "h6" }}>
			{quality}
		</Avatar>
	);
};

export default qualityCell;
