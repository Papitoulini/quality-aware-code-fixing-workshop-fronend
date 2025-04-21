import { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, InputAdornment, Typography, IconButton } from "@mui/material";
import { AccountCircle, AutoStories, Email, IntegrationInstructions } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

import Form from "../components/Form.jsx";
import Spinner from "../components/Spinner.jsx";
import Switch from "../components/Switch.jsx";
import { useSnackbar } from "../utils/index.js";
import useGlobalState from "../use-global-state.js";
import { getUser, register, useUser } from "../api/index.js";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%",
		padding: "2rem",
		overflowY: "auto",
	},
	switchBox: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		color: "white",
	},
	card: {
		width: "700px",
		padding: "2rem",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		backgroundColor: "white",
		borderRadius: "10px",
		boxShadow: "10px 10px 5px rgba(0, 0, 0, 0.2)",
	},
	title: {
		fontSize: "1.5rem",
		fontWeight: "bold",
		color: theme.palette.primary.main,
		marginBottom: "1rem",
	},
	infoGrid: {
		width: "100%",
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		marginTop: "1rem",
		marginBottom: "1rem",
	},
	info: {
		fontSize: "1rem",
		textAlign: "left",
		color: theme.palette.primary.main,
	},
}));

const UserRegistration = () => {
	const classes = useStyles();
	const { success, error } = useSnackbar();
	const navigate = useNavigate();
	const id = useGlobalState((state) => state.id);
	const setId = useGlobalState((state) => state.setId);
	// const [alreadyRegistered, setAlreadyRegistered] = useState(false)
	const [user, setUser] = useState({});
	const [isLoading, setIsLoading] = useState(false);

	const fetchData = async (userId) => {
		setIsLoading(true);
		const { success: fetchSuccess, user: fetchedUser } = await getUser(userId);
		if (fetchSuccess) {
			setUser(fetchedUser);
		} else {
			setId(null);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		if (id) {
			fetchData(id);
			console.log("a")
		}
	}, []);

	const onSubmit = async (values) => {
		setIsLoading(true);

		const data = {
			email: values.email,
			code: values.code,
			fullname: values.fullname,
			programmingExperience: values.programmingExperience,
			programmingLevel: Number.parseInt(values.programmingLevel),
			javascriptLevel: Number.parseInt(values.javascriptLevel),
			qualityLevel: Number.parseInt(values.qualityLevel),
			llmLevel: Number.parseInt(values.llmLevel),
			llmHow: values.llmHow,
			gpt: values.gpt,
			claude: values.claude,
			llama: values.llama,
			gemini: values.gemini,
			// alreadyRegistered,
		};

		const { success: registerSuccess, message, id: userId } = await register(data);
		if (registerSuccess) {
			setId(userId);
			setIsLoading(false);
			success(message);
			navigate("/question/1");
		} else {
			setIsLoading(false);
			error(message);
		}
	};

	const formContent = [
		{
			customType: "input",
			id: "fullname",
			type: "text",
			label: "Ονοματεπώνυμο:",
			placeholder: "Ονοματεπώνυμο",
			defaultValue: user.fullname,
			inputProps: {
				endAdornment: (
					<InputAdornment position="start">
						<IconButton disabled>
							<AccountCircle />
						</IconButton>
					</InputAdornment>
				),
			},
		},
		{
			customType: "input",
			id: "email",
			type: "email",
			label: "Πανεπιστημιακό Email:",
			placeholder: "Πανεπιστημιακό Email",
			defaultValue: user.email,
			inputProps: {
				endAdornment: (
					<InputAdornment position="start">
						<IconButton disabled>
							<Email />
						</IconButton>
					</InputAdornment>
				),
			},
		},
		{
			customType: "input",
			id: "code",
			type: "text",
			label: "Κλειδί του WorkShop",
			placeholder: "Κλειδί",
			defaultValue: user.code,
			inputProps: {
				endAdornment: (
					<InputAdornment position="start">
						<IconButton disabled>
							<AutoStories />
						</IconButton>
					</InputAdornment>
				),
			},
		},
		{
			customType: "input",
			id: "programmingExperience",
			type: "number",
			label: "Πόσα χρόνια ασχολείστε καθ' οποιοδήποτε τρόπο με τον προγραμματισμό;",
			placeholder: "0",
			defaultValue: user?.experience?.programmingYears || 0,
			inputProps: {
				endAdornment: (
					<InputAdornment position="start">
						<IconButton disabled>
							<IntegrationInstructions />
						</IconButton>
					</InputAdornment>
				),
			},
		},
		{
			customType: "component",
			component: (
				<Grid item className={classes.infoGrid}>
					<Typography className={classes.info}>
						<b>{"Τεχνικές Δεξιότητες:"}</b>
					</Typography>
					<Typography className={classes.info}>
						{"• Επίπεδο 0 (δεν γνωρίζω)"}
					</Typography>
					<Typography className={classes.info}>
						{"• Επίπεδο 1 (έχω διδαχθεί στη σχολή)"}
					</Typography>
					<Typography className={classes.info}>
						{"• Επίπεδο 2 (έχω προγραμματίσει προσωπικά projects)"}
					</Typography>
					<Typography className={classes.info}>
						{"• Επίπεδο 3 (έχω χρησιμοποιήσει επαγγελματικά)"}
					</Typography>
				</Grid>
			),
		},
		{
			customType: "radio",
			id: "programmingLevel",
			label: "Ποιο είναι το επίπεδο των γνώσεών σας στον προγραμματισμό λογισμικού;",
			color: "secondary",
			defaultValue: user?.experience?.programmingLevel || 0,
			row: true,
			items: [
				{ value: 0, label: "Επίπεδο 0" },
				{ value: 1, label: "Επίπεδο 1" },
				{ value: 2, label: "Επίπεδο 2" },
				{ value: 3, label: "Επίπεδο 3" },
			],
		},
		{
			customType: "radio",
			id: "javascriptLevel",
			label: "Ποιο είναι το επίπεδο των γνώσεών σας στη γλώσσα προγραμματισμού JavaScript;",
			color: "secondary",
			defaultValue: user?.experience?.javascriptLevel || 0,
			row: true,
			items: [
				{ value: 0, label: "Επίπεδο 0" },
				{ value: 1, label: "Επίπεδο 1" },
				{ value: 2, label: "Επίπεδο 2" },
				{ value: 3, label: "Επίπεδο 3" },
			],
		},
		{
			customType: "radio",
			id: "qualityLevel",
			label: "Ποιο είναι το επίπεδο των γνώσεών σας σχετικά με ποιότητα λογισμικού;",
			color: "secondary",
			defaultValue: user?.experience?.qualityLevel || 0,
			row: true,
			items: [
				{ value: 0, label: "Επίπεδο 0" },
				{ value: 1, label: "Επίπεδο 1" },
				{ value: 2, label: "Επίπεδο 2" },
				{ value: 3, label: "Επίπεδο 3" },
			],
		},
		{
			customType: "radio",
			id: "llmLevel",
			label: "Ποιο είναι το επίπεδο της εξοικείωσής σας με τα Μεγάλα Γλωσσικά Μοντέλα (Large Language Models – LLMs);",
			color: "secondary",
			defaultValue: user?.experience?.llmLevel || 0,
			row: true,
			items: [
				{ value: 0, label: "Επίπεδο 0" },
				{ value: 1, label: "Επίπεδο 1" },
				{ value: 2, label: "Επίπεδο 2" },
				{ value: 3, label: "Επίπεδο 3" },
			],
		},
		{
			customType: "input",
			id: "llmHow",
			type: "text",
			multiline: true,
			label: "Έχετε χρησιμοποιήσει LLMs και πως;",
			placeholder: "Η απάντησή σας...",
			defaultValue: user?.experience?.llmHow || "",
			minRows: 5,
		},
		{
			customType: "checkboxes",
			id: "llmUsage",
			label: "Αναφέρετε LLMs που έχετε χρησιμοποιήσει στο παρελθόν.",
			color: "secondary",
			items: [
				{ id: "gpt", defaultValue: user?.experience?.llmUsage?.gpt || false, label: "GPT" },
				{ id: "claude", defaultValue: user?.experience?.llmUsage?.claude || false, label: "Claude" },
				{ id: "llama", defaultValue: user?.experience?.llmUsage?.llama || false, label: "Llama" },
				{ id: "gemini", defaultValue: user?.experience?.llmUsage?.gemini || false, label: "Gemini" },
			],
		},
		{
			customType: "button",
			id: "submit",
			type: "submit",
			text: "Επόμενο",
			color: "third",
		},
	];

	// const signInContent = [
	// 	{
	// 		customType: "input",
	// 		id: "email",
	// 		type: "email",
	// 		label: "Πανεπιστημιακό Email:",
	// 		placeholder: "Πανεπιστημιακό Email",
	// 		defaultValue: user.email,
	// 		inputProps: {
	// 			endAdornment: (
	// 				<InputAdornment position="start">
	// 					<IconButton disabled>
	// 						<Email />
	// 					</IconButton>
	// 				</InputAdornment>
	// 			),
	// 		},
	// 	},
	// 	{
	// 		customType: "input",
	// 		id: "code",
	// 		type: "text",
	// 		label: "Κλειδί του WorkShop",
	// 		placeholder: "Κλειδί",
	// 		defaultValue: user.code,
	// 		inputProps: {
	// 			endAdornment: (
	// 				<InputAdornment position="start">
	// 					<IconButton disabled>
	// 						<AutoStories />
	// 					</IconButton>
	// 				</InputAdornment>
	// 			),
	// 		},
	// 	},
	// 	{
	// 		customType: "button",
	// 		id: "submit",
	// 		type: "submit",
	// 		text: "Επόμενο",
	// 		color: "third",
	// 	}];
		
	// const finalFormContent = useMemo(() => {
	// 	const signInIds = new Set([
	// 		"email",
	// 		"code",
	// 		"submit",
	// 	])
	// 	return alreadyRegistered 
	// 		? formContent.filter(({ id }) => signInIds.has(id))
	// 		: formContent;
	// }, [alreadyRegistered, formContent]);

	return (
		<>
			<Spinner open={isLoading} />
			<Grid container className={classes.root}>
				<Grid item className={classes.card}>
					{/* <Typography className={classes.title}>
						{"Προσωπικές Πληροφορίες"}
					</Typography>
					<Grid container item className={classes.switchBox}>
						<Typography textAlign="left" color="primary">{"Already registered"}</Typography>
						<Switch
							color={"secondary"}
							checked={alreadyRegistered}
							size={"small"}
							onChange={() => {
								setAlreadyRegistered((a) => !a)
							}}
						/>
					</Grid> */}
					<Form key="registration" content={formContent} validationSchema="userRegistration" onSubmit={onSubmit} />
				</Grid>
			</Grid>
		</>
	);
};

export default memo(UserRegistration);
