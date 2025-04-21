import { useEffect, useState } from "react";
import { TableContainer, Table, TableRow, TableCell, TableBody, Paper, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import Tooltip from "./Tooltip";

const useStyles = makeStyles((theme) => ({
	tableContainer: {
		marginTop: theme.spacing(1),
		borderRadius: "10px",
		outline: "0px",
		border: "0px",
	},
	tableHead: {
		backgroundColor: theme.palette.secondary.dark,
	},
	tableHeadCell: {
		fontSize: "0.9rem",
		color: theme.palette.white.main,
		cursor: "help",
	},
	tableRow: {
		"&:nth-of-type(odd)": {
			backgroundColor: theme.palette.grey.light,
		},
	},
	tableCell: {
		fontWeight: "bold",
		fontSize: "0.9rem",    
	},
	caption: {
		width: "100%",
		padding: "2px 16px",
		fontSize: "0.9rem",
		color: theme.palette.white.main,
		backgroundColor: theme.palette.primary.main,
	},
}));

const names = {
	"sumOfSquaredQuality": "Συνολική Ποιότητα",
	"harmonicMeanQuality": "Ισορροπημένη Ποιότητα",
	"CC": "Πολυπλοκότητα",
	"MI": "Διατηρησιμότητα",
	"CD": "Σχολιασμός",
	"LOC": "Μέγεθος",
	"PAR": "Ορίσματα",
	"IMPORTS": "Βιβλιοθήκες",
	"VIOLATIONS": "Παραβιάσεις",
};

const tooltips = {
	"sumOfSquaredQuality": "Ένας συνδυαστικός δείκτης που εκτιμά την ποιότητα του κώδικα. Υπολογίζεται από το άθροισμα των τετραγώνων των ποσοστών των μετρικών του κώδικα.",
	"harmonicMeanQuality": "Ένας συνδυαστικός δείκτης που εκτιμά την ποιότητα του κώδικα, δίνοντας μεγαλύτερη βαρύτητα στις χαμηλότερες τιμές των μετρικών. Υπολογίζεται ως ο αρμονικός μέσος όρος των μετρικών του κώδικα.",
	"CC": "Μετρά την πολυπλοκότητα ενός προγράμματος. Αξιολογεί τον αριθμό των ανεξάρτητων μονοπατιών (paths) μέσα από τον πηγαίο κώδικα, βοηθώντας στον εντοπισμό του πόσο δύσκολο είναι να κατανοηθεί, να δοκιμαστεί ή να συντηρηθεί ένα τμήμα του κώδικα.",
	"MI": "Ένας συνδυαστικός δείκτης που εκτιμά τη διατηρησιμότητα του κώδικα. Βασίζεται σε στατιστικά και μετρικές του κώδικα, όπως ο αριθμός γραμμών κώδικα, η πολυπλοκότητα και η αναγνωσιμότητα.",
	"CD": "Το σκορ που προκύπτει από τον αριθμό και το ποσοστό των σχολίων",
	"LOC": "Το σκορ που προκύπτει από τον αριθμό των γραμμών κώδικα",
	"PAR": "Το σκορ που προκύπτει από τον αριθμό των ορισμάτων που χρησιμοποιούνται στις μεθόδους",
	"IMPORTS": "Το σκορ που προκύπτει από τον αριθμό των βιβλιοθηκών που χρησιμοποιούνται",
	"VIOLATIONS": "Το σκορ που προκύπτει από το πλήθος και τον τύπο των παραβιάσεων",
};

const successColor = "green";
const failColor = "red";
const defaultColor = "black";

const isMax = (value, ...values) => {
	return Math.max(value, ...values) === value;
};

const isMin = (value, ...values) => {
	return Math.min(value, ...values) === value;
};

const QualityTable = ({
	quality: propQuality,
	quality2: propQuality2,
	quality3: propQuality3,
	width = "100%",
	height = "100%",
	horizontal = false,
	comparative = false,
	comparative2 = false,
}) => {
	const classes = useStyles({ width, height });
	const [quality, setQuality] = useState(propQuality);
	const [quality2, setQuality2] = useState(propQuality2);
	const [quality3, setQuality3] = useState(propQuality3);

	useEffect(() => {
		setQuality(propQuality);
	}, [propQuality]);

	useEffect(() => {
		setQuality2(propQuality2);
	}, [propQuality2]);

	useEffect(() => {
		setQuality3(propQuality3);
	}, [propQuality3]);

	const renderVertical = () => (
		<TableBody>
			<TableRow className={classes.tableHead}>
				<TableCell className={classes.tableHeadCell} style={{ fontWeight: "bold" }}>
					{"Μετρική"}
				</TableCell>
				<TableCell align="center" className={classes.tableHeadCell}>
					{"Αρχικός Κώδικας"}
				</TableCell>
				{comparative && (
					<TableCell align="center" className={classes.tableHeadCell}>
						{"Κώδικας LLM"}
					</TableCell>
				)}
				{comparative2 && (
					quality3.map((_, index) => (
						<TableCell key={index} align="center" className={classes.tableHeadCell}>
							{`Πρόταση Quoly ${index + 1}`}
						</TableCell>
					))
				)}
			</TableRow>
			{Object.keys(quality).map((row) => (
				<TableRow key={row} className={classes.tableRow}>
					<TableCell
						component="th"
						scope="row"
						className={classes.tableCell}
						style={{
							fontWeight: (["sumOfSquaredQuality", "harmonicMeanQuality"].includes(row) ? "bold" : "normal"),
							background: (["sumOfSquaredQuality", "harmonicMeanQuality"].includes(row) ? "rgba(0,0,0,0.2)" : "transparent"),
						}}
					>
						<Tooltip placement="top-start" title={tooltips[row]}>
							{names[row]}
						</Tooltip>
					</TableCell>
					<TableCell
						align="center"
						className={classes.tableCellValue}
						style={{
							color: (comparative
								? (isMax(quality?.[row], quality2?.[row], ...quality3?.map((value) => value?.quality?.[row]))
									? successColor
									: (isMin(quality?.[row], quality2?.[row], ...quality3?.map((value) => value?.quality?.[row]))
										? failColor
										: defaultColor
									)
								)
								: defaultColor
							),
							background: (["sumOfSquaredQuality", "harmonicMeanQuality"].includes(row) ? "rgba(0,0,0,0.2)" : "transparent"),
						}}
					>
						{`${(quality[row] * 100).toFixed(2)}%`}
					</TableCell>
					{comparative && (
						<TableCell
							align="center"
							className={classes.tableCellComparative}
							style={{
								color: (comparative
									? (isMax(quality2?.[row], quality?.[row], ...((quality3 || [])?.map((value) => value?.quality?.[row])))
										? successColor
										: (isMin(quality2?.[row], quality?.[row], ...((quality3 || [])?.map((value) => value?.quality?.[row])))
											? failColor
											: defaultColor
										)
									)
									: defaultColor
								),
								background: (["sumOfSquaredQuality", "harmonicMeanQuality"].includes(row) ? "rgba(0,0,0,0.2)" : "transparent"),
							}}
						>
							{`${(quality2[row] * 100).toFixed(2)}%`}
						</TableCell>
					)}
					{comparative2 && (
						quality3.map((value, index) => (
							<TableCell
								key={index}
								align="center"
								className={classes.tableCellComparative}
								style={{
									color: (comparative
										? (isMax(value?.quality[row], quality?.[row], quality2?.[row], ...quality3?.map((value) => value?.quality?.[row]))
											? successColor
											: (isMin(value?.quality[row], quality?.[row], quality2?.[row], ...quality3?.map((value) => value?.quality?.[row]))
												? failColor
												: defaultColor
											)
										)
										: defaultColor
									),
									background: (["sumOfSquaredQuality", "harmonicMeanQuality"].includes(row) ? "rgba(0,0,0,0.2)" : "transparent"),
								}}
							>
								{`${(value?.quality[row] * 100).toFixed(2)}%`}
							</TableCell>
						))
					)}
				</TableRow>
			))}
		</TableBody>
	);

	const renderHorizontal = () => (
		<TableBody>
			<TableRow className={classes.tableHead}>
				<TableCell component="th" scope="row" className={classes.tableHeadCell} style={{ fontWeight: "bold" }}>
					{"Μετρική"}
				</TableCell>
				{Object.keys(quality).map((row) => (
					<TableCell
						key={row}
						align="center"
						className={classes.tableHeadCell}
						style={{
							fontWeight: (["sumOfSquaredQuality", "harmonicMeanQuality"].includes(row) ? "bold" : "normal"),
							background: (["sumOfSquaredQuality", "harmonicMeanQuality"].includes(row) ? "rgba(0,0,0,0.2)" : "transparent"),
						}}
					>
						<Tooltip title={tooltips[row]}>
							{names[row]}
						</Tooltip>
					</TableCell>
				))}
			</TableRow>
			<TableRow className={classes.tableRow}>
				<TableCell component="th" scope="row" className={classes.tableCell}>
					{"Αρχικός Κώδικας"}
				</TableCell>
				{Object.keys(quality).map((row) => (
					<TableCell
						key={row}
						align="center"
						className={classes.tableCellValue}
						style={{
							color: (comparative
								? (isMax(quality?.[row], ...(quality2?.[row] ? [quality2?.[row]] : []), ...(quality3?.map((value) => value?.quality?.[row]) ?? []))
									? successColor
									: (isMin(quality?.[row], ...(quality2?.[row] ? [quality2?.[row]] : []), ...(quality3?.map((value) => value?.quality?.[row]) ?? []))
										? failColor
										: defaultColor
									)
								)
								: defaultColor
							),
							background: (["sumOfSquaredQuality", "harmonicMeanQuality"].includes(row) ? "rgba(0,0,0,0.2)" : "transparent"),
						}}
					>
						{`${(quality[row] * 100).toFixed(2)}%`}
					</TableCell>
				))}
			</TableRow>
			{comparative && (
				<TableRow className={classes.tableRow}>
					<TableCell component="th" scope="row" className={classes.tableCell}>
						{"Κώδικας LLM"}
					</TableCell>
					{Object.keys(quality2).map((row) => (
						<TableCell
							key={row}
							align="center"
							className={classes.tableCellComparative}
							style={{
								color: (comparative
									? (isMax(quality2?.[row], quality?.[row], ...((quality3 || [])?.map((value) => value?.quality?.[row])))
										? successColor
										: (isMin(quality2?.[row], quality?.[row], ...((quality3 || [])?.map((value) => value?.quality?.[row])))
											? failColor
											: defaultColor
										)
									)
									: defaultColor
								),
								background: (["sumOfSquaredQuality", "harmonicMeanQuality"].includes(row) ? "rgba(0,0,0,0.2)" : "transparent"),
							}}
						>
							{`${(quality2[row] * 100).toFixed(2)}%`}
						</TableCell>
					))}
				</TableRow>
			)}
			{comparative2 && (
				quality3.map((value, index) => (
					<TableRow key={index} className={classes.tableRow}>
						<TableCell component="th" scope="row" className={classes.tableCell}>
							{`Πρόταση Quoly ${index + 1}`}
						</TableCell>
						{Object.keys(value.quality).map((row) => (
							<TableCell
								key={row}
								align="center"
								className={classes.tableCellComparative}
								style={{
									color: (comparative
										? (isMax(value?.quality[row], quality?.[row], quality2?.[row], ...quality3?.map((value) => value?.quality?.[row]))
											? successColor
											: (isMin(value?.quality[row], quality?.[row], quality2?.[row], ...quality3?.map((value) => value?.quality?.[row]))
												? failColor
												: defaultColor
											)
										)
										: defaultColor
									),
									background: (["sumOfSquaredQuality", "harmonicMeanQuality"].includes(row) ? "rgba(0,0,0,0.2)" : "transparent"),
								}}
							>
								{`${(value.quality[row] * 100).toFixed(2)}%`}
							</TableCell>
						))}
					</TableRow>
				))
			)}
		</TableBody>
	);

	return (
		<TableContainer component={Paper} className={classes.tableContainer}>
			<Table>
				{horizontal ? renderHorizontal() : renderVertical()}
			</Table>
			<Typography className={classes.caption}>
				{"Οι μετρικές ποιότητας εκφράζονται σε ποσοστιαία μορφή, όπου το 100% αντιστοιχεί στο τέλειο σκορ"}
			</Typography>
		</TableContainer>
	);
};

export default QualityTable;
