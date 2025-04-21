import { memo, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { shallow } from "zustand/shallow";

import { SecondaryBackgroundButton, SecondaryBorderButton, ThirdBackgroundButton, WhiteBorderButton } from "../components/Buttons.jsx";
import CodeEditor from "../components/CodeEditor.jsx";
import Form from "../components/Form.jsx";
import QualityTable from "../components/QualityTable.jsx";
import FindingsTable from "../components/FindingsTable.jsx";
import Popup from "../components/Popup.jsx";
import Spinner from "../components/Spinner.jsx";
import { useSnackbar } from "../utils/index.js";
import useGlobalState from "../use-global-state.js";
import { getQuestion, getSimilarSnippets, postToLLM, postToQuality } from "../api/index.js";

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(2),
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		marginLeft: "auto",
		marginRight: "auto",
	},
	card: {
		width: "700px",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		marginLeft: "auto",
		marginRight: "auto",
		backgroundColor: "white",
		borderRadius: "10px",
	},
	title: {
		textAlign: "left",
		fontWeight: "bold",
		fontSize: "1.5rem",
		lineHeight: "1.2",
	},
	subtitle: {
		textAlign: "justify",
		fontSize: "1rem",
	},
	main: {
		display: "flex",
		alignItems: "center",
		flexDirection: "column",
	},
	buttonArea: {
		display: "flex",
		justifyContent: "flex-end",
		margin: "10px 0px"
	},
	recommendationsButtonArea: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		margin: "10px 0px",
	},
	recommendationsTitle: {
		fontSize: "1.5rem",
		fontWeight: "bold",
		color: theme.palette.secondary.main,
	},
	secondButton: {
		marginLeft: "10px",
	},
}));

