// OverviewTiles.jsx
import { memo } from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { formatTileNumber, capitalize } from "#utils";

const OverviewTiles = (props) => {
	const { content = "default content", percent = false, isTime = false, added = null, removed = null, hasDiff = true } = props;

	const isTotal = content.toLowerCase() === "total";
	if (isTotal) return null;

	return (
		<Box
			sx={{
				display: "flex",
				gap: 1,
				alignItems: "center",
				backgroundColor: "none",
			}}
		>
			<Typography sx={{ flex: "1 1 auto", textAlign: "start", flexWrap: "wrap" }}>
				{capitalize(content)}
			</Typography>
			<Typography sx={{ color: (hasDiff ? "error.main" : "primary.main"), textAlign: "center", minWidth: "3rem" }}>
				{(hasDiff ? "+" : "")}{formatTileNumber(added, { percent, isTime })}
			</Typography>
			<Typography sx={{ color: (hasDiff ? "success.main" : (
				added - removed >= 0 ? "success.main" : "error.main")),  textAlign: "center", minWidth: "3rem" }}>
				{
					(hasDiff
						? `-${formatTileNumber(removed, { percent, isTime })}`
						: `${formatTileNumber(added - removed, { percent, isTime })}`)
				}
				
			</Typography>
		</Box>
	);
};

OverviewTiles.propTypes = {
	content: PropTypes.string,
	added: PropTypes.number,
	removed: PropTypes.number,
	percent: PropTypes.bool,
	isTime: PropTypes.bool,
};

export default memo(OverviewTiles);
