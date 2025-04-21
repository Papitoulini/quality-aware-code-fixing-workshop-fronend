import { makeStyles } from "@mui/styles";
import {
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper,
	Typography,
	CircularProgress,
	Box,
} from "@mui/material";

const useStyles = makeStyles((theme) => ({
	tableContainer: {
		marginTop: theme.spacing(2),
		borderRadius: '8px',
		overflowX: 'auto',
	},
	tableHead: {
		backgroundColor: theme.palette.primary.dark,
	},
	tableHeadCell: {
		fontSize: '1rem',
		fontWeight: 'bold',
		color: theme.palette.common.white,
	},
	tableRow: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.action.hover,
		},
	},
	tableCell: {
		fontSize: '0.95rem',
		padding: theme.spacing(1),
	},
	caption: {
		padding: theme.spacing(1),
		fontSize: '0.85rem',
		textAlign: 'center',
		backgroundColor: theme.palette.grey[200],
	},
	heading: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(1),
		fontWeight: 'bold',
	},
}));

/**
 * Displays one or more security findings in a table layout.
 * @param {Object} props
 * @param {Array<Object>} props.findings  Array of finding objects.
 * @param {boolean} props.loading        Show loader when true.
 * @param {Array<{ key: string, label: string, render?: (finding) => React.ReactNode }>} props.fieldsConfig
 */
const FindingTable = ({ findings = [], loading = false, fieldsConfig }) => {
	const classes = useStyles();

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" p={2}>
				<CircularProgress />
			</Box>
		);
	}

	if (!Array.isArray(findings) || findings.length === 0) {
		return (
			<Typography align="center" p={2}>
        No finding data available.
			</Typography>
		);
	}

	// Default fieldsConfig if none provided
	const defaultConfig = [
		{ key: 'message', label: 'Message' },
		{ key: 'lines', label: 'Context' },
		{
			key: 'start',
			label: 'Start Position',
			render: (f) => `Line ${f.start.line}, Column ${f.start.col}`,
		},
		{
			key: 'end',
			label: 'End Position',
			render: (f) => `Line ${f.end.line}, Column ${f.end.col}`,
		},
		{
			key: 'metadata.confidence',
			label: 'Confidence',
			render: (f) => f.metadata?.confidence,
		},
		{
			key: 'metadata.likelihood',
			label: 'Likelihood',
			render: (f) => f.metadata?.likelihood,
		},
		{
			key: 'metadata.cwe',
			label: 'CWE',
			render: (f) => f.metadata?.cwe?.map((c) => <div key={c}>• {c}</div>),
		},
		{
			key: 'metadata.references',
			label: 'References',
			render: (f) => f.metadata?.references?.map((url) => (
				<div key={url}>
          • <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
				</div>
			)),
		},
	];

	const config = Array.isArray(fieldsConfig) && fieldsConfig.length > 0 ? fieldsConfig : defaultConfig;

	return (
		<>
			{findings.map((finding, idx) => (
				<Box key={idx}>
					<Typography variant="h6" className={classes.heading}>
            Finding {idx + 1}
					</Typography>
					<TableContainer component={Paper} className={classes.tableContainer}>
						<Table>
							<TableHead>
								<TableRow className={classes.tableHead}>
									<TableCell className={classes.tableHeadCell}>Field</TableCell>
									<TableCell className={classes.tableHeadCell}>Value</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{config.map(({ key, label, render }) => (
									<TableRow key={key} className={classes.tableRow}>
										<TableCell className={classes.tableCell}>{label}</TableCell>
										<TableCell className={classes.tableCell}>
											{render
												? render(finding)
												: key.split('.').reduce((obj, k) => obj?.[k], finding)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
						<Typography className={classes.caption}>
              Detailed finding information
						</Typography>
					</TableContainer>
				</Box>
			))}
		</>
	);
};

export default FindingTable;