const Question = () => {
	const classes = useStyles();
	const { index } = useParams();
	const navigate = useNavigate();
	const { error } = useSnackbar();
	const [question, setQuestion] = useState({});
	const [code, setCode] = useState("");
	const [quality, setQuality] = useState([]);
	const [hasNext, setHasNext] = useState(false);
	const [step, setStep] = useState(1);
	const [llmPopupOpen, setLlmPopupOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [similarSnippetsFetched, setSimilarSnippetsFetched] = useState(false);
	const [similarSnippets, setSimilarSnippets] = useState([]);
	const [recommendationIndex, setRecommendationIndex] = useState(0);
	const id = useGlobalState((state) => state.id);

	const fetchQuestion = async () => {
		setIsLoading(true);
		const { success: fetchSuccess, question, hasNext: hasNextQuestion } = await getQuestion(index);
		if (fetchSuccess) {
			setQuestion(question);
			setCode(question?.code || "");
			setQuality(question?.analysis || {});
			setHasNext(hasNextQuestion);
		} else {
			error("Σφάλμα κατά την ανάκτηση της ερώτησης");
		}
		setIsLoading(false);
	};

	const fetchSimilarSnippets = async () => {
		setIsLoading(true);
		const { success: fetchSuccess, message, similarSnippets: fetchedSimilarSnippets } = await getSimilarSnippets(question?.code, question?._id, id);
		if (fetchSuccess) {
			setSimilarSnippetsFetched(true);
			setSimilarSnippets(fetchedSimilarSnippets);
			setRecommendationIndex(0);
		} else {
			error(message);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		fetchQuestion();
		setStep(1);
		setSimilarSnippetsFetched(false);
		setSimilarSnippets([]);
		setRecommendationIndex(0);
		setLlmPopupOpen(false);
	}, [index]);

	const llmFormContent = [
		{
			customType: "input",
			id: "query",
			type: "text",
			multiline: true,
			placeholder: "Η ερώτησή σας...",
			minRows: 5,
		},
		{
			customType: "radio",
			id: "llm",
			label: "Επιλέξτε το LLM που θέλετε να χρησιμοποιήσετε",
			color: "secondary",
			defaultValue: "claude",
			row: true,
			items: [
				{ value: "gpt", label: "GPT" },
				{ value: "claude", label: "Claude" },
			],
		},
		{
			customType: "button",
			id: "submit",
			type: "submit",
			text: "Υποβολή",
			color: "third",
		},
	];

	const onLLMSubmit = async (values) => {
		setIsLoading(true);
		const { llm, query } = values;
		const { success: postSuccess, message, ...response } = await postToLLM(llm, question?.code, query, question?._id, id);
		if (postSuccess) {
			// const { code: { new: newCode }, quality: { new: newQuality } } = response;
			const { code: { new: newCode } } = response;
			setCode(newCode);
			// setQuality(newQuality);
			setLlmPopupOpen(false);
		} else {
			error(message);
		}
		setIsLoading(false);
	};

	const openLLMPopup = () => {
		setLlmPopupOpen(true);
	};

	const analyzeCode = async () => {
		setIsLoading(true);
		const { success: postSuccess, message, quality: newQuality } = await postToQuality(code, question?._id, id);
		if (postSuccess) {
			setQuality(newQuality);
		} else {
			error(message);
		}
		setIsLoading(false);
	};

	const nextStep = () => {
		if (step < 3) {
			setStep(step + 1);
		} else if (hasNext) {
			navigate(`/question/${Number.parseInt(index) + 1}`);
		} else {
			navigate("../questionnaire");
		}
	};

	const previousStep = () => {
		if (step > 1) {
			setStep(step - 1);
		} else if (index > 1) {
			navigate(`/question/${Number.parseInt(index) - 1}`);
		} else {
			navigate("../profile");
		}
	};

	const nextRecommendation = () => {
		if (recommendationIndex < similarSnippets.length - 1) {
			setRecommendationIndex(recommendationIndex + 1);
		}
	};

	const previousRecommendation = () => {
		if (recommendationIndex > 0) {
			setRecommendationIndex(recommendationIndex - 1);
		}
	};

	return (
		<>
			<Spinner open={isLoading} />
			<Grid container item key={index} className={classes.root} xs={12} md={8}>
				{step === 1 && (
					<Grid item width="100%">
						<Typography variant="h6" className={classes.title}>
							{question?.question}
						</Typography>
						<Typography className={classes.subtitle}>
							{question?.description}
						</Typography>
						<Grid item className={classes.main}>
							<CodeEditor width="100%" height="400px" code={code} language={"javascript"} editable={false} />
							<FindingsTable findings={quality} />
						</Grid>
					</Grid>
				)}
				{step === 2 && (
					<Grid item width="100%">
						<Typography variant="h6" className={classes.title}>
							{"Χρησιμοποιήστε κάποιο LLM ή διορθώστε μόνοι σας τον κώδικα"}
						</Typography>
						<Typography className={classes.subtitle}>
							{question?.question}
						</Typography>
						<Grid item className={classes.buttonArea}>
							<ThirdBackgroundButton title="Χρησιμοποίησε LLM" onClick={openLLMPopup} />
							<WhiteBorderButton title="Ανάλυσε τον κώδικα" className={classes.secondButton} onClick={analyzeCode} />
						</Grid>
						<Grid item className={classes.main}>
							<CodeEditor width="100%" height="400px" code={code} language={"javascript"} editable={true} setCode={setCode} />
							<FindingsTable findings={quality} />
						</Grid>
						<Popup
							width="auto"
							title="Γράψτε το ερώτημά σας προς το LLM"
							titleBackgroundColor="primary"
							backgroundColor="white.main"
							open={llmPopupOpen}
							onClose={() => setLlmPopupOpen(false)}
						>
							<Grid item className={classes.card}>
								<Form content={llmFormContent} validationSchema="llmQuery" toResetForm={false} onSubmit={onLLMSubmit} />
							</Grid>
						</Popup>
					</Grid>
				)}
				{step === 3 && (
					<Grid item width="100%">
						<Typography variant="h6" className={classes.title}>
							{"Δείτε τις προτάσεις του συστήματος Quoly"}
						</Typography>
						<Typography className={classes.subtitle}>
							{question?.question}
						</Typography>
						{similarSnippetsFetched && (
							<Grid item className={classes.recommendationsButtonArea}>
								<Typography className={classes.recommendationsTitle}>
									{`Πρόταση ${recommendationIndex + 1} από ${similarSnippets.length}:`}
								</Typography>
								<Grid item>
									<WhiteBorderButton
										title="Προηγούμενη Πρόταση"
										width="250px"
										disabled={recommendationIndex === 0}
										onClick={previousRecommendation}
									/>
									<ThirdBackgroundButton
										title="Επόμενη Πρόταση"
										width="250px"
										disabled={recommendationIndex === similarSnippets.length - 1}
										className={classes.secondButton}
										onClick={nextRecommendation}
									/>
								</Grid>
							</Grid>
						)}
						{!similarSnippetsFetched && (
							<Grid item className={classes.recommendationsButtonArea}>
								<Typography variant="h6" className={classes.recommendationsTitle}>
									{"Αρχικός Κώδικας:"}
								</Typography>
								<ThirdBackgroundButton title="Εύρεση Προτάσεων" width="250px" onClick={fetchSimilarSnippets} />
							</Grid>
						)}
						<Grid item className={classes.main}>
							<CodeEditor
								width="100%"
								height="400px"
								code={similarSnippetsFetched ? similarSnippets[recommendationIndex].code : question?.code || ""}
								language={"javascript"}
								editable={false}
							/>
							<QualityTable
								horizontal
								comparative={similarSnippetsFetched}
								comparative2={similarSnippetsFetched}
								width="100%"
								quality={question?.analysis || {}}
								quality2={quality || {}}
								quality3={similarSnippets || {}}
							/>
						</Grid>
					</Grid>
				)}
				<Grid item className={classes.buttonArea}>
					<SecondaryBorderButton
						title={step === 1 && index === "1"
							? "Προφίλ"
							: (step === 1
								? "Προηγούμενη Ερώτηση"
								: (step === 2
									? "Αρχικός Κώδικας"
									: "Επεξεργασία"
								)
							)
						}
						width="auto"
						onClick={previousStep}
					/>
					<SecondaryBackgroundButton
						title={step === 1
							? "Επεξεργασία"
							: (step === 2
								? "Προτάσεις Quoly"
								: (hasNext
									? "Επόμενη Ερώτηση"
									: "Ερωτηματολόγιο"
								)
							)
						}
						className={classes.secondButton}
						onClick={nextStep}
					/>
				</Grid>
			</Grid>
		</>
	);
};

export default memo(Question